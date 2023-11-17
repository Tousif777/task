const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userController");
const { userAuth } = require("../middleware/userAuth");

// Route for user register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required!"),
    body("email").isEmail().withMessage("Invalid email format!"),
    body("password").notEmpty().withMessage("Password is required!"),
    body("provider").notEmpty().withMessage("Provider is required!"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { name, email, password, provider, image } = req.body;
      const userData = {
        name,
        email,
        password,
        provider,
        image,
      };

      const newUser = await userController.createUser(userData);

      return res.status(200).json(newUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for user login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const data = await userController.signIn({ email, password });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for verify email using otp
router.post(
  "/verify-email",
  [body("otp").notEmpty().withMessage("OTP is required!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { otp } = req.body;
      const { token } = req.headers;
      const data = await userController.verifyEmail({ token, otp });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route to resend verification email
router.post(
  "/resend-otp",
  [body("email").isEmail().withMessage("Invalid email format")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;

      const data = await userController.ResendOTP({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for changing user password
router.put(
  "/change-password",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, oldPassword, newPassword } = req.body;

      // Call the controller function to change the password
      const data = await userController.ChangePassword({
        email,
        oldPassword,
        newPassword,
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for getting access token by using refresh token
router.post("/refresh-token", userAuth, async (req, res, next) => {
  try {
    const data = await userController.getAccessToken(req.user);
    return res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Route for user profile
router.post(
  "/profile",
  userAuth,
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;

      const data = await userController.GetProfile({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for updating user profile
router.put(
  "/profile",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, name, image, role } = req.body;

      const data = await userController.UpdateProfile({
        email,
        name,
        image,
        role,
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Delete User Account
router.delete(
  "/delete",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;
      const data = await userController.DeleteUser({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

module.exports = router;
