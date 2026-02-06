import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import RoleEnum from "../enums/RoleEnum.js";

const prisma = new PrismaClient();

/**
 * Middleware to verify if the authenticated user is a superadmin.
 * Fetches the user from the database using userId from token and checks the role.
 */
export const superadminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Authorization header is required",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get userId from token
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for role field from database
    if (user.role.name !== RoleEnum.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Superadmin access required.",
      });
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
  }
};
