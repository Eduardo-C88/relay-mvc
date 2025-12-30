require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use("/", require("./routes/messaging.routes"));

module.exports = app;
