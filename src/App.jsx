import { useEffect, useState } from "react";
import StaffLogin from "./components/StaffLogin/StaffLogin";
import Signup from "./components/Signup/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
  }

  function handleLogout() {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setAuthMode("login");
  }

  if (user) {
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
  }

  if (authMode === "signup") {
    return (
      <Signup onBackToLogin={() => setAuthMode("login")} />
    );
  }

  return (
    <StaffLogin
      onLogin={handleLogin}
      onShowSignup={() => setAuthMode("signup")}
    />
  );
}

export default App;