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
    return updatedUser;
}

// exports.addUniversity = async (uniData) => {
//     try{
//         const newUniversity = await prisma.university.create({
//             data: uniData // Pass the object directly
//         });
//         return newUniversity;
//     } catch (error) {
//         // Handle P2002: Unique constraint violation (University already exists)
//         if (error.code === 'P2002' && error.meta?.target.includes('name')) {
//             // Throw a specific error for the controller to catch
//             throw { status: 409, message: 'University with this name already exists.' };
//         }
//         // Re-throw other errors (like database connection issues)
//         throw error;
//     }
// }

// exports.addCourse = async (courseData) => {
//     try{
//         const newCourse = await prisma.course.create({
//             data: courseData
//         });
//         return newCourse;
//     } catch (error) {
//         // Handle P2002: Unique constraint violation (Course already exists)
//         if (error.code === 'P2002' && error.meta?.target.includes('name')) {
//             throw { status: 409, message: 'Course with this name already exists.' };
//         }
//         throw error;
//     }
// }
