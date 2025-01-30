import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./components/Landing";
import { Signup } from "./components/Signup";
import { Login } from "./components/Login";
import { CodingPage } from "./components/CodingPage";
import ProtectedRoutes from "./components/ProtectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoutes><Landing /></ProtectedRoutes>} />
        <Route
          path="/coding"
          element={
            <ProtectedRoutes>
              <CodingPage />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
