const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class AuthController {
  async requestCode(req, res) {
    try {
      const { email } = req.body;
      const { code, expiresAt, profileName } = await authService.requestAuthCode(email);
      
      // Enviar email com código
      await emailService.sendAuthCode(email, profileName, code);
      
      return success(res, {
        message: 'Código enviado por email',
        expiresAt
      }, 'Código de autenticação enviado');
    } catch (err) {
      logger.error('Erro ao solicitar código:', err);
      
      if (err.message === 'Email não encontrado ou inativo' || 
          err.message === 'Muitas solicitações. Aguarde alguns minutos.') {
        return error(res, err.message, 'AUTH_ERROR', null, 400);
      }
      
      return error(res, 'Erro ao solicitar código', 'AUTH_ERROR', null, 500);
    }
  }

  async verifyCode(req, res) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyAuthCode(email, code);
      
      return success(res, result, 'Autenticação realizada com sucesso');
    } catch (err) {
      logger.error('Erro ao verificar código:', err);
      
      if (err.message === 'Código inválido ou expirado' || 
          err.message === 'Perfil não encontrado ou inativo') {
        return error(res, err.message, 'AUTH_ERROR', null, 400);
      }
      
      return error(res, 'Erro ao verificar código', 'AUTH_ERROR', null, 500);
    }
  }

  async validateToken(req, res) {
    try {
      const { token } = req.body;
      const profile = await authService.validateFixedToken(token);
      
      return success(res, {
        profile,
        message: 'Token válido'
      }, 'Token validado com sucesso');
    } catch (err) {
      logger.error('Erro ao validar token:', err);
      return error(res, err.message || 'Token inválido', 'AUTH_ERROR', null, 401);
    }
  }
}

module.exports = new AuthController();

