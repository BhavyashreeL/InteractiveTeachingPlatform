import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Home from "./pages/Home/Home.jsx";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <div className="app-container">
        <Sidebar />

        <div className="main-content">
          <Home />
        </div>
      </div>
    </>
  );
}

export default App;