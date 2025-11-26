const formSubmissionRepository = require('../repositories/formSubmissionRepository');
const carRepository = require('../repositories/carRepository');
const emailService = require('./emailService');
const { sanitizeFormData } = require('../utils/sanitizer');
const { sanitizeCPF } = require('../utils/cpfValidator');
const config = require('../config/env');
const logger = require('../utils/logger');

class FormSubmissionService {
  async submitForm(formData, ipAddress, userAgent) {
    try {
      const sanitizedData = sanitizeFormData(formData);

      if (sanitizedData.interest?.carId) {
        const car = await carRepository.findById(sanitizedData.interest.carId);
        if (!car) {
          throw new Error('CAR_NOT_FOUND');
        }
      }

      const cpf = sanitizedData.personalData.cpf;
      const recentSubmission = await formSubmissionRepository.findByCpfRecent(cpf, 24);
      
      if (recentSubmission) {
        if (!recentSubmission.whatsappLinkSent) {
          await formSubmissionRepository.updateWhatsappLinkSent(recentSubmission.id);
        }
        
        return {
          id: recentSubmission.id,
          whatsappLink: config.form.whatsappGroupLink,
          message: 'Obrigado pelo interesse! Seus dados foram enviados com sucesso. Clique no link para entrar no nosso grupo do WhatsApp.'
        };
      }

      const submission = await formSubmissionRepository.create({
        ...sanitizedData,
        ipAddress,
        userAgent
      });

      await formSubmissionRepository.updateWhatsappLinkSent(submission.id);
      const submissionWithCar = await formSubmissionRepository.findById(submission.id);

      if (config.form.sendAdminNotifications && config.form.adminNotificationEmail) {
        this.sendAdminNotification(submissionWithCar).catch(err => {
          logger.error('Erro ao enviar notificação para admin:', err);
        });
      }

      return {
        id: submission.id,
        whatsappLink: config.form.whatsappGroupLink,
        message: 'Obrigado pelo interesse! Seus dados foram enviados com sucesso. Clique no link para entrar no nosso grupo do WhatsApp.'
      };
    } catch (error) {
      logger.error('Erro ao processar submissão do formulário:', error);
      throw error;
    }
  }

  async sendAdminNotification(submission) {
    try {
      const carInfo = submission.car
        ? `${submission.car.brand} ${submission.car.model} ${submission.car.year} - R$ ${submission.car.price}`
        : 'Não especificado';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
            .section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1; font-size: 12px; color: #7f8c8d; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Nova Submissão de Formulário - RepassIA</h1>
            
            <h2>Dados Pessoais</h2>
            <div class="section">
              <div class="field"><span class="label">Nome Completo:</span> <span class="value">${submission.fullName}</span></div>
              <div class="field"><span class="label">Email:</span> <span class="value">${submission.email}</span></div>
              <div class="field"><span class="label">Telefone:</span> <span class="value">${submission.phone}</span></div>
              <div class="field"><span class="label">CPF:</span> <span class="value">${submission.cpf}</span></div>
              <div class="field"><span class="label">RG:</span> <span class="value">${submission.rg || 'Não informado'}</span></div>
              <div class="field"><span class="label">Data de Nascimento:</span> <span class="value">${new Date(submission.birthDate).toLocaleDateString('pt-BR')}</span></div>
              <div class="field"><span class="label">Nome da Mãe:</span> <span class="value">${submission.motherName}</span></div>
              <div class="field"><span class="label">Nome do Pai:</span> <span class="value">${submission.fatherName || 'Não informado'}</span></div>
              <div class="field"><span class="label">Cidade de Nascimento:</span> <span class="value">${submission.birthCity}${submission.birthState ? ` - ${submission.birthState}` : ''}</span></div>
              <div class="field"><span class="label">Estado Civil:</span> <span class="value">${submission.maritalStatus || 'Não informado'}</span></div>
              <div class="field"><span class="label">Possui CNH:</span> <span class="value">${submission.hasDriverLicense ? 'Sim' : 'Não'}${submission.driverLicenseCategory ? ` (${submission.driverLicenseCategory})` : ''}</span></div>
            </div>

            <h2>Dados Residenciais</h2>
            <div class="section">
              <div class="field"><span class="label">CEP:</span> <span class="value">${submission.zipCode}</span></div>
              <div class="field"><span class="label">Endereço:</span> <span class="value">${submission.street}, ${submission.number}${submission.complement ? ` - ${submission.complement}` : ''}</span></div>
              <div class="field"><span class="label">Bairro:</span> <span class="value">${submission.neighborhood}</span></div>
              <div class="field"><span class="label">Cidade/Estado:</span> <span class="value">${submission.city}${submission.state ? ` - ${submission.state}` : ''}</span></div>
              <div class="field"><span class="label">Tempo de Residência:</span> <span class="value">${submission.residenceTime || 'Não informado'}</span></div>
              <div class="field"><span class="label">Tipo de Residência:</span> <span class="value">${submission.residenceType || 'Não informado'}</span></div>
            </div>

            <h2>Dados Profissionais</h2>
            <div class="section">
              <div class="field"><span class="label">Tipo de Emprego:</span> <span class="value">${submission.employmentType || 'Não informado'}</span></div>
              ${submission.companyName ? `<div class="field"><span class="label">Empresa:</span> <span class="value">${submission.companyName}</span></div>` : ''}
              ${submission.position ? `<div class="field"><span class="label">Cargo:</span> <span class="value">${submission.position}</span></div>` : ''}
              ${submission.admissionDate ? `<div class="field"><span class="label">Data de Admissão:</span> <span class="value">${new Date(submission.admissionDate).toLocaleDateString('pt-BR')}</span></div>` : ''}
              ${submission.activityDescription ? `<div class="field"><span class="label">Descrição da Atividade:</span> <span class="value">${submission.activityDescription}</span></div>` : ''}
              ${submission.activityTime ? `<div class="field"><span class="label">Tempo de Atividade:</span> <span class="value">${submission.activityTime}</span></div>` : ''}
              ${submission.grossIncome ? `<div class="field"><span class="label">Renda Bruta:</span> <span class="value">R$ ${submission.grossIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>` : ''}
              ${submission.companyStreet ? `<div class="field"><span class="label">Endereço da Empresa:</span> <span class="value">${submission.companyStreet}${submission.companyNeighborhood ? `, ${submission.companyNeighborhood}` : ''}${submission.companyCity ? ` - ${submission.companyCity}` : ''}${submission.companyState ? `/${submission.companyState}` : ''}</span></div>` : ''}
            </div>

            ${submission.referenceName ? `
            <h2>Referências</h2>
            <div class="section">
              <div class="field"><span class="label">Nome:</span> <span class="value">${submission.referenceName}</span></div>
              <div class="field"><span class="label">Telefone:</span> <span class="value">${submission.referencePhone || 'Não informado'}</span></div>
            </div>
            ` : ''}

            <h2>Interesse</h2>
            <div class="section">
              <div class="field"><span class="label">Carro de Interesse:</span> <span class="value">${carInfo}</span></div>
              ${submission.message ? `<div class="field"><span class="label">Mensagem:</span> <span class="value">${submission.message}</span></div>` : ''}
            </div>

            <div class="footer">
              <p><strong>Data/Hora da Submissão:</strong> ${new Date(submission.createdAt).toLocaleString('pt-BR')}</p>
              <p><strong>IP do Usuário:</strong> ${submission.ipAddress || 'Não disponível'}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await emailService.sendEmail({
        to: config.form.adminNotificationEmail,
        subject: `Nova Lead - ${submission.fullName}`,
        html: htmlContent
      });
    } catch (error) {
      logger.error('Erro ao enviar notificação para admin:', error);
      throw error;
    }
  }

  async getSubmissions(filters) {
    return await formSubmissionRepository.findAll(filters);
  }

  async getSubmissionById(id) {
    const submission = await formSubmissionRepository.findById(id);
    if (!submission) {
      throw new Error('SUBMISSION_NOT_FOUND');
    }
    return submission;
  }

}

module.exports = new FormSubmissionService();

