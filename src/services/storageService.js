const { minioClient } = require('../config/minio');
const config = require('../config/env');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../utils/logger');

class StorageService {
  async uploadFile(file, carId) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${carId}/${uuidv4()}${fileExtension}`;
      
      await minioClient.putObject(
        config.minio.bucket,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype
        }
      );

      const url = `${config.server.apiBaseUrl}/api/v1/images/${fileName}`;
      
      logger.info(`Arquivo enviado: ${fileName}`);
      return {
        url,
        fileName,
        size: file.size,
        mimetype: file.mimetype
      };
    } catch (error) {
      logger.error('Erro ao fazer upload do arquivo:', error);
      throw new Error('Erro ao fazer upload do arquivo');
    }
  }

  async deleteFile(fileName) {
    try {
      await minioClient.removeObject(config.minio.bucket, fileName);
      logger.info(`Arquivo removido: ${fileName}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao remover arquivo ${fileName}:`, error);
      throw new Error('Erro ao remover arquivo');
    }
  }

  async getFile(fileName) {
    try {
      const stream = await minioClient.getObject(config.minio.bucket, fileName);
      const stat = await minioClient.statObject(config.minio.bucket, fileName);
      
      return {
        stream,
        stat
      };
    } catch (error) {
      logger.error(`Erro ao obter arquivo ${fileName}:`, error);
      throw new Error('Arquivo não encontrado');
    }
  }

  extractFileNameFromUrl(url) {
    const parts = url.split('/api/v1/images/');
    return parts.length > 1 ? parts[1] : null;
  }
}

module.exports = new StorageService();

