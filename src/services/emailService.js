const { sendAuthCodeEmail } = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  async sendAuthCode(email, name, code) {
    try {
      await sendAuthCodeEmail(email, name, code);
      logger.info(`Código de autenticação enviado para ${email}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar código de autenticação para ${email}:`, error);
      throw new Error('Erro ao enviar email');
    }
  }
}

module.exports = new EmailService();

