import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email.");

      return;
    }

    if (!password) {
      setError("Please enter your password.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),

          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to log in.");
      }

      const user = result.data?.user;

      const token = result.data?.token;

      if (!user?.id) {
        throw new Error("Login succeeded, but no user was returned.");
      }

      // 🟢 SAVE LOGGED-IN USER
      localStorage.setItem("uome-user", JSON.stringify(user));

      if (token) {
        localStorage.setItem("uome-token", token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(err.message || "We couldn't log you in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">UOME</div>

        <div className="login-heading">
          <h1>Welcome back</h1>

          <p>Log in to manage your groups, expenses, and balances.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              onChange={(event) => {
                setEmail(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
              />

              <button
                type="button"
                className="show-password-button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="login-footer">
          <span>New to UOME?</span>

          <Link to="/register">Create an account</Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
