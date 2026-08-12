const API_URL = "http://localhost:3001/api";

export async function getGroupQRCode(groupId) {
  const response = await fetch(
    `${API_URL}/groups/${groupId}/qr-code`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to generate QR code."
    );
  }

  return result.data;
}

export async function joinGroupWithQRCode(code) {
  const response = await fetch(
    `${API_URL}/groups/join/${code}`,
    {
      method: "POST"
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to join group."
    );
  }

  return result.data;
}