const carService = require('../services/carService');
const { success, successWithMeta, error } = require('../utils/response');
const logger = require('../utils/logger');

class CarController {
  async listCars(req, res) {
    try {
      const filters = {
        brand: req.query.brand,
        model: req.query.model,
        year: req.query.year,
        minYear: req.query.min_year,
        maxYear: req.query.max_year,
        minPrice: req.query.min_price,
        maxPrice: req.query.max_price,
        status: req.query.status,
        fuelType: req.query.fuel_type,
        transmission: req.query.transmission,
        sortBy: req.query.sort_by,
        sortOrder: req.query.sort_order
      };

      const pagination = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20
      };

      const result = await carService.listCars(filters, pagination);
      
      return successWithMeta(res, result.data, result.meta);
    } catch (err) {
      logger.error('Erro ao listar carros:', err);
      return error(res, 'Erro ao listar carros', 'LIST_ERROR', null, 500);
    }
  }

  async getCarById(req, res) {
    try {
      const car = await carService.getCarById(req.params.id);
      return success(res, car);
    } catch (err) {
      if (err.message === 'Carro não encontrado') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao buscar carro:', err);
      return error(res, 'Erro ao buscar carro', 'GET_ERROR', null, 500);
    }
  }

  async createCar(req, res) {
    try {
      const car = await carService.createCar(req.body);
      return success(res, car, 'Carro criado com sucesso', 201);
    } catch (err) {
      logger.error('Erro ao criar carro:', err);
      return error(res, err.message || 'Erro ao criar carro', 'CREATE_ERROR', null, 500);
    }
  }

  async updateCar(req, res) {
    try {
      const car = await carService.updateCar(req.params.id, req.body);
      return success(res, car, 'Carro atualizado com sucesso');
    } catch (err) {
      if (err.message === 'Carro não encontrado') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao atualizar carro:', err);
      return error(res, err.message || 'Erro ao atualizar carro', 'UPDATE_ERROR', null, 500);
    }
  }

  async updateCarStatus(req, res) {
    try {
      const car = await carService.updateCarStatus(req.params.id, req.body.status);
      return success(res, car, 'Status atualizado com sucesso');
    } catch (err) {
      if (err.message === 'Carro não encontrado') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao atualizar status:', err);
      return error(res, err.message || 'Erro ao atualizar status', 'UPDATE_ERROR', null, 500);
    }
  }

  async deleteCar(req, res) {
    try {
      await carService.deleteCar(req.params.id);
      return success(res, null, 'Carro deletado com sucesso');
    } catch (err) {
      if (err.message === 'Carro não encontrado') {
        return error(res, err.message, 'NOT_FOUND', null, 404);
      }
      logger.error('Erro ao deletar carro:', err);
      return error(res, err.message || 'Erro ao deletar carro', 'DELETE_ERROR', null, 500);
    }
  }
}

module.exports = new CarController();

