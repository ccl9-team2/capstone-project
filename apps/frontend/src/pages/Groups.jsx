import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getGroups } from "../api/groups.js";
import GroupCard from "../components/GroupCard.jsx";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        setError("");

        const data = await getGroups();

        setGroups(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load groups.");
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  if (loading) {
    return (
      <main className="page">
        <p>Loading groups...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <p className="error-message">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Groups</h1>

          <p>
            Your expense-splitting groups.
          </p>
        </div>

        <Link
          to="/groups/new"
          className="button"
        >
          Create Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <h2>No groups yet</h2>

          <p>
            Create your first group to start
            splitting expenses.
          </p>

          <Link
            to="/groups/new"
            className="button"
          >
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="group-grid">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default Groups;