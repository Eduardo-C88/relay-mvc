require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const setupRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Rate limiter (avoid brute-force)
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 100,
}));

app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

// Expose the metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Register gateway routing
setupRoutes(app);

// Error handler middleware
app.use(errorHandler);

// Body parser
app.use(express.json());

const PORT = process.env.GATEWAY_PORT || 3000;

app.listen(PORT, () => {
    console.log("API Gateway running on port", PORT);
});
