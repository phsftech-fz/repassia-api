const { prisma } = require('../config/database');

class AuthCodeRepository {
  async create(authCodeData) {
    return await prisma.authCode.create({
      data: authCodeData
    });
  }

  async findValidCode(email, code) {
    return await prisma.authCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async markAsUsed(id) {
    return await prisma.authCode.update({
      where: { id },
      data: { used: true }
    });
  }

  async deleteExpired() {
    return await prisma.authCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  async countRecentCodes(email, minutes = 15) {
    const since = new Date();
    since.setMinutes(since.getMinutes() - minutes);

    return await prisma.authCode.count({
      where: {
        email,
        createdAt: {
          gte: since
        },
        used: false
      }
    });
  }
}

module.exports = new AuthCodeRepository();

