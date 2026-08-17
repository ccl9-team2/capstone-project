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

      await Promise.all([loadMembers(), loadGroup()]);
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

      await Promise.all([loadMembers(), loadGroup()]);
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
      <main className="page group-dashboard-page">
        <p>Loading group...</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="page group-dashboard-page">
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

  const expenses = Array.isArray(group.expenses) ? group.expenses : [];

  const expenseTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount ?? 0),
    0,
  );

  const recentExpenses = [...expenses]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <main className="page group-dashboard-page">
      {/* 🟢 DASHBOARD-STYLE GROUP HEADER */}
      <div className="group-dashboard-header">
        <div>
          <Link to="/groups" className="group-back-link">
            ← Back to Groups
          </Link>

          <h1>{group.name}</h1>

          <p>Here's a quick look at what's happening in this group.</p>
        </div>

        <Link to={`/groups/${id}/expenses/new`} className="button">
          + Add Expense
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* 🟢 THREE SUMMARY CARDS */}
      <section className="stats-grid group-dashboard-stats">
        <div className="stat-card group-dashboard-stat-card">
          <span className="stat-label">Members</span>

          <strong className="stat-value">{members.length}</strong>

          <span className="stat-support">People sharing this group</span>
        </div>

        <div className="stat-card group-dashboard-stat-card">
          <span className="stat-label">Expenses</span>

          <strong className="stat-value">{expenses.length}</strong>

          <span className="stat-support">Shared expenses recorded</span>
        </div>

        <div className="stat-card group-dashboard-stat-card">
          <span className="stat-label">Group Total</span>

          <strong className="stat-value">${expenseTotal.toFixed(2)}</strong>

          <span className="stat-support">Total expenses in this group</span>
        </div>
      </section>

      {/* 🟢 DASHBOARD-STYLE TWO COLUMN AREA */}
      <div className="group-dashboard-main-grid">
        {/* RECENT EXPENSES */}
        <section className="content-section group-dashboard-panel">
          <div className="group-dashboard-section-header">
            <div>
              <h2>Recent Expenses</h2>

              <p>The latest shared costs in this group.</p>
            </div>

            <Link
              to={`/groups/${id}/expenses/new`}
              className="secondary-button"
            >
              Add Expense
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="group-dashboard-empty">No expenses yet.</div>
          ) : (
            <div className="group-dashboard-list">
              {recentExpenses.map((expense) => (
                <div className="group-dashboard-row" key={expense.id}>
                  <div>
                    <strong>{expense.description}</strong>

                    <p>${Number(expense.amount).toFixed(2)}</p>
                  </div>

                  <Link
                    to={`/expenses/${expense.id}`}
                    className="secondary-button"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MEMBERS */}
        <section className="content-section group-dashboard-panel">
          <div className="group-dashboard-section-header">
            <div>
              <h2>Members</h2>

              <p>Everyone sharing expenses here.</p>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="group-dashboard-empty">No members yet.</div>
          ) : (
            <div className="group-dashboard-list">
              {members.map((member) => {
                const user = member.user ?? member;

                const userId = member.userId ?? user.id;

                return (
                  <div className="group-dashboard-row member-row" key={userId}>
                    <div>
                      <strong>{user.name ?? "Unknown User"}</strong>

                      <p>{user.email ?? ""}</p>
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

          <div className="group-dashboard-add-member">
            <h3>Add Someone</h3>

            {availableUsers.length === 0 ? (
              <p className="group-muted-text">
                Everyone is already in this group.
              </p>
            ) : (
              <form
                className="member-form group-dashboard-member-form"
                onSubmit={handleAddMember}
              >
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
                  {adding ? "Adding..." : "Add"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* 🟢 INVITE PANEL */}
      <section className="content-section group-dashboard-panel group-dashboard-invite">
        <div className="group-dashboard-section-header">
          <div>
            <h2>Invite People</h2>

            <p>Let someone join this group using a QR code.</p>
          </div>

          <button
            className="button"
            onClick={handleGenerateQRCode}
            disabled={qrLoading}
          >
            {qrLoading ? "Generating..." : "Generate QR Code"}
          </button>
        </div>

        {showQRCode && qrCode && (
          <div className="qr-section group-dashboard-qr">
            <div className="qr-code-container">
              <QRCodeSVG value={qrCode} size={200} level="M" />
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
