const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const { sanitizeObject, sanitizeErrorMessage } = require('./logSanitizer');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const sanitizeFormat = winston.format((info) => {
  if (info.message) {
    info.message = sanitizeErrorMessage(info.message);
  }
  
  if (info.meta || info[Symbol.for('splat')]) {
    const metadata = info.meta || info[Symbol.for('splat')]?.[0] || {};
    info.meta = sanitizeObject(metadata);
  }
  
  if (info.stack) {
    info.stack = sanitizeErrorMessage(info.stack);
  }
  
  return info;
});

const logger = winston.createLogger({
  level: config.server.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    sanitizeFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'repassia-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Adicionar console transport em todos os ambientes
if (config.server.nodeEnv === 'production') {
  // Em produção: formato JSON simples no console
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
} else {
  // Em desenvolvimento: formato colorido e legível
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        if (meta.method && meta.url) {
          const statusColor = meta.statusCode >= 400 ? '\x1b[31m' : meta.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
          const resetColor = '\x1b[0m';
          return `${timestamp} ${statusColor}${meta.method}${resetColor} ${meta.url} ${statusColor}${meta.statusCode || ''}${resetColor} ${meta.duration || ''} ${meta.ip || ''}`;
        }
        
        if (level.includes('error')) {
          return `${timestamp} [${level}]: ${message}${meta.stack ? '\n' + meta.stack : ''}`;
        }
        
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0 && !meta.stack) {
          const relevantMeta = Object.keys(meta)
            .filter(key => !['service', 'timestamp'].includes(key))
            .reduce((obj, key) => {
              obj[key] = meta[key];
              return obj;
            }, {});
          if (Object.keys(relevantMeta).length > 0) {
            msg += ` ${JSON.stringify(relevantMeta, null, 0)}`;
          }
        }
        return msg;
      })
    )
  }));
}

module.exports = logger;

