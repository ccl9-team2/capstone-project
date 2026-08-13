import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

function CreateGroup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            createdById: 1
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create group."
        );
      }

      // Navigate to the newly created group
      const newGroup = result.data;

      navigate(`/groups/${newGroup.id}`);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create group."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Create a Group</h1>

          <p>
            Create a new group to start
            splitting expenses.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="form"
      >
        <div className="form-group">
          <label htmlFor="groupName">
            Group Name
          </label>

          <input
            id="groupName"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Capstone Team"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/groups")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Group"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreateGroup;