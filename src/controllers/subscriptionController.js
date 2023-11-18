const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');

// Function to decode the access token
const decodeAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.APP_SECRET);
        return decoded;
    } catch (error) {
        console.error('Error decoding access token:', error.message);
        return null;
    }
};

const getSubscriptions = async (req, res) => {
    try {
        // Get the access token from the request header
        const accessToken = req.headers.token;

        // Decode the access token to get user information
        const decodedToken = decodeAccessToken(accessToken);

        if (!decodedToken) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        // Retrieve the customer from Stripe using the user's email
        const userMail = decodedToken.email;

        // Retrieve the customer ID using the email address
        const customer = await stripe.customers.list({
            email: userMail,
            limit: 1,
        });

        if (customer.data.length === 0) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }

        const customerId = customer.data[0].id;

        // Retrieve all subscriptions of the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
        });

        res.json({ message: "Subscriptions list generated successfully", subscriptions: subscriptions.data });
    } catch (error) {
        console.error('Error getting subscriptions:', error.message);
        res.status(500).json({ error: 'Error getting subscriptions' });
    }
};

const cancelSubscription = async (req, res) => {
    try {
        // Get the access token from the request header
        const accessToken = req.headers.token;

        // Decode the access token to get user information
        const decodedToken = decodeAccessToken(accessToken);

        if (!decodedToken) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        // Retrieve the customer from Stripe using the user's email
        const userMail = decodedToken.email;

        // Retrieve the customer ID using the email address
        const customer = await stripe.customers.list({
            email: userMail,
            limit: 1,
        });

        if (customer.data.length === 0) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }

        const customerId = customer.data[0].id;

        // Retrieve the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
        });

        // If the customer has subscriptions, cancel the specified one
        if (subscriptions.data.length > 0) {
            // Assuming the subscription ID is provided in the request body
            const { subscriptionIdToCancel } = req.body;

            if (!subscriptionIdToCancel) {
                return res.status(400).json({ status: false, message: 'Subscription ID to cancel is missing in the request body' });
            }

            // Find the subscription in the customer's subscriptions
            const subscriptionToCancel = subscriptions.data.find(subscription => subscription.id === subscriptionIdToCancel);

            if (subscriptionToCancel) {
                // Cancel the subscription
                await stripe.subscriptions.cancel(subscriptionIdToCancel);
                res.json({ status: true, message: 'Subscription canceled successfully' });
            } else {
                res.status(404).json({ status: false, message: 'Subscription not found for the customer' });
            }
        } else {
            res.json({ status: false, message: 'No active subscriptions to cancel' });
        }
    } catch (error) {
        console.error('Error canceling subscription:', error.message);
        res.status(500).json({ error: 'Error canceling subscription' });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        // Get the access token from the request header
        const accessToken = req.headers.token;

        // Decode the access token to get user information
        const decodedToken = decodeAccessToken(accessToken);

        if (!decodedToken) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        // Retrieve the customer from Stripe using the user's email
        const userMail = decodedToken.email;

        // Retrieve the customer ID using the email address
        const customer = await stripe.customers.list({
            email: userMail,
            limit: 1,
        });

        if (customer.data.length === 0) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }

        const customerId = customer.data[0].id;

        // Retrieve all payment intents of the customer
        const paymentIntents = await stripe.paymentIntents.list({
            customer: customerId,
        });

        res.json({ message: 'Payment history retrieved successfully', result: paymentIntents.data });
    } catch (error) {
        console.error('Error getting payment history:', error.message);
        res.status(500).json({ error: 'Error getting payment history' });
    }
};


module.exports = {
    getSubscriptions,
    cancelSubscription,
    getPaymentHistory
};
