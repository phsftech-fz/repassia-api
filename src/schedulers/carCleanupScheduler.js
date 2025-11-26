const cron = require('node-cron');
const carService = require('../services/carService');
const storageService = require('../services/storageService');
const { extractImagePath } = require('../utils/imageUrlHelper');
const config = require('../config/env');
const logger = require('../utils/logger');

let cleanupJob = null;

const runCleanup = async () => {
  try {
    logger.info('Iniciando limpeza automática de carros...');
    
    const daysAgo = config.scheduler.cleanupDays;
    const oldCars = await carService.getOldCars(daysAgo);

    logger.info(`Encontrados ${oldCars.length} carro(s) para remoção`);

    let deletedCount = 0;
    for (const car of oldCars) {
      try {
        // Deletar imagens do MinIO
        for (const image of car.images) {
          const fileName = extractImagePath(image.imageUrl);
          if (fileName) {
            try {
              await storageService.deleteFile(fileName);
            } catch (err) {
              logger.warn(`Erro ao deletar arquivo do MinIO durante limpeza: ${err.message}`);
            }
          }
        }

        // Deletar carro (cascade deleta imagens do banco)
        await carService.deleteCar(car.id);
        deletedCount++;
        logger.info(`Carro ${car.id} removido automaticamente`);
      } catch (err) {
        logger.error(`Erro ao remover carro ${car.id} na limpeza automática:`, err);
      }
    }

    logger.info(`Limpeza automática concluída. ${deletedCount} carro(s) removido(s)`);
  } catch (error) {
    logger.error('Erro na limpeza automática:', error);
  }
};

const startScheduler = () => {
  if (cleanupJob) {
    logger.warn('Scheduler já está em execução');
    return;
  }

  const schedule = config.scheduler.schedule;
  
  cleanupJob = cron.schedule(schedule, runCleanup, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
  });

  logger.info(`⏰ Scheduler de limpeza configurado: ${schedule}`);
};

const stopScheduler = () => {
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    logger.info('Scheduler de limpeza parado');
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  runCleanup
};

