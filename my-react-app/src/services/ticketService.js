const API_BASE_URL = "http://localhost:8081/api/tickets";

async function parseResponse(response, fallbackMessage) {
  if (response.ok) {
    return response.json();
  }

  let message = fallbackMessage;
  try {
    const data = await response.json();
    message = data.error || fallbackMessage;
  } catch {
    // Ignore JSON parsing errors and use fallback message.
  }
  throw new Error(message);
}

export async function fetchTickets() {
  const response = await fetch(API_BASE_URL);
  return parseResponse(response, "Failed to load tickets");
}

export async function fetchTicketById(ticketId) {
  const response = await fetch(`${API_BASE_URL}/${ticketId}`);
  return parseResponse(response, "Failed to load ticket");
}

export async function createTicket(payload, userId = "user1@campus.lk") {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create ticket");
}
