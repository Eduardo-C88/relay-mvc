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
            course: { select: { id: true, name: true } },
            university: { select: { id: true, name: true } },
            role: { select: { id: true, name: true } },
            createdAt: true,
        }
    });
    return user;
}

exports.updateUserProfile = async (userId, updateData) => {

    // Validate foreign keys if they are being updated
    if (updateData.universityId) {
        const universityExists = await prisma.university.findUnique({
            where: { id: updateData.universityId }
        });
        if (!universityExists) {
            throw new Error('University ID does not exist.'); // Handled by 400 in controller
        }
    }
    if (updateData.courseId) {
        const courseExists = await prisma.course.findUnique({ 
            where: { id: updateData.courseId } 
        });
        if (!courseExists) {
            throw new Error('Course ID does not exist.'); // Handled by 400 in controller
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            address: true,
            // Include related models for a complete response
            course: { select: { id: true, name: true } },
            university: { select: { id: true, name: true } },
            // Add any other user fields the client needs to see immediately after update
            reputation: true,
        }
    });
    return updatedUser;
}