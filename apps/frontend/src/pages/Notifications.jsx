import { useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification
} from "../api/notifications.js";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();

      setNotifications(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkAsRead(id) {
    try {
      await markNotificationAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update notification."
      );
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete notification."
      );
    }
  }

  if (loading) {
    return (
      <main className="page">
        <h1>Notifications</h1>
        <p>Loading notifications...</p>
      </main>
    );
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>

          <p>
            Stay up to date with your
            expense splitter activity.
          </p>
        </div>

        <div className="notification-count">
          {unreadCount} unread
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <h2>No notifications</h2>

          <p>
            You're all caught up!
          </p>
        </div>
      ) : (
        <section className="notification-list">
          {notifications.map(
            (notification) => (
              <div
                key={notification.id}
                className={
                  notification.isRead
                    ? "notification-card read"
                    : "notification-card unread"
                }
              >
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title ??
                      "Notification"}
                  </div>

                  <p>
                    {notification.message ??
                      notification.text ??
                      "You have a new notification."}
                  </p>

                  {notification.createdAt && (
                    <small>
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </small>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="button"
                      onClick={() =>
                        handleMarkAsRead(
                          notification.id
                        )
                      }
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleDelete(
                        notification.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}

export default Notifications;