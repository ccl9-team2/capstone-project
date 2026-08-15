const API_URL = "http://localhost:3001/api";

export async function getNotifications() {
  const response = await fetch(`${API_URL}/notifications`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load notifications.");
  }

  return result.data;
}

// 🟢 CHANGED
// Backend route is PATCH /notifications/:id/read
export async function markNotificationAsRead(id) {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to mark notification as read.");
  }

  return result.data;
}

export async function deleteNotification(id) {
  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete notification.");
  }

  return result.data;
}
