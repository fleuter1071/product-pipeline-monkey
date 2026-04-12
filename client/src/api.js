const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.error || "Request failed.");
  }

  return data;
}

export async function fetchRequests() {
  const data = await requestJson("/api/requests");
  return data.items ?? [];
}

export async function createRequest(payload) {
  const data = await requestJson("/api/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.item;
}

export async function updateRequest(id, payload) {
  const data = await requestJson(`/api/requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.item;
}

export async function deleteRequest(id) {
  await requestJson(`/api/requests/${id}`, {
    method: "DELETE",
  });
}
