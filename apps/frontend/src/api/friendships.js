const API_URL = "http://localhost:3001/api";

export async function getFriendships() {
  const response = await fetch(
    `${API_URL}/friendships`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load friendships."
    );
  }

  return result.data;
}

export async function createFriendship(friendshipData) {
  const response = await fetch(
    `${API_URL}/friendships`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(friendshipData)
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to send friend request."
    );
  }

  return result.data;
}

export async function updateFriendship(
  id,
  friendshipData
) {
  const response = await fetch(
    `${API_URL}/friendships/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(friendshipData)
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update friendship."
    );
  }

  return result.data;
}

export async function deleteFriendship(id) {
  const response = await fetch(
    `${API_URL}/friendships/${id}`,
    {
      method: "DELETE"
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to remove friendship."
    );
  }

  return result.data;
}