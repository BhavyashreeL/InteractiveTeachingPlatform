import "./Sidebar.css";
import {
  FaHome,
  FaDatabase,
  FaBook,
  FaCode,
  FaQuestionCircle,
  FaCog,
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="sidebar">

      <h2 className="menu-title">MENU</h2>

      <ul>

        <li><FaHome /> Dashboard</li>

        <li><FaBook /> Unit 1</li>

        <li><FaBook /> Unit 2</li>

        <li><FaBook /> Unit 3</li>

        <li><FaBook /> Unit 4</li>

        <li><FaBook /> Unit 5</li>

        <li><FaDatabase /> SQL Lab</li>

        <li><FaCode /> Practice</li>

        <li><FaQuestionCircle /> Quiz</li>

        <li><FaCog /> Settings</li>

      </ul>

    </aside>
  );
}

export default Sidebar;