require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use("/", require("./routes/notifications.routes"));

module.exports = app;
