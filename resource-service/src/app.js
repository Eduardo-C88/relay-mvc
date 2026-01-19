const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../static/swagger/swagger.json");
const { connectRabbitMQ, onChannelReady } = require("./utils/rabbitmq");
const { startResourceConsumers } = require("./events/resourceConsumer");
const { initResourceMessaging } = require("./events/resourcePublisher");
const client = require('prom-client');
client.collectDefaultMetrics();

// App Routes
const resourcesRoutes = require("./routes/resourcesRoutes");

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
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Add this to your routes
app.get('/stress', (req, res) => {
  const end = Date.now() + 5000; // Stress CPU for 5 seconds
  while (Date.now() < end) {
    Math.random() * Math.random(); // Do useless math
  }
  res.send("CPU Stress Test Complete");
});

//Connect to RabbitMQ
(async () => {
  await connectRabbitMQ();  // Ensure channel is created

  // Initialize publishers
  await initResourceMessaging();
  console.log("✅ All RabbitMQ publishers initialized");
})();
// 🔥 Register consumers SAFELY
onChannelReady(startResourceConsumers);

// app.use Routes
app.use(resourcesRoutes);

module.exports = app;
