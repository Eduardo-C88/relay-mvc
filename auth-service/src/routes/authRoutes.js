const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshToken);
router.delete('/logout', authController.logout);

router.post('/changePassword', authMiddleware.authenticateToken, authController.changePassword);
router.delete('/deleteAccount', authMiddleware.authenticateToken, authController.deleteAccount);

module.exports = router;