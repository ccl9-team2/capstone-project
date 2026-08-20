import { useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { joinGroupWithQRCode } from "../api/qrCodes.js";

function JoinGroup() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // 🟢 AUTHENTICATED USER
  // =========================

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

  async function handleJoinGroup(event) {
    event.preventDefault();

    if (!code.trim()) {
      setError("Please enter a group code.");

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

      // The backend identifies the joining user from the JWT.
      const group = await joinGroupWithQRCode(code.trim());

      const groupId = group?.id ?? group?.group?.id ?? group?.groupId;

      if (groupId) {
        navigate(`/groups/${groupId}`);
      } else {
        setError(
          "You joined the group, but we couldn't determine which group to open.",
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "We couldn't join that group. Please check the code and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page join-group-page">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="join-group-header">
        <Link to="/groups" className="back-link join-group-back-link">
          ← Back to Groups
        </Link>

        <h1>Join a Group</h1>

        <p>Have a group code? Enter it below and we'll take you there.</p>
      </div>

      {/* ========================= */}
      {/* JOIN CARD */}
      {/* ========================= */}

      <section className="content-section join-group-card">
        <div className="join-group-card-header">
          <h2>Enter Group Code</h2>

          <p>
            Group codes usually look something like <strong>GROUP-2</strong>.
          </p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="join-group-form" onSubmit={handleJoinGroup}>
          <div className="join-group-field">
            <label htmlFor="group-code">Group code</label>

            <input
              id="group-code"
              type="text"
              placeholder="Example: GROUP-2"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="button join-group-button"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Group"}
          </button>
        </form>

        <div className="join-group-help">
          <strong>Don't have a code?</strong>

          <p>
            Ask a member of the group to send you their UOME group code or QR
            code.
          </p>
        </div>
      </section>
    </main>
  );
}

export default JoinGroup;
