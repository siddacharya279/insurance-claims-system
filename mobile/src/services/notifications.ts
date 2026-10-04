import { apiRequest } from "./api";

export interface Notification {
  id: string;
  claimId: string;
  recipientUserId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(token: string): Promise<Notification[]> {
  return apiRequest<Notification[]>("/notifications", {}, token);
}

export async function getUnreadNotifications(
  token: string,
): Promise<Notification[]> {
  return apiRequest<Notification[]>("/notifications/unread", {}, token);
}

export async function markNotificationAsRead(
  id: string,
  token: string,
): Promise<Notification> {
  return apiRequest<Notification>(
    `/notifications/${id}/read`,
    {
      method: "PATCH",
    },
    token,
  );
}
