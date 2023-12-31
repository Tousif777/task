const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.get('/get-subscriptions', subscriptionController.getSubscriptions);
router.post('/cancel-subscription', subscriptionController.cancelSubscription);
router.get('/payment-history', subscriptionController.getPaymentHistory)
router.post('/auto-renew-off', subscriptionController.turnOffAutoRenewal)
router.post('/auto-renew-on', subscriptionController.turnOnAutoRenewal)

module.exports = router;
