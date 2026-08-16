import { useState } from "react";
import "./Signup.css";
import { API_BASE_URL } from "../../config";

function Signup({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSignup() {
    setError("");
    setSuccessMessage("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      setSuccessMessage("Account created successfully. Please login with your credentials.");

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onBackToLogin();
      }, 5000);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Unable to signup. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-title">
        <h1>Data Structures Visualizer</h1>
        <p>Create your staff account</p>
      </div>

      <div className="signup-card">
        <h2>Create Account</h2>

        {error && <p className="signup-error">{error}</p>}
        {successMessage && <p className="signup-success">{successMessage}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@bmsce.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || successMessage}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || successMessage}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || successMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSignup();
              }
            }}
          />
        </div>

        <button onClick={handleSignup} disabled={loading || successMessage}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="signup-note">
          Already have an account?{" "}
          <span onClick={onBackToLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;