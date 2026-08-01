import { useState } from "react";
import "./StaffLogin.css";
import { API_BASE_URL } from "./config";

function StaffLogin({ onLogin, onShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid login.");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to login. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-title">
        <h1>Data Structures Visualizer</h1>
        <p>Sign in with your BMSCE email</p>
      </div>

      <div className="staff-login">
        <h2>Sign in</h2>

        {error && <p className="login-error">{error}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@bmsce.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
        </div>

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="login-note">
          Only <strong>@bmsce.ac.in</strong> addresses can access this app.
        </p>

        <p className="signup-link">
          New user? <span onClick={onShowSignup}>Create account</span>
        </p>
      </div>
    </div>
  );
}

export default StaffLogin;