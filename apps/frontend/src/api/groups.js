const API_URL = "http://localhost:3001/api";

export async function getGroups() {
  const response = await fetch(`${API_URL}/groups`);

  if (!response.ok) {
    throw new Error("Failed to fetch groups.");
  }

  const result = await response.json();

  return result.data;
}

export async function getGroupById(id) {
  const response = await fetch(`${API_URL}/groups/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch group.");
  }

  const result = await response.json();

  return result.data;
}
