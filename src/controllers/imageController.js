const imageService = require('../services/imageService');
const storageService = require('../services/storageService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class ImageController {
  async getImagesByCarId(req, res) {
    try {
      const images = await imageService.getImagesByCarId(req.params.id);
      return success(res, images);
    } catch (err) {
      logger.error('Erro ao buscar imagens:', err);
      return error(res, 'Erro ao buscar imagens', 'GET_ERROR', null, 500);
    }
  }

  async uploadImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return error(res, 'Nenhum arquivo enviado', 'VALIDATION_ERROR', null, 400);
      }

      const images = await imageService.uploadImages(req.params.id, req.files);
      return success(res, images, 'Imagens enviadas com sucesso', 201);
    } catch (err) {
      if (err.message === 'Carro não encontrado') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao fazer upload de imagens:', err);
      return error(res, err.message || 'Erro ao fazer upload de imagens', 'UPLOAD_ERROR', null, 500);
    }
  }

  async deleteImage(req, res) {
    try {
      await imageService.deleteImage(req.params.id);
      return success(res, null, 'Imagem deletada com sucesso');
    } catch (err) {
      if (err.message === 'Imagem não encontrada') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao deletar imagem:', err);
      return error(res, err.message || 'Erro ao deletar imagem', 'DELETE_ERROR', null, 500);
    }
  }

  async setPrimaryImage(req, res) {
    try {
      const image = await imageService.setPrimaryImage(req.params.id);
      return success(res, image, 'Imagem principal definida com sucesso');
    } catch (err) {
      if (err.message === 'Imagem não encontrada') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao definir imagem principal:', err);
      return error(res, err.message || 'Erro ao definir imagem principal', 'UPDATE_ERROR', null, 500);
    }
  }

  async updateImageOrder(req, res) {
    try {
      const image = await imageService.updateImageOrder(req.params.id, req.body.displayOrder);
      return success(res, image, 'Ordem da imagem atualizada com sucesso');
    } catch (err) {
      if (err.message === 'Imagem não encontrada') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao atualizar ordem da imagem:', err);
      return error(res, err.message || 'Erro ao atualizar ordem da imagem', 'UPDATE_ERROR', null, 500);
    }
  }

  async serveImage(req, res) {
    try {
      const fileName = req.params[0] || req.params.filename;
      
      if (!fileName) {
        return error(res, 'Nome do arquivo não fornecido', 'VALIDATION_ERROR', null, 400);
      }

      const fileData = await storageService.getFile(fileName);
      
      const contentType = fileData.stat.metaData['content-type'] || 
                         fileData.stat.metaData['Content-Type'] ||
                         'image/jpeg';
      
      const config = require('../config/env');
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
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileData.stat.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Vary', 'Origin');
      
      fileData.stream.pipe(res);
    } catch (err) {
      logger.error('Erro ao servir imagem:', err);
      return error(res, 'Imagem não encontrada', 'NOT_FOUND', null, 404);
    }
  }
}

module.exports = new ImageController();

