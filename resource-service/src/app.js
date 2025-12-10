const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../static/swagger/swagger.json");
const { connectRabbitMQ } = require("./utils/rabbitmq");
const {
  startUserEventsConsumer, 
  startPurchaseRequestConsumer,
  startPurchaseConfirmedConsumer
} = require("./events/resourceConsumer");

// App Routes
const resourcesRoutes = require("./routes/resourcesRoutes");
const healthRoutes = require("./routes/healthRoutes");

require("dotenv").config();

const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//Serve static files from the 'static' directory
app.use("/", express.static(path.join(__dirname, "../static")));
//access api documentation
app.use("/doc", express.static(path.join(__dirname, "../static/doc")));
app.use("/apidoc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to RabbitMQ and start consumers
(async () => {
  const channel = await connectRabbitMQ();
  await startUserEventsConsumer(channel);
  await startPurchaseRequestConsumer(channel);
  await startPurchaseConfirmedConsumer(channel);
})();

// app.use Routes
app.use(resourcesRoutes);
app.use(healthRoutes);

module.exports = app;
