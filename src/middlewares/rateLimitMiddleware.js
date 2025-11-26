const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false
  }
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Muitas requisições. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false
  }
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Muitas requisições. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false
  },
  keyGenerator: (req) => {
    const token = req.headers.authorization?.substring(7);
    return token || req.ip;
  }
});

const formLimiter = rateLimit({
  windowMs: (process.env.FORM_RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.FORM_RATE_LIMIT_MAX || 2,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false
  },
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

module.exports = {
  authLimiter,
  publicLimiter,
  adminLimiter,
  formLimiter
};

