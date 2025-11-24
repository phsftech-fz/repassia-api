const { error } = require('../utils/response');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error('Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        details: err.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      }
    });
  }

  // Erro de CORS
  if (err.message === 'Não permitido pelo CORS') {
    return error(res, 'Origem não permitida', 'CORS_ERROR', null, 403);
  }

  // Erro de Prisma
  if (err.code === 'P2002') {
    return error(res, 'Registro duplicado', 'DUPLICATE_ERROR', null, 409);
  }

  if (err.code === 'P2025') {
    return error(res, 'Registro não encontrado', 'NOT_FOUND', null, 404);
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  return error(res, message, 'INTERNAL_ERROR', null, statusCode);
};

module.exports = errorMiddleware;

