const express = require("express");
const userRoutes = require("../src/routes/userRoutes"); // Import user routes
const { verifyApiKeyGet } = require("../src/middleware/userAuth");

const router = express.Router();

// Use the userRoutes, productRoutes, and orderRoutes in your router
router.use("/user", verifyApiKeyGet, userRoutes);

module.exports = router;
