const { prisma } = require('../config/database');

class ProfileRepository {
  async findByEmail(email) {
    return await prisma.profile.findUnique({
      where: { email }
    });
  }

  async findByFixedToken(token) {
    return await prisma.profile.findFirst({
      where: {
        fixedToken: token,
        isActive: true
      }
    });
  }

  async findById(id) {
    return await prisma.profile.findUnique({
      where: { id }
    });
  }

  async create(profileData) {
    return await prisma.profile.create({
      data: profileData
    });
  }

  async update(id, profileData) {
    return await prisma.profile.update({
      where: { id },
      data: profileData
    });
  }

  async updateLastLogin(id) {
    return await prisma.profile.update({
      where: { id },
      data: {
        lastLoginAt: new Date()
      }
    });
  }
}

module.exports = new ProfileRepository();

