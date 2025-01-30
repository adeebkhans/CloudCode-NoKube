import jwt, { JwtPayload } from "jsonwebtoken";

const isTokenValid = async (token: string): Promise<JwtPayload | string | null> => {
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "");
        return decoded;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Token verification failed:", error.message);
        } else {
            console.error("Unknown error during token verification");
        }
        return null; // Return null for invalid or expired tokens
    }
};

export default isTokenValid;
