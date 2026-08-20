import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function CreateGroup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  function getLoggedInUser() {
    try {
      const storedUser = localStorage.getItem("uome-user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        return null;
      }

      return user;
    } catch (err) {
      console.error("Unable to read logged-in user:", err);

      return null;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a group name.");

      return;
    }

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

      const response = await fetch(`${API_URL}/groups`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),

          // 🟢 AUTHENTICATED USER
          createdById: currentUser.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create group.");
      }

      const newGroup = result.data;

      navigate(`/groups/${newGroup.id}`);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to create group.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page create-group-page">
      <div className="create-group-header">
        <Link to="/groups" className="back-link create-group-back-link">
          ← Back to Groups
        </Link>

        <h1>Create a Group</h1>

        <p>
          Start a new group and keep everyone's shared expenses in one place.
        </p>
      </div>

      <section className="content-section create-group-card">
        <div className="create-group-card-header">
          <h2>Group Details</h2>

          <p>Give your group a name that everyone will recognize.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="create-group-field">
            <label htmlFor="groupName">Group name</label>

            <input
              id="groupName"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              placeholder="Example: Weekend Trip"
              disabled={loading}
              autoComplete="off"
            />

            <span className="create-group-hint">
              You can use a trip, event, household, or team name.
            </span>
          </div>

          <div className="create-group-note">
            <strong>What happens next?</strong>

            <p>
              You'll automatically be added as the first member. Then you can
              invite others and start adding expenses.
            </p>
          </div>

          <div className="create-group-actions">
            <Link to="/groups" className="secondary-button">
              Cancel
            </Link>

            <button type="submit" className="button" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateGroup;
