const { validateSignature } = require("../helpers");

const userAuth = async (req, res, next) => {
  const isAuthorized = await validateSignature(req);

  console.log("IsAuthorized", isAuthorized);

  if (isAuthorized) {
    return next();
  }
  return res
    .status(401)
    .json({ message: "Unauthorized: Please log in first!" });
};

const userAuthorization = (req, res, next) => {
  if (["superAdmin", "admin", "subAdmin"].includes(req.user.admin_type)) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Your credentials are not authorized" });
};

const verifyApiKey = async (req, res, next) => {
  const API_KEY = req.body.api_key;
  if (API_KEY !== process.env.API_KEY) {
    res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid API key or API key not found",
    });
  } else {
    return next();
  }
};

const verifyApiKeyGet = (req, res, next) => {
  const API_KEY = req.headers.api_key;
  if (API_KEY !== process.env.API_KEY) {
    res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid API key or API key not found!",
    });
  } else {
    next();
  }
};

module.exports = {
  userAuth,
  userAuthorization,
  verifyApiKey,
  verifyApiKeyGet,
};
