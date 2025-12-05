const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// We export an object { prisma } so your service can destructure it
module.exports = { prisma };