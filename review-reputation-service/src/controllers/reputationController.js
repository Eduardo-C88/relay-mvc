const reputationService = require('../services/reputationService');

// GET /reputation/:userId
module.exports.getReputation = async function(req, res) {
    try {
        const userId = Number(req.params.userId);
        const reputation = await reputationService.getUserReputation(userId);
        if (!reputation) return res.status(404).json({ error: 'User reputation not found' });
        res.status(200).json({ reputation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /reputation/:userId
// roleType: 'BUYER' | 'SELLER', rating: 1-5
module.exports.updateReputation = async function(req, res) {
    try {
        const userId = Number(req.params.userId);
        const { roleType, rating } = req.body;

        const updatedReputation = await reputationService.updateUserReputation(userId, roleType, rating);
        res.status(200).json({ reputation: updatedReputation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};