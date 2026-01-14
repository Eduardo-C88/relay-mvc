const { db } = require("../db/db");
const { publishPurchaseCreated } = require("../events/transactionPublisher");
const { publishPurchaseConfirmed } = require("../events/transactionPublisher");

exports.createPurchaseReq = async (purchaseData) => {
    const newPurchase = await db
      .insertInto('purchases')
      .values({
        buyer_id: purchaseData.buyerId,
        resource_id: purchaseData.resourceId,
        seller_id: purchaseData.sellerId,
        status_id: purchaseData.statusId,
      })
      .returningAll()
      .executeTakeFirst();

  publishPurchaseCreated({
    resourceId: newPurchase.resource_id,
    statusId: newPurchase.status_id,
  });

  return newPurchase;
};

exports.approvePurchaseReq = async (resourceId) => {
  const updated = await db
      .updateTable('purchases')
      .set({ status_id: 5 }) // APPROVED
      .where('resource_id', '=', resourceId)
      .where('status_id', '=', 4) // PENDING
      .returningAll()
      .executeTakeFirst();

    if (!updated) {
      throw new Error('No pending purchase found to approve');
    }

    publishPurchaseConfirmed({
      resourceId,
      statusId: 5,
    });

    return updated;
};

exports.rejectPurchaseReq = async (resourceId) => {
    const updated = await db
      .updateTable('purchases')
      .set({ status_id: 6 }) // REJECTED
      .where('resource_id', '=', resourceId)
      .where('status_id', '=', 4) // PENDING
      .returningAll()
      .executeTakeFirst();

    if (!updated) {
      throw new Error('No pending purchase found to reject');
    }

    publishPurchaseConfirmed({
      resourceId,
      statusId: 6,
    });

    return updated;
};

exports.getPurchasesByUser = async (userId) => {
  return await db
      .selectFrom('purchases')
      .innerJoin('status', 'status.id', 'purchases.status_id')
      .select([
        'purchases.id',
        'purchases.resource_id',
        'purchases.seller_id',
        'purchases.status_id',
        'purchases.created_at',
        'status.name as status_name',
      ])
      .where('purchases.buyer_id', '=', userId)
      .execute();
};

exports.getAllPurchases = async () => {
    return await db
      .selectFrom('purchases')
      .innerJoin('status', 'status.id', 'purchases.status_id')
      .select([
        'purchases.id',
        'purchases.buyer_id',
        'purchases.resource_id',
        'purchases.seller_id',
        'purchases.status_id',
        'purchases.created_at',
        'status.name as status_name',
      ])
      .execute();
};
