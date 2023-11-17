const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");

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

exports.addPaymentMethod = async (req, res) => {
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
        let customer = await stripe.customers.list({
            email: userMail,
            limit: 1,
        });

        if (customer.data.length === 0) {
            // If no customer found, create a new customer in Stripe
            customer = await stripe.customers.create({
                email: userMail,
                // Add more customer details as needed
            });
        } else {
            // Use the first customer found in the list
            customer = customer.data[0];
        }

        // Attach the payment method to the customer
        const attachedPaymentMethod = await stripe.paymentMethods.attach(req.body.paymentMethod.id, {
            customer: customer.id,
        });

        // Set the attached payment method as the default for the customer
        await stripe.customers.update(customer.id, {
            invoice_settings: {
                default_payment_method: attachedPaymentMethod.id,
            },
        });

        return res.status(200).json({
            status: true,
            message: 'Payment method added successfully',
            paymentMethod: attachedPaymentMethod
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        return res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
};

exports.getAllPaymentMethods = async (req, res) => {
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
        let customer = await stripe.customers.list({
            email: userMail,
            limit: 1,
        });

        if (customer.data.length === 0) {
            return res.status(404).json({ status: false, message: 'Customer not found in Stripe' });
        }

        // Use the first customer found in the list
        customer = customer.data[0];

        // Retrieve all payment methods associated with the customer
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customer.id,
            type: 'card', // You can adjust this based on your payment method types
        });

        return res.status(200).json({
            status: true,
            message: 'Payment methods retrieved successfully',
            paymentMethods: paymentMethods.data
        });
    } catch (error) {
        console.error('Error getting payment methods:', error);
        return res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
};