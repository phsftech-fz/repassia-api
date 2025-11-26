const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const imageController = require('../controllers/imageController');
const formSubmissionController = require('../controllers/formSubmissionController');
const formTypesController = require('../controllers/formTypesController');
const { publicLimiter, formLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, formSubmissionSchema } = require('../utils/validator');

// Rate limiting
router.use(publicLimiter);

// Rotas públicas de carros
router.get('/cars', carController.listCars.bind(carController));
router.get('/cars/:id', carController.getCarById.bind(carController));
router.get('/cars/:id/images', imageController.getImagesByCarId.bind(imageController));

// Rota pública para servir imagens (usa * para capturar caminho completo com barras)
router.get('/images/*', imageController.serveImage.bind(imageController));

// Rota pública para submissão de formulário (com rate limit específico)
router.post('/form/submit', formLimiter, validate(formSubmissionSchema), formSubmissionController.submitForm.bind(formSubmissionController));

// Rota pública para obter tipos/enums do formulário
router.get('/form/types', formTypesController.getFormTypes.bind(formTypesController));

module.exports = router;

