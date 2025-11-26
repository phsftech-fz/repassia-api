const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;

  const shouldLog = !req.url.includes('/favicon.ico') && !req.url.includes('/health');

  if (shouldLog) {
    logger.debug('→ Incoming', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')?.substring(0, 50),
      requestId
    });
  }

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const responseSize = Buffer.byteLength(JSON.stringify(data || ''), 'utf8');
    
    if (shouldLog) {
      const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      
      logger[logLevel]('← Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        size: `${(responseSize / 1024).toFixed(2)}KB`,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        authType: req.user?.authType,
        requestId
      });
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = loggerMiddleware;

