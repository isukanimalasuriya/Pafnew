import { api } from "./api";

export async function fetchTickets() {
  const { data } = await api.get("/api/tickets");
  return data;
}

export async function fetchTicketById(ticketId) {
  const { data } = await api.get(`/api/tickets/${ticketId}`);
  return data;
}

export async function createTicket(payload) {
  const { data } = await api.post("/api/tickets", payload);
  return data;
}

export async function uploadTicketImages(ticketId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await api.post(`/api/tickets/${ticketId}/images`, formData);
  return data;
}

export async function updateTicketStatus(ticketId, status, rejectedReason, resolutionNotes) {
  const { data } = await api.put(`/api/tickets/${ticketId}/status`, {
    status,
    rejectedReason,
    resolutionNotes
  });
  return data;
}

export async function assignTicket(ticketId, assignedToEmail) {
  const { data } = await api.patch(`/api/tickets/${ticketId}/assign`, { assignedToEmail });
  return data;
}

export async function resolveTicket(ticketId, resolutionNotes) {
  const { data } = await api.put(`/api/tickets/${ticketId}/resolution`, { resolutionNotes });
  return data;
}
