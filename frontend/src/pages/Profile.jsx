import { FaUserCircle } from "react-icons/fa";
import "../styles/pages.css";

const Profile = () => {
  return (
    <div className="page">
      <h1 className="page-title">Profile</h1>
      <div className="underline"></div>

      <div className="auth-card" style={{ textAlign: "center" }}>
        <FaUserCircle style={{ fontSize: "90px", color: "#ff7b00" }} />
        <h2>GitHub User</h2>
        <p>Profile data will show after GitHub OAuth integration.</p>
      </div>
    </div>
  );
};

export default Profile;