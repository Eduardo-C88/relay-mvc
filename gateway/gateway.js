require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

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
