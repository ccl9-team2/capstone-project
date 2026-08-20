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
// USER BALANCES
// =========================

export async function getUserBalances(userId) {
  const response = await fetch(`${API_URL}/users/${userId}/balances`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load user balances.");
  }

  return result.data;
}

// =========================
// GET ALL USERS
// =========================

// 🟢 Gets all users so we can find
// a friend by email.
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load users.");
  }

  return result.data;
}
