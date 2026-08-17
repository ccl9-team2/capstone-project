import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

function CreateExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [createdById, setCreatedById] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadGroup() {
    try {
      setLoading(true);
      setError("");

      const [groupResponse, membersResponse] = await Promise.all([
        fetch(`${API_URL}/groups/${id}`),
        fetch(`${API_URL}/groups/${id}/members`),
      ]);

      const groupResult = await groupResponse.json();
      const membersResult = await membersResponse.json();

      if (!groupResponse.ok) {
        throw new Error(groupResult.message || "Failed to load group.");
      }

      if (!membersResponse.ok) {
        throw new Error(
          membersResult.message || "Failed to load group members.",
        );
      }

      setGroup(groupResult.data);
      setMembers(membersResult.data);

      // 🟢 TEMPORARY default:
      // Use the first group member until authentication is added.
      if (membersResult.data.length > 0) {
        const firstMember = membersResult.data[0];

        setCreatedById(String(firstMember.userId ?? firstMember.user?.id));
      }
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load group information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!description.trim()) {
      setError("Please enter an expense description.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    if (!createdById) {
      setError("Please select who paid for this expense.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: Number(amount),
          groupId: Number(id),
          createdById: Number(createdById),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create expense.");
      }

      const newExpense = result.data;

      navigate(`/expenses/${newExpense.id}`);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to create expense.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="page create-expense-page">
        <p>Loading group...</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="page create-expense-page">
        <h1>Group not found</h1>

        <Link to="/groups">Back to Groups</Link>
      </main>
    );
  }

  return (
    <main className="page create-expense-page">
      {/* 🟢 POLISHED HEADER */}
      <div className="create-expense-header">
        <Link
          to={`/groups/${id}`}
          className="back-link create-expense-back-link"
        >
          ← Back to {group.name}
        </Link>

        <h1>Add Expense</h1>

        <p>
          Add a shared expense to <strong>{group.name}</strong>.
        </p>
      </div>

      {/* 🟢 COMPACT EXPENSE CARD */}
      <section className="content-section create-expense-card">
        <div className="create-expense-card-header">
          <div>
            <h2>Expense Details</h2>

            <p>Enter the purchase information below.</p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="create-expense-form" onSubmit={handleSubmit}>
          <div className="create-expense-field">
            <label htmlFor="description">What was this for?</label>

            <input
              id="description"
              type="text"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              placeholder="Example: Team Dinner"
              disabled={creating}
            />
          </div>

          <div className="create-expense-two-column">
            <div className="create-expense-field">
              <label htmlFor="amount">Amount</label>

              <div className="create-expense-amount-input">
                <span>$</span>

                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="0.00"
                  disabled={creating}
                />
              </div>
            </div>

            <div className="create-expense-field">
              <label htmlFor="createdById">Who paid?</label>

              <select
                id="createdById"
                value={createdById}
                onChange={(event) => {
                  setCreatedById(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                disabled={creating}
              >
                <option value="">Select a member</option>

                {members.map((member) => {
                  const user = member.user ?? member;

                  const userId = member.userId ?? user.id;

                  return (
                    <option key={userId} value={userId}>
                      {user.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 🟢 FRIENDLIER SPLIT EXPLANATION */}
          <div className="create-expense-note">
            <strong>How will this be split?</strong>

            <p>
              For now, UOME will split this expense equally between all members
              of {group.name}.
            </p>
          </div>

          <div className="create-expense-actions">
            <Link to={`/groups/${id}`} className="secondary-button">
              Cancel
            </Link>

            <button type="submit" className="button" disabled={creating}>
              {creating ? "Creating..." : "Create Expense"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateExpense;
