import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGroupById } from "../api/groups.js";
import ExpenseForm from "../components/ExpenseForm.jsx";
import GroupBalances from "../components/GroupBalances.jsx";

function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGroup() {
    try {
      setLoading(true);

      const data = await getGroupById(id);

      setGroup(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load this group.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroup();
  }, [id]);

  function handleExpenseCreated() {
    setShowExpenseForm(false);

    // Reload the group so the new expense
    // immediately appears on the page.
    loadGroup();
  }

  if (loading) {
    return (
      <main className="page">
        <p>Loading group...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <p className="error-message">{error}</p>

        <Link to="/groups" className="button">
          Back to Groups
        </Link>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="page">
        <p>Group not found.</p>

        <Link to="/groups" className="button">
          Back to Groups
        </Link>
      </main>
    );
  }

  const members = group.members ?? [];
  const expenses = group.expenses ?? [];

  const totalSpent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  return (
    <main className="page">
      <Link to="/groups" className="back-link">
        ← Back to Groups
      </Link>

      {!showExpenseForm ? (
        <>
          <div className="page-header">
            <div>
              <h1>{group.name}</h1>

              <p>Created by {group.createdBy?.name ?? "Unknown"}</p>
            </div>

            <button className="button" onClick={() => setShowExpenseForm(true)}>
              Add Expense
            </button>
          </div>

          <section className="stats-grid">
            <div className="stat-card">
              <h3>Members</h3>
              <p>{members.length}</p>
            </div>

            <div className="stat-card">
              <h3>Expenses</h3>
              <p>{expenses.length}</p>
            </div>

            <div className="stat-card">
              <h3>Total Spent</h3>
              <p>${totalSpent.toFixed(2)}</p>
            </div>
          </section>

          <GroupBalances groupId={group.id} />
          <section className="content-section">
            <h2>Members</h2>

            {members.length === 0 ? (
              <p>No members found.</p>
            ) : (
              <div className="member-list">
                {members.map((member) => {
                  const user = member.user;

                  const userId = user?.id ?? member.userId;

                  return (
                    <div className="member-card" key={userId}>
                      <div className="member-avatar">
                        {user?.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>

                      <div>
                        <strong>{user?.name ?? "Unknown User"}</strong>

                        <p>{user?.email ?? ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="content-section">
            <div className="section-header">
              <h2>Expenses</h2>

              <button
                className="button"
                onClick={() => setShowExpenseForm(true)}
              >
                Add Expense
              </button>
            </div>

            {expenses.length === 0 ? (
              <div className="empty-state">
                <p>No expenses in this group yet.</p>
              </div>
            ) : (
              <div className="expense-list">
                {expenses.map((expense) => (
                  <Link
                    to={`/expenses/${expense.id}`}
                    className="expense-card"
                    key={expense.id}
                  >
                    <div>
                      <h3>{expense.description}</h3>

                      <p>
                        Added by{" "}
                        {expense.createdBy?.name ??
                          group.createdBy?.name ??
                          "Unknown"}
                      </p>
                    </div>

                    <strong>${Number(expense.amount).toFixed(2)}</strong>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <ExpenseForm
          group={group}
          onExpenseCreated={handleExpenseCreated}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}
    </main>
  );
}

export default GroupDetails;
