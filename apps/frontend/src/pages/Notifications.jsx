import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../api/notifications.js";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

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
  // LOAD NOTIFICATIONS
  // =========================

  async function loadNotifications() {
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

      const data = await getNotifications(currentUser.id);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================
  // MARK AS READ
  // =========================

  async function handleMarkAsRead(id) {
    try {
      setError("");

      await markNotificationAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to update notification.");
    }
  }

  // =========================
  // 🟢 OPEN NOTIFICATION
  // =========================

  async function handleOpenNotification(notification) {
    try {
      setError("");

      // 🟢 Opening a notification also marks it as read.
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  isRead: true,
                }
              : item,
          ),
        );
      }

      const message = String(
        notification.message ?? notification.text ?? "",
      ).toLowerCase();

      // =========================
      // FRIEND REQUEST
      // =========================

      if (message.includes("friend request")) {
        navigate("/friends");

        return;
      }

      // =========================
      // FALLBACK
      // =========================

      // For notifications that do not yet have
      // a destination, simply leave them marked read.
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to open notification.");
    }
  }

  // =========================
  // DELETE
  // =========================

  async function handleDelete(id) {
    try {
      setError("");

      await deleteNotification(id);

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id),
      );
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to delete notification.");
    }
  }

  // =========================
  // DATE FORMAT
  // =========================

  function formatNotificationDate(date) {
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

  // =========================
  // 🟢 NOTIFICATION TITLE
  // =========================

  function getNotificationTitle(notification) {
    if (notification.title) {
      return notification.title;
    }

    const message = String(
      notification.message ?? notification.text ?? "",
    ).toLowerCase();

    if (message.includes("sent you a friend request")) {
      return "New Friend Request";
    }

    if (message.includes("accepted your friend request")) {
      return "Friend Request Accepted";
    }

    if (message.includes("declined your friend request")) {
      return "Friend Request Declined";
    }

    return "Notification";
  }

  // =========================
  // 🟢 ACTION LABEL
  // =========================

  function getNotificationActionLabel(notification) {
    const message = String(
      notification.message ?? notification.text ?? "",
    ).toLowerCase();

    if (message.includes("sent you a friend request")) {
      return "View Request";
    }

    if (message.includes("friend request")) {
      return "View Friends";
    }

    return null;
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="page notifications-page">
        <h1>Notifications</h1>

        <p>Loading notifications...</p>
      </main>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // =========================
  // PAGE
  // =========================

  return (
    <main className="page notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>

          <p>Stay on top of payments, requests, and other UOME activity.</p>
        </div>

        <span className="notifications-unread-badge">{unreadCount} unread</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      {notifications.length === 0 ? (
        <div className="notifications-empty-state">
          <strong>You're all caught up.</strong>

          <p>
            New payments, friend requests, and group activity will appear here.
          </p>
        </div>
      ) : (
        <section className="notification-list compact-notification-list">
          {notifications.map((notification) => {
            const actionLabel = getNotificationActionLabel(notification);

            return (
              <div
                key={notification.id}
                className={
                  notification.isRead
                    ? "notification-card compact-notification-card read"
                    : "notification-card compact-notification-card unread"
                }
              >
                <div className="notification-content compact-notification-content">
                  <div className="notification-top-line">
                    <div>
                      <strong className="notification-title">
                        {getNotificationTitle(notification)}
                      </strong>

                      {!notification.isRead && (
                        <span className="notification-new-badge">New</span>
                      )}
                    </div>

                    {notification.createdAt && (
                      <small>
                        {formatNotificationDate(notification.createdAt)}
                      </small>
                    )}
                  </div>

                  <p>
                    {notification.message ??
                      notification.text ??
                      "You have a new notification."}
                  </p>
                </div>

                <div className="notification-actions compact-notification-actions">
                  {/* ========================= */}
                  {/* 🟢 VIEW / OPEN */}
                  {/* ========================= */}

                  {actionLabel && (
                    <button
                      type="button"
                      className="button notification-view-button"
                      onClick={() => handleOpenNotification(notification)}
                    >
                      {actionLabel}
                    </button>
                  )}

                  {/* ========================= */}
                  {/* MARK READ */}
                  {/* ========================= */}

                  {!notification.isRead && (
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark Read
                    </button>
                  )}

                  {/* ========================= */}
                  {/* DELETE */}
                  {/* ========================= */}

                  <button
                    type="button"
                    className="notification-delete-button"
                    onClick={() => handleDelete(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Notifications;
