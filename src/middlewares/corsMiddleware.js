const cors = require('cors');
const config = require('../config/env');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = config.cors.allowedOrigins || [];
    
    if (allowedOrigins.includes('*') || allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: (config.cors.allowedOrigins && !config.cors.allowedOrigins.includes('*') && config.cors.allowedOrigins.length > 0),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);

