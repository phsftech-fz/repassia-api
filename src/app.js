const express = require('express');
const helmet = require('helmet');
const corsMiddleware = require('./middlewares/corsMiddleware');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { checkDatabaseConnection } = require('./config/database');
const { checkMinioConnection } = require('./config/minio');

const app = express();

// Middlewares globais
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    const minioStatus = await checkMinioConnection();
    
    const status = dbStatus && minioStatus ? 'ok' : 'degraded';
    
    res.status(status === 'ok' ? 200 : 503).json({
      status,
      database: dbStatus ? 'connected' : 'disconnected',
      minio: minioStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

// Rotas
app.use('/api/v1', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'RepassIA API',
    version: '1.0.0',
    status: 'running'
  });
});

// Middleware de erro (deve ser o último)
app.use(errorMiddleware);

module.exports = app;

