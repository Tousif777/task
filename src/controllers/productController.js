const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createSubscriptionProduct = async (req, res) => {
    try {
        const { name, description, images, type, unit_amount, currency, interval, features } = req.body;

        // Create the product
        const product = await stripe.products.create({
            name: name || 'Subscription Product',
            description: description || 'Subscription product description',
            images: images || ['https://example.com/default-image.jpg'],
            type: type || 'service',
            metadata: { features: features || [] },
        });

        // Create the price for the product (subscription)
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: unit_amount || 1500,
            currency: currency || 'usd',
            recurring: {
                interval: interval || 'year',
            },
        });

        // Return details about the created subscription
        res.status(200).json({ product, price });

    } catch (error) {
        console.error('Error creating subscription product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllSubscriptionProducts = async (req, res) => {
    try {
        // Retrieve all products from Stripe
        const products = await stripe.products.list({ type: 'service' });

        // Create an array to store product details with prices
        const productsWithPrices = [];

        // Iterate through each product
        for (const product of products.data) {
            // Retrieve prices associated with the product
            const prices = await stripe.prices.list({ product: product.id });

            // Add the product details along with prices to the array
            productsWithPrices.push({
                product,
                prices: prices.data,
            });
        }

        // Return the list of products with prices
        res.status(200).json({ productsWithPrices });

    } catch (error) {
        console.error('Error retrieving subscription products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deactivateSubscriptionProduct = async (req, res) => {
    const productId = req.params.productId;

    try {
        // Retrieve prices associated with the product
        const prices = await stripe.prices.list({ product: productId });

        // Set prices as inactive
        await Promise.all(prices.data.map(async (price) => {
            await stripe.prices.update(price.id, {
                active: false,
            });
        }));

        // Return details about the updated product
        const updatedProduct = await stripe.products.update(productId, {
            active: false,
        });

        res.status(200).json({ success: true, product: updatedProduct, message: 'Product deactivated successfully' });

    } catch (error) {
        console.error('Error deactivating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.activateSubscriptionProduct = async (req, res) => {
    const productId = req.params.productId;

    try {
        // Retrieve prices associated with the product
        const prices = await stripe.prices.list({ product: productId });

        // Set prices as active
        await Promise.all(prices.data.map(async (price) => {
            await stripe.prices.update(price.id, {
                active: true,
            });
        }));

        // Return details about the updated product
        const updatedProduct = await stripe.products.update(productId, {
            active: true,
        });

        res.status(200).json({ success: true, product: updatedProduct, message: 'Product activated successfully' });

    } catch (error) {
        console.error('Error activating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateSubscriptionProduct = async (req, res) => {
    const productId = req.params.productId;
    const { name, description, images, type, unit_amount, currency, interval, features } = req.body;

    try {
        const updatedProduct = await stripe.products.update(productId, {
            name: name || 'Updated Subscription Product',
            description: description || 'Updated subscription product description',
            images: images || ['https://example.com/updated-image.jpg'],
            type: type || 'service',
            metadata: { features: features || [] },
        });

        const updatedPrice = await stripe.prices.update(
            productId,
            {
                product: productId,
                unit_amount: unit_amount || 2000,
                currency: currency || 'usd',
                recurring: {
                    interval: interval || 'year',
                },
            }
        );

        res.status(200).json({ product: updatedProduct, price: updatedPrice });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
