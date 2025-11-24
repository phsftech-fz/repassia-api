const jwt = require('jsonwebtoken');
const config = require('../config/env');
const profileRepository = require('../repositories/profileRepository');
const authCodeRepository = require('../repositories/authCodeRepository');
const logger = require('../utils/logger');

class AuthService {
  generateAuthCode() {
    const length = config.auth.codeLength;
    // Gera um número aleatório de 6 dígitos (100000 a 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code.substring(0, length);
  }

  async requestAuthCode(email) {
    // Verificar se email existe e está ativo
    const profile = await profileRepository.findByEmail(email);
    
    if (!profile || !profile.isActive) {
      throw new Error('Email não encontrado ou inativo');
    }

    // Verificar rate limiting (máximo 3 códigos nos últimos 15 minutos)
    const recentCodes = await authCodeRepository.countRecentCodes(email, 15);
    if (recentCodes >= 3) {
      throw new Error('Muitas solicitações. Aguarde alguns minutos.');
    }

    // Gerar código
    const code = this.generateAuthCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.auth.codeExpiration);

    // Salvar código
    await authCodeRepository.create({
      email,
      code,
      expiresAt
    });

    return {
      code,
      expiresAt,
      profileName: profile.name
    };
  }

  async verifyAuthCode(email, code) {
    // Buscar código válido
    const authCode = await authCodeRepository.findValidCode(email, code);
    
    if (!authCode) {
      throw new Error('Código inválido ou expirado');
    }

    // Buscar profile
    const profile = await profileRepository.findByEmail(email);
    
    if (!profile || !profile.isActive) {
      throw new Error('Perfil não encontrado ou inativo');
    }

    // Marcar código como usado
    await authCodeRepository.markAsUsed(authCode.id);

    // Atualizar último login
    await profileRepository.updateLastLogin(profile.id);

    // Gerar JWT
    const token = this.generateJWT(profile.id);

    logger.info(`Código verificado com sucesso para ${email}`);

    return {
      token,
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name
      }
    };
  }

  generateJWT(userId) {
    return jwt.sign(
      { userId },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiration }
    );
  }

  verifyJWT(token) {
    try {
      return jwt.verify(token, config.auth.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async validateFixedToken(token) {
    const profile = await profileRepository.findByFixedToken(token);
    
    if (!profile) {
      throw new Error('Token inválido');
    }

    // Atualizar último login
    await profileRepository.updateLastLogin(profile.id);

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      authType: 'fixed_token'
    };
  }
}

module.exports = new AuthService();

