const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/productController');

router.post('/create-subscription-product', subscriptionController.createSubscriptionProduct);

router.get('/get-all-products', subscriptionController.getAllSubscriptionProducts);

router.put('/deactivate-product/:productId', subscriptionController.deactivateSubscriptionProduct);

router.put('/update-product/:productId', subscriptionController.updateSubscriptionProduct);

router.put('/activate-product/:productId', subscriptionController.activateSubscriptionProduct);

module.exports = router;
