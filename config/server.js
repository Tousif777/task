const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const errorMiddleware = require("../src/middleware/errorMiddleware");
const { verifyApiKeyGet } = require("../src/middleware/userAuth");
const router = require("./router");
const connectToMongoDB = require("./database");
const config = require("./config");

const env = process.env.NODE_ENV || "development";

// Connect to database
connectToMongoDB(config[env].databaseURI);

// Middleware
app.use(cors(config[env].corsOptions));
app.use(express.json());


// Routes
app.use("/api", router);

// Home Page
app.use("/", (req, res) => {
  res.send("Hello World");
});

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
