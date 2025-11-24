const { prisma } = require('../config/database');

class ImageRepository {
  async findByCarId(carId) {
    return await prisma.carImage.findMany({
      where: { carId },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async findById(id) {
    return await prisma.carImage.findUnique({
      where: { id },
      include: {
        car: true
      }
    });
  }

  async create(imageData) {
    return await prisma.carImage.create({
      data: imageData
    });
  }

  async createMany(imagesData) {
    return await prisma.carImage.createMany({
      data: imagesData
    });
  }

  async update(id, imageData) {
    return await prisma.carImage.update({
      where: { id },
      data: imageData
    });
  }

  async delete(id) {
    await prisma.carImage.delete({
      where: { id }
    });
    return true;
  }

  async countByCarId(carId) {
    return await prisma.carImage.count({
      where: { carId }
    });
  }

  async unsetPrimaryByCarId(carId) {
    return await prisma.carImage.updateMany({
      where: { carId },
      data: { isPrimary: false }
    });
  }

  async setPrimary(id) {
    return await prisma.carImage.update({
      where: { id },
      data: { isPrimary: true }
    });
  }

  async updateOrder(id, displayOrder) {
    return await prisma.carImage.update({
      where: { id },
      data: { displayOrder }
    });
  }
}

module.exports = new ImageRepository();

