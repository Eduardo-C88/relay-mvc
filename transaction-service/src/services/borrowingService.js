const { prisma } = require("../models/prismaClient");
const { publishBorrowCreated } = require("../events/transactionPublisher");
const { publishBorrowConfirmed } = require("../events/transactionPublisher");

exports.createBorrowReq = async (borrowData) => {
  const newBorrow = await prisma.borrowings.create({
    data: borrowData,
  });

  publishBorrowCreated({
    resourceId: newBorrow.resourceId,
    statusId: newBorrow.statusId,
  });

  return newBorrow;
};

exports.approveBorrowReq = async (resourceId) => {
  const updatedBorrow = await prisma.borrowings.updateMany({
    where: { resourceId, statusId: 1 }, // Pending
    data: { statusId: 2 }, // Approved
  });

  publishBorrowConfirmed({
    resourceId,
    statusId: 2,
  });

  return updatedBorrow;
};

exports.rejectBorrowReq = async (resourceId) => {
  const updatedBorrow = await prisma.borrowings.updateMany({
    where: { resourceId, statusId: 1 },
    data: { statusId: 3 }, // Rejected
  });

  publishBorrowConfirmed({
    resourceId,
    statusId: 3,
  });

  return updatedBorrow;
};

exports.getBorrowingsByUser = async (userId) => {
  return prisma.borrowings.findMany({
    where: { borrowerId: userId },
    include: { status: true },
  });
};

exports.getAllBorrowings = async () => {
  return prisma.borrowings.findMany({
    include: { status: true },
  });
};
