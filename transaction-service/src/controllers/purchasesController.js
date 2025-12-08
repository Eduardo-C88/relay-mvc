const purchasesService = require('../services/purchasesService');

exports.createPurchaseReq = async (req, res) => {
    try {
        const purchaseData = {
            itemId: req.params.id,
            buyerId: req.user.id,
            // Add other necessary fields from req.body if needed
        };
        const purchase = await purchasesService.createPurchaseReq(purchaseData);
        res.status(201).json(purchase);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create purchase request' });
    }
};