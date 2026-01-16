const purchasesService = require("../services/purchasesService");

exports.createPurchase = async (req, res) => {
  const resourceId = parseInt(req.params.resourceId);
  const buyerId = req.user.id;

  try {
    const purchaseData = {
      buyerId,
      resourceId,
    };

    const purchase = await purchasesService.createPurchaseReq(purchaseData);
    res.status(201).json(purchase);

  } catch (error) {
    console.error("Failed to create purchase:", error);
    res.status(500).json({ error: "Failed to create purchase" });
  }
};


exports.approvePurchase = async (req, res) => {
  const purchaseId = parseInt(req.params.purchaseId);
  const userId = req.user.id;

  if (isNaN(purchaseId)) {
    return res.status(400).json({ error: "Invalid purchase ID" });
  }
  try {
    const updatedPurchase = await purchasesService.approvePurchaseReq(purchaseId, userId);
    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error("Failed to approve purchase:", error);
    res.status(500).json({ error: "Failed to approve purchase" });
  }
};

exports.rejectPurchase = async (req, res) => {
  const purchaseId = parseInt(req.params.purchaseId);
  const userId = req.user.id;
  if (isNaN(purchaseId)) {
    return res.status(400).json({ error: "Invalid purchase ID" });
  }
  try {
    const updatedPurchase = await purchasesService.rejectPurchaseReq(purchaseId, userId);
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
  