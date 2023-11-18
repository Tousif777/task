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

const createCheckoutLink = async (req, res) => {
    const { priceId } = req.body;

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

        let customerId;

        if (customer.data.length === 0) {
            // If the customer does not exist, create a new customer
            const newCustomer = await stripe.customers.create({
                email: userMail,
            });

            // Use the newly created customer's ID
            customerId = newCustomer.id;
        } else {
            // Use the existing customer's ID
            customerId = customer.data[0].id;
        }


        // Create a new Checkout Session with customer information
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription' , // Use 'payment' for one-time purchases, 'subscription' for renewals
            success_url: 'https://yourwebsite.com/success',
            cancel_url: 'https://yourwebsite.com/cancel',
            customer: customerId, // Pass customer ID to pre-fill saved card information
        });

        // Retrieve the checkout session URL
        const checkoutLink = session.url;

        // Send the checkout session link back to the client with a message
        res.json({ status: 'success', message: 'Checkout session created successfully', checkoutLink });

    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Error creating checkout session' });
    }
};


module.exports = {
    createCheckoutLink
};
