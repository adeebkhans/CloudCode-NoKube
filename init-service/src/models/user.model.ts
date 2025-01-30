import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    createdAt: Date;
    replIds: string[]; // Array to store the user's project IDs
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replIds: { type: [String], default: [] }, // Store the project IDs
}, { timestamps: true });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
