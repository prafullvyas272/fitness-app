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
    const { firstName, lastName, email, phone, password, role, gender } = req.body;
    const data = await registerUser(firstName, lastName, email, phone, password, role, gender);

    console.log('role')
    res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to your email and phone.",
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
    const { user } = data;

    let response = {
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          roleId: user.roleId,
          isActive: user.isActive,
          phoneVerified: user.phoneVerified,
          gender: user.gender,
          createdAt: user.createdAt,
          provider: user.provider,
          specialities: user.specialities,
        },
      },
    };

    if (!!user.access_token) {
      response.message = "Login successful.";
      response.data.access_token = user.access_token;
      response.data.refresh_token = user.refresh_token;
      return res.status(200).json(response);
    }

    if (user.isActive && user.phoneVerified) {
      response.message = "Login successful.";
      response.data.access_token = data.access_token;
      response.data.refresh_token = data.refresh_token;
      return res.status(200).json(response);
    }

     // Active but not phone verified
    if (user.isActive && !user.phoneVerified) {
      response.message = "OTP sent to your registered email.";
      return res.status(200).json(response);
    }

    // Not active, but phone verified
    if (!user.isActive && user.phoneVerified) {
      response.message = "Your account needs approval from admin.";
      return res.status(200).json(response);
    }

    // fallback
    response.success = false;
    response.message = "Invalid login state.";
    return res.status(401).json(response);
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
