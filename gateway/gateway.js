require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const setupRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 1. Security middleware first
app.use(helmet());
app.use(cors());

// 2. Logging (but maybe skip for health checks to reduce noise)
app.use(morgan("dev", {
  skip: (req) => req.path.startsWith('/health')
}));

// 3. Rate limiter (avoid brute-force) - skip for health endpoints
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: (req) => req.path.startsWith('/health') // Don't rate limit health checks
});
app.use(limiter);

// 4. Body parser - BEFORE routes that need it
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Health endpoints - place them BEFORE the gateway routing
// This ensures they're accessible and not affected by proxy issues
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', (req, res) => {
  // You could add checks here, e.g., verify backend services
  res.status(200).json({ 
    status: 'READY',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ 
    status: 'ALIVE',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
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
