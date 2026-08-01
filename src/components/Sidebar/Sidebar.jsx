import "./Sidebar.css";
import {
  FaHome,
  FaDatabase,
  FaBook,
  FaCode,
  FaQuestionCircle,
  FaCog,
} from "react-icons/fa";

function Sidebar({ selectedMenu, onMenuClick }) {
  const menuItems = [
    { label: "Dashboard", icon: <FaHome /> },
    { label: "Unit 1", icon: <FaBook /> },
    { label: "Unit 2", icon: <FaBook /> },
    { label: "Unit 3", icon: <FaBook /> },
    { label: "Unit 4", icon: <FaBook /> },
    { label: "Unit 5", icon: <FaBook /> },
    { label: "SQL Lab", icon: <FaDatabase /> },
    { label: "Practice", icon: <FaCode /> },
    { label: "Quiz", icon: <FaQuestionCircle /> },
    { label: "Settings", icon: <FaCog /> },
  ];

  return (
    <aside className="sidebar">
      <h2 className="menu-title">MENU</h2>

      <ul>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={selectedMenu === item.label ? "active" : ""}
            onClick={() => onMenuClick(item.label)}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;