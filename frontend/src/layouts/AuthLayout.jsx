import { Outlet } from "react-router-dom";
import "../styles/auth.css";

const AuthLayout = () => {
  return (
    <div className="page">
      <Outlet />
    </div>
  );
};

export default AuthLayout;