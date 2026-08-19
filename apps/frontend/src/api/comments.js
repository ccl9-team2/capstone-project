const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getComments(expenseId) {
  const response = await fetch(`${API_URL}/comments?expenseId=${expenseId}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load comments.");
  }

  return result.data;
}

export async function createComment(commentData) {
  const response = await fetch(`${API_URL}/comments`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(commentData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to add comment.");
  }

  return result.data;
}

export async function updateComment(id, commentData) {
  const response = await fetch(`${API_URL}/comments/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(commentData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update comment.");
  }

  return result.data;
}

export async function deleteComment(id, userId) {
  const response = await fetch(`${API_URL}/comments/${id}?userId=${userId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete comment.");
  }

  return result.data;
}
