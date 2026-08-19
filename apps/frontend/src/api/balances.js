const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getGroupBalances(groupId) {
  const response = await fetch(`${API_URL}/groups/${groupId}/balances`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load group balances.");
  }

  return result.data;
}
