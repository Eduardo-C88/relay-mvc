const { prisma } = require('../models/prismaClient');

class UserProfileService {  
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }
  
  // Upsert so it works for created or updated users
  async createOrUpdateUserProfile(user) {
    await this.prisma.userProfile.upsert({
      where: { id: user.userId },
      update: {
        name: user.name,
        reputation: user.reputation,
        university: user.university,
        course: user.course,
      },
      create: {
        id: user.userId,
        name: user.name,
        reputation: user.reputation,
        university: user.university,
        course: user.course,
      },
    });
  }
  
  async updateUserInfo(update) {
    await this.prisma.userProfile.upsert({
      where: { id: update.userId },
      update: {
        name: update.name,
        reputation: update.reputation,
        university: update.university,
        course: update.course,
      },
      create: {
        id: update.userId,
        name: update.name,
        reputation: update.reputation,
        university: update.university,
        course: update.course,
      }
    });
  }
}

module.exports = UserProfileService;
