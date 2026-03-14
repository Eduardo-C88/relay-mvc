const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../static/swagger/swagger.json');
const { connectRabbitMQ } = require("./utils/rabbitmq");
const client = require('prom-client');
client.collectDefaultMetrics();

const crypto = require('crypto');

app.use('/api/reviews', reviewRoutes);
app.use('/api/reputation', reputationRoutes);

require('dotenv').config();

const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Serve static files from the 'static' directory
app.use('/', express.static(path.join(__dirname, '../static')));
//access api documentation
app.use('/doc', express.static(path.join(__dirname, '../static/doc')));
app.use('/apidoc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Health check endpoint
app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Stress test endpoint
app.get('/stress', (req, res) => {
  const end = Date.now() + 5000;
  while (Date.now() < end) {
    crypto.pbkdf2Sync('pass', 'salt', 1000, 64, 'sha512');
  }
  res.send('CPU stressed');
});


// Connect to RabbitMQ
(async () => {
    const channel = await connectRabbitMQ();
    await initUserPublisher(channel);
})();

const reviewRoutes = require('./routes/reviewRoutes');
const reputationRoutes = require('./routes/reputationRoutes');
 
module.exports = app;
