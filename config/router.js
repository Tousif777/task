const express = require("express");
const userRoutes = require("../src/routes/userRoutes"); // Import user routes
const productRoute = require("../src/routes/productRoute");
const paymentRoute = require("../src/routes/paymentRoutes");
const checkOutRoute = require("../src/routes/checkoutRoute");
const subscriptionRoute = require("../src/routes/subscriptionRoute");
const { verifyApiKeyGet } = require("../src/middleware/userAuth");

const router = express.Router();

// Use the userRoutes, productRoutes, and orderRoutes in your router
router.use("/user", verifyApiKeyGet, userRoutes);
router.use('/products', verifyApiKeyGet, productRoute);
router.use("/payment", verifyApiKeyGet, paymentRoute);

// Routes
router.use('/checkout', checkOutRoute);
router.use('/subscription', subscriptionRoute);

module.exports = router;
