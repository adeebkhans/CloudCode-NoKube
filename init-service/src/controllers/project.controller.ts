import { CustomRequest } from "../middlewares/isAuthenticated";
import { Response } from "express";
import { copyS3Folder } from "../aws";
import User from "../models/user.model";

export const createProject = async (req: CustomRequest, res: Response): Promise<Response> => {
    try {
        const { replId, language } = req.body;
        const username = req.username;

        // Ensure the required fields are present
        if (!username || !replId || !language) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false,
            });
        }

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Check if the replId already exists
        if (user.replIds.includes(replId)) {
            return res.status(200).json({
                message: `The replId "${replId}" already exists for this user`,
                success: true, // Treat this as a success to allow navigation
            });
        }

        // Attempt to copy project folder
        try {
            await copyS3Folder(`base/${language}`, `code/${username}/${replId}`);
        } catch (awsError: unknown) {
            const errorMessage =
                awsError instanceof Error ? awsError.message : "Unknown AWS error";

            return res.status(500).json({
                message: "Failed to copy S3 folder",
                success: false,
                error: errorMessage, // Provide detailed error info
            });
        }

        // Add the replId to the user's document
        user.replIds.push(replId);
        await user.save();

        // Return success only if all steps succeed
        return res.status(201).json({
            message: "Project created successfully",
            success: true,
        });
    } catch (error) {
        console.error("Error in createProject controller:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};
