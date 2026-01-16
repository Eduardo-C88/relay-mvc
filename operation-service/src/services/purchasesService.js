const { db } = require("../db/db");
const {  publishPurchaseRequested, publishPurchaseApproved, publishPurchaseRejected } = require("../events/operationPublisher");

exports.createPurchaseReq = async (purchaseData) => {
    const newPurchase = await db
      .insertInto('purchases')
      .values({
        buyer_id: purchaseData.buyerId,
        resource_id: purchaseData.resourceId,
        status_id: 1,
      })
      .returningAll()
      .executeTakeFirst();

  publishPurchaseRequested({
    purchaseId: newPurchase.id,
    resourceId: newPurchase.resource_id,
    buyerId: newPurchase.buyer_id,
  });

  return newPurchase;
};

exports.resourceAvailable = async (purchaseId, ownerId) => {
  const updated =  await db
      .updateTable('purchases')
      .set({ status_id: 2, seller_id: ownerId }) // AWAITING_SELLER
      .where('id', '=', purchaseId)
      .where('status_id', '=', 1) // REQUESTED
      .returningAll()
      .executeTakeFirst();
  if (!updated) {
    throw new Error('Purchase not found or not in REQUESTED status');
  }
  return updated;
}

exports.resourceFailed = async (purchaseId) => {
  const updated =  await db
      .updateTable('purchases')
      .set({ status_id: 7 }) // FAILED
      .where('id', '=', purchaseId)
      .where('status_id', '=', 1) // REQUESTED
      .returningAll()
      .executeTakeFirst();
  if (!updated) {
    throw new Error('Purchase not found or not in REQUESTED status');
  }
  return updated;
};

exports.approvePurchaseReq = async (purchaseId, userId) => {
  // Verify that the user is authorized to approve the purchase
  const purchase = await db
    .selectFrom('purchases')
    .selectAll()
    .where('id', '=', purchaseId)
    .executeTakeFirst();

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.seller_id !== userId) {
    throw new Error('User not authorized to approve this purchase');
  }

  const updated = await db
      .updateTable('purchases')
      .set({ status_id: 3 }) // APPROVED
      .where('id', '=', purchaseId)
      .where('status_id', '=', 2) // AWAITING_SELLER    
      .returningAll()
      .executeTakeFirst();

    if (!updated) {
      throw new Error('No pending purchase found to approve');
    }

    publishPurchaseApproved({
      purchaseId: purchaseId,
      resourceId: purchase.resource_id,
    });

    return updated;
};

exports.rejectPurchaseReq = async (purchaseId, userId) => {
  // Verify that the user is authorized to reject the purchase
  const purchase = await db
    .selectFrom('purchases')
    .selectAll()
    .where('id', '=', purchaseId)
    .executeTakeFirst();

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.seller_id !== userId) {
    throw new Error('User not authorized to approve this purchase');
  }

  const updated = await db
      .updateTable('purchases')
      .set({ status_id: 4 }) // REJECTED
      .where('id', '=', purchaseId)
      .where('status_id', '=', 2) // AWAITING_SELLER
      .returningAll()
      .executeTakeFirst();

  if (!updated) {
    throw new Error('No pending purchase found to reject');
  }

  publishPurchaseRejected({
    purchaseId: purchaseId,
    resourceId: purchase.resource_id,
  });

  return updated;
};

exports.getPurchasesByUser = async (userId) => {
  return await db
    .selectFrom('purchases as p')
    .innerJoin('purchase_status as s', 's.id', 'p.status_id')
    .select([
      'p.id',
      'p.resource_id',
      'p.seller_id',
      'p.status_id',
      'p.created_at',
      's.name as status_name',
    ])
    .where('p.buyer_id', '=', userId)
    .execute();
};


exports.getAllPurchases = async () => {
  return await db
    .selectFrom('purchases as p')
    .innerJoin('purchase_status as s', 's.id', 'p.status_id')
    .select([
      'p.id',
      'p.buyer_id',
      'p.resource_id',
      'p.seller_id',
      'p.status_id',
      'p.created_at',
      's.name as status_name',
    ])
    .execute();
};
