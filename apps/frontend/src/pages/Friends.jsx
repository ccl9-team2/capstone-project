import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  getFriendships,
  createFriendship,
  updateFriendship,
  deleteFriendship,
} from "../api/friendships.js";

import { getUsers } from "../api/users.js";

function Friends() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  const [friendships, setFriendships] = useState([]);

  const [users, setUsers] = useState([]);

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // 🟢 AUTHENTICATED USER
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
  // LOAD FRIENDSHIPS
  // =========================

  async function loadFriendships() {
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

      const [friendshipData, userData] = await Promise.all([
        getFriendships(),
        getUsers(),
      ]);

      setFriendships(Array.isArray(friendshipData) ? friendshipData : []);

      setUsers(Array.isArray(userData) ? userData : []);
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

  // =========================
  // SEND FRIEND REQUEST
  // =========================

  async function handleSendRequest(event) {
    event.preventDefault();

    if (!currentUser?.id) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!email.trim()) {
      setError("Please enter a friend's email.");

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      const normalizedEmail = email.trim().toLowerCase();

      const friendUser = users.find(
        (user) => user.email?.toLowerCase() === normalizedEmail,
      );

      if (!friendUser) {
        setError("No user was found with that email.");

        return;
      }

      // 🟢 AUTHENTICATED USER
      if (Number(friendUser.id) === Number(currentUser.id)) {
        setError("You cannot send a friend request to yourself.");

        return;
      }

      const existingFriendship = friendships.find((friendship) => {
        const sameDirection =
          Number(friendship.senderId) === Number(currentUser.id) &&
          Number(friendship.receiverId) === Number(friendUser.id);

        const reverseDirection =
          Number(friendship.senderId) === Number(friendUser.id) &&
          Number(friendship.receiverId) === Number(currentUser.id);

        return sameDirection || reverseDirection;
      });

      if (existingFriendship) {
        const status = existingFriendship.status?.toLowerCase();

        if (status === "accepted") {
          setError("You are already friends with this user.");

          return;
        }

        if (status === "pending") {
          setError(
            "A friend request already exists between you and this user.",
          );

          return;
        }
      }

      await createFriendship({
        // 🟢 AUTHENTICATED USER
        senderId: Number(currentUser.id),

        receiverId: Number(friendUser.id),
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

  // =========================
  // ACCEPT
  // =========================

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

  // =========================
  // REJECT
  // =========================

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

  // =========================
  // REMOVE / CANCEL
  // =========================

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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="page friends-page">
        <h1>Friends</h1>

        <p>Loading friends...</p>
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  // =========================
  // 🟢 CURRENT USER'S
  // FRIENDSHIPS ONLY
  // =========================

  const myFriendships = friendships.filter(
    (friendship) =>
      Number(friendship.senderId) === Number(currentUser.id) ||
      Number(friendship.receiverId) === Number(currentUser.id),
  );

  const acceptedFriends = myFriendships.filter(
    (friendship) => friendship.status?.toLowerCase() === "accepted",
  );

  const pendingRequests = myFriendships.filter(
    (friendship) =>
      friendship.status?.toLowerCase() === "pending" &&
      Number(friendship.receiverId) === Number(currentUser.id),
  );

  const sentRequests = myFriendships.filter(
    (friendship) =>
      friendship.status?.toLowerCase() === "pending" &&
      Number(friendship.senderId) === Number(currentUser.id),
  );

  // =========================
  // GET THE OTHER USER
  // =========================

  function getFriend(friendship) {
    if (Number(friendship.senderId) === Number(currentUser.id)) {
      return friendship.receiver;
    }

    return friendship.sender;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="page friends-page">
      <div className="friends-header">
        <div>
          <h1>Friends</h1>

          <p>Manage your connections and friend requests in one place.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="friends-main-grid">
        {/* ========================= */}
        {/* YOUR FRIENDS */}
        {/* ========================= */}

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

        {/* ========================= */}
        {/* RIGHT COLUMN */}
        {/* ========================= */}

        <div className="friends-side-column">
          {/* ADD FRIEND */}

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
                disabled={submitting}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
              />

              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </form>
          </section>

          {/* ========================= */}
          {/* PENDING REQUESTS */}
          {/* ========================= */}

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

          {/* ========================= */}
          {/* SENT REQUESTS */}
          {/* ========================= */}

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
