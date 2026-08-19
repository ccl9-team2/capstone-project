const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function createPayment(paymentData) {
  const response = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to record payment.");
  }

  return result.data;
}
