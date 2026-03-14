const reviewService = require('../services/reviewService');

module.exports.createReview = async function(req, res) {
    try {
        const review = await reviewService.createReview(req.body);
        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getReviewById = async function(req, res) {
    try {
        const review = await reviewService.getReviewById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getAllReviews = async function(req, res) {
    try {
        const reviews = await reviewService.getAllReviews();
        res.json(reviews);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.updateReview = async function(req, res) {
    try {
        const updated = await reviewService.updateReview(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Review not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.deleteReview = async function(req, res) {
    try {
        const deleted = await reviewService.deleteReview(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Review not found' });
        res.status(204).end();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getReviewsByUser = async function(req, res) {
    try {
        const reviews = await reviewService.getReviewsByUser(req.params.userId);
        res.json(reviews);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getReviewsByResource = async function(req, res) {
    try {
        const reviews = await reviewService.getReviewsByResource(req.params.resourceId);
        res.json(reviews);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
