require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const axios = require("axios");

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

app.get('/api/stress-all', async (req, res) => {
    try {
        await Promise.all([
            axios.get('http://user-service:3001/stress', { timeout: 15000 }),
            axios.get('http://resource-service:3002/stress', { timeout: 15000 }),
            axios.get('http://operation-service:3003/stress', { timeout: 15000 })
        ]);
        res.send("🔥 All services stressed!");
    } catch (err) {
        // This will tell you EXACTLY which service failed in your terminal
        console.error("Stress Test Failure at:", err.config?.url);
        console.error("Error Message:", err.message);
        res.status(500).send(`Service Failed: ${err.config?.url || 'Unknown'}`);
    }
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
