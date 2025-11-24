require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { startSchedulers } = require('./src/schedulers');
const config = require('./src/config/env');

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📝 Ambiente: ${config.server.nodeEnv}`);
  logger.info(`🌐 API Base URL: ${config.server.apiBaseUrl}`);

  // Iniciar schedulers
  startSchedulers();
  logger.info('⏰ Schedulers iniciados');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

