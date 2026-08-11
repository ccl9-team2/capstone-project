import { useEffect, useState } from "react";
import { getGroupBalances } from "../api/balances.js";

function GroupBalances({ groupId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBalances() {
      try {
        setLoading(true);

        const result = await getGroupBalances(groupId);

        setData(result);
      } catch (err) {
        console.error(err);

        setError(err.message || "Unable to load balances.");
      } finally {
        setLoading(false);
      }
    }

    loadBalances();
  }, [groupId]);

  if (loading) {
    return (
      <section className="content-section">
        <h2>Group Balances</h2>
        <p>Calculating balances...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="content-section">
        <h2>Group Balances</h2>
        <p className="error-message">{error}</p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h2>Group Balances</h2>
          <p>Total spent: ${data.totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="balance-summary-grid">
        {data.balances.map((person) => {
          const isPositive = person.balance > 0.01;

          const isNegative = person.balance < -0.01;

          return (
            <div className="group-balance-card" key={person.userId}>
              <div className="balance-person">
                <div className="member-avatar">
                  {person.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{person.name}</strong>

                  <p>
                    {isPositive
                      ? "Gets back"
                      : isNegative
                        ? "Owes"
                        : "Settled up"}
                  </p>
                </div>
              </div>

              <strong
                className={
                  isPositive
                    ? "balance-positive"
                    : isNegative
                      ? "balance-negative"
                      : "balance-neutral"
                }
              >
                {isPositive ? "+" : isNegative ? "-" : ""}$
                {Math.abs(person.balance).toFixed(2)}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="settlements-section">
        <h3>Who owes who?</h3>

        {data.settlements.length === 0 ? (
          <div className="empty-state">
            <p>Everyone is settled up!</p>
          </div>
        ) : (
          <div className="settlement-list">
            {data.settlements.map((settlement, index) => (
              <div
                className="settlement-card"
                key={`${settlement.fromUserId}-${settlement.toUserId}-${index}`}
              >
                <div>
                  <strong>{settlement.fromUserName}</strong>

                  <span> owes </span>

                  <strong>{settlement.toUserName}</strong>
                </div>

                <strong>${settlement.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default GroupBalances;
