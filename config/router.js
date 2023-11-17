const express = require("express");
const userRoutes = require("../src/routes/userRoutes"); // Import user routes
const productRoute = require("../src/routes/productRoute");
const { verifyApiKeyGet } = require("../src/middleware/userAuth");

const router = express.Router();

// Use the userRoutes, productRoutes, and orderRoutes in your router
router.use("/user", verifyApiKeyGet, userRoutes);
router.use('/products', verifyApiKeyGet, productRoute);

module.exports = router;
