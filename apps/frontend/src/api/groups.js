const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getAuthHeaders() {
  const token = localStorage.getItem("uome-token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function getGroups() {
  const response = await fetch(`${API_URL}/groups`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch groups.");
  }

  return result.data;
}

export async function getGroupById(id) {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch group.");
  }

  return result.data;
}

export async function deleteGroup(id) {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete group.");
  }

  return result.data;
}
