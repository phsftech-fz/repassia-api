const Joi = require('joi');

const currentYear = new Date().getFullYear();

// Helper para validar strings não vazias (após trim)
const nonEmptyString = Joi.string().trim().min(1);

const carSchema = Joi.object({
  brand: nonEmptyString.required().messages({
    'string.empty': 'Marca é obrigatória e não pode estar vazia',
    'string.min': 'Marca é obrigatória e não pode estar vazia',
    'any.required': 'Marca é obrigatória'
  }),
  model: nonEmptyString.required().messages({
    'string.empty': 'Modelo é obrigatório e não pode estar vazio',
    'string.min': 'Modelo é obrigatório e não pode estar vazio',
    'any.required': 'Modelo é obrigatório'
  }),
  year: Joi.number().integer().min(1900).max(currentYear + 1).required().messages({
    'number.base': 'Ano deve ser um número',
    'number.integer': 'Ano deve ser um número inteiro',
    'number.min': 'Ano deve ser maior ou igual a 1900',
    'number.max': `Ano deve ser menor ou igual a ${currentYear + 1}`,
    'any.required': 'Ano é obrigatório'
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Preço deve ser um número',
    'number.positive': 'Preço deve ser maior que zero',
    'any.required': 'Preço é obrigatório'
  }),
  mileage: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Quilometragem deve ser um número',
    'number.integer': 'Quilometragem deve ser um número inteiro',
    'number.min': 'Quilometragem deve ser maior ou igual a zero'
  }),
  color: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  fuelType: Joi.string().trim().valid('gasolina', 'etanol', 'flex', 'diesel', 'elétrico', 'híbrido').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Tipo de combustível deve ser: gasolina, etanol, flex, diesel, elétrico ou híbrido'
  }),
  transmission: Joi.string().trim().valid('manual', 'automático', 'automatizado', 'cvt').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Transmissão deve ser: manual, automático, automatizado ou cvt'
  }),
  description: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  status: Joi.string().trim().valid('disponível', 'reservado', 'vendido').default('disponível').messages({
    'any.only': 'Status deve ser: disponível, reservado ou vendido'
  }),
  licensePlate: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  chassis: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional()
});

const carUpdateSchema = Joi.object({
  brand: nonEmptyString.optional().messages({
    'string.empty': 'Marca não pode estar vazia',
    'string.min': 'Marca não pode estar vazia'
  }),
  model: nonEmptyString.optional().messages({
    'string.empty': 'Modelo não pode estar vazio',
    'string.min': 'Modelo não pode estar vazio'
  }),
  year: Joi.number().integer().min(1900).max(currentYear + 1).optional().messages({
    'number.base': 'Ano deve ser um número',
    'number.integer': 'Ano deve ser um número inteiro',
    'number.min': 'Ano deve ser maior ou igual a 1900',
    'number.max': `Ano deve ser menor ou igual a ${currentYear + 1}`
  }),
  price: Joi.number().positive().optional().messages({
    'number.base': 'Preço deve ser um número',
    'number.positive': 'Preço deve ser maior que zero'
  }),
  mileage: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Quilometragem deve ser um número',
    'number.integer': 'Quilometragem deve ser um número inteiro',
    'number.min': 'Quilometragem deve ser maior ou igual a zero'
  }),
  color: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  fuelType: Joi.string().trim().valid('gasolina', 'etanol', 'flex', 'diesel', 'elétrico', 'híbrido').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Tipo de combustível deve ser: gasolina, etanol, flex, diesel, elétrico ou híbrido'
  }),
  transmission: Joi.string().trim().valid('manual', 'automático', 'automatizado', 'cvt').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Transmissão deve ser: manual, automático, automatizado ou cvt'
  }),
  description: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  status: Joi.string().trim().valid('disponível', 'reservado', 'vendido').optional().messages({
    'any.only': 'Status deve ser: disponível, reservado ou vendido'
  }),
  licensePlate: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  chassis: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional()
}).min(1).messages({
  'object.min': 'É necessário enviar pelo menos um campo para atualizar'
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().trim().valid('disponível', 'reservado', 'vendido').required().messages({
    'any.only': 'Status deve ser: disponível, reservado ou vendido',
    'string.empty': 'Status é obrigatório',
    'any.required': 'Status é obrigatório'
  })
});

const requestCodeSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  })
});

const verifyCodeSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  }),
  code: Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'Código deve ter exatamente 6 dígitos',
    'string.pattern.base': 'Código deve conter apenas números',
    'string.empty': 'Código é obrigatório',
    'any.required': 'Código é obrigatório'
  })
});

const imageOrderSchema = Joi.object({
  display_order: Joi.number().integer().min(0).required().messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a zero',
    'any.required': 'Ordem é obrigatória'
  })
});

const validateTokenSchema = Joi.object({
  token: nonEmptyString.required().messages({
    'string.empty': 'Token é obrigatório e não pode estar vazio',
    'string.min': 'Token é obrigatório e não pode estar vazio',
    'any.required': 'Token é obrigatório'
  })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true // Converte tipos automaticamente (ex: "123" -> 123)
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Erro de validação',
          details
        }
      });
    }

    // Aplicar trim em todas as strings do objeto
    const trimStrings = (obj) => {
      if (typeof obj === 'string') {
        return obj.trim();
      }
      if (Array.isArray(obj)) {
        return obj.map(trimStrings);
      }
      if (obj && typeof obj === 'object') {
        const trimmed = {};
        for (const key in obj) {
          if (obj[key] !== null && obj[key] !== undefined) {
            trimmed[key] = trimStrings(obj[key]);
          } else {
            trimmed[key] = obj[key];
          }
        }
        return trimmed;
      }
      return obj;
    };

    req.body = trimStrings(value);
    next();
  };
};

module.exports = {
  carSchema,
  carUpdateSchema,
  statusUpdateSchema,
  requestCodeSchema,
  verifyCodeSchema,
  imageOrderSchema,
  validateTokenSchema,
  validate
};

