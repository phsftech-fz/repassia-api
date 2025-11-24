const cors = require('cors');
const config = require('../config/env');

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar se origin está na lista de permitidas
    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);

