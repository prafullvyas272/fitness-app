import { registerUser, loginUser } from "../services/auth.service.js";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
} from "../services/auth.service.js";
import { googleLogin } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const data = await registerUser(firstName, lastName, email, phone, password);

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

    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
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
    await verifyOtp(userId, otp);

    res.status(200).json({
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
