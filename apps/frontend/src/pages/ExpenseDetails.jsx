import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { getExpenseById } from "../api/expenses.js";

import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/comments.js";

import RecordPayment from "../components/RecordPayment.jsx";

function ExpenseDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);

  const [selectedSplit, setSelectedSplit] = useState(null);

  // =========================
  // 🟢 AUTHENTICATED USER
  // =========================

  const [currentUser, setCurrentUser] = useState(null);

  // =========================
  // COMMENTS
  // =========================

  const [comments, setComments] = useState([]);

  const [newComment, setNewComment] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);

  const [editingText, setEditingText] = useState("");

  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [commentError, setCommentError] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // GET LOGGED-IN USER
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
  // LOAD EXPENSE
  // =========================

  async function loadExpense() {
    const data = await getExpenseById(id);

    setExpense(data);
  }

  // =========================
  // LOAD COMMENTS
  // =========================

  async function loadComments() {
    const data = await getComments(id);

    setComments(Array.isArray(data) ? data : []);
  }

  // =========================
  // LOAD PAGE
  // =========================

  async function loadPage() {
    try {
      setLoading(true);

      setError("");

      const user = getLoggedInUser();

      if (!user) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setCurrentUser(user);

      await Promise.all([loadExpense(), loadComments()]);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load this expense.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [id]);

  // =========================
  // PAYMENT RECORDED
  // =========================

  function handlePaymentRecorded() {
    setSelectedSplit(null);

    loadExpense();
  }

  // =========================
  // 🟢 ADD COMMENT
  // =========================

  async function handleAddComment(event) {
    event.preventDefault();

    if (!currentUser?.id) {
      setCommentError("You must be logged in to add a comment.");

      return;
    }

    if (!newComment.trim()) {
      setCommentError("Please enter a comment.");

      return;
    }

    try {
      setCommentSubmitting(true);

      setCommentError("");

      await createComment({
        expenseId: Number(id),

        // 🟢 AUTHENTICATED USER
        userId: Number(currentUser.id),

        text: newComment.trim(),
      });

      setNewComment("");

      await loadComments();
    } catch (err) {
      console.error(err);

      setCommentError(err.message || "Unable to add comment.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  // =========================
  // START EDITING
  // =========================

  function handleStartEdit(comment) {
    setEditingCommentId(comment.id);

    setEditingText(comment.text);

    setCommentError("");
  }

  // =========================
  // CANCEL EDIT
  // =========================

  function handleCancelEdit() {
    setEditingCommentId(null);

    setEditingText("");

    setCommentError("");
  }

  // =========================
  // 🟢 SAVE EDIT
  // =========================

  async function handleSaveEdit(commentId) {
    if (!currentUser?.id) {
      setCommentError("You must be logged in to edit a comment.");

      return;
    }

    if (!editingText.trim()) {
      setCommentError("Comment cannot be empty.");

      return;
    }

    try {
      setCommentSubmitting(true);

      setCommentError("");

      await updateComment(commentId, {
        // 🟢 AUTHENTICATED USER
        userId: Number(currentUser.id),

        text: editingText.trim(),
      });

      setEditingCommentId(null);

      setEditingText("");

      await loadComments();
    } catch (err) {
      console.error(err);

      setCommentError(err.message || "Unable to update comment.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  // =========================
  // 🟢 DELETE COMMENT
  // =========================

  async function handleDeleteComment(commentId) {
    if (!currentUser?.id) {
      setCommentError("You must be logged in to delete a comment.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCommentSubmitting(true);

      setCommentError("");

      await deleteComment(
        commentId,

        // 🟢 AUTHENTICATED USER
        Number(currentUser.id),
      );

      if (editingCommentId === commentId) {
        setEditingCommentId(null);

        setEditingText("");
      }

      await loadComments();
    } catch (err) {
      console.error(err);

      setCommentError(err.message || "Unable to delete comment.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="page expense-details-page">
        <p>Loading expense...</p>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="page expense-details-page">
        <p className="error-message">{error}</p>

        <Link to="/groups" className="button">
          Back to Groups
        </Link>
      </main>
    );
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!expense) {
    return (
      <main className="page expense-details-page">
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

  // =========================
  // COMMENT DATE
  // =========================

  function formatCommentDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main className="page expense-details-page">
      <Link
        to={`/groups/${expense.groupId}`}
        className="back-link expense-details-back-link"
      >
        ← Back to Group
      </Link>

      {/* ========================= */}
      {/* EXPENSE HEADER */}
      {/* ========================= */}

      <div className="expense-details-hero">
        <div>
          <span className="expense-details-eyebrow">Expense</span>

          <h1>{expense.description}</h1>

          <p>
            Paid by <strong>{paidBy}</strong>
          </p>
        </div>

        <div className="expense-details-total-block">
          <span>Total</span>

          <strong>${Number(expense.amount).toFixed(2)}</strong>
        </div>
      </div>

      {/* ========================= */}
      {/* SUMMARY */}
      {/* ========================= */}

      <section className="content-section expense-details-summary-card">
        <div className="expense-details-summary-grid">
          <div>
            <span>Description</span>

            <strong>{expense.description}</strong>
          </div>

          <div>
            <span>Paid by</span>

            <strong>{paidBy}</strong>
          </div>

          <div>
            <span>Split total</span>

            <strong>${totalOwed.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* SPLIT + BALANCES */}
      {/* ========================= */}

      <div className="expense-details-main-grid">
        {/* SPLIT */}

        <section className="content-section expense-details-panel">
          <div className="expense-details-section-heading">
            <div>
              <h2>Split</h2>

              <p>See each person's share of this expense.</p>
            </div>
          </div>

          {splits.length === 0 ? (
            <div className="expense-details-inline-empty">
              No splits found for this expense.
            </div>
          ) : (
            <div className="split-list expense-details-split-list">
              {splits.map((split) => {
                const userName =
                  split.user?.name ?? split.user?.email ?? "Unknown User";

                const amount = Number(split.amountOwed);

                const isPayer =
                  Number(expense.createdBy?.id) === Number(split.user?.id);

                return (
                  <div
                    className="split-detail-card expense-details-row"
                    key={split.id}
                  >
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

                    <div className="split-card-right expense-details-row-actions">
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

          <div className="split-total expense-details-split-total">
            <span>Total split</span>

            <strong>${totalOwed.toFixed(2)}</strong>
          </div>
        </section>

        {/* BALANCES */}

        <section className="content-section expense-details-panel">
          <div className="expense-details-section-heading">
            <div>
              <h2>Balances</h2>

              <p>See who still owes money on this expense.</p>
            </div>
          </div>

          {splits.length === 0 ? (
            <div className="expense-details-inline-empty">
              No balances available.
            </div>
          ) : (
            <div className="balance-list expense-details-balance-list">
              {splits.map((split) => {
                const userName =
                  split.user?.name ?? split.user?.email ?? "Unknown User";

                const amount = Number(split.amountOwed);

                const isPayer =
                  Number(expense.createdBy?.id) === Number(split.user?.id);

                if (isPayer) {
                  return (
                    <div
                      className="balance-card expense-details-row"
                      key={split.id}
                    >
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
                  <div
                    className="balance-card expense-details-row"
                    key={split.id}
                  >
                    <div>
                      <strong>{userName}</strong>

                      <p>
                        {split.settled ? `Paid ${paidBy}` : `Owes ${paidBy}`}
                      </p>
                    </div>

                    <strong>${amount.toFixed(2)}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ========================= */}
      {/* 🟢 COMMENTS */}
      {/* ========================= */}

      <section className="content-section comments-section">
        <div className="comments-header">
          <div>
            <h2>Comments</h2>

            <p>Keep notes and updates about this expense.</p>
          </div>

          <span className="comments-count">{comments.length}</span>
        </div>

        {commentError && <div className="form-error">{commentError}</div>}

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            id="new-comment"
            value={newComment}
            placeholder="Write a comment..."
            rows="2"
            disabled={commentSubmitting}
            onChange={(event) => {
              setNewComment(event.target.value);

              if (commentError) {
                setCommentError("");
              }
            }}
          />

          <div className="comment-form-actions">
            <button
              type="submit"
              className="button"
              disabled={commentSubmitting}
            >
              {commentSubmitting ? "Saving..." : "Add Comment"}
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <div className="comments-empty-state">
            No comments yet. Add the first note for this expense.
          </div>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => {
              // 🟢 AUTHENTICATED
              // COMMENT OWNERSHIP

              const commentUserId = comment.user?.id ?? comment.userId;

              const isOwnComment =
                Number(commentUserId) === Number(currentUser?.id);

              const isEditing = editingCommentId === comment.id;

              return (
                <div className="comment-card" key={comment.id}>
                  <div className="comment-main">
                    <div className="comment-meta">
                      <strong>{comment.user?.name ?? "Unknown User"}</strong>

                      {/* 🟢 CHANGED — show updated time after an edit */}
                      {comment.createdAt && (
                        <span>
                          {formatCommentDate(
                            comment.updatedAt ?? comment.createdAt,
                          )}

                          {comment.updatedAt &&
                            comment.updatedAt !== comment.createdAt &&
                            " · Edited"}
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="comment-edit-area">
                        <textarea
                          value={editingText}
                          rows="2"
                          disabled={commentSubmitting}
                          onChange={(event) =>
                            setEditingText(event.target.value)
                          }
                        />

                        <div className="comment-edit-actions">
                          <button
                            type="button"
                            className="small-button"
                            disabled={commentSubmitting}
                            onClick={() => handleSaveEdit(comment.id)}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            disabled={commentSubmitting}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{comment.text}</p>
                    )}
                  </div>

                  {isOwnComment && !isEditing && (
                    <div className="comment-actions">
                      <button
                        type="button"
                        className="comment-action-button"
                        disabled={commentSubmitting}
                        onClick={() => handleStartEdit(comment)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="comment-action-button delete"
                        disabled={commentSubmitting}
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================= */}
      {/* RECORD PAYMENT MODAL */}
      {/* ========================= */}

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
