const jwt = require('jsonwebtoken');
const config = require('../config/env');
const profileRepository = require('../repositories/profileRepository');
const authCodeRepository = require('../repositories/authCodeRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
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

    // Gerar access token (JWT de curta duração)
    const accessToken = this.generateJWT(profile.id);

    // Gerar refresh token (de longa duração)
    const refreshToken = await this.generateRefreshToken(profile.id);

    logger.info('Código verificado com sucesso');

    return {
      accessToken,
      refreshToken,
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

  async generateRefreshToken(userId) {
    // Calcular data de expiração
    const expiresAt = new Date();
    const expirationDays = this.parseExpirationDays(config.auth.refreshTokenExpiration);
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Criar refresh token no banco
    const refreshToken = await refreshTokenRepository.create(userId, expiresAt);

    return refreshToken.token;
  }

  async refreshAccessToken(refreshTokenString) {
    // Buscar refresh token válido
    const refreshToken = await refreshTokenRepository.findValidToken(refreshTokenString);

    if (!refreshToken) {
      throw new Error('Refresh token inválido ou expirado');
    }

    // Buscar profile do usuário
    const profile = await profileRepository.findById(refreshToken.userId);

    if (!profile || !profile.isActive) {
      throw new Error('Perfil não encontrado ou inativo');
    }

    // Gerar novo access token
    const accessToken = this.generateJWT(profile.id);

    // Atualizar último login
    await profileRepository.updateLastLogin(profile.id);

    logger.info(`Access token renovado para usuário ${profile.id}`);

    return {
      accessToken,
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name
      }
    };
  }

  async revokeRefreshToken(refreshTokenString) {
    try {
      await refreshTokenRepository.revokeToken(refreshTokenString);
      logger.info('Refresh token revogado');
      return true;
    } catch (error) {
      logger.error('Erro ao revogar refresh token:', error);
      throw new Error('Erro ao revogar refresh token');
    }
  }

  async revokeAllUserRefreshTokens(userId) {
    try {
      await refreshTokenRepository.revokeAllUserTokens(userId);
      logger.info(`Todos os refresh tokens do usuário ${userId} foram revogados`);
      return true;
    } catch (error) {
      logger.error('Erro ao revogar refresh tokens:', error);
      throw new Error('Erro ao revogar refresh tokens');
    }
  }

  parseExpirationDays(expiration) {
    // Converte strings como "7d", "30d" para número de dias
    const match = expiration.match(/^(\d+)([dhms])$/);
    if (!match) return 7; // Default: 7 dias

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value;
      case 'h':
        return Math.floor(value / 24);
      case 'm':
        return Math.floor(value / (24 * 60));
      case 's':
        return Math.floor(value / (24 * 60 * 60));
      default:
        return 7;
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

