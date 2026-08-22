const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
// GET NOTIFICATIONS
// =========================

export async function getNotifications() {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load notifications.");
  }

  return result.data;
}

// =========================
// MARK AS READ
// =========================

export async function markNotificationAsRead(id) {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",

    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to mark notification as read.");
  }

  return result.data;
}

// =========================
// DELETE NOTIFICATION
// =========================

export async function deleteNotification(id) {
  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",

    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete notification.");
  }

  return result.data;
}
