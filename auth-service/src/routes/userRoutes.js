const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes defined in this router
router.use(authMiddleware.authenticateToken);
router.get('/users/me', userController.getUserProfile);

module.exports = router;