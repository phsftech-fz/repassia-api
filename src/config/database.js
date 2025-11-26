const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prismaLogLevel = process.env.PRISMA_LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'warn' : 'error');

const prisma = new PrismaClient({
  log: prismaLogLevel === 'query' 
    ? [{ level: 'query', emit: 'event' }]
    : prismaLogLevel === 'warn'
    ? ['warn', 'error']
    : ['error']
});

if (prismaLogLevel === 'query' && process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 1000) {
      logger.warn(`Query lenta detectada (${e.duration}ms): ${e.query.substring(0, 100)}...`);
    }
  });
}

// Conectar ao banco de dados (não bloqueia a inicialização)
prisma.$connect()
  .then(() => {
    logger.info('Conectado ao PostgreSQL via Prisma');
  })
  .catch((error) => {
    logger.error('Erro ao conectar ao PostgreSQL:', error.message || error);
    // Não encerra o processo aqui, deixa o startServer tratar
  });

process.on('beforeExit', async () => {
  await prisma.$disconnect();
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

