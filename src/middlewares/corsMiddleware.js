const cors = require('cors');
const config = require('../config/env');

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (navegador direto, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = config.cors.allowedOrigins || [];
    
    // Se wildcard está configurado ou lista vazia, permitir todas
    if (allowedOrigins.includes('*') || allowedOrigins.length === 0) {
      return callback(null, true);
    }

    // Verificar se a origin está na lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Origin não permitida
    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Alguns navegadores legados (IE11) podem ter problemas com 204
};

module.exports = cors(corsOptions);

