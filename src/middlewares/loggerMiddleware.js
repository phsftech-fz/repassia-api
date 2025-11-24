const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log da requisição
  logger.info('Requisição recebida', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Interceptar resposta para log
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    logger.info('Resposta enviada', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    originalSend.call(this, data);
  };

  next();
};

module.exports = loggerMiddleware;

