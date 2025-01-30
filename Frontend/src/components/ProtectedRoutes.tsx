import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";

interface ProtectedRoutesProps {
  children: ReactNode; // Define children as a ReactNode type
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
  const { id } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if the user is not logged in
    if (!id) {
      navigate("/login");
    }
  }, [id, navigate]); // Add `id` to the dependency array to track changes

  return <>{children}</>;
};

export default ProtectedRoutes;
