require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY'
  // SMTP não é obrigatório - apenas aviso se não configurado
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const errorMsg = `❌ Variáveis de ambiente obrigatórias faltando: ${missing.join(', ')}\n` +
                     `Por favor, configure essas variáveis no arquivo .env antes de iniciar a aplicação.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
};

// Validar apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  try {
    validateEnv();
  } catch (error) {
    console.error('\n========================================');
    console.error('ERRO DE CONFIGURAÇÃO');
    console.error('========================================');
    console.error(error.message);
    console.error('\nVerifique o arquivo .env e certifique-se de que todas as variáveis obrigatórias estão configuradas.');
    console.error('========================================\n');
    process.exit(1);
  }
}

module.exports = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 8080,
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080'
  },
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'repassia',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'repassia_db'
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET || 'car-images',
    useSSL: process.env.MINIO_USE_SSL === 'true'
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || process.env.SMTP_USER
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '15m', // Access token: 15 minutos
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d', // Refresh token: 7 dias
    codeExpiration: parseInt(process.env.AUTH_CODE_EXPIRATION, 10) || 15,
    codeLength: parseInt(process.env.AUTH_CODE_LENGTH, 10) || 6
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000']
  },
  scheduler: {
    cleanupDays: parseInt(process.env.CAR_CLEANUP_DAYS, 10) || 5,
    schedule: process.env.CLEANUP_SCHEDULE || '0 2 * * *'
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',') 
      : ['image/jpeg', 'image/png', 'image/webp']
  },
  form: {
    whatsappGroupLink: process.env.WHATSAPP_GROUP_LINK || '',
    rateLimitWindow: parseInt(process.env.FORM_RATE_LIMIT_WINDOW, 10) || 15,
    rateLimitMax: parseInt(process.env.FORM_RATE_LIMIT_MAX, 10) || 2,
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || '',
    sendAdminNotifications: process.env.SEND_ADMIN_NOTIFICATIONS === 'true',
    minAge: parseInt(process.env.MIN_AGE, 10) || 18
  }
};

