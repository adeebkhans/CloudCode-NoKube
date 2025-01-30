import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Define the type for the input state
interface InputState {
    username: string;
    email: string;
    password: string;
}

// Define the type for the API response
interface ApiResponse {
    success: boolean;
    message: string;
}

export const Signup: React.FC = () => {
    const [input, setInput] = useState<InputState>({
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { id } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (id) {
            navigate("/");
        }
    }, [])

    const SignupHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post<ApiResponse>(
                "http://localhost:3001/api/user/register",
                input,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, // Allows sending cookies/credentials
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
                setInput({
                    username: "",
                    email: "",
                    password: "",
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;

            if (axiosError.response) {
                // Display error message from server
                toast.error(axiosError.response.data.message || "Something went wrong");
            } else {
                // Handle network or unknown errors
                toast.error("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gray-900 text-gray-100 min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-center bg-gray-800 w-full py-4 shadow-md">
                <h1 className="text-2xl font-bold tracking-wide">Cloud Code Signup</h1>
            </header>

            {/* Signup Form */}
            <main className="flex flex-col items-center w-full max-w-lg p-8 mt-12 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-center">
                    Create an Account
                </h2>

                <form className="w-full" onSubmit={SignupHandler}>
                    {/* Username Input */}
                    <div className="w-full mb-4">
                        <label htmlFor="username" className="block text-sm mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={input.username}
                            onChange={(e) =>
                                setInput({ ...input, username: e.target.value })
                            }
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="w-full mb-4">
                        <label htmlFor="email" className="block text-sm mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={input.email}
                            onChange={(e) => setInput({ ...input, email: e.target.value })}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="w-full mb-6">
                        <label htmlFor="password" className="block text-sm mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={input.password}
                            onChange={(e) => setInput({ ...input, password: e.target.value })}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-3 text-lg font-semibold text-white rounded-md ${loading
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 transition duration-200"
                            }`}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>
            </main>

            {/* Footer */}
            <footer className="mt-auto bg-gray-800 w-full py-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <span
                    className="text-blue-400 cursor-pointer"
                    onClick={() => navigate("/login")}
                >
                    Login
                </span>
            </footer>
        </div>
    );
};
