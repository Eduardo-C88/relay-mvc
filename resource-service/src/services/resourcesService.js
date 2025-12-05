const { prisma } = require('../models/prismaClient');

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