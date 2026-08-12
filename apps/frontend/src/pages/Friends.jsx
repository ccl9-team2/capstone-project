import { useEffect, useState } from "react";
import {
  getFriendships,
  createFriendship,
  updateFriendship,
  deleteFriendship
} from "../api/friendships.js";

function Friends() {
  const [friendships, setFriendships] =
    useState([]);

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  async function loadFriendships() {
    try {
      setLoading(true);
      setError("");

      const data = await getFriendships();

      setFriendships(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load friends."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFriendships();
  }, []);

  async function handleSendRequest(event) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter a friend's email.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * Adjust these fields if your backend
       * uses a different request format.
       */
      await createFriendship({
        email: email.trim()
      });

      setEmail("");

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to send friend request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(id) {
    try {
      setError("");

      await updateFriendship(id, {
        status: "accepted"
      });

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to accept friend request."
      );
    }
  }

  async function handleReject(id) {
    try {
      setError("");

      await updateFriendship(id, {
        status: "rejected"
      });

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to reject friend request."
      );
    }
  }

  async function handleRemove(id) {
    try {
      setError("");

      await deleteFriendship(id);

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to remove friend."
      );
    }
  }

  if (loading) {
    return (
      <main className="page">
        <h1>Friends</h1>
        <p>Loading friends...</p>
      </main>
    );
  }

  const acceptedFriends =
    friendships.filter(
      (friendship) =>
        friendship.status === "accepted"
    );

  const pendingRequests =
    friendships.filter(
      (friendship) =>
        friendship.status === "pending"
    );

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Friends</h1>
          <p>
            Manage your friends and
            connection requests.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <section className="content-section">
        <h2>Add a Friend</h2>

        <form
          className="friend-form"
          onSubmit={handleSendRequest}
        >
          <input
            type="email"
            placeholder="Friend's email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <button
            type="submit"
            className="button"
            disabled={submitting}
          >
            {submitting
              ? "Sending..."
              : "Send Request"}
          </button>
        </form>
      </section>

      <section className="content-section">
        <h2>
          Friends ({acceptedFriends.length})
        </h2>

        {acceptedFriends.length === 0 ? (
          <div className="empty-state">
            <p>
              You don't have any friends yet.
            </p>
          </div>
        ) : (
          <div className="friend-list">
            {acceptedFriends.map(
              (friendship) => {
                const friend =
                  friendship.user ??
                  friendship.friend;

                return (
                  <div
                    className="friend-card"
                    key={friendship.id}
                  >
                    <div>
                      <strong>
                        {friend?.name ??
                          "Unknown User"}
                      </strong>

                      <p>
                        {friend?.email ?? ""}
                      </p>
                    </div>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        handleRemove(
                          friendship.id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <section className="content-section">
        <h2>
          Pending Requests (
          {pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            <p>
              You don't have any pending
              requests.
            </p>
          </div>
        ) : (
          <div className="friend-list">
            {pendingRequests.map(
              (friendship) => {
                const friend =
                  friendship.user ??
                  friendship.friend;

                return (
                  <div
                    className="friend-card"
                    key={friendship.id}
                  >
                    <div>
                      <strong>
                        {friend?.name ??
                          "Unknown User"}
                      </strong>

                      <p>
                        {friend?.email ?? ""}
                      </p>
                    </div>

                    <div className="friend-actions">
                      <button
                        className="button"
                        onClick={() =>
                          handleAccept(
                            friendship.id
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleReject(
                            friendship.id
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Friends;