const API_URL = "http://localhost:3001/api";

export async function getNotifications(userId) {
  const params = new URLSearchParams();

  if (userId) {
    params.set("userId", String(userId));
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_URL}/notifications?${queryString}`
    : `${API_URL}/notifications`;

  const response = await fetch(url);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load notifications.");
  }

  return result.data;
}

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
