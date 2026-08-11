import { useState } from "react";
import { createExpense } from "../api/expenses.js";

function ExpenseForm({ group, onExpenseCreated, onCancel }) {
  const members = group.members ?? [];

  const getUserId = (member) => member.user?.id ?? member.userId;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [selectedMembers, setSelectedMembers] = useState(
    members.map(getUserId),
  );

  const [splitType, setSplitType] = useState("equal");

  const [customAmounts, setCustomAmounts] = useState(
    Object.fromEntries(members.map((member) => [getUserId(member), ""])),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleMember(userId) {
    setSelectedMembers((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  }

  function updateCustomAmount(userId, value) {
    setCustomAmounts((current) => ({
      ...current,
      [userId]: value,
    }));
  }

  function calculateEqualAmount() {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0 || selectedMembers.length === 0) {
      return 0;
    }

    return numericAmount / selectedMembers.length;
  }

  function calculateCustomTotal() {
    return selectedMembers.reduce(
      (total, userId) => total + Number(customAmounts[userId] || 0),
      0,
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const numericAmount = Number(amount);

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!paidBy) {
      setError("Please select who paid.");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Please select at least one person.");
      return;
    }

    let splits;

    if (splitType === "equal") {
      const splitAmount = numericAmount / selectedMembers.length;

      splits = selectedMembers.map((userId) => ({
        userId: Number(userId),
        amountOwed: Number(splitAmount.toFixed(2)),
      }));
    } else {
      const customTotal = calculateCustomTotal();

      if (Math.abs(customTotal - numericAmount) > 0.01) {
        setError(
          `Custom splits must add up to $${numericAmount.toFixed(
            2,
          )}. Currently they add up to $${customTotal.toFixed(2)}.`,
        );

        return;
      }

      splits = selectedMembers.map((userId) => ({
        userId: Number(userId),
        amountOwed: Number(Number(customAmounts[userId] || 0).toFixed(2)),
      }));
    }

    try {
      setSubmitting(true);

      const expenseData = {
        groupId: Number(group.id),
        description: description.trim(),
        amount: numericAmount,
        createdBy: Number(paidBy),
        splits,
      };

      const createdExpense = await createExpense(expenseData);

      setDescription("");
      setAmount("");
      setPaidBy("");

      setSelectedMembers(members.map(getUserId));

      setSplitType("equal");

      setCustomAmounts(
        Object.fromEntries(members.map((member) => [getUserId(member), ""])),
      );

      onExpenseCreated(createdExpense);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to create expense.");
    } finally {
      setSubmitting(false);
    }
  }

  const equalAmount = calculateEqualAmount();
  const customTotal = calculateCustomTotal();

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <h2>Add Expense</h2>

          <p>Add a new expense to {group.name}.</p>
        </div>

        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* Description */}

      <div className="form-group">
        <label htmlFor="description">Description</label>

        <input
          id="description"
          type="text"
          placeholder="Dinner, gas, hotel..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {/* Amount */}

      <div className="form-group">
        <label htmlFor="amount">Amount</label>

        <input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>

      {/* Paid By */}

      <div className="form-group">
        <label htmlFor="paidBy">Paid by</label>

        <select
          id="paidBy"
          value={paidBy}
          onChange={(event) => setPaidBy(event.target.value)}
        >
          <option value="">Select a person</option>

          {members.map((member) => {
            const user = member.user;
            const userId = getUserId(member);

            return (
              <option key={userId} value={userId}>
                {user?.name ?? "Unknown User"}
              </option>
            );
          })}
        </select>
      </div>

      {/* Members */}

      <div className="form-group">
        <label>Split between</label>

        <div className="member-checkboxes">
          {members.map((member) => {
            const user = member.user;
            const userId = getUserId(member);

            return (
              <label className="checkbox-row" key={userId}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(userId)}
                  onChange={() => toggleMember(userId)}
                />

                <span>{user?.name ?? "Unknown User"}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Split Type */}

      <div className="form-group">
        <label>Split type</label>

        <div className="split-type-options">
          <label className="radio-row">
            <input
              type="radio"
              name="splitType"
              value="equal"
              checked={splitType === "equal"}
              onChange={() => setSplitType("equal")}
            />

            <span>Equal</span>
          </label>

          <label className="radio-row">
            <input
              type="radio"
              name="splitType"
              value="custom"
              checked={splitType === "custom"}
              onChange={() => setSplitType("custom")}
            />

            <span>Custom</span>
          </label>
        </div>
      </div>

      {/* Equal Split */}

      {splitType === "equal" && selectedMembers.length > 0 && (
        <div className="split-preview">
          <strong>Equal split</strong>

          <p>Each person owes ${equalAmount.toFixed(2)}</p>
        </div>
      )}

      {/* Custom Split */}

      {splitType === "custom" && selectedMembers.length > 0 && (
        <div className="custom-splits">
          <h3>Custom amounts</h3>

          {members
            .filter((member) => selectedMembers.includes(getUserId(member)))
            .map((member) => {
              const user = member.user;
              const userId = getUserId(member);

              return (
                <div className="custom-split-row" key={userId}>
                  <label>{user?.name ?? "Unknown User"}</label>

                  <div className="custom-amount-input">
                    <span>$</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customAmounts[userId]}
                      onChange={(event) =>
                        updateCustomAmount(userId, event.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              );
            })}

          <div className="custom-total">
            <span>Split total</span>

            <strong>
              ${customTotal.toFixed(2)}
              {" / "}${Number(amount || 0).toFixed(2)}
            </strong>
          </div>

          <p
            className={
              Math.abs(customTotal - Number(amount || 0)) < 0.01
                ? "split-valid"
                : "split-invalid"
            }
          >
            {Math.abs(customTotal - Number(amount || 0)) < 0.01
              ? "✓ Split is balanced"
              : "The split must equal the expense total"}
          </p>
        </div>
      )}

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Adding Expense..." : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
