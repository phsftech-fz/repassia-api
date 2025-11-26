require('dotenv').config();

// Verificar se Prisma Client está atualizado (apenas aviso, não bloqueia)
try {
  const { prisma } = require('./src/config/database');
  // Tentar acessar um modelo para verificar se está atualizado
  if (prisma && typeof prisma.refreshToken === 'undefined') {
    console.warn('⚠️ AVISO: Prisma Client pode estar desatualizado.');
    console.warn('⚠️ Execute: npx prisma generate');
  }
} catch (error) {
  // Ignorar erros de importação aqui
}

const app = require('./src/app');
const logger = require('./src/utils/logger');
const { startSchedulers, stopSchedulers } = require('./src/schedulers');
const { checkDatabaseConnection } = require('./src/config/database');
const { prisma } = require('./src/config/database');
const { checkMinioConnection, ensureBucket } = require('./src/config/minio');
const config = require('./src/config/env');

const PORT = config.server.port;
let server = null;

// Função para inicializar serviços antes de iniciar o servidor
const initializeServices = async () => {
  try {
    logger.info('Iniciando serviços...');

    // Verificar conexão com banco de dados
    logger.info('Verificando conexão com banco de dados...');
    const dbConnected = await Promise.race([
      checkDatabaseConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout após 10 segundos')), 10000))
    ]).catch((error) => {
      logger.error('Erro ao verificar banco de dados:', error.message || error);
      return false;
    });

    if (!dbConnected) {
      logger.error('❌ Falha ao conectar com o banco de dados. Verifique DATABASE_URL no .env');
      logger.error('Encerrando servidor...');
      process.exit(1);
    }
    logger.info('✅ Banco de dados conectado');

    // Verificar/criar bucket do MinIO
    logger.info('Verificando MinIO...');
    try {
      await Promise.race([
        ensureBucket(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout após 10 segundos')), 10000))
      ]);
      logger.info('✅ MinIO inicializado');
    } catch (error) {
      logger.warn('⚠️ Aviso ao inicializar MinIO:', error.message || error);
      logger.warn('⚠️ O servidor continuará, mas uploads de imagens podem falhar');
      // Não bloqueia a inicialização se MinIO falhar
    }

    logger.info('✅ Serviços inicializados');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao inicializar serviços:', error.message || error);
    logger.error('Stack:', error.stack);
    throw error;
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} recebido, encerrando servidor graciosamente...`);
  
  if (server) {
    server.close(() => {
      logger.info('Servidor HTTP fechado');
    });
  }
  
  stopSchedulers();
  
  try {
    await prisma.$disconnect();
    logger.info('Conexão com banco de dados fechada');
  } catch (error) {
    logger.error('Erro ao fechar conexão com banco:', error);
  }
  
  setTimeout(() => {
    logger.info('Encerrando processo...');
    process.exit(0);
  }, 5000);
};

const startServer = async () => {
  try {
    await initializeServices();

    server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📝 Ambiente: ${config.server.nodeEnv}`);
      logger.info(`🌐 API Base URL: ${config.server.apiBaseUrl}`);

      startSchedulers();
      logger.info('⏰ Schedulers iniciados');
    });
  } catch (error) {
    logger.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

