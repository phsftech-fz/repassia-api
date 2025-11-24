const carRepository = require('../repositories/carRepository');
const logger = require('../utils/logger');

class CarService {
  async listCars(filters, pagination) {
    return await carRepository.findAll(filters, pagination);
  }

  async getCarById(id) {
    const car = await carRepository.findById(id);
    
    if (!car) {
      throw new Error('Carro não encontrado');
    }

    return car;
  }

  async createCar(carData) {
    // Dados já foram validados e normalizados pelo validator
    // Apenas garantir tipos corretos para campos numéricos
    const normalizedData = {
      brand: carData.brand,
      model: carData.model,
      year: typeof carData.year === 'number' ? carData.year : parseInt(carData.year, 10),
      price: typeof carData.price === 'number' ? carData.price : parseFloat(carData.price),
      mileage: carData.mileage !== undefined && carData.mileage !== null 
        ? (typeof carData.mileage === 'number' ? carData.mileage : parseInt(carData.mileage, 10))
        : 0,
      color: carData.color || null,
      fuelType: carData.fuelType || null,
      transmission: carData.transmission || null,
      description: carData.description || null,
      status: carData.status || 'disponível',
      licensePlate: carData.licensePlate || null,
      chassis: carData.chassis || null
    };

    const car = await carRepository.create(normalizedData);
    logger.info(`Carro criado: ${car.id}`);
    
    return car;
  }

  async updateCar(id, carData) {
    const car = await carRepository.findById(id);
    
    if (!car) {
      throw new Error('Carro não encontrado');
    }

    // Dados já foram validados pelo validator
    // Apenas garantir tipos corretos para campos numéricos
    const normalizedData = {};
    
    if (carData.brand !== undefined) normalizedData.brand = carData.brand;
    if (carData.model !== undefined) normalizedData.model = carData.model;
    if (carData.year !== undefined) {
      normalizedData.year = typeof carData.year === 'number' 
        ? carData.year 
        : parseInt(carData.year, 10);
    }
    if (carData.price !== undefined) {
      normalizedData.price = typeof carData.price === 'number' 
        ? carData.price 
        : parseFloat(carData.price);
    }
    if (carData.mileage !== undefined) {
      normalizedData.mileage = carData.mileage !== null
        ? (typeof carData.mileage === 'number' 
            ? carData.mileage 
            : parseInt(carData.mileage, 10))
        : 0;
    }
    if (carData.color !== undefined) normalizedData.color = carData.color || null;
    if (carData.fuelType !== undefined) normalizedData.fuelType = carData.fuelType || null;
    if (carData.transmission !== undefined) normalizedData.transmission = carData.transmission || null;
    if (carData.description !== undefined) normalizedData.description = carData.description || null;
    if (carData.status !== undefined) normalizedData.status = carData.status;
    if (carData.licensePlate !== undefined) normalizedData.licensePlate = carData.licensePlate || null;
    if (carData.chassis !== undefined) normalizedData.chassis = carData.chassis || null;

    const updatedCar = await carRepository.update(id, normalizedData);
    logger.info(`Carro atualizado: ${id}`);
    
    return updatedCar;
  }

  async updateCarStatus(id, status) {
    const car = await carRepository.findById(id);
    
    if (!car) {
      throw new Error('Carro não encontrado');
    }

    const updatedCar = await carRepository.update(id, { status });
    logger.info(`Status do carro ${id} atualizado para ${status}`);
    
    return updatedCar;
  }

  async deleteCar(id) {
    const car = await carRepository.findById(id);
    
    if (!car) {
      throw new Error('Carro não encontrado');
    }

    await carRepository.delete(id);
    logger.info(`Carro deletado: ${id}`);
    
    return true;
  }

  async getOldCars(daysAgo) {
    return await carRepository.findOldCars(daysAgo);
  }
}

module.exports = new CarService();

