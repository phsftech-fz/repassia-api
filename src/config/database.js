const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error']
});

// Conectar ao banco
prisma.$connect()
  .then(() => {
    logger.info('✅ Conectado ao PostgreSQL via Prisma');
  })
  .catch((error) => {
    logger.error('❌ Erro ao conectar ao PostgreSQL:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Desconectado do PostgreSQL');
});

const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Erro ao verificar conexão com banco:', error);
    return false;
  }
};

module.exports = {
  prisma,
  checkDatabaseConnection
};

