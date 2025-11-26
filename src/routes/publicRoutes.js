const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const imageController = require('../controllers/imageController');
const formSubmissionController = require('../controllers/formSubmissionController');
const formTypesController = require('../controllers/formTypesController');
const { publicLimiter, formLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, formSubmissionSchema } = require('../utils/validator');

router.use(publicLimiter);

router.get('/cars', carController.listCars.bind(carController));
router.get('/cars/:id', carController.getCarById.bind(carController));
router.get('/cars/:id/images', imageController.getImagesByCarId.bind(imageController));

router.get('/images/*', imageController.serveImage.bind(imageController));
router.options('/images/*', (req, res) => {
  const config = require('../config/env');
  const origin = req.headers.origin;
  const allowedOrigins = config.cors.allowedOrigins || [];
  
  let allowedOrigin = '*';
  if (allowedOrigins.includes('*') || allowedOrigins.length === 0) {
    allowedOrigin = '*';
  } else if (origin && allowedOrigins.includes(origin)) {
    allowedOrigin = origin;
  }
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  if (allowedOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

router.post('/form/submit', formLimiter, validate(formSubmissionSchema), formSubmissionController.submitForm.bind(formSubmissionController));
router.get('/form/types', formTypesController.getFormTypes.bind(formTypesController));

module.exports = router;

