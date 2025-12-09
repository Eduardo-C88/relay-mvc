const purchasesService = require("../services/purchasesService");
const resourceClient = require("../utils/resourceClient");

exports.createPurchase = async (req, res) => {
  const resourceId = parseInt(req.params.resourceId);
  const buyerId = req.user.id;

  try {
    const availability = await resourceClient.checkAvailability(resourceId, buyerId);

    if (!availability.isAvailable) {
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