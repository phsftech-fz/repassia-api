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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
};

module.exports = cors(corsOptions);

