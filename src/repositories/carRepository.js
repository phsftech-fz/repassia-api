const { prisma } = require('../config/database');

class CarRepository {
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Máximo 100

    const where = {};

    if (filters.brand) {
      where.brand = { contains: filters.brand, mode: 'insensitive' };
    }

    if (filters.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }

    // Filtro de ano: range (minYear/maxYear) tem prioridade sobre ano exato
    if (filters.minYear || filters.maxYear) {
      where.year = {};
      if (filters.minYear) {
        where.year.gte = parseInt(filters.minYear, 10);
      }
      if (filters.maxYear) {
        where.year.lte = parseInt(filters.maxYear, 10);
      }
    } else if (filters.year) {
      where.year = parseInt(filters.year, 10);
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        where.price.lte = parseFloat(filters.maxPrice);
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }

    if (filters.transmission) {
      where.transmission = filters.transmission;
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take,
        include: {
          images: {
            orderBy: { displayOrder: 'asc' }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.car.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  async findById(id) {
    return await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
  }

  async create(carData) {
    return await prisma.car.create({
      data: carData,
      include: {
        images: true
      }
    });
  }

  async update(id, carData) {
    return await prisma.car.update({
      where: { id },
      data: carData,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
  }

  async delete(id) {
    await prisma.car.delete({
      where: { id }
    });
    return true;
  }

  async findOldCars(daysAgo, excludeStatus = 'vendido') {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

    return await prisma.car.findMany({
      where: {
        createdAt: {
          lt: dateThreshold
        },
        status: {
          not: excludeStatus
        }
      },
      include: {
        images: true
      }
    });
  }
}

module.exports = new CarRepository();

