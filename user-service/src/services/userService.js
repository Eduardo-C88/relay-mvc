const { prisma } = require('../models/prismaClient');
const { publishUserUpdated } = require("../events/userPublisher");

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
            id: true,
            name: true,
            address: true,
            // Include related models for a complete response
            course: { select: { id: true, name: true } },
            university: { select: { id: true, name: true } },
            // Add any other user fields the client needs to see immediately after update
            reputation: true,
        }
    });
    // Publish user updated event
    publishUserUpdated({
        userId,
        name: updatedUser.name,
        reputation: updatedUser.reputation,
        university: updatedUser.university?.name,
        course: updatedUser.course?.name
      });

    return updatedUser;
}

exports.changeUserRole = async (userId, roleId) => {
    // Validate the roleId exists
    const roleExists = await prisma.role.findUnique({
        where: { id: roleId }
    });
    if (!roleExists) {
        throw new Error('Role ID does not exist.');
    }
    const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { roleId },
        select: {
            id: true,
            name: true,
            email: true,
            role: { select: { id: true, name: true } },
        }
    });

    // Publish user updated event
    publishUserUpdated({
        userId: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role.name,
    });
    return updatedUser;
}
