const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const APP_SECRET = process.env.APP_SECRET;

// Helper Functions
module.exports.generateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.generatePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.validatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.generatePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.generateSignature = async (payload, time) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: time });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.GenerateTempToken = async (data) => {
  try {
    return jwt.sign(payload, code, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.generateVerificationToken = async (payload) => {
  try {
    return jwt.sign(payload, process.env.APP_SECRET, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.checkOptValidity = async (opt, hashedOtp) => {
  try {
    const result = await bcrypt.compare(opt, hashedOtp);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.checkTimeValidity = (timestamp) => {
  const inputDate = new Date(timestamp);
  const currentTime = new Date();
  const timeDifference = currentTime - inputDate;
  return timeDifference <= 120000; // 2 minutes
};

module.exports.validateSignature = async (req) => {
  try {
    //const signature = req.get("Authorization"); //Another way from direct Authorization
    const signature = req.headers.authorization; //Taking auth token from headers
    const payload = jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.excludeMany = async (array, keys) => {
  let newArray = [];
  array?.map((item) => {
    for (let key of keys) {
      delete item[key];
    }
    newArray.push(item);
  });
  return newArray;
};

module.exports.exclude = (object, keys) => {
  for (let key of keys) {
    delete object[key];
  }
  return object;
};

module.exports.FormateData = (data) => {
  if (data) {
    return data;
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.UpdateObject = (oldObject, newObject) => {
  const newData = Object?.entries(oldObject);
  newData.forEach((item) => {
    const key = item[0];
    const value = item[1];

    if (newObject.hasOwnProperty(key)) {
      oldObject[key] = newObject[key];
    }
  });
  return oldObject;
};

module.exports.deleteImagesFromArray = async (array) => {
  for (const item of array) {
    await deleteImage(item.image_url);
  }
};

module.exports.generateVerificationCode = (length) => {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports.capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
