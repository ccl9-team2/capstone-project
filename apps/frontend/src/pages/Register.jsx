import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");

      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");

      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),

          email: email.trim().toLowerCase(),

          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create account.");
      }

      const user = result.data?.user;

      const token = result.data?.token;

      if (!user?.id) {
        throw new Error("Account created, but no user was returned.");
      }

      /*
       * 🟢 AUTO-LOGIN AFTER
       * REGISTRATION
       */
      localStorage.setItem("uome-user", JSON.stringify(user));

      if (token) {
        localStorage.setItem("uome-token", token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(err.message || "We couldn't create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card register-card">
        <div className="login-brand">UOME</div>

        <div className="login-heading">
          <h1>Create your account</h1>

          <p>Join UOME and start keeping shared expenses simple.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              type="text"
              value={name}
              placeholder="Your name"
              autoComplete="name"
              disabled={loading}
              onChange={(event) => {
                setName(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="login-field">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
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
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              type="password"
              value={password}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              disabled={loading}
              onChange={(event) => {
                setPassword(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirm-password">Confirm password</label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              placeholder="Enter password again"
              autoComplete="new-password"
              disabled={loading}
              onChange={(event) => {
                setConfirmPassword(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <button
            type="submit"
            className="button login-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="login-footer">
          <span>Already have an account?</span>

          <Link to="/login">Log in</Link>
        </div>
      </section>
    </main>
  );
}

export default Register;
