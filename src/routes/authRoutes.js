const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, requestCodeSchema, verifyCodeSchema, validateTokenSchema, refreshTokenSchema } = require('../utils/validator');

// Rate limiting
router.use(authLimiter);

// Rotas de autenticação
router.post('/request-code', validate(requestCodeSchema), authController.requestCode.bind(authController));
router.post('/verify-code', validate(verifyCodeSchema), authController.verifyCode.bind(authController));
router.post('/validate-token', validate(validateTokenSchema), authController.validateToken.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/revoke', validate(refreshTokenSchema), authController.revokeRefreshToken.bind(authController));

module.exports = router;

