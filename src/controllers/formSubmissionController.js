const formSubmissionService = require('../services/formSubmissionService');
const { success, successWithMeta, error } = require('../utils/response');
const logger = require('../utils/logger');

class FormSubmissionController {
  async submitForm(req, res) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await formSubmissionService.submitForm(
        req.body,
        ipAddress,
        userAgent
      );

      return success(res, result, 200);
    } catch (err) {
      logger.error('Erro ao processar submissão do formulário:', {
        message: err.message,
        code: err.code
      });

      if (err.message === 'CAR_NOT_FOUND' || err.message === 'CAR_ID_INVALID') {
        return error(res, 'O carro informado não foi encontrado. Verifique o ID e tente novamente.', 'CAR_NOT_FOUND', null, 404);
      }

      if (err.message === 'SUBMISSION_DUPLICATED') {
        return error(res, 'Você já enviou um formulário recentemente. Verifique seu email ou tente novamente mais tarde.', 'SUBMISSION_DUPLICATED', null, 409);
      }

      if (err.message === 'Dados pessoais e residenciais são obrigatórios') {
        return error(res, 'Por favor, preencha todos os campos obrigatórios do formulário.', 'VALIDATION_ERROR', null, 400);
      }

      if (err.message.includes('birthDate inválida') || err.message.includes('admissionDate inválida')) {
        return error(res, 'Data inválida. Verifique o formato da data informada.', 'VALIDATION_ERROR', null, 400);
      }

      if (err.code === 'P2002') {
        return error(res, 'Este registro já existe no sistema. Verifique os dados informados.', 'DUPLICATE_DATA', null, 409);
      }

      if (err.code === 'P2003') {
        return error(res, 'Referência inválida. Verifique os dados informados.', 'INVALID_REFERENCE', null, 400);
      }

      return error(res, 'Ocorreu um erro ao processar seu formulário. Tente novamente mais tarde.', 'INTERNAL_ERROR', null, 500);
    }
  }

  async getSubmissions(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page, 10) || 1,
        limit: Math.min(parseInt(req.query.limit, 10) || 20, 100),
        carId: req.query.carId || null,
        employmentType: req.query.employmentType || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null
      };

      const result = await formSubmissionService.getSubmissions(filters);

      // Formatar dados para resposta
      const formattedData = result.data.map(submission => ({
        id: submission.id,
        fullName: submission.fullName,
        email: submission.email,
        phone: submission.phone,
        cpf: submission.cpf,
        birthDate: submission.birthDate,
        city: submission.city,
        state: submission.state,
        employmentType: submission.employmentType,
        grossIncome: submission.grossIncome,
        carId: submission.carId,
        car: submission.car ? {
          id: submission.car.id,
          brand: submission.car.brand,
          model: submission.car.model,
          year: submission.car.year,
          price: submission.car.price
        } : null,
        whatsappLinkSent: submission.whatsappLinkSent,
        createdAt: submission.createdAt
      }));

      return successWithMeta(res, formattedData, result.meta);
    } catch (err) {
      logger.error('Erro ao listar submissões:', err);
      return error(res, 'Erro ao listar submissões', 'INTERNAL_ERROR', null, 500);
    }
  }

  async getSubmissionById(req, res) {
    try {
      // Validar formato UUID antes de processar
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return error(res, 'ID inválido. Deve ser um UUID válido.', 'INVALID_ID', null, 400);
      }

      const submission = await formSubmissionService.getSubmissionById(req.params.id);

      // Formatar resposta completa
      const formattedData = {
        id: submission.id,
        personalData: {
          fullName: submission.fullName,
          email: submission.email,
          phone: submission.phone,
          rg: submission.rg,
          cpf: submission.cpf,
          birthDate: submission.birthDate,
          motherName: submission.motherName,
          fatherName: submission.fatherName,
          birthCity: submission.birthCity,
          birthState: submission.birthState,
          maritalStatus: submission.maritalStatus,
          hasDriverLicense: submission.hasDriverLicense,
          driverLicenseCategory: submission.driverLicenseCategory
        },
        residentialData: {
          zipCode: submission.zipCode,
          street: submission.street,
          number: submission.number,
          complement: submission.complement,
          neighborhood: submission.neighborhood,
          city: submission.city,
          state: submission.state,
          residenceTime: submission.residenceTime,
          residenceType: submission.residenceType
        },
        professionalData: {
          employmentType: submission.employmentType,
          companyName: submission.companyName,
          companyZipCode: submission.companyZipCode,
          companyPhone: submission.companyPhone,
          companyStreet: submission.companyStreet,
          companyNeighborhood: submission.companyNeighborhood,
          companyCity: submission.companyCity,
          companyState: submission.companyState,
          admissionDate: submission.admissionDate,
          grossIncome: submission.grossIncome,
          position: submission.position,
          activityDescription: submission.activityDescription,
          activityTime: submission.activityTime
        },
        references: {
          name: submission.referenceName,
          phone: submission.referencePhone
        },
        interest: {
          carId: submission.carId,
          car: submission.car ? {
            id: submission.car.id,
            brand: submission.car.brand,
            model: submission.car.model,
            year: submission.car.year,
            price: submission.car.price,
            mileage: submission.car.mileage,
            color: submission.car.color
          } : null,
          message: submission.message
        },
        metadata: {
          whatsappLinkSent: submission.whatsappLinkSent,
          ipAddress: submission.ipAddress,
          userAgent: submission.userAgent,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt
        }
      };

      return success(res, formattedData, 200);
    } catch (err) {
      logger.error(`Erro ao buscar submissão ${req.params.id}:`, err);

      // Erro de UUID inválido do Prisma
      if (err.code === 'P2023' || err.message?.includes('UUID') || err.message?.includes('invalid character')) {
        return error(res, 'ID inválido. Deve ser um UUID válido.', 'INVALID_ID', null, 400);
      }

      if (err.message === 'SUBMISSION_NOT_FOUND') {
        return error(res, 'Submissão não encontrada', 'SUBMISSION_NOT_FOUND', null, 404);
      }

      return error(res, 'Erro ao buscar submissão', 'INTERNAL_ERROR', null, 500);
    }
  }

}

module.exports = new FormSubmissionController();

