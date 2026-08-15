import { useEffect, useState } from "react";

import {
  getFriendships,
  createFriendship,
  updateFriendship,
  deleteFriendship,
} from "../api/friendships.js";

import { getUsers } from "../api/users.js";

function Friends() {
  // 🟢 TEMPORARY current user until login/authentication is added
  const CURRENT_USER_ID = 3;

  const [friendships, setFriendships] = useState([]);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadFriendships() {
    try {
      setLoading(true);
      setError("");

      const [friendshipData, userData] = await Promise.all([
        getFriendships(),
        getUsers(),
      ]);

      setFriendships(friendshipData);
      setUsers(userData);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load friends.");
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

      const friendUser = users.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (!friendUser) {
        setError("No user was found with that email.");
        return;
      }

      if (friendUser.id === CURRENT_USER_ID) {
        setError("You cannot send a friend request to yourself.");
        return;
      }

      await createFriendship({
        senderId: CURRENT_USER_ID,
        receiverId: friendUser.id,
      });

      setEmail("");

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to send friend request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(id) {
    try {
      setError("");

      await updateFriendship(id, {
        status: "Accepted",
      });

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to accept friend request.");
    }
  }

  async function handleReject(id) {
    try {
      setError("");

      await updateFriendship(id, {
        status: "Rejected",
      });

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to reject friend request.");
    }
  }

  async function handleRemove(id) {
    try {
      setError("");

      await deleteFriendship(id);

      await loadFriendships();
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to remove friendship.");
    }
  }

  if (loading) {
    return (
      <main className="page friends-page">
        <h1>Friends</h1>
        <p>Loading friends...</p>
      </main>
    );
  }

  const myFriendships = friendships.filter(
    (friendship) =>
      friendship.senderId === CURRENT_USER_ID ||
      friendship.receiverId === CURRENT_USER_ID,
  );

  const acceptedFriends = myFriendships.filter(
    (friendship) => friendship.status?.toLowerCase() === "accepted",
  );

  const pendingRequests = myFriendships.filter(
    (friendship) =>
      friendship.status?.toLowerCase() === "pending" &&
      friendship.receiverId === CURRENT_USER_ID,
  );

  const sentRequests = myFriendships.filter(
    (friendship) =>
      friendship.status?.toLowerCase() === "pending" &&
      friendship.senderId === CURRENT_USER_ID,
  );

  function getFriend(friendship) {
    if (friendship.senderId === CURRENT_USER_ID) {
      return friendship.receiver;
    }

    return friendship.sender;
  }

  return (
    <main className="page friends-page">
      {/* 🟢 COMPACT HEADER */}
      <div className="friends-header">
        <div>
          <h1>Friends</h1>

          <p>Manage your connections and friend requests in one place.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* 🟢 ADD FRIEND + MAIN CONTENT */}
      <div className="friends-main-grid">
        <section className="content-section friends-panel friends-list-panel">
          <div className="friends-section-heading">
            <div>
              <h2>Your Friends</h2>
              <p>People you've connected with.</p>
            </div>

            <span className="friends-count-badge">
              {acceptedFriends.length}
            </span>
          </div>

          {acceptedFriends.length === 0 ? (
            <div className="empty-state friends-empty-state">
              <p>You don't have any friends yet.</p>
            </div>
          ) : (
            <div className="friend-list compact-friend-list">
              {acceptedFriends.map((friendship) => {
                const friend = getFriend(friendship);

                return (
                  <div
                    className="friend-card compact-friend-card"
                    key={friendship.id}
                  >
                    <div className="friend-person">
                      <div className="friend-avatar">
                        {(friend?.name ?? "?").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{friend?.name ?? "Unknown User"}</strong>

                        <p>{friend?.email ?? ""}</p>
                      </div>
                    </div>

                    <button
                      className="secondary-button"
                      onClick={() => handleRemove(friendship.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="friends-side-column">
          <section className="content-section friends-panel add-friend-panel">
            <div className="friends-section-heading">
              <div>
                <h2>Add a Friend</h2>
                <p>Send a request using their email.</p>
              </div>
            </div>

            <form
              className="friend-form compact-friend-form"
              onSubmit={handleSendRequest}
            >
              <input
                type="email"
                placeholder="Friend's email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </form>
          </section>

          <section className="content-section friends-panel">
            <div className="friends-section-heading">
              <div>
                <h2>Pending Requests</h2>
                <p>Requests waiting for your response.</p>
              </div>

              <span className="friends-count-badge">
                {pendingRequests.length}
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="friends-inline-empty">No pending requests.</div>
            ) : (
              <div className="friend-list compact-friend-list">
                {pendingRequests.map((friendship) => {
                  const friend = getFriend(friendship);

                  return (
                    <div
                      className="friend-card compact-friend-card request-card"
                      key={friendship.id}
                    >
                      <div className="friend-person">
                        <div className="friend-avatar">
                          {(friend?.name ?? "?").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{friend?.name ?? "Unknown User"}</strong>

                          <p>{friend?.email ?? ""}</p>
                        </div>
                      </div>

                      <div className="friend-actions">
                        <button
                          className="button"
                          onClick={() => handleAccept(friendship.id)}
                        >
                          Accept
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() => handleReject(friendship.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="content-section friends-panel">
            <div className="friends-section-heading">
              <div>
                <h2>Sent Requests</h2>
                <p>Requests that are still waiting.</p>
              </div>

              <span className="friends-count-badge">{sentRequests.length}</span>
            </div>

            {sentRequests.length === 0 ? (
              <div className="friends-inline-empty">No sent requests.</div>
            ) : (
              <div className="friend-list compact-friend-list">
                {sentRequests.map((friendship) => {
                  const friend = getFriend(friendship);

                  return (
                    <div
                      className="friend-card compact-friend-card request-card"
                      key={friendship.id}
                    >
                      <div className="friend-person">
                        <div className="friend-avatar">
                          {(friend?.name ?? "?").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{friend?.name ?? "Unknown User"}</strong>

                          <p>{friend?.email ?? ""}</p>

                          <span className="request-status">
                            Waiting for response
                          </span>
                        </div>
                      </div>

                      <button
                        className="secondary-button"
                        onClick={() => handleRemove(friendship.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Friends;
