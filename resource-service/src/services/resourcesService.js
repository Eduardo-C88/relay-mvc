const { prisma } = require('../models/prismaClient');

// Helper function needed by the Controller for the Authorization check
exports.getResourceOwner = async (resourceId) => {
    try {
        return await prisma.resource.findUnique({
            where: { id: parseInt(resourceId) },
            select: { ownerId: true }
        });
    } catch (error) {
        // If resourceId is badly formatted and parseInt fails, Prisma might error.
        console.error("Error fetching resource owner:", error);
        return null; // Return null if fetching fails
    }
};

exports.createResource = async (data) => {
    const newResource = await prisma.resource.create({
        data: data,
        include: {
            category: true,
            status: true
        }
    });
    return newResource;
};

exports.editResource = async (resourceId, data) => {
    try {
        const updatedResource = await prisma.resource.update({
            where: { id: parseInt(resourceId) },
            data: data,
            include: {
                category: true,
                status: true
            }
        });
        return updatedResource;
    } catch (error) {
        // Prisma error code P2025 indicates "Record to update not found."
        if (error.code === 'P2025') {
            // Throw a specific error that the Controller can catch and translate to 404
            const notFoundError = new Error('Resource not found');
            notFoundError.statusCode = 404;
            throw notFoundError;
        }
        // Re-throw any other unexpected error
        throw error;
    }
};

exports.deleteResource = async (resourceId) => {
    try {
        await prisma.resource.delete({
            where: { id: parseInt(resourceId) }
        });
    } catch (error) {
        // Prisma error code P2025 indicates "Record to delete not found."
        if (error.code === 'P2025') {
            const notFoundError = new Error('Resource not found');
            notFoundError.statusCode = 404;
            throw notFoundError;
        }
        // Re-throw any other unexpected error
        throw error;
    }  
};
