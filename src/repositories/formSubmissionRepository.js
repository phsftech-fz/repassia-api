const { prisma } = require('../config/database');
const logger = require('../utils/logger');

class FormSubmissionRepository {
  async create(data) {
    try {
      if (!data.personalData || !data.residentialData) {
        throw new Error('Dados pessoais e residenciais são obrigatórios');
      }

      if (!data.personalData.birthDate) {
        throw new Error('Data de nascimento é obrigatória');
      }

      if (data.interest?.carId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(data.interest.carId)) {
          throw new Error('CAR_ID_INVALID');
        }
      }

      const createDate = (dateValue, fieldName = 'date') => {
        if (!dateValue) return null;
        
        if (dateValue instanceof Date) {
          return isNaN(dateValue.getTime()) ? null : dateValue;
        }
        
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          const [year, month, day] = dateValue.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        
        try {
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? null : date;
        } catch (e) {
          logger.error(`Erro ao criar data para ${fieldName}:`, e);
          return null;
        }
      };

      const submission = await prisma.formSubmission.create({
        data: {
          fullName: data.personalData.fullName,
          email: data.personalData.email,
          phone: data.personalData.phone,
          rg: data.personalData.rg || null,
          cpf: data.personalData.cpf,
          birthDate: createDate(data.personalData.birthDate, 'birthDate'),
          motherName: data.personalData.motherName,
          fatherName: data.personalData.fatherName || null,
          birthCity: data.personalData.birthCity,
          birthState: data.personalData.birthState || null,
          maritalStatus: data.personalData.maritalStatus || null,
          hasDriverLicense: data.personalData.hasDriverLicense || false,
          driverLicenseCategory: data.personalData.driverLicenseCategory || null,
          zipCode: data.residentialData.zipCode,
          street: data.residentialData.street,
          number: data.residentialData.number,
          complement: data.residentialData.complement || null,
          neighborhood: data.residentialData.neighborhood,
          city: data.residentialData.city,
          state: data.residentialData.state || null,
          residenceTime: data.residentialData.residenceTime || null,
          residenceType: data.residentialData.residenceType || null,
          employmentType: data.professionalData?.employmentType || null,
          companyName: data.professionalData?.companyName || null,
          companyZipCode: data.professionalData?.companyZipCode || null,
          companyPhone: data.professionalData?.companyPhone || null,
          companyStreet: data.professionalData?.companyStreet || null,
          companyNeighborhood: data.professionalData?.companyNeighborhood || null,
          companyCity: data.professionalData?.companyCity || null,
          companyState: data.professionalData?.companyState || null,
          admissionDate: data.professionalData?.admissionDate ? createDate(data.professionalData.admissionDate, 'admissionDate') : null,
          grossIncome: data.professionalData?.grossIncome ? parseFloat(data.professionalData.grossIncome) : null,
          position: data.professionalData?.position || null,
          activityDescription: data.professionalData?.activityDescription || null,
          activityTime: data.professionalData?.activityTime || null,
          referenceName: data.references?.name || null,
          referencePhone: data.references?.phone || null,
          carId: data.interest?.carId || null,
          message: data.interest?.message || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          whatsappLinkSent: false
        }
      });
      
      logger.info(`Form submission criada: ${submission.id}`);
      return submission;
    } catch (error) {
      logger.error('Erro ao criar form submission:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new Error(`Dado duplicado: ${field}`);
      }
      
      if (error.code === 'P2003') {
        throw new Error('CAR_NOT_FOUND');
      }
      
      throw error;
    }
  }

  async findByCpfRecent(cpf, hours = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);
      
      const submission = await prisma.formSubmission.findFirst({
        where: {
          cpf: cpf,
          createdAt: {
            gte: cutoffDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return submission;
    } catch (error) {
      logger.error('Erro ao buscar submission por CPF:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return null;
      }

      const submission = await prisma.formSubmission.findUnique({
        where: { id },
        include: {
          car: {
            include: {
              images: {
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        }
      });
      
      return submission;
    } catch (error) {
      if (error.code === 'P2023' || error.message?.includes('UUID') || error.message?.includes('invalid character')) {
        return null;
      }
      logger.error(`Erro ao buscar submission ${id}:`, error);
      throw error;
    }
  }

  async findAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        carId,
        employmentType,
        startDate,
        endDate
      } = filters;

      const skip = (page - 1) * limit;
      const where = {};

      if (carId) {
        where.carId = carId;
      }

      if (employmentType) {
        where.employmentType = employmentType;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          where.createdAt.gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }

      const [submissions, total] = await Promise.all([
        prisma.formSubmission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            car: {
              select: {
                id: true,
                brand: true,
                model: true,
                year: true,
                price: true
              }
            }
          }
        }),
        prisma.formSubmission.count({ where })
      ]);

      return {
        data: submissions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar submissions:', error);
      throw error;
    }
  }

  async updateWhatsappLinkSent(id) {
    try {
      const submission = await prisma.formSubmission.update({
        where: { id },
        data: { whatsappLinkSent: true }
      });
      
      return submission;
    } catch (error) {
      logger.error(`Erro ao atualizar whatsappLinkSent ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new FormSubmissionRepository();

