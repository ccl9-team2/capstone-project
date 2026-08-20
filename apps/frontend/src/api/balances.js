const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getAuthHeaders() {
  const token = localStorage.getItem("uome-token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function getGroupBalances(groupId) {
  const response = await fetch(`${API_URL}/groups/${groupId}/balances`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load group balances.");
  }

  return result.data;
}
