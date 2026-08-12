const API_URL = "http://localhost:3001/api";

export async function getGroupMembers(groupId) {
  const response = await fetch(
    `${API_URL}/groups/${groupId}/members`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load group members."
    );
  }

  return result.data;
}

export async function addGroupMember(
  groupId,
  userId
) {
  const response = await fetch(
    `${API_URL}/groups/${groupId}/members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to add member."
    );
  }

  return result.data;
}

export async function removeGroupMember(
  groupId,
  userId
) {
  const response = await fetch(
    `${API_URL}/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE"
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to remove member."
    );
  }

  return result.data;
}