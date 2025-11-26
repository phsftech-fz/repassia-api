const { prisma } = require('../config/database');
const crypto = require('crypto');

class RefreshTokenRepository {
  async create(userId, expiresAt) {
    const token = this.generateToken();
    
    return await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  }

  async findByToken(token) {
    return await prisma.refreshToken.findUnique({
      where: { token }
    });
  }

  async findValidToken(token) {
    return await prisma.refreshToken.findFirst({
      where: {
        token,
        revoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
  }

  async revokeToken(token) {
    return await prisma.refreshToken.update({
      where: { token },
      data: {
        revoked: true,
        revokedAt: new Date()
      }
    });
  }

  async revokeAllUserTokens(userId) {
    return await prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false
      },
      data: {
        revoked: true,
        revokedAt: new Date()
      }
    });
  }

  async deleteExpired() {
    return await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  async deleteRevoked() {
    return await prisma.refreshToken.deleteMany({
      where: {
        revoked: true,
        revokedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new RefreshTokenRepository();
