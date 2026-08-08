const API_URL = "http://localhost:3001/api";

export async function getExpenses() {
  const response = await fetch(`${API_URL}/expenses`);

  if (!response.ok) {
    throw new Error("Failed to fetch expenses.");
  }

  const result = await response.json();

  return result.data;
}

export async function getExpenseById(id) {
  const response = await fetch(`${API_URL}/expenses/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch expense.");
  }

  const result = await response.json();

  return result.data;
}