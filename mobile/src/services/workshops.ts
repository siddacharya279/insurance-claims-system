import { apiRequest } from "./api";

export interface Workshop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getWorkshops(token: string): Promise<Workshop[]> {
  return apiRequest<Workshop[]>("/workshops", {}, token);
}

export async function getWorkshop(
  workshopId: string,
  token: string,
): Promise<Workshop> {
  return apiRequest<Workshop>(`/workshops/${workshopId}`, {}, token);
}

export async function assignWorkshop(
  claimId: string,
  workshopId: string,
  token: string,
): Promise<unknown> {
  return apiRequest(
    `/claims/${claimId}/assign-workshop`,
    {
      method: "PATCH",
      body: JSON.stringify({ workshopId }),
    },
    token,
  );
}
