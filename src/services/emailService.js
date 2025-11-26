const { sendAuthCodeEmail } = require('../config/email');
const logger = require('../utils/logger');
const config = require('../config/env');

class EmailService {
  async sendAuthCode(email, name, code) {
    if (!config.smtp.user || !config.smtp.password || config.smtp.user.includes('seu-email')) {
      logger.warn('SMTP não configurado. Configure SMTP no .env para enviar emails automaticamente.');
      return true;
    }

    try {
      await sendAuthCodeEmail(email, name, code);
      logger.info('Código de autenticação enviado com sucesso');
      return true;
    } catch (error) {
      logger.error('Erro ao enviar código de autenticação:', error);
      if (config.server.nodeEnv === 'development') {
        return true;
      }
      throw new Error('Erro ao enviar email');
    }
  }
}

module.exports = new EmailService();

