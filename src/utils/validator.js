const Joi = require('joi');
const { validateCPF } = require('./cpfValidator');
const config = require('../config/env');

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
  fuelType: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  transmission: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
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
  fuelType: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
  transmission: Joi.string().trim().allow(null, '').empty(['', null]).default(null).optional(),
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
  displayOrder: Joi.number().integer().min(0).required().messages({
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

const refreshTokenSchema = Joi.object({
  refreshToken: nonEmptyString.required().messages({
    'string.empty': 'Refresh token é obrigatório e não pode estar vazio',
    'string.min': 'Refresh token é obrigatório e não pode estar vazio',
    'any.required': 'Refresh token é obrigatório'
  })
});

// Schema para validação de CPF customizado
const cpfSchema = Joi.string().custom((value, helpers) => {
  const cleanCPF = value.replace(/\D/g, '');
  if (cleanCPF.length !== 11) {
    return helpers.error('string.length');
  }
  if (!validateCPF(cleanCPF)) {
    return helpers.error('custom.cpf');
  }
  return cleanCPF;
}, 'CPF validation').messages({
  'string.length': 'CPF deve conter 11 dígitos',
  'custom.cpf': 'CPF inválido'
});

// Schema para telefone brasileiro (10-11 dígitos)
const phoneSchema = Joi.string().custom((value, helpers) => {
  const cleanPhone = value.replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return helpers.error('string.length');
  }
  return cleanPhone;
}, 'Phone validation').messages({
  'string.length': 'Telefone deve conter 10 ou 11 dígitos'
});

// Schema para CEP brasileiro (8 dígitos)
const zipCodeSchema = Joi.string().custom((value, helpers) => {
  const cleanZipCode = value.replace(/\D/g, '');
  if (cleanZipCode.length !== 8) {
    return helpers.error('string.length');
  }
  return cleanZipCode;
}, 'ZipCode validation').messages({
  'string.length': 'CEP deve conter 8 dígitos'
});

// Schema para data de nascimento com validação de idade mínima
const birthDateSchema = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).custom((value, helpers) => {
  const [year, month, day] = value.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  
  if (isNaN(birthDate.getTime())) {
    return helpers.error('date.base');
  }
  
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  
  if (actualAge < config.form.minAge) {
    return helpers.error('custom.age');
  }
  
  if (birthDate > today) {
    return helpers.error('date.max');
  }
  
  return value; // Retornar string
}, 'Age validation').messages({
  'string.pattern.base': 'Data de nascimento deve estar no formato YYYY-MM-DD',
  'date.base': 'Data de nascimento inválida',
  'date.max': 'Data de nascimento não pode ser futura',
  'custom.age': `Idade mínima é ${config.form.minAge} anos`
});

// Schema para data de admissão (não pode ser futura)
const admissionDateSchema = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).custom((value, helpers) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) {
    return helpers.error('date.base');
  }
  
  if (date > new Date()) {
    return helpers.error('date.max');
  }
  
  return value; // Retornar string
}, 'Admission date validation').messages({
  'string.pattern.base': 'Data de admissão deve estar no formato YYYY-MM-DD',
  'date.base': 'Data de admissão inválida',
  'date.max': 'Data de admissão não pode ser futura'
});

// Schema para estado (UF) - 2 letras maiúsculas
const stateSchema = Joi.string().trim().length(2).uppercase().messages({
  'string.length': 'Estado deve ser uma sigla de 2 letras'
});

// Schema para dados pessoais
const personalDataSchema = Joi.object({
  fullName: nonEmptyString.min(3).max(200).required().messages({
    'string.min': 'Nome completo deve ter no mínimo 3 caracteres',
    'string.max': 'Nome completo deve ter no máximo 200 caracteres',
    'any.required': 'Nome completo é obrigatório'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),
  phone: phoneSchema.required().messages({
    'any.required': 'Telefone é obrigatório'
  }),
  rg: Joi.string().trim().replace(/\D/g, '').allow(null, '').empty(['', null]).default(null).optional(),
  cpf: cpfSchema.required().messages({
    'any.required': 'CPF é obrigatório'
  }),
  birthDate: birthDateSchema.required().messages({
    'any.required': 'Data de nascimento é obrigatória'
  }),
  motherName: nonEmptyString.min(3).max(200).required().messages({
    'string.min': 'Nome da mãe deve ter no mínimo 3 caracteres',
    'string.max': 'Nome da mãe deve ter no máximo 200 caracteres',
    'any.required': 'Nome da mãe é obrigatório'
  }),
  fatherName: nonEmptyString.min(3).max(200).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.min': 'Nome do pai deve ter no mínimo 3 caracteres se fornecido'
  }),
  birthCity: nonEmptyString.min(2).max(100).required().messages({
    'string.min': 'Cidade de nascimento deve ter no mínimo 2 caracteres',
    'string.max': 'Cidade de nascimento deve ter no máximo 100 caracteres',
    'any.required': 'Cidade de nascimento é obrigatória'
  }),
  birthState: stateSchema.allow(null, '').empty(['', null]).default(null).optional(),
  maritalStatus: Joi.string().trim().valid('solteiro', 'casado', 'divorciado', 'viúvo', 'união estável').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Estado civil deve ser: solteiro, casado, divorciado, viúvo ou união estável'
  }),
  hasDriverLicense: Joi.boolean().default(false),
  driverLicenseCategory: Joi.string().trim().valid('A', 'B', 'AB', 'C', 'D', 'E').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Categoria da CNH deve ser: A, B, AB, C, D ou E'
  })
});

// Schema para dados residenciais
const residentialDataSchema = Joi.object({
  zipCode: zipCodeSchema.required().messages({
    'any.required': 'CEP é obrigatório'
  }),
  street: nonEmptyString.min(3).max(200).required().messages({
    'string.min': 'Rua deve ter no mínimo 3 caracteres',
    'string.max': 'Rua deve ter no máximo 200 caracteres',
    'any.required': 'Rua é obrigatória'
  }),
  number: nonEmptyString.required().messages({
    'any.required': 'Número é obrigatório'
  }),
  complement: Joi.string().trim().max(100).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Complemento deve ter no máximo 100 caracteres'
  }),
  neighborhood: nonEmptyString.min(2).max(100).required().messages({
    'string.min': 'Bairro deve ter no mínimo 2 caracteres',
    'string.max': 'Bairro deve ter no máximo 100 caracteres',
    'any.required': 'Bairro é obrigatório'
  }),
  city: nonEmptyString.min(2).max(100).required().messages({
    'string.min': 'Cidade deve ter no mínimo 2 caracteres',
    'string.max': 'Cidade deve ter no máximo 100 caracteres',
    'any.required': 'Cidade é obrigatória'
  }),
  state: stateSchema.allow(null, '').empty(['', null]).default(null).optional(),
  residenceTime: Joi.string().trim().max(200).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Tempo de residência deve ter no máximo 200 caracteres'
  }),
  residenceType: Joi.string().trim().valid('própria', 'alugada', 'financiada', 'cedida', 'outros').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Tipo de residência deve ser: própria, alugada, financiada, cedida ou outros'
  })
});

// Schema para dados profissionais (validação condicional será feita no controller)
const professionalDataSchema = Joi.object({
  employmentType: Joi.string().trim().valid('assalariado', 'autônomo', 'aposentado', 'pensionista', 'empresário', 'desempregado').allow(null, '').empty(['', null]).default(null).optional().messages({
    'any.only': 'Tipo de emprego deve ser: assalariado, autônomo, aposentado, pensionista, empresário ou desempregado'
  }),
  companyName: Joi.string().trim().max(200).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Nome da empresa deve ter no máximo 200 caracteres'
  }),
  companyZipCode: zipCodeSchema.allow(null, '').empty(['', null]).default(null).optional(),
  companyPhone: phoneSchema.allow(null, '').empty(['', null]).default(null).optional(),
  companyStreet: Joi.string().trim().max(200).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Rua da empresa deve ter no máximo 200 caracteres'
  }),
  companyNeighborhood: Joi.string().trim().max(100).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Bairro da empresa deve ter no máximo 100 caracteres'
  }),
  companyCity: Joi.string().trim().max(100).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Cidade da empresa deve ter no máximo 100 caracteres'
  }),
  companyState: stateSchema.allow(null, '').empty(['', null]).default(null).optional(),
  admissionDate: admissionDateSchema.allow(null).optional(),
  grossIncome: Joi.number().positive().allow(null).optional().messages({
    'number.positive': 'Renda bruta deve ser um número positivo'
  }),
  position: Joi.string().trim().max(100).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Cargo deve ter no máximo 100 caracteres'
  }),
  activityDescription: Joi.string().trim().max(500).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Descrição da atividade deve ter no máximo 500 caracteres'
  }),
  activityTime: Joi.string().trim().max(200).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Tempo de atividade deve ter no máximo 200 caracteres'
  })
});

// Schema para referências
const referencesSchema = Joi.object({
  name: nonEmptyString.min(3).max(100).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.min': 'Nome da referência deve ter no mínimo 3 caracteres se fornecido',
    'string.max': 'Nome da referência deve ter no máximo 100 caracteres'
  }),
  phone: phoneSchema.allow(null, '').empty(['', null]).default(null).optional()
});

// Schema para interesse
const interestSchema = Joi.object({
  carId: Joi.string().uuid().allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.guid': 'ID do carro deve ser um UUID válido'
  }),
  message: Joi.string().trim().max(500).allow(null, '').empty(['', null]).default(null).optional().messages({
    'string.max': 'Mensagem deve ter no máximo 500 caracteres'
  })
});

// Schema completo do formulário
const formSubmissionSchema = Joi.object({
  personalData: personalDataSchema.required().messages({
    'any.required': 'Dados pessoais são obrigatórios'
  }),
  residentialData: residentialDataSchema.required().messages({
    'any.required': 'Dados residenciais são obrigatórios'
  }),
  professionalData: professionalDataSchema.allow(null).optional(),
  references: referencesSchema.allow(null).optional(),
  interest: interestSchema.allow(null).optional()
});

// Função para validar regras condicionais do formulário
function validateFormConditionalRules(data) {
  const errors = [];
  
  // Se não houver professionalData, não há validações condicionais
  if (!data.professionalData) {
    return errors;
  }
  
  // Normalizar employmentType para comparação (trim e lowercase)
  const employmentType = data.professionalData.employmentType 
    ? String(data.professionalData.employmentType).trim().toLowerCase() 
    : null;
  
  // Desempregado ou sem employmentType: nenhum campo profissional é obrigatório
  if (!employmentType || employmentType === 'desempregado') {
    return errors;
  }
  
  // Helper para verificar se um campo está vazio ou nulo
  const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
  };
  
  if (employmentType === 'assalariado') {
    if (isEmpty(data.professionalData.companyName)) {
      errors.push({ field: 'professionalData.companyName', message: 'Nome da empresa é obrigatório para assalariados' });
    }
    if (isEmpty(data.professionalData.admissionDate)) {
      errors.push({ field: 'professionalData.admissionDate', message: 'Data de admissão é obrigatória para assalariados' });
    }
    if (isEmpty(data.professionalData.position)) {
      errors.push({ field: 'professionalData.position', message: 'Cargo/Função é obrigatório para assalariados' });
    }
    if (isEmpty(data.professionalData.grossIncome)) {
      errors.push({ field: 'professionalData.grossIncome', message: 'Renda bruta é obrigatória para assalariados' });
    }
  } else if (employmentType === 'autônomo' || employmentType === 'empresário') {
    if (isEmpty(data.professionalData.activityDescription)) {
      errors.push({ field: 'professionalData.activityDescription', message: 'Descrição da atividade é obrigatória para autônomos/empresários' });
    }
    if (isEmpty(data.professionalData.activityTime)) {
      errors.push({ field: 'professionalData.activityTime', message: 'Tempo de atividade é obrigatório para autônomos/empresários' });
    }
    if (isEmpty(data.professionalData.grossIncome)) {
      errors.push({ field: 'professionalData.grossIncome', message: 'Renda bruta é obrigatória para autônomos/empresários' });
    }
  } else if (employmentType === 'aposentado' || employmentType === 'pensionista') {
    if (isEmpty(data.professionalData.activityTime)) {
      errors.push({ field: 'professionalData.activityTime', message: 'Tempo de aposentadoria/pensão é obrigatório' });
    }
    if (isEmpty(data.professionalData.grossIncome)) {
      errors.push({ field: 'professionalData.grossIncome', message: 'Renda é obrigatória para aposentados/pensionistas' });
    }
  }
  
  return errors;
}

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
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
    
    // Validações condicionais para formulário
    if (schema === formSubmissionSchema) {
      const conditionalErrors = validateFormConditionalRules(req.body);
      if (conditionalErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação',
            details: conditionalErrors
          }
        });
      }
    }
    
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
  refreshTokenSchema,
  formSubmissionSchema,
  validateFormConditionalRules,
  validate
};

