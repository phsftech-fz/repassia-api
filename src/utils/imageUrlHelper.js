const config = require('../config/env');

/**
 * Monta a URL completa de uma imagem a partir do path
 * @param {string} imagePath - Path da imagem (ex: "car-id/uuid.jpg")
 * @returns {string} URL completa da imagem
 */
function buildImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Se já for uma URL completa, retornar como está (compatibilidade com dados antigos)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remover barra inicial se existir
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${config.server.apiBaseUrl}/api/v1/images/${cleanPath}`;
}

/**
 * Extrai o path de uma URL de imagem ou retorna o próprio path se já for um path
 * @param {string} urlOrPath - URL completa ou path da imagem
 * @returns {string|null} Path da imagem ou null se inválido
 */
function extractImagePath(urlOrPath) {
  if (!urlOrPath) return null;
  
  // Se já for um path (não começa com http), retornar como está
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  
  // Extrair path de URL completa
  const parts = urlOrPath.split('/api/v1/images/');
  return parts.length > 1 ? parts[1] : null;
}

/**
 * Formata um objeto de imagem adicionando a URL completa
 * @param {object} image - Objeto de imagem do banco
 * @returns {object} Objeto de imagem com imageUrl formatado
 */
function formatImage(image) {
  if (!image) return null;
  
  return {
    ...image,
    imageUrl: buildImageUrl(image.imageUrl)
  };
}

/**
 * Formata um array de imagens adicionando URLs completas
 * @param {array} images - Array de imagens do banco
 * @returns {array} Array de imagens com imageUrl formatado
 */
function formatImages(images) {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(formatImage);
}

/**
 * Formata um objeto de carro, incluindo suas imagens
 * @param {object} car - Objeto de carro do banco
 * @returns {object} Objeto de carro com imagens formatadas
 */
function formatCarWithImages(car) {
  if (!car) return null;
  
  return {
    ...car,
    images: formatImages(car.images)
  };
}

/**
 * Formata um array de carros, incluindo suas imagens
 * @param {array} cars - Array de carros do banco
 * @returns {array} Array de carros com imagens formatadas
 */
function formatCarsWithImages(cars) {
  if (!cars || !Array.isArray(cars)) return [];
  
  return cars.map(formatCarWithImages);
}

module.exports = {
  buildImageUrl,
  extractImagePath,
  formatImage,
  formatImages,
  formatCarWithImages,
  formatCarsWithImages
};

