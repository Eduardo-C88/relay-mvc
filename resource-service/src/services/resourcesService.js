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

exports.getAllResources = async () => {
    return await prisma.resource.findMany({
        select: {
            title: true,
            price: true,
            imageUrl: true,
            owner: true
        }
    });
}

exports.getResourceById = async (resourceId) => {
    const resource = await prisma.resource.findUnique({
        where: { id: parseInt(resourceId) },
        select: {
            title: true,
            description: true,
            price: true,
            imageUrl: true,
            category: true,
            status: true,
            ownerId: true
        }
    });
    return resource;
};

const parseFilterInt = (value) => {
    if (value === undefined || value === null || value === '') {
        return NaN;
    }
    return parseInt(value);
};

exports.filterResources = async (filters) => {
    // Build dynamic where clause based on provided filters
    const whereClause = {};

    // Use explicit checks for existence and validity (e.g., ensure it's not an empty string)
    const categoryId = parseFilterInt(filters.categoryId);
    if (!isNaN(categoryId)) {
        whereClause.categoryId = categoryId;
    }
    
    const priceMax = parseFilterInt(filters.priceMax);
    if (!isNaN(priceMax)) {
        whereClause.price = { lte: priceMax };
    }

    const ownerId = parseFilterInt(filters.ownerId);
    if (!isNaN(ownerId)) {
        whereClause.ownerId = ownerId;
    }

    const filteredResources = await prisma.resource.findMany({
        where: whereClause,
        select: {
            title: true,
            price: true,
            imageUrl: true,
        }
    });
    return filteredResources;
};

// Higher-order functions
exports.createCategory = async (data) => {
    const newCategory = await prisma.category.create({
        data: data
    });
    return newCategory;
}

exports.checResourceAvailability = async (resourceId, buyerId) => {
    console.log(`Checking availability for resourceId: ${resourceId}, buyerId: ${buyerId}`);
    const resource = await prisma.resource.findUnique({
        where: { id: parseInt(resourceId) },
        select: {
            ownerId: true,
            statusId: true
        }
    });
    if (!resource) {
        throw new Error('Resource not found');
    }
    // Check if the resource is available and not owned by the buyer
    const isAvailable = resource.statusId === 1 && resource.ownerId !== parseInt(buyerId);
    
    return { available: isAvailable, ownerId: resource.ownerId };
};

exports.changeResourceStatus = async (resourceId, statusId) => {
    try {
        const updatedResource = await prisma.resource.update({
            where: { id: parseInt(resourceId) },
            data: { statusId: statusId },
            include: {
                category: true,
                status: true
            }
        });
        return updatedResource;
    } catch (error) {
        // Prisma error code P2025 indicates "Record to update not found."
        if (error.code === 'P2025') {
            const notFoundError = new Error('Resource not found');
            notFoundError.statusCode = 404;
            throw notFoundError;
        }
        // Re-throw any other unexpected error
        throw error;
    }
};