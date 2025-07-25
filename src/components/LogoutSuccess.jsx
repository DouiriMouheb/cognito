import { useEffect } from "react";

const LogoutSuccess = () => {
  useEffect(() => {
    // Immediately redirect to login page
    window.location.replace('/login');
  }, []);
  return null;
};

export default LogoutSuccess;
