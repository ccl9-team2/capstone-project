const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getUserBalances(userId) {
  const response = await fetch(`${API_URL}/users/${userId}/balances`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load user balances.");
  }

  return result.data;
}
// 🟢 NEW - Gets all users so we can find a friend by email
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load users.");
  }

  return result.data;
}
