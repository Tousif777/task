const mongoose = require("mongoose");

const connectToMongoDB = async (databaseURI) => {
  try {
    await mongoose.connect(databaseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Database!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectToMongoDB;
