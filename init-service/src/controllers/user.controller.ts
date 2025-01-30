import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// TypeScript interface for the request body
interface IRegisterRequestBody {
    username: string;
    email: string;
    password: string;
}

interface ILoginRequestBody {
    email: string;
    password: string;
}

export const register = async (req: Request<{}, {}, IRegisterRequestBody>, res: Response): Promise<Response> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }

        const userExists = await User.findOne({ email, username });
        if (userExists) {
            return res.status(400).json({
                message: "Try a different email/username",
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error, please try again later.",
            success: false,
        });
    }
};

export const login = async (req: Request<{}, {}, ILoginRequestBody>, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password || "");
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY || "", { expiresIn: '1d' });

        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
        };

        return res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user: userResponse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error, please try again later.",
            success: false,
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Clear the cookie by setting the expiration date in the past
        res.clearCookie("token", { httpOnly: true, sameSite: 'strict' });

        return res.status(200).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error, please try again later.",
            success: false,
        });
    }
};
