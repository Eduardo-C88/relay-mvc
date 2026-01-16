const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../static/swagger/swagger.json');
const { connectRabbitMQ } = require("./utils/rabbitmq");
const { initUserMessaging } = require("./events/userPublisher");

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

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

// Connect to RabbitMQ
(async () => {
  await connectRabbitMQ();  // Ensure channel is created

  // Initialize publishers
  await initUserMessaging();

  console.log("✅ All RabbitMQ publishers initialized");
})();

app.use(authRoutes);
app.use(userRoutes);
 
module.exports = app;
