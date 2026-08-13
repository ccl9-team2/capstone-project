const API_URL = "http://localhost:3001/api";

export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users.");
  }

  const result = await response.json();

  return result.data;
}

export async function getUserById(id) {
  const response = await fetch(`${API_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user.");
  }

  const result = await response.json();

  return result.data;
}

export async function getUserBalances(id) {
  const response = await fetch(`${API_URL}/users/${id}/balances`);

  if (!response.ok) {
    throw new Error("Failed to fetch balances.");
  }

  const result = await response.json();

  return result.data;
}
