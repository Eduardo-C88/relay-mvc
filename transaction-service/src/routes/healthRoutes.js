const express = require('express');
const router = express.Router();

// Health route without separate controller file
router.get('/health', (req, res) => res.status(200).send('OK'));
router.get('/health/ready', (req, res) => res.status(200).send('READY'));
router.get('/health/live', (req, res) => res.status(200).send('ALIVE'));

module.exports = router;