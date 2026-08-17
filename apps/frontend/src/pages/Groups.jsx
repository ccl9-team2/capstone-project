import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { getGroups } from "../api/groups.js";

import GroupCard from "../components/GroupCard.jsx";

function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);

        setError("");

        const currentUser = getLoggedInUser();

        if (!currentUser) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const data = await getGroups();

        const allGroups = Array.isArray(data) ? data : [];

        // 🟢 AUTHENTICATED USER
        // Only show groups the logged-in
        // user actually belongs to.
        const currentUserGroups = allGroups.filter((group) =>
          group.members?.some((member) => {
            const memberUserId = member.userId ?? member.user?.id;

            return Number(memberUserId) === Number(currentUser.id);
          }),
        );

        setGroups(currentUserGroups);
      } catch (err) {
        console.error(err);

        setError(err.message || "Unable to load your groups.");
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, [navigate]);

  if (loading) {
    return (
      <main className="page groups-page">
        <p>Loading your groups...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page groups-page">
        <div className="form-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="page groups-page">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="groups-header">
        <div>
          <h1>Your Groups</h1>

          <p>Keep track of the people, expenses, and balances you share.</p>
        </div>

        <Link to="/groups/new" className="button groups-create-button">
          + Create Group
        </Link>
      </div>

      {/* ========================= */}
      {/* GROUP COUNT */}
      {/* ========================= */}

      {groups.length > 0 && (
        <div className="groups-summary-row">
          <span>
            {groups.length} {groups.length === 1 ? "group" : "groups"}
          </span>
        </div>
      )}

      {/* ========================= */}
      {/* GROUP LIST */}
      {/* ========================= */}

      {groups.length === 0 ? (
        <div className="groups-empty-state">
          <div className="groups-empty-icon">+</div>

          <h2>No groups yet</h2>

          <p>
            Create your first group and start keeping shared expenses organized
            in UOME.
          </p>

          <Link to="/groups/new" className="button">
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="group-grid groups-grid">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </main>
  );
}

export default Groups;
