import { useState } from "react";
import { createPayment } from "../api/payments.js";

function RecordPayment({ split, expense, onPaymentRecorded, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amount = Number(split.amountOwed);

  const fromUserId = split.user?.id ?? split.userId;

  const toUserId = expense.createdBy?.id ?? expense.createdById;

  const fromUserName = split.user?.name ?? "This user";

  const toUserName = expense.createdBy?.name ?? "the payer";

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!fromUserId) {
      setError("Could not determine who owes this payment.");
      return;
    }

    if (!toUserId) {
      setError("Could not determine who should receive this payment.");
      return;
    }

    try {
      setSubmitting(true);

      const paymentData = {
        expenseSplitId: Number(split.id),
        fromUserId: Number(fromUserId),
        toUserId: Number(toUserId),
        amount,
      };

      const payment = await createPayment(paymentData);

      onPaymentRecorded(payment);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to record payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="payment-modal">
      <div className="payment-modal-content">
        <div className="form-header">
          <div>
            <h2>Record Payment</h2>

            <p>
              Record that {fromUserName} paid {toUserName}.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="payment-summary">
          <div>
            <span>From</span>
            <strong>{fromUserName}</strong>
          </div>

          <div>
            <span>To</span>
            <strong>{toUserName}</strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>${amount.toFixed(2)}</strong>
          </div>
        </div>

        <button
          type="submit"
          className="button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Recording..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
}

export default RecordPayment;
