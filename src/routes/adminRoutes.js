const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const imageController = require('../controllers/imageController');
const carService = require('../services/carService');
const storageService = require('../services/storageService');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminLimiter } = require('../middlewares/rateLimitMiddleware');
const { uploadMultiple } = require('../middlewares/uploadMiddleware');
const { validate, carSchema, carUpdateSchema, statusUpdateSchema, imageOrderSchema } = require('../utils/validator');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const config = require('../config/env');

// Rate limiting
router.use(adminLimiter);

// Autenticação obrigatória para todas as rotas admin
router.use(authMiddleware);

// Rotas admin de carros
router.post('/cars', validate(carSchema), carController.createCar.bind(carController));
router.put('/cars/:id', validate(carUpdateSchema), carController.updateCar.bind(carController));
router.patch('/cars/:id/status', validate(statusUpdateSchema), carController.updateCarStatus.bind(carController));
router.delete('/cars/:id', carController.deleteCar.bind(carController));

// Rotas admin de imagens
router.post('/cars/:id/images', uploadMultiple, (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return error(res, 'Nenhum arquivo enviado', 'VALIDATION_ERROR', null, 400);
  }
  next();
}, imageController.uploadImages.bind(imageController));

router.delete('/images/:id', imageController.deleteImage.bind(imageController));
router.put('/images/:id/set-primary', imageController.setPrimaryImage.bind(imageController));
router.put('/images/:id/order', validate(imageOrderSchema), imageController.updateImageOrder.bind(imageController));

// Rota admin para executar limpeza manualmente
router.post('/cleanup', async (req, res) => {
  try {
    const daysAgo = config.scheduler.cleanupDays;
    const oldCars = await carService.getOldCars(daysAgo);

    let deletedCount = 0;
    for (const car of oldCars) {
      try {
        // Deletar imagens do MinIO
        for (const image of car.images) {
          const fileName = storageService.extractFileNameFromUrl(image.imageUrl);
          if (fileName) {
            try {
              await storageService.deleteFile(fileName);
            } catch (err) {
              logger.warn(`Erro ao deletar arquivo do MinIO: ${err.message}`);
            }
          }
        }

        // Deletar carro (cascade deleta imagens do banco)
        await carService.deleteCar(car.id);
        deletedCount++;
        logger.info(`Carro ${car.id} removido na limpeza manual`);
      } catch (err) {
        logger.error(`Erro ao remover carro ${car.id}:`, err);
      }
    }

    return success(res, {
      deletedCount,
      totalFound: oldCars.length
    }, `Limpeza concluída. ${deletedCount} carro(s) removido(s)`);
  } catch (err) {
    logger.error('Erro na limpeza manual:', err);
    return error(res, 'Erro ao executar limpeza', 'CLEANUP_ERROR', null, 500);
  }
});

module.exports = router;

