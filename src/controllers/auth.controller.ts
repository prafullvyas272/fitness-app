import { registerUser, loginUser } from "../services/auth.service.js";

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
