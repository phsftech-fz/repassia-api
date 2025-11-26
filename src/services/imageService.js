const { prisma } = require('../config/database');
const imageRepository = require('../repositories/imageRepository');
const storageService = require('./storageService');
const { formatImages, formatImage } = require('../utils/imageUrlHelper');
const logger = require('../utils/logger');

class ImageService {
  async getImagesByCarId(carId) {
    const images = await imageRepository.findByCarId(carId);
    return formatImages(images);
  }

  async uploadImages(carId, files) {
    if (!files || files.length === 0) {
      throw new Error('Nenhum arquivo enviado');
    }

    // Verificar se carro existe
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      throw new Error('Carro não encontrado');
    }

    // Contar imagens existentes
    const existingCount = await imageRepository.countByCarId(carId);
    const isFirstImage = existingCount === 0;

    // Upload de todas as imagens
    const uploadPromises = files.map(async (file, index) => {
      const uploadResult = await storageService.uploadFile(file, carId);
      
      return {
        carId,
        imageUrl: uploadResult.fileName, // Salvar apenas o path
        displayOrder: existingCount + index,
        isPrimary: isFirstImage && index === 0
      };
    });

    const imagesData = await Promise.all(uploadPromises);

    // Salvar no banco
    await imageRepository.createMany(imagesData);

    logger.info(`${files.length} imagem(ns) adicionada(s) ao carro ${carId}`);

    const images = await imageRepository.findByCarId(carId);
    return formatImages(images);
  }

  async deleteImage(imageId) {
    const image = await imageRepository.findById(imageId);
    
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    // Extrair nome do arquivo (pode ser path ou URL completa)
    const fileName = storageService.extractFileNameFromUrl(image.imageUrl);
    
    // Deletar do MinIO
    if (fileName) {
      try {
        await storageService.deleteFile(fileName);
      } catch (error) {
        logger.warn(`Erro ao deletar arquivo do MinIO: ${error.message}`);
      }
    }

    // Deletar do banco
    await imageRepository.delete(imageId);

    logger.info(`Imagem deletada: ${imageId}`);

    return true;
  }

  async setPrimaryImage(imageId) {
    const image = await imageRepository.findById(imageId);
    
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    // Usar transação para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // Remover primary de todas as imagens do carro
      await tx.carImage.updateMany({
        where: { carId: image.carId },
        data: { isPrimary: false }
      });

      // Definir esta imagem como primary
      await tx.carImage.update({
        where: { id: imageId },
        data: { isPrimary: true }
      });
    });

    logger.info(`Imagem ${imageId} definida como principal`);

    const updatedImage = await imageRepository.findById(imageId);
    return formatImage(updatedImage);
  }

  async updateImageOrder(imageId, displayOrder) {
    const image = await imageRepository.findById(imageId);
    
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    const updatedImage = await imageRepository.updateOrder(imageId, displayOrder);
    logger.info(`Ordem da imagem ${imageId} atualizada para ${displayOrder}`);

    return formatImage(updatedImage);
  }
}

module.exports = new ImageService();

