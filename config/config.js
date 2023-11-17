require("dotenv").config();

const config = {
  development: {
    corsOptions: {
      origin: process.env.CORS_ORIGINS.split(","),
      credentials: true,
    },
    databaseURI: process.env.DEV_DATABASE_URL,
    apiKey: process.env.API_KEY,
    appSecret: process.env.APP_SECRET,
  },
  production: {
    corsOptions: {
      origin: process.env.CORS_ORIGINS.split(","),
      credentials: true,
    },
    databaseURI: process.env.PROD_DATABASE_URL,
    apiKey: process.env.API_KEY,
    appSecret: process.env.APP_SECRET,
  },
};

module.exports = config;
