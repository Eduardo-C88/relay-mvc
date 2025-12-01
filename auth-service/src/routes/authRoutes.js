const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController');

router.post('/register', authController.register);

module.exports = router;