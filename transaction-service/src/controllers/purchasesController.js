const purchasesService = require("../services/purchasesService");
const resourceClient = require("../utils/resourceClient");

exports.createPurchase = async (req, res) => {
  const resourceId = parseInt(req.params.resourceId);
  const buyerId = req.user.id;

  try {
    const availability = await resourceClient.checkAvailability(resourceId, buyerId);

    if (!availability.available) {
      console.log(`Resource ${resourceId} is not available for purchase by buyer ${buyerId}`);
      return res.status(400).json({ error: "Resource is not available for purchase" });
    }

    const purchaseData = {
      buyerId,
      resourceId,
      sellerId: availability.ownerId,
      statusId: 4
    };

    const purchase = await purchasesService.createPurchaseReq(purchaseData);
    res.status(201).json(purchase);

  } catch (error) {
    console.error("Failed to create purchase:", error);
    res.status(500).json({ error: "Failed to create purchase" });
  }
};


exports.approvePurchase = async (req, res) => {
  const resourceId = parseInt(req.params.resourceId);
  const userId = req.user.id;

  if (isNaN(resourceId)) {
    return res.status(400).json({ error: "Invalid resource ID" });
  }
  try {
    // Check if the purchase can be approved
    const confirmable = await resourceClient.checkConfirmable(resourceId, userId);
    if (!confirmable) {
      console.log(`Purchase for resource ${resourceId} cannot be approved by user ${userId}`);
      return res.status(400).json({ error: "Purchase cannot be approved" });
    }

    const updatedPurchase = await purchasesService.approvePurchaseReq(resourceId);
    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error("Failed to approve purchase:", error);
    res.status(500).json({ error: "Failed to approve purchase" });
  }
};

exports.rejectPurchase = async (req, res) => {
  const resourceId = parseInt(req.params.resourceId);
  const userId = req.user.id;
  if (isNaN(resourceId)) {
    return res.status(400).json({ error: "Invalid resource ID" });
  }
  try {
    // Check if the purchase can be rejected
    const confirmable = await resourceClient.checkConfirmable(resourceId, userId);
    if (!confirmable) {
      console.log(`Purchase for resource ${resourceId} cannot be rejected by user ${userId}`);
      return res.status(400).json({ error: "Purchase cannot be rejected" });
    }

    const updatedPurchase = await purchasesService.rejectPurchaseReq(resourceId, userId);
    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error("Failed to reject purchase:", error);
    res.status(500).json({ error: "Failed to reject purchase" });
  }
};

exports.getPurchasesHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const purchases = await purchasesService.getPurchasesByUser(userId);
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Failed to get purchase history:", error);
    res.status(500).json({ error: "Failed to get purchase history" });
  } 
};

exports.getUserPurchases = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const purchases = await purchasesService.getPurchasesByUser(userId);
    res.status(200).json(purchases);
  }
  catch (error) {
    console.error("Failed to get user purchases:", error);
    res.status(500).json({ error: "Failed to get user purchases" });
  }
};  

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases =  await purchasesService.getAllPurchases();
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Failed to get all purchases:", error);
    res.status(500).json({ error: "Failed to get all purchases" });
  }
};
  