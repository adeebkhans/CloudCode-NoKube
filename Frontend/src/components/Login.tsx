import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

// Define the type for the input state
interface InputState {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [input, setInput] = useState<InputState>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const LoginHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/api/user/login", // Change to your login endpoint
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Login successful!");
        dispatch(setUser({ id: res.data.user._id, username: res.data.user.username, email: res.data.user.email }));
        navigate("/"); // Redirect to the home page
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(axiosError);

      if (axiosError.response) {
        toast.error(axiosError.response.data.message || "Invalid credentials.");
      } else {
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
        <h1 className="text-2xl font-bold tracking-wide">Cloud Code Login</h1>
      </header>

      {/* Login Form */}
      <main className="flex flex-col items-center w-full max-w-lg p-8 mt-12 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-center">Login to Your Account</h2>

        <form className="w-full" onSubmit={LoginHandler}>
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 text-lg font-semibold text-white rounded-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transition duration-200"
            }`}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-gray-800 w-full py-4 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <span
          className="text-blue-400 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </footer>
    </div>
  );
};
