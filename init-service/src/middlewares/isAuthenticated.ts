import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";

// Extend Request to include username
export interface CustomRequest extends Request {
    username?: string;
}

const isAuthenticated = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.token; // Safely access cookies and token
        if (!token) {
            res.status(401).json({
                message: "No token found",
                success: false,
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "") as { userId: string };
        if (!decoded || !decoded.userId) {
            res.status(401).json({
                message: "Invalid token",
                success: false,
            });
            return;
        }

        // Fetch the user from the database
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                message: "User not found",
                success: false,
            });
            return;
        }

        req.username = user.username; // Attach username to the request
        next(); // Call next middleware
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export default isAuthenticated;
