const rateLimit = require('express-rate-limit');

// Rate limit para endpoints de autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 requisições por minuto
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para endpoints públicos
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Muitas requisições. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para endpoints admin
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requisições por minuto
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Muitas requisições. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar token do usuário como chave para rate limiting por usuário
    const token = req.headers.authorization?.substring(7);
    return token || req.ip;
  }
});

// Rate limit para formulário (2 submissões por IP em 15 minutos)
const formLimiter = rateLimit({
  windowMs: (process.env.FORM_RATE_LIMIT_WINDOW || 15) * 60 * 1000, // minutos em ms
  max: process.env.FORM_RATE_LIMIT_MAX || 2, // máximo de submissões
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP como chave para rate limiting
    return req.ip || req.connection.remoteAddress;
  }
});

module.exports = {
  authLimiter,
  publicLimiter,
  adminLimiter,
  formLimiter
};

