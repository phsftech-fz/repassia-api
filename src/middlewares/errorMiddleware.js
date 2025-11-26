const { error } = require('../utils/response');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  if (err.message === 'Não permitido pelo CORS') {
    logger.error('CORS bloqueado', {
      message: err.message,
      origin: err.origin || 'não informada',
      url: req.url,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress
    });
    return error(res, 'Acesso não permitido para esta origem', 'CORS_ERROR', null, 403);
  }

  logger.error('Erro capturado', {
    message: err.message,
    code: err.code,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode || res.statusCode
  });

  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Por favor, verifique os dados informados',
        details: err.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      }
    });
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'registro';
    return error(res, `Este ${field} já está cadastrado no sistema`, 'DUPLICATE_ERROR', null, 409);
  }

  if (err.code === 'P2025') {
    return error(res, 'Registro não encontrado', 'NOT_FOUND', null, 404);
  }

  if (err.code === 'P2003') {
    return error(res, 'Referência inválida. Verifique os dados informados', 'INVALID_REFERENCE', null, 400);
  }

  if (err.code === 'P2023') {
    return error(res, 'ID inválido. Verifique o formato do identificador', 'INVALID_ID', null, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.' 
    : err.message;

  return error(res, message, 'INTERNAL_ERROR', null, statusCode);
};

module.exports = errorMiddleware;

