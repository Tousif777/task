const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.get('/get-subscriptions', subscriptionController.getSubscriptions);
router.post('/cancel-subscription', subscriptionController.cancelSubscription);

module.exports = router;
