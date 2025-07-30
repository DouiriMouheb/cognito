
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoadingScreen = ({ message = "Loading...", subtitle = "Please wait" }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/timesheets', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
