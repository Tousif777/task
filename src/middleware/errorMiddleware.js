const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    // Check if the error is a Mongoose validation error
    if (err.name === 'ValidationError') {
        const validationErrors = [];
        for (let field in err.errors) {
            validationErrors.push(err.errors[field].message);
        }
        res.status(400).json({ status: false, errors: validationErrors }); // Bad request due to validation errors
    } else {
        res.status(500).json({ status: false, error: err.message || 'Something went wrong!' }); // Internal server error
    }
};

module.exports = errorMiddleware;
