import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

  // =========================
  // AUTH HEADERS
  // =========================

  function getAuthHeaders() {
    const token = localStorage.getItem("uome-token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  // =========================
  // LOGGED-IN USER
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
  // LOAD GROUP + MEMBERS
  // =========================

  async function loadGroup() {
    try {
      setLoading(true);
      setError("");

      const currentUser = getLoggedInUser();

      if (!currentUser) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const [groupResponse, membersResponse] = await Promise.all([
        fetch(`${API_URL}/groups/${id}`, {
          headers: {
            ...getAuthHeaders(),
          },
        }),

        fetch(`${API_URL}/groups/${id}/members`, {
          headers: {
            ...getAuthHeaders(),
          },
        }),
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

      // =========================
      // DEFAULT PAYER
      // =========================
      // Prefer the logged-in user
      // if they are a member.
      // Otherwise use the first
      // group member.

      const loggedInMember = membersResult.data.find(
        (member) =>
          Number(member.userId ?? member.user?.id) === Number(currentUser.id),
      );

      if (loggedInMember) {
        setCreatedById(
          String(loggedInMember.userId ?? loggedInMember.user?.id),
        );
      } else if (membersResult.data.length > 0) {
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

  // =========================
  // CREATE EXPENSE
  // =========================

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

          ...getAuthHeaders(),
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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="page create-expense-page">
        <p>Loading group...</p>
      </main>
    );
  }

  // =========================
  // GROUP LOAD ERROR
  // =========================

  if (!group) {
    return (
      <main className="page create-expense-page">
        <h1>Unable to load group</h1>

        {error && <div className="form-error">{error}</div>}

        <Link to="/groups" className="back-link">
          Back to Groups
        </Link>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="page create-expense-page">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="create-expense-header">
        <Link
          to={`/groups/${id}`}
          className="back-link create-expense-back-link"
        >
          ← Back to Group
        </Link>

        <div>
          <h1>Add Expense</h1>

          <p>Add a shared expense to {group.name}.</p>
        </div>
      </div>

      {/* ========================= */}
      {/* ERROR */}
      {/* ========================= */}

      {error && <div className="form-error">{error}</div>}

      {/* ========================= */}
      {/* FORM */}
      {/* ========================= */}

      <form className="form create-expense-form" onSubmit={handleSubmit}>
        {/* DESCRIPTION */}

        <div className="form-group">
          <label htmlFor="description">Description</label>

          <input
            id="description"
            type="text"
            value={description}
            placeholder="e.g. Dinner"
            disabled={creating}
            onChange={(event) => {
              setDescription(event.target.value);

              if (error) {
                setError("");
              }
            }}
          />
        </div>

        {/* AMOUNT */}

        <div className="form-group">
          <label htmlFor="amount">Amount</label>

          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            placeholder="0.00"
            disabled={creating}
            onChange={(event) => {
              setAmount(event.target.value);

              if (error) {
                setError("");
              }
            }}
          />
        </div>

        {/* WHO PAID */}

        <div className="form-group">
          <label htmlFor="createdById">Who paid?</label>

          <select
            id="createdById"
            value={createdById}
            disabled={creating}
            onChange={(event) => {
              setCreatedById(event.target.value);

              if (error) {
                setError("");
              }
            }}
          >
            <option value="">Select a member</option>

            {members.map((member) => {
              const userId = member.userId ?? member.user?.id;

              const userName = member.user?.name ?? `User ${userId}`;

              return (
                <option key={member.id ?? userId} value={userId}>
                  {userName}
                </option>
              );
            })}
          </select>
        </div>

        {/* ========================= */}
        {/* ACTIONS */}
        {/* ========================= */}

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
