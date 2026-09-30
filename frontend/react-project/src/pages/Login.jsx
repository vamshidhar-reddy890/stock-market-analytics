import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Loader2 } from "lucide-react";

import api from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {

    event.preventDefault();

    setLoading(true);
    setError("");

    try {

      const response = await api.post("/auth/login", {
        email,
        password
      });

      const token = response.data.token;
      let userName = response.data.name;

      if (!userName && email) {
        const raw = email.split("@")[0].replace(/[0-9._-]+/g, " ").trim();
        userName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "User";
      }

      if (!token) {
        throw new Error("Login response did not contain a token");
      }

      localStorage.setItem("authToken", token);
      if (userName) {
        localStorage.setItem("userName", userName);
      }
      window.dispatchEvent(new Event("user_auth_changed"));

      navigate("/dashboard");

    } catch (err) {

      setError(
        err.response?.data ||
        err.message ||
        "Login failed. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">

      <div className="auth-card">

        <div className="auth-logo">
          <BarChart3 size={32} />
          <h1>StockAnalytics</h1>
        </div>

        <h2>Welcome Back</h2>

        <p>
          Login to your analytics dashboard
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="spinner"
                />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/register">
            Create Account
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Login;
