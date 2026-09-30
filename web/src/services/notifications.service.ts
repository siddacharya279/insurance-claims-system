import api from "../api/axios";
export interface Notification {
  id: string;
  claimId: string;
  recipientUserId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>("/notifications");
  return response.data;
};
const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>("/notifications/unread");
  return response.data;
};
const markAsRead = async (id: string): Promise<Notification> => {
  const response = await api.patch<Notification>(`/notifications/${id}/read`);
  return response.data;
};
export default {
  getMyNotifications,
  getUnreadNotifications,
  markAsRead,
};
