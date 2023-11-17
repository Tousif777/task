const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/create-checkout-link', checkoutController.createCheckoutLink);

module.exports = router;
