import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/userSlice"; // Import the clearUser action

/** Constants */
const SLUG_WORKS = ["car", "dog", "computer", "person", "inside", "word", "for", "please", "to", "cool", "open", "source"];
const INIT_SERVICE_URL = "http://localhost:3001";


/** Helper function */
function getRandomSlug() {
    let slug = "";
    for (let i = 0; i < 3; i++) {
        slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
    }
    return slug;
}

/** Component */
export const Landing = () => {
    const [language, setLanguage] = useState("node");
    const [replId, setReplId] = useState(getRandomSlug());
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Get dispatch from Redux

    // Configure axios to include cookies with requests
    axios.defaults.withCredentials = true;

    // Logout handler
    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:3001/api/user/logout"); // Call the logout API to clear the token
            dispatch(clearUser()); // Dispatch the clearUser action to clear user data from Redux
            navigate("/login"); // Redirect to login page after logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gray-900 text-gray-100 min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between bg-gray-800 w-full py-4 px-6 shadow-md">
                <h1 className="text-2xl font-bold tracking-wide">Cloud Code</h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                >
                    Logout
                </button>
            </header>

            {/* Main Content */}
            <main className="flex flex-col items-center w-full max-w-lg p-8 mt-12 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-center">
                    Kickstart Your Coding Session
                </h2>

                {/* Repl ID Input */}
                <div className="w-full mb-4">
                    <label htmlFor="replId" className="block text-sm mb-2">
                        Repl ID
                    </label>
                    <input
                        id="replId"
                        type="text"
                        placeholder="Enter or generate a Repl ID"
                        value={replId}
                        onChange={(e) => setReplId(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Language Selection */}
                <div className="w-full mb-6">
                    <label htmlFor="language" className="block text-sm mb-2">
                        Select Language
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="node">Node.js</option>
                        <option value="python">Python</option>
                    </select>
                </div>

                {/* Start Coding Button */}
                <button
                    disabled={loading}
                    onClick={async () => {
                        setLoading(true);
                        await axios.post(`${INIT_SERVICE_URL}/api/project`, { replId, language });
                        setLoading(false);
                        navigate(`/coding/?replId=${replId}`);
                    }}
                    className={`w-full p-3 text-lg font-semibold text-white rounded-md ${loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 transition duration-200"
                        }`}
                >
                    {loading ? "Starting..." : "Start Coding"}
                </button>
            </main>

            {/* Footer */}
            <footer className="mt-auto bg-gray-800 w-full py-4 text-center text-sm text-gray-500">
                © 2025 Cloud Code. All rights reserved.
            </footer>
        </div>
    );
};
