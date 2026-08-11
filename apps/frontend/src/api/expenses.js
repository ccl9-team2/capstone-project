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

export async function createExpense(expenseData) {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create expense.");
  }

  return result.data;
}
