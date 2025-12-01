const express = require('express');
const routes = require('./routes/authRoutes');

require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/auth', routes);

module.exports = app;
