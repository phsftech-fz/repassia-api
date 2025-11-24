const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const imageController = require('../controllers/imageController');
const { publicLimiter } = require('../middlewares/rateLimitMiddleware');

// Rate limiting
router.use(publicLimiter);

// Rotas públicas de carros
router.get('/cars', carController.listCars.bind(carController));
router.get('/cars/:id', carController.getCarById.bind(carController));
router.get('/cars/:id/images', imageController.getImagesByCarId.bind(imageController));

// Rota pública para servir imagens
router.get('/images/:filename', imageController.serveImage.bind(imageController));

module.exports = router;

