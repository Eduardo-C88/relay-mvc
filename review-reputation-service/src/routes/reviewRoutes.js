const express = require('express');
const reviewController = require('../controllers/reviewController');
const reputationController = require('../controllers/reputationController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Reviews
router.post('/reviews', authMiddleware, reviewController.createReview);

router.get('/reviews/:id', reviewController.getReviewById);
router.get('/reviews', reviewController.getAllReviews);

router.put('/reviews/:id', authMiddleware, reviewController.updateReview);

router.delete('/reviews/:id', authMiddleware, roleMiddleware('admin'), reviewController.deleteReview);

// Reputation
router.get('/reputation/:userId', reputationController.getUserReputation);

module.exports = router;