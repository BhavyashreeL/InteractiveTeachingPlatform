import "./Navbar.css";
import { FaBell, FaUserCircle, FaMoon } from "react-icons/fa";

function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <span className="logo">🎓</span>
        <span>BMSCE DBMS Interactive Teaching Platform</span>
      </div>

      <div className="navbar-actions">
        <FaMoon />
        <FaBell />
        <FaUserCircle title={user?.fullName} />

        <button onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Navbar;