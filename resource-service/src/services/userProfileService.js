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

}

module.exports = UserProfileService;
