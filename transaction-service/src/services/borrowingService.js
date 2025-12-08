const { prisma } = require("../models/prismaClient");
const borrowEvents = require("../events/transactionPublisher");

exports.createBorrowingReq = async (borrowingData) => {
  const borrowing = await prisma.borrowings.create({
    data: borrowingData,
  });
  return borrowing;
};
