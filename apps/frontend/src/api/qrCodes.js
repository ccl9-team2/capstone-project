const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getAuthHeaders() {
  const token = localStorage.getItem("uome-token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getGroupQRCode(groupId) {
  const response = await fetch(`${API_URL}/groups/${groupId}/qr-code`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to generate group code.");
  }

  return result.data;
}

export async function joinGroupWithQRCode(code) {
  const response = await fetch(
    `${API_URL}/groups/join/${encodeURIComponent(code)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({}),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to join group.");
  }

  return result.data;
}
