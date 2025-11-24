const authService = require('../services/authService');
const profileRepository = require('../repositories/profileRepository');
const { error } = require('../utils/response');
const logger = require('../utils/logger');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return error(res, 'Token não fornecido', 'AUTH_ERROR', null, 401);
    }

    // Tenta validar como JWT primeiro (acesso web)
    try {
      const decoded = authService.verifyJWT(token);
      req.user = { 
        id: decoded.userId, 
        authType: 'jwt' 
      };
      
      // Atualizar último login
      await profileRepository.updateLastLogin(decoded.userId);
      
      return next();
    } catch (jwtError) {
      // Se falhar, tenta validar como token fixo (n8n)
      try {
        const profile = await authService.validateFixedToken(token);
        
        req.user = { 
          id: profile.id, 
          authType: 'fixed_token' 
        };
        
        return next();
      } catch (fixedTokenError) {
        logger.warn(`Tentativa de autenticação com token inválido: ${token.substring(0, 10)}...`);
        return error(res, 'Token inválido', 'AUTH_ERROR', null, 401);
      }
    }
  } catch (err) {
    logger.error('Erro na autenticação:', err);
    return error(res, 'Erro na autenticação', 'AUTH_ERROR', null, 500);
  }
};

module.exports = authMiddleware;

