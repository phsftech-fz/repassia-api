const Minio = require('minio');
const config = require('./env');
const logger = require('../utils/logger');

const minioClient = new Minio.Client({
  endPoint: config.minio.endpoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey
});

// Criar bucket se não existir
const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(config.minio.bucket);
    if (!exists) {
      await minioClient.makeBucket(config.minio.bucket, 'us-east-1');
      logger.info(`✅ Bucket "${config.minio.bucket}" criado`);
    } else {
      logger.info(`✅ Bucket "${config.minio.bucket}" já existe`);
    }
  } catch (error) {
    logger.error('Erro ao verificar/criar bucket:', error);
  }
};

// Verificar conexão
const checkMinioConnection = async () => {
  try {
    await minioClient.bucketExists(config.minio.bucket);
    return true;
  } catch (error) {
    logger.error('Erro ao verificar conexão com MinIO:', error);
    return false;
  }
};

// Inicializar bucket na inicialização
ensureBucket();

module.exports = {
  minioClient,
  checkMinioConnection,
  ensureBucket
};

