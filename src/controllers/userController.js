const sendVerificationEmail = require("../middleware/sendEmailVerification");
const User = require("../models/User");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  exclude,
  generateSignature,
  generatePassword,
  generateSalt,
  validatePassword,
  generateVerificationCode,
  generateVerificationToken,
  checkOptValidity,
  checkTimeValidity,
  capitalizeFirstLetter,
} = require("../helpers"); 0
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EXPIRE_TIME = 60 * 60 * 20 * 1000; // 20 Hours

// Create New User
const createUser = async (userInputs) => {
  try {
    const { name, email, password, provider, image } = userInputs;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Case 1: User exists, email unverified, delete the existing user
      if (existingUser.email_verified === 0) {
        await User.deleteOne({ email: email });
      }

      // Case 2: User exists, email verified, and email provider
      if (
        existingUser.email_verified === 1 &&
        existingUser.provider === 'email' &&
        provider === 'email'
      ) {
        return { status: false, message: 'This email already exists!' };
      }

      // Case 3: User exists, email verified, different provider (prevent manual registration)
      if (
        existingUser.email_verified === 1 &&
        existingUser.provider !== 'email' &&
        provider === 'email'
      ) {
        return {
          status: false,
          message: `Please Try, Sign Up with ${capitalizeFirstLetter(existingUser.provider)}!`,
        };
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user if not exists
    let newUser = existingUser;

    if (!newUser) {
      newUser = new User({
        name,
        email,
        provider,
        image,
        password: hashedPassword,
        salt,
        email_verified: provider === 'email' ? 0 : 1,
        status: 1,
      });

      await newUser.save();

      // Create a customer in Stripe
      const stripeCustomer = await stripe.customers.create({
        email: newUser.email,
        name: newUser.name,
        // Add more customer details as needed
      });

      // Save the Stripe customer ID in your MongoDB user model
      newUser.stripeCustomerId = stripeCustomer.id;
      await newUser.save();
    }

    if (provider === 'email') {
      // Case 4: User is registered with email provider
      const otp = generateVerificationCode(6);
      const hashedOtp = await bcrypt.hash(otp, 10);

      // Save verify code
      await newUser.updateOne({ verify_code: hashedOtp });

      // Send Email
      await sendVerificationEmail(newUser.email, otp);

      // Generate Temporary Access Token
      const accessToken = await generateVerificationToken({
        email: newUser.email,
      });

      return {
        status: true,
        data: { accessToken },
        message: 'OTP sent successfully!',
      };
    }

    // Case 5: User registered via social provider
    const accessToken = await generateSignature(
      {
        email: newUser.email,
        role: newUser.role,
      },
      60 * 60 * 24 // 1 Day
    );

    const refreshToken = await generateSignature(
      {
        email: newUser.email,
        role: newUser.role,
      },
      60 * 60 * 24 * 7 // 7 Days
    );

    const user = exclude(newUser.toObject(), [
      '_id',
      '__v',
      'password',
      'salt',
      'verify_code',
      'provider',
      'forget_code',
      'createdAt',
      'updatedAt',
    ]);

    return {
      status: true,
      message: 'Login successfully!',
      data: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        ...user,
      },
    };
  } catch (error) {
    console.error('Error', error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      throw new Error('Email is already exist!');
    }
    throw new Error('Failed to create user!');
  }
};

// User Sign In
const signIn = async (userInfo) => {
  try {
    const { email, password } = userInfo;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return {
        status: false,
        message: "Your credentials are incorrect!",
      };
    }

    if (existingUser.email_verified === 0) {
      await User.deleteOne({ email: existingUser.email });
      return {
        status: false,
        message: "Your credentials are incorrect!",
      };
    }

    if (
      existingUser.email_verified === 1 &&
      existingUser.provider !== "email"
    ) {
      return {
        status: false,
        message: `Please Try, Sign In with ${capitalizeFirstLetter(
          existingUser.provider
        )}!`,
      };
    }

    const validPassword = await validatePassword(
      password,
      existingUser.password,
      existingUser.salt
    );

    if (validPassword) {
      const accessToken = await generateSignature(
        {
          email: existingUser.email,
          role: existingUser.role,
        },
        60 * 60 * 24 // 1 Day
      );

      const refreshToken = await generateSignature(
        {
          email: existingUser.email,
          role: existingUser.role,
        },
        60 * 60 * 24 * 7 // 7 Days
      );

      const user = exclude(existingUser.toObject(), [
        "_id",
        "__v",
        "password",
        "salt",
        "verify_code",
        "provider",
        "forget_code",
        "createdAt",
        "updatedAt",
      ]);

      return {
        status: true,
        message: "Login successfully!",
        data: {
          accessToken,
          refreshToken,
          expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          ...user,
        },
      };
    } else {
      return {
        status: false,
        message: "Your credentials are incorrect!",
      };
    }
  } catch (error) {
    console.error("Error in Sign In:", error);
    throw new Error("Failed to user Sign In!");
  }
};

// Get Access Token
const getAccessToken = async (userInfo) => {
  try {
    const accessToken = await generateSignature(
      {
        email: userInfo.email,
        role: userInfo.role,
      },
      60 * 60 * 24 // 1 Day
    );

    const refreshToken = await generateSignature(
      {
        email: userInfo.email,
        role: userInfo.role,
      },
      60 * 60 * 24 * 7 // 7 Days
    );

    return {
      status: true,
      message: "Access Token refresh successfully!",
      data: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      },
    };
  } catch (error) {
    console.error("Error in Sign In:", error);
    throw new Error("Failed to Sign In user");
  }
};

// Verify Email
const verifyEmail = async (optInfo) => {
  try {
    const { token, otp } = optInfo;
    const decode = jwt.verify(token, process.env.APP_SECRET);
    const email = decode.email;
    const findUser = await User.findOne({ email });

    if (!findUser) {
      return { status: false, message: "Otp is expired or incorrect!" };
    }

    const hashedOtp = findUser.verify_code;
    const isValidOpt = await checkOptValidity(otp, hashedOtp);
    const isValidTime = checkTimeValidity(findUser.createdAt);

    if (isValidOpt && isValidTime) {
      const userData = {
        email_verified: 1,
        verify_code: null,
      };

      const verifiedUser = await User.findByIdAndUpdate(
        findUser._id,
        userData,
        { new: true }
      );

      const accessToken = await generateSignature(
        {
          email: verifiedUser.email,
          role: verifiedUser.role,
        },
        60 * 60 * 24 // 1 Day
      );

      const refreshToken = await generateSignature(
        {
          email: verifiedUser.email,
          role: verifiedUser.role,
        },
        60 * 60 * 24 * 7 // 7 Days
      );
      const user = exclude(verifiedUser.toObject(), [
        "password",
        "salt",
        "verify_code",
        "provider",
        "forget_code",
        "createdAt",
        "updatedAt",
        "_id",
        "__v",
      ]);
      return {
        status: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          ...user,
        },
        message: "Otp validated successfully!",
      };
    } else {
      return { status: false, message: "OTP is expired or incorrect!" };
    }
  } catch (error) {
    console.error("Error", error);
    throw new Error("Failed");
  }
};

// Resend OTP
const ResendOTP = async (userInfo) => {
  try {
    const { email } = userInfo;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    if (existingUser.email_verified !== 0) {
      return { status: false, message: "Email is already verified" };
    }

    const otp = generateVerificationCode(6);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await User.findByIdAndUpdate(existingUser._id, { verify_code: hashedOtp });

    await sendVerificationEmail(existingUser.email, otp);

    return { status: true, message: "New OTP sent successfully!" };
  } catch (error) {
    console.error("Error in Resend Verification Email:", error);
    throw new Error("Failed to resend verification email");
  }
};

// Change Password
const ChangePassword = async ({ email, oldPassword, newPassword }) => {
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    const isPasswordValid = await validatePassword(
      oldPassword,
      existingUser.password,
      existingUser.salt
    );

    if (!isPasswordValid) {
      return { status: false, message: "Invalid old password" };
    }

    if (oldPassword === newPassword) {
      return {
        status: false,
        message: "New password cannot be the same as the old password",
      };
    }

    const newSalt = await generateSalt();
    const hashedNewPassword = await generatePassword(newPassword, newSalt);

    existingUser.password = hashedNewPassword;
    existingUser.salt = newSalt;

    await existingUser.save();

    return { status: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in Change Password:", error);
    throw new Error("Failed to change password");
  }
};

// Get User Profile
const GetProfile = async (userInfo) => {
  try {
    const { email } = userInfo;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new Error("No Profile");
    }

    const userWithoutSensitiveInfo = exclude(existingUser.toObject(), [
      "_id",
      "__v",
      "password",
      "salt",
      "verify_code",
      "provider",
      "forget_code",
      "createdAt",
      "updatedAt",
    ]);

    return {
      status: true,
      message: "User profile found",
      user: userWithoutSensitiveInfo,
    };
  } catch (error) {
    console.log(error);
    if (error.message === "No Profile") {
      throw new Error("User profile does not exist");
    } else {
      throw new Error("Failed to retrieve user profile");
    }
  }
};

// Update User Profile
const UpdateProfile = async (updatedUserInfo) => {
  try {
    const { email, name, image, role } = updatedUserInfo;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    if (name) {
      existingUser.name = name;
    }

    if (image) {
      existingUser.image = image;
    }

    if (role) {
      existingUser.role = role;
    }

    await existingUser.save();

    const userWithoutSensitiveInfo = {
      ...existingUser.toObject(),
      password: undefined,
      salt: undefined,
      verify_code: undefined,
      provider: undefined,
      forget_code: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    return {
      status: true,
      message: "User profile updated",
      user: userWithoutSensitiveInfo,
    };
  } catch (error) {
    console.error("Error in Update Profile:", error);
    throw new Error("Failed to update user profile");
  }
};

// Delete User Account
const DeleteUser = async (userInfo) => {
  try {
    const { email } = userInfo;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    await User.deleteOne({ email });

    return { status: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error in Delete User:", error);
    throw new Error("Failed to delete user");
  }
};

module.exports = {
  createUser,
  signIn,
  getAccessToken,
  verifyEmail,
  ResendOTP,
  GetProfile,
  UpdateProfile,
  DeleteUser,
  ChangePassword,
};
