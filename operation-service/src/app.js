const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../static/swagger/swagger.json");
const { connectRabbitMQ, onChannelReady } = require("./utils/rabbitmq");
const { initOperationMessaging } = require("./events/operationPublisher");
const { startOperationConsumers } = require("./events/operationConsumer");
const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// App Routes
const purchasesRoutes = require("./routes/purchasesRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");

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

app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

// Expose the metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

//Connect to RabbitMQ and start consumers
(async () => {
  await connectRabbitMQ();  // Ensure channel is created

  // Initialize publishers
  await initOperationMessaging();

  console.log("✅ All RabbitMQ publishers initialized");
})();
// 🔥 Register consumers SAFELY
onChannelReady(startOperationConsumers);

//app.use(express.json());

// app.use Routes
app.use(borrowingRoutes);
app.use(purchasesRoutes);


module.exports = app;
