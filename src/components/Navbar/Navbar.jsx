import "./Navbar.css";
import { FaMoon, FaBell, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <header className="navbar">

      <div className="logo">
        🎓 BMSCE DBMS Interactive Teaching Platform
      </div>

      <div className="nav-icons">
        <FaMoon />
        <FaBell />
        <FaUserCircle />
      </div>

    </header>
  );
}

export default Navbar;