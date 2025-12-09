const purchasesService = require("../services/purchasesService");
const resourceClient = require("../utils/resourceClient");

exports.createPurchase = async (req, res) => {
  const resourceId = parseInt(req.params.id);
  const buyerId = req.user.id;

  if (isNaN(resourceId)) {
    return res.status(400).json({ error: "Invalid resource ID" });
  }

  try {
    // 1️⃣ Check resource availability
    const availability = await resourceClient.checkAvailability(resourceId, buyerId);

    if (!availability) {
      return res.status(400).json({ error: "Resource is not available for purchase" });
    }

    // 2️⃣ Create purchase request using the ownerId as sellerId
    const purchaseData = {
      buyerId,
      resourceId,
      sellerId: availability.ownerId,  // <- from Resource service
      statusId: 4 // Pending
    };

    const purchase = await purchasesService.createPurchaseReq(purchaseData);

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Failed to create purchase:", error);
    res.status(500).json({ error: "Failed to create purchase" });
  }
};