import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
} from "../api/groupMembers.js";

import { getGroupQRCode } from "../api/qrCodes.js";

const API_URL = "http://localhost:3001/api";

function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // QR code state
  const [qrCode, setQrCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  async function loadGroup() {
    const response = await fetch(`${API_URL}/groups/${id}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load group.");
    }

    setGroup(result.data);
  }

  async function loadMembers() {
    const data = await getGroupMembers(id);

    setMembers(data);
  }

  async function loadUsers() {
    const response = await fetch(`${API_URL}/users`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load users.");
    }

    setUsers(result.data);
  }

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([loadGroup(), loadMembers(), loadUsers()]);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load group information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [id]);

  async function handleAddMember(event) {
    event.preventDefault();

    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      await addGroupMember(id, Number(selectedUserId));

      setSelectedUserId("");

      await loadMembers();
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to add member.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveMember(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await removeGroupMember(id, userId);

      await loadMembers();
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to remove member.");
    }
  }

  async function handleGenerateQRCode() {
    try {
      setQrLoading(true);
      setError("");

      const data = await getGroupQRCode(id);

      const code = data?.code ?? data?.qrCode ?? data;

      if (!code) {
        throw new Error("The server did not return a QR code.");
      }

      setQrCode(code);
      setShowQRCode(true);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to generate QR code.");
    } finally {
      setQrLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p>Loading group...</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="page">
        <h1>Group not found</h1>

        <Link to="/groups">Back to Groups</Link>
      </main>
    );
  }

  const memberIds = new Set(
    members.map((member) =>
      Number(member.userId ?? member.user?.id ?? member.id),
    ),
  );

  const availableUsers = users.filter(
    (user) => !memberIds.has(Number(user.id)),
  );

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link to="/groups">← Back to Groups</Link>

          <h1>{group.name}</h1>

          <p>Manage your group members and expenses.</p>

          <Link to={`/groups/${id}/expenses/new`} className="button">
            Add Expense
          </Link>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* MEMBERS */}
      <section className="content-section">
        <h2>Members ({members.length})</h2>

        {members.length === 0 ? (
          <div className="empty-state">
            <p>There are no members in this group yet.</p>
          </div>
        ) : (
          <div className="member-list">
            {members.map((member) => {
              const user = member.user ?? member;

              const userId = member.userId ?? user.id;

              return (
                <div className="member-card" key={userId}>
                  <div className="member-info">
                    <strong>{user.name ?? "Unknown User"}</strong>

                    <span>{user.email ?? ""}</span>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => handleRemoveMember(userId)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ADD MEMBER */}
      <section className="content-section">
        <h2>Add Member</h2>

        {availableUsers.length === 0 ? (
          <p>There are no additional users available to add.</p>
        ) : (
          <form className="member-form" onSubmit={handleAddMember}>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              <option value="">Select a user</option>

              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>

            <button type="submit" className="button" disabled={adding}>
              {adding ? "Adding..." : "Add Member"}
            </button>
          </form>
        )}
      </section>

      {/* QR CODE */}
      <section className="content-section">
        <h2>Invite Members</h2>

        <p>Generate a QR code that other users can scan to join this group.</p>

        <button
          className="button"
          onClick={handleGenerateQRCode}
          disabled={qrLoading}
        >
          {qrLoading ? "Generating..." : "Generate QR Code"}
        </button>

        {showQRCode && qrCode && (
          <div className="qr-section">
            <div className="qr-code-container">
              <QRCodeSVG value={qrCode} size={220} level="M" />
            </div>

            <p className="qr-code-text">
              Scan this code to join <strong>{group.name}</strong>.
            </p>

            <p className="qr-code-value">Code: {qrCode}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default GroupDetails;
