const { db } = require("../db/db");
const { publishBorrowCreated } = require("../events/transactionPublisher");
const { publishBorrowConfirmed } = require("../events/transactionPublisher");

exports.createBorrowReq = async (borrowData) => {
  const newBorrow = await db
    .insertInto('borrowings')
    .values({
      borrower_id: borrowData.borrowerId,
      resource_id: borrowData.resourceId,
      owner_id: borrowData.ownerId,
      status_id: borrowData.statusId,
      start_date: borrowData.startDate,
      end_date: borrowData.endDate,
    })
    .returningAll()
    .executeTakeFirst();

  publishBorrowCreated({
    resourceId: newBorrow.resource_id,
    statusId: newBorrow.status_id,
  });

  return newBorrow;
};

exports.approveBorrowReq = async (resourceId) => {
  const updatedBorrow = await db
    .updateTable('borrowings')
    .set({ status_id: 5 }) // Approved
    .where('resource_id', '=', resourceId)
    .where('status_id', '=', 4) // Pending
    .returningAll()
    .executeTakeFirst();

  if (!updatedBorrow) {
    throw new Error('No pending borrow found to approve');
  }

  publishBorrowConfirmed({
    resourceId,
    statusId: 2,
  });

  return updatedBorrow;
};

exports.rejectBorrowReq = async (resourceId) => {
const updatedBorrow = await db
    .updateTable('borrowings')
    .set({ status_id: 6 }) // Rejected
    .where('resource_id', '=', resourceId)
    .where('status_id', '=', 4) // Pending
    .returningAll()
    .executeTakeFirst();

  if (!updatedBorrow) {
    throw new Error('No pending borrow found to reject');
  }

  publishBorrowConfirmed({
    resourceId,
    statusId: 6,
  });

  return updatedBorrow;
};

exports.getBorrowingsByUser = async (userId) => {
  return await db
    .selectFrom('borrowings')
    .innerJoin('status', 'status.id', 'borrowings.status_id')
    .select([
      'borrowings.id',
      'borrowings.resource_id',
      'borrowings.owner_id',
      'borrowings.start_date',
      'borrowings.end_date',
      'borrowings.created_at',
      'status.name as status_name',
    ])
    .where('borrowings.borrower_id', '=', userId)
    .execute();
};

exports.getAllBorrowings = async () => {
  return await db
    .selectFrom('borrowings')
    .innerJoin('status', 'status.id', 'borrowings.status_id')
    .select([
      'borrowings.id',
      'borrowings.borrower_id',
      'borrowings.resource_id',
      'borrowings.owner_id',
      'borrowings.start_date',
      'borrowings.end_date',
      'borrowings.created_at',
      'status.name as status_name',
    ])
    .execute();
};
