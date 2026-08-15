import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { joinGroupWithQRCode } from "../api/qrCodes.js";

function JoinGroup() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // 🟢 TEMPORARY current user
  // Jerusalem = user ID 3
  const CURRENT_USER_ID = 3;

  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleJoinGroup(event) {
    event.preventDefault();

    if (!code.trim()) {
      setError("Please enter a group code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 🟢 Sends BOTH the code and Jerusalem's user ID
      const group = await joinGroupWithQRCode(code.trim(), CURRENT_USER_ID);

      const groupId = group?.id ?? group?.group?.id ?? group?.groupId;

      if (groupId) {
        navigate(`/groups/${groupId}`);
      } else {
        setError(
          "You joined the group, but we could not determine the group ID.",
        );
      }
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to join group.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Join a Group</h1>

          <p>Enter a group code to join.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <section className="content-section">
        <form className="member-form" onSubmit={handleJoinGroup}>
          <input
            type="text"
            placeholder="Example: GROUP-2"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Joining..." : "Join Group"}
          </button>
        </form>
      </section>

      <Link to="/groups">← Back to Groups</Link>
    </main>
  );
}

export default JoinGroup;
