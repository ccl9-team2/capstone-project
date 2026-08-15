const API_URL = "http://localhost:3001/api";

export async function getGroupQRCode(groupId) {
  const response = await fetch(`${API_URL}/groups/${groupId}/qr-code`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to generate group code.");
  }

  return result.data;
}

export async function joinGroupWithQRCode(code, userId) {
  const response = await fetch(
    `${API_URL}/groups/join/${encodeURIComponent(code)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to join group.");
  }

  return result.data;
}
