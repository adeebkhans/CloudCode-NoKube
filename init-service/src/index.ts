import express, { urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser"
import projectRoutes from "./routes/project.routes"; // Import the project routes
import userRoutes from "./routes/user.routes"; // Import the user routes
import mongoose from "mongoose";

const app = express();

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://localhost:27017/CodeDate", {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const typedError = error as Error;
        console.error("Error:", typedError.message);
        process.exit(1);
    }
};

connectDB();

//middlewares
app.use(express.json()) // to convert json to javascript object on req.body
app.use(cookieParser()) // parse cookies as JavaScript object on req.cookies
app.use(urlencoded({ extended: true })) // his is typically used for parsing form data submitted via HTML forms with the application/x-www-form-urlencoded content type.


const corsOptions = {
    origin: 'http://localhost:5173', // or an array of origins: ['http://localhost:5173', 'http://anotherdomain.com']
    credentials: true, // Important: Allow sending cookies/authorization headers
  };
  
app.use(cors(corsOptions));
  
app.use(express.json());

// Use the project routes
app.use("/api/user", userRoutes);
app.use("/api", projectRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is listening at *:${port}`);
});
