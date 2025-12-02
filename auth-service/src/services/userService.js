const { prisma } = require('../models/prismaClient');

exports.getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,  
            reputation: true,
            address: true, 
            courseId: true,
            universityId: true,
            createdAt: true,
        }
    });
    return user;
}