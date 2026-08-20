import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getUserById, updateUser } from "../api/users.js";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  function getLoggedInUser() {
    try {
      const storedUser = localStorage.getItem("uome-user");

      if (!storedUser) {
        return null;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser?.id) {
        return null;
      }

      return parsedUser;
    } catch (err) {
      console.error("Unable to read logged-in user:", err);

      return null;
    }
  }

  async function loadProfile() {
    const currentUser = getLoggedInUser();

    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const profile = await getUserById(currentUser.id);

      setUser(profile);

      setName(profile.name || "");

      setEmail(profile.email || "");
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Please enter your name.");

      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");

      return;
    }

    try {
      setSaving(true);

      const updatedUser = await updateUser(user.id, {
        name: name.trim(),

        email: email.trim().toLowerCase(),
      });

      setUser(updatedUser);

      setName(updatedUser.name);

      setEmail(updatedUser.email);

      // 🟢 Keep the locally stored
      // logged-in user synchronized.
      localStorage.setItem("uome-user", JSON.stringify(updatedUser));

      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page">
        <h1>Profile</h1>

        <div className="form-error">{error || "Unable to load profile."}</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>

          <p>View and update your UOME account information.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {successMessage && <div className="form-success">{successMessage}</div>}

      <section className="profile-card">
        <div className="profile-summary">
          <h2>{user.name}</h2>

          <p>{user.email}</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name">Name</label>

            <input
              id="profile-name"
              type="text"
              value={name}
              disabled={saving}
              onChange={(event) => {
                setName(event.target.value);

                if (error) {
                  setError("");
                }

                if (successMessage) {
                  setSuccessMessage("");
                }
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email</label>

            <input
              id="profile-email"
              type="email"
              value={email}
              disabled={saving}
              onChange={(event) => {
                setEmail(event.target.value);

                if (error) {
                  setError("");
                }

                if (successMessage) {
                  setSuccessMessage("");
                }
              }}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="button" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Profile;
