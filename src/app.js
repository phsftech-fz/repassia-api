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

app.set('trust proxy', true);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use('/api/v1/images', (req, res, next) => {
  const config = require('./config/env');
  const origin = req.headers.origin;
  const allowedOrigins = config.cors.allowedOrigins || [];
  
  let allowedOrigin = null;
  if (allowedOrigins.includes('*') || allowedOrigins.length === 0) {
    allowedOrigin = origin || '*';
  } else if (origin && allowedOrigins.includes(origin)) {
    allowedOrigin = origin;
  } else if (!origin) {
    allowedOrigin = '*';
  }
  
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    if (allowedOrigin !== '*' && origin) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  next();
});

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

app.use('/api/v1', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'RepassIA API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use(errorMiddleware);

module.exports = app;

