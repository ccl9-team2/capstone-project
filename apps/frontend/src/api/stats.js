const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getStats() {
  const response = await fetch(`${API_URL}/stats`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load statistics.");
  }

  return result.data;
}
