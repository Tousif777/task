const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentConteroller');

// Create user payment method
router.post('/add-payment-method', paymentController.addPaymentMethod);

//get all user payment method
router.get('/get-all-payment-methods', paymentController.getAllPaymentMethods);

module.exports = router;
