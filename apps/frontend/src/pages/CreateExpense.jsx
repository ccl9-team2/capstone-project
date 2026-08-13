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

      // Default to the first member
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
      setError("Please select who created the expense.");
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

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link to={`/groups/${id}`}>← Back to {group.name}</Link>

          <h1>Add Expense</h1>

          <p>Add an expense to {group.name}.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description</label>

          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Team Dinner"
            disabled={creating}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>

          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="90.00"
            disabled={creating}
          />
        </div>

        <div className="form-group">
          <label htmlFor="createdById">Paid By</label>

          <select
            id="createdById"
            value={createdById}
            onChange={(event) => setCreatedById(event.target.value)}
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

        <div className="form-actions">
          <Link to={`/groups/${id}`} className="secondary-button">
            Cancel
          </Link>

          <button type="submit" className="button" disabled={creating}>
            {creating ? "Creating..." : "Create Expense"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreateExpense;
