import { registerUser, loginUser } from "../services/auth.service.js";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  facebookLogin,
  appleLogin,
} from "../services/auth.service.js";
import { googleLogin } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;
    const data = await registerUser(firstName, lastName, email, phone, password, role);

    console.log('role')
    res.status(201).json({
      success: true,
      message: "User registered",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    const isSuperadmin = !!data.user.access_token;

    res.status(200).json({
      success: true,
      message: isSuperadmin
        ? "Login successful."
        : "OTP sent to your registered email.",
      data: {
        user: {
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          roleId: data.user.roleId,
        },
        ...(isSuperadmin && {
          access_token: data.user.access_token,
          refresh_token: data.user.refresh_token,
        }),
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const sendOtpHandler = async (req, res) => {
  try {
    const { userId } = req.body;
    await sendOtp(userId);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const verifyOtpHandler = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const data = await verifyOtp(userId, otp);

    res.status(200).json({
      data,
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const resendOtpHandler = async (req, res) => {
  try {
    const { userId } = req.body;
    await resendOtp(userId);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const googleLoginHandler = async (req, res) => {
  try {
    const { idToken } = req.body;

    const data = await googleLogin(idToken);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      data,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const facebookLoginHandler = async (req, res) => {
  try {
    const { accessToken } = req.body;

    const data = await facebookLogin(accessToken);

    res.status(200).json({
      success: true,
      message: "Facebook login successful",
      data,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const appleLoginHandler = async (req, res) => {
  try {
    const { identityToken, fullName } = req.body;

    const data = await appleLogin(identityToken, fullName);

    res.status(200).json({
      success: true,
      message: "Apple login successful",
      data,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};
