import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getUserBalances } from "../api/users.js";
import { getNotifications } from "../api/notifications.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function Dashboard() {
  const navigate = useNavigate();

  // =========================
  // 🟢 AUTHENTICATED USER
  // =========================

  const [currentUser, setCurrentUser] = useState(null);

  const [balances, setBalances] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // 🟢 GET LOGGED-IN USER
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

  // =========================
  // GET CURRENT USER GROUPS
  // =========================

  async function getCurrentUserGroups(userId) {
    const response = await fetch(`${API_URL}/groups`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "We couldn't load your groups.");
    }

    const allGroups = result.data ?? [];

    return allGroups.filter((group) =>
      group.members?.some((member) => {
        const memberUserId = member.userId ?? member.user?.id;

        return Number(memberUserId) === Number(userId);
      }),
    );
  }

  // =========================
  // GREETING
  // =========================

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  }

  // =========================
  // LOAD DASHBOARD
  // =========================

  async function loadDashboard() {
    try {
      setLoading(true);

      setError("");

      // 🟢 Get user from login session
      const user = getLoggedInUser();

      if (!user) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setCurrentUser(user);

      const [balanceData, notificationData, groupData] = await Promise.all([
        getUserBalances(user.id),

        getNotifications(user.id),

        getCurrentUserGroups(user.id),
      ]);

      setBalances(balanceData);

      setNotifications(Array.isArray(notificationData) ? notificationData : []);

      setGroups(groupData);
    } catch (err) {
      console.error(err);

      setError(err.message || "We couldn't load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="page dashboard-page">
        <h1>Dashboard</h1>

        <p>Loading your dashboard...</p>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="page dashboard-page">
        <h1>Dashboard</h1>

        <div className="form-error">{error}</div>

        <button className="button" onClick={loadDashboard}>
          Try Again
        </button>
      </main>
    );
  }

  // =========================
  // DASHBOARD DATA
  // =========================

  const totalOwed = Number(balances?.totalYouOwe ?? 0);

  const moneyOwedToYou = Number(balances?.totalYouAreOwed ?? 0);

  const netBalance = moneyOwedToYou - totalOwed;

  const youOwe = balances?.youOwe ?? [];

  const owedToYou = balances?.owedToYou ?? [];

  const recentActivity = notifications.slice(0, 5);

  const greeting = getGreeting();

  const userName = currentUser?.name ?? "there";

  // =========================
  // PAGE
  // =========================

  return (
    <main className="page dashboard-page">
      {/* ========================= */}
      {/* USER GREETING */}
      {/* ========================= */}

      <div className="page-header dashboard-header">
        <div>
          <h1>
            {greeting}, {userName}! 👋
          </h1>

          <p>Here's a quick look at where things stand.</p>
        </div>
      </div>

      {/* ========================= */}
      {/* MONEY OVERVIEW */}
      {/* ========================= */}

      <section className="stats-grid dashboard-stats">
        <div className="stat-card dashboard-stat-card">
          <span className="stat-label">You Owe</span>

          <strong className="stat-value">${totalOwed.toFixed(2)}</strong>

          <span className="stat-support">
            Across {youOwe.length}{" "}
            {youOwe.length === 1 ? "expense" : "expenses"}
          </span>
        </div>

        <div className="stat-card dashboard-stat-card">
          <span className="stat-label">Owed to You</span>

          <strong className="stat-value">${moneyOwedToYou.toFixed(2)}</strong>

          <span className="stat-support">
            Across {owedToYou.length}{" "}
            {owedToYou.length === 1 ? "expense" : "expenses"}
          </span>
        </div>

        <div className="stat-card dashboard-stat-card">
          <span className="stat-label">Overall Balance</span>

          <strong
            className={`stat-value ${
              netBalance > 0
                ? "dashboard-positive"
                : netBalance < 0
                  ? "dashboard-negative"
                  : ""
            }`}
          >
            {netBalance > 0 ? "+" : ""}${netBalance.toFixed(2)}
          </strong>

          <span className="stat-support">
            {netBalance > 0
              ? `You're owed $${netBalance.toFixed(2)} more than you owe.`
              : netBalance < 0
                ? `You owe $${Math.abs(netBalance).toFixed(
                    2,
                  )} more than you're owed.`
                : "You're all even."}
          </span>
        </div>
      </section>

      {/* ========================= */}
      {/* BALANCES + ACTIVITY */}
      {/* ========================= */}

      <div className="dashboard-main-grid">
        {/* ========================= */}
        {/* WHO OWES WHAT */}
        {/* ========================= */}

        <section className="content-section dashboard-panel">
          <div className="section-header dashboard-section-header">
            <div>
              <h2>Who Owes What</h2>

              <p>See what you owe and what others owe you.</p>
            </div>
          </div>

          {youOwe.length === 0 && owedToYou.length === 0 ? (
            <div className="empty-state">
              <p>Everything is settled up.</p>
            </div>
          ) : (
            <div className="balance-list dashboard-balance-list">
              {/* ========================= */}
              {/* MONEY OWED TO USER */}
              {/* ========================= */}

              {owedToYou.map((balance) => (
                <div
                  className="balance-card dashboard-balance-card"
                  key={`owed-${balance.splitId}`}
                >
                  <div className="dashboard-balance-copy">
                    <strong>
                      {balance.owedBy?.name ?? "Unknown User"} owes you $
                      {Number(balance.amount).toFixed(2)}
                    </strong>

                    <p>{balance.description}</p>
                  </div>

                  <div className="balance-actions dashboard-balance-actions">
                    <Link
                      to={`/expenses/${balance.expenseId}`}
                      className="small-button"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}

              {/* ========================= */}
              {/* MONEY USER OWES */}
              {/* ========================= */}

              {youOwe.map((balance) => (
                <div
                  className="balance-card dashboard-balance-card"
                  key={`owe-${balance.splitId}`}
                >
                  <div className="dashboard-balance-copy">
                    <strong>
                      You owe {balance.owedTo?.name ?? "Unknown User"} $
                      {Number(balance.amount).toFixed(2)}
                    </strong>

                    <p>{balance.description}</p>
                  </div>

                  <div className="balance-actions dashboard-balance-actions">
                    <Link
                      to={`/expenses/${balance.expenseId}`}
                      className="secondary-button dashboard-view-link"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================= */}
        {/* WHAT'S NEW */}
        {/* ========================= */}

        <section className="content-section dashboard-panel">
          <div className="section-header dashboard-section-header">
            <div>
              <h2>What's New</h2>

              <p>Recent payments, expenses, and requests.</p>
            </div>

            <Link to="/notifications" className="secondary-button">
              See All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>Nothing new yet.</p>
            </div>
          ) : (
            <div className="activity-list dashboard-activity-list">
              {recentActivity.map((notification) => (
                <div
                  className="activity-card dashboard-activity-card"
                  key={notification.id}
                >
                  <div>
                    <strong>{notification.message}</strong>

                    {notification.createdAt && (
                      <p>{new Date(notification.createdAt).toLocaleString()}</p>
                    )}
                  </div>

                  {!notification.isRead && (
                    <span className="activity-status">New</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ========================= */}
      {/* YOUR GROUPS */}
      {/* ========================= */}

      <section className="content-section dashboard-panel dashboard-groups-panel">
        <div className="section-header dashboard-section-header">
          <div>
            <h2>Your Groups</h2>

            <p>Pick up where you left off.</p>
          </div>

          <Link to="/groups" className="secondary-button">
            See All
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="empty-state">
            <p>You haven't joined any groups yet.</p>
          </div>
        ) : (
          <div className="group-list dashboard-group-list">
            {groups.map((group) => (
              <div className="dashboard-group-row" key={group.id}>
                <div>
                  <strong>{group.name}</strong>

                  <p>
                    {group.members?.length ?? 0}{" "}
                    {(group.members?.length ?? 0) === 1 ? "member" : "members"}
                  </p>
                </div>

                <Link
                  to={`/groups/${group.id}`}
                  className="secondary-button dashboard-group-button"
                >
                  View Group
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
