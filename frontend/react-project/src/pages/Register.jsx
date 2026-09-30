import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Loader2 } from "lucide-react";

import api from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {

    event.preventDefault();

    setLoading(true);
    setError("");

    try {

      const response = await api.post("/auth/register", {
        name,
        email,
        password
      });

      const token = response.data.token;

      if (!token) {
        throw new Error("Registration response did not contain a token");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", name);
      window.dispatchEvent(new Event("user_auth_changed"));

      navigate("/dashboard");

    } catch (err) {

      setError(
        err.response?.data ||
        err.message ||
        "Registration failed. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">

      <div className="auth-card">

        <div className="auth-logo">
          <BarChart3 size={32} />
          <h1>StockAnalytics</h1>
        </div>

        <h2>Create Account</h2>

        <p>
          Start analyzing the stock market
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>

          <label htmlFor="register-name">Full Name</label>

          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            required
          />

          <label htmlFor="register-email">Email</label>

          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create password"
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
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Register;
