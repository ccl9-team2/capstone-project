import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExpenseById } from "../api/expenses.js";
import RecordPayment from "../components/RecordPayment.jsx";

function ExpenseDetails() {
  const { id } = useParams();

  const [expense, setExpense] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExpense() {
      try {
        setLoading(true);
        setError("");

        const data = await getExpenseById(id);

        setExpense(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this expense.");
      } finally {
        setLoading(false);
      }
    }

    loadExpense();
  }, [id]);

  function handlePaymentRecorded() {
    setSelectedSplit(null);

    // Reload the expense so the updated
    // settled status appears immediately.
    window.location.reload();
  }

  if (loading) {
    return (
      <main className="page">
        <p>Loading expense...</p>
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

  if (!expense) {
    return (
      <main className="page">
        <p>Expense not found.</p>
      </main>
    );
  }

  const splits = expense.splits ?? [];

  const totalOwed = splits.reduce(
    (total, split) => total + Number(split.amountOwed),
    0,
  );

  const paidBy = expense.createdBy?.name ?? expense.payer?.name ?? "Unknown";

  return (
    <main className="page">
      <Link to={`/groups/${expense.groupId}`} className="back-link">
        ← Back to Group
      </Link>

      {/* Expense Header */}

      <div className="expense-details-header">
        <div>
          <h1>{expense.description}</h1>

          <p>
            Paid by <strong>{paidBy}</strong>
          </p>
        </div>

        <div className="expense-total">
          ${Number(expense.amount).toFixed(2)}
        </div>
      </div>

      {/* Expense Summary */}

      <section className="content-section">
        <h2>Expense Summary</h2>

        <div className="expense-summary">
          <div>
            <span>Description</span>

            <strong>{expense.description}</strong>
          </div>

          <div>
            <span>Total</span>

            <strong>${Number(expense.amount).toFixed(2)}</strong>
          </div>

          <div>
            <span>Paid by</span>

            <strong>{paidBy}</strong>
          </div>
        </div>
      </section>

      {/* Splits */}

      <section className="content-section">
        <h2>Split</h2>

        {splits.length === 0 ? (
          <p>No splits found for this expense.</p>
        ) : (
          <div className="split-list">
            {splits.map((split) => {
              const userName =
                split.user?.name ?? split.user?.email ?? "Unknown User";

              const amount = Number(split.amountOwed);

              const isPayer =
                Number(expense.createdBy?.id) === Number(split.user?.id);

              return (
                <div className="split-detail-card" key={split.id}>
                  <div>
                    <strong>{userName}</strong>

                    <p>
                      {split.settled
                        ? "Settled"
                        : isPayer
                          ? "Paid the expense"
                          : `Owes ${expense.createdBy?.name ?? "the payer"}`}
                    </p>
                  </div>

                  <div className="split-card-right">
                    <strong>${amount.toFixed(2)}</strong>

                    {!split.settled && !isPayer && (
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => setSelectedSplit(split)}
                      >
                        Record Payment
                      </button>
                    )}

                    {split.settled && (
                      <span className="settled-badge">✓ Settled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="split-total">
          <span>Total split</span>

          <strong>${totalOwed.toFixed(2)}</strong>
        </div>
      </section>

      {/* Balances */}

      <section className="content-section">
        <h2>Balances</h2>

        {splits.length === 0 ? (
          <p>No balances available.</p>
        ) : (
          <div className="balance-list">
            {splits.map((split) => {
              const userName =
                split.user?.name ?? split.user?.email ?? "Unknown User";

              const amount = Number(split.amountOwed);

              const isPayer =
                Number(expense.createdBy?.id) === Number(split.user?.id);

              if (isPayer) {
                return (
                  <div className="balance-card" key={split.id}>
                    <div>
                      <strong>{userName}</strong>

                      <p>Paid the expense</p>
                    </div>

                    <strong className="balance-positive">
                      Paid ${Number(expense.amount).toFixed(2)}
                    </strong>
                  </div>
                );
              }

              return (
                <div className="balance-card" key={split.id}>
                  <div>
                    <strong>{userName}</strong>

                    <p>{split.settled ? `Paid ${paidBy}` : `Owes ${paidBy}`}</p>
                  </div>

                  <strong>${amount.toFixed(2)}</strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Record Payment Modal */}

      {selectedSplit && (
        <RecordPayment
          split={selectedSplit}
          expense={expense}
          onPaymentRecorded={handlePaymentRecorded}
          onCancel={() => setSelectedSplit(null)}
        />
      )}
    </main>
  );
}

export default ExpenseDetails;
