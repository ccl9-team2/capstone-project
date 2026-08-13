import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getStats } from "../api/stats.js";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      const data = await getStats();

      setStats(data);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <main className="page">
        <h1>Dashboard</h1>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <h1>Dashboard</h1>

        <div className="form-error">{error}</div>

        <button className="button" onClick={loadStats}>
          Try Again
        </button>
      </main>
    );
  }

  /*
   * These fallbacks make the dashboard tolerant
   * of slightly different property names from
   * the backend.
   */
  const totalExpenses = stats?.totalExpenses ?? stats?.totalExpenseAmount ?? 0;

  const totalOwed = stats?.totalOwed ?? stats?.amountOwed ?? 0;

  const totalPaid = stats?.totalPaid ?? stats?.amountPaid ?? 0;

  const moneyOwedToYou = stats?.moneyOwedToYou ?? stats?.totalReceivable ?? 0;

  const groups = stats?.groups ?? stats?.groupCount ?? 0;

  const friends = stats?.friends ?? stats?.friendCount ?? 0;

  const unsettledExpenses =
    stats?.unsettledExpenses ?? stats?.unsettledCount ?? 0;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>Here's an overview of your expenses and balances.</p>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Expenses</span>

          <strong className="stat-value">
            ${Number(totalExpenses).toFixed(2)}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">You Owe</span>

          <strong className="stat-value">
            ${Number(totalOwed).toFixed(2)}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">You've Paid</span>

          <strong className="stat-value">
            ${Number(totalPaid).toFixed(2)}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">You're Owed</span>

          <strong className="stat-value">
            ${Number(moneyOwedToYou).toFixed(2)}
          </strong>
        </div>
      </section>

      <section className="stats-grid secondary-stats">
        <div className="stat-card">
          <span className="stat-label">Groups</span>

          <strong className="stat-value">{groups}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Friends</span>

          <strong className="stat-value">{friends}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Unsettled Expenses</span>

          <strong className="stat-value">{unsettledExpenses}</strong>
        </div>
      </section>

      <section className="dashboard-actions">
        <Link to="/groups" className="button">
          View Groups
        </Link>

        <Link to="/friends" className="secondary-button">
          View Friends
        </Link>

        <Link to="/join-group" className="secondary-button">
          Join a Group
        </Link>
      </section>
    </main>
  );
}

export default Dashboard;
