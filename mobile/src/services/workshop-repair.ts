import { apiRequest } from "./api";

export type RepairStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Repair {
  id: string;
  claimId: string;
  workshopId: string;
  status: RepairStatus;
  startedAt: string | null;
  completedAt: string | null;
  expectedDeliveryDate: string | null;
  estimatedCost: number | null;
  finalBillAmount: number | null;
  repairNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartRepairRequest {
  expectedDeliveryDate?: string;
}

export interface UpdateRepairRequest {
  expectedDeliveryDate?: string;
  repairNotes?: string;
}

export interface CompleteRepairRequest {
  finalBillAmount: number;
  repairNotes?: string;
}

export async function getRepairByClaimId(
  claimId: string,
  token: string,
): Promise<Repair | null> {
  try {
    return await apiRequest<Repair>(
      `/workshop-repair/claim/${claimId}`,
      {},
      token,
    );
  } catch (error: any) {
    if (
      error?.message === "Repair not found for this claim" ||
      error?.message === "Repair not found"
    ) {
      return null;
    }

    throw error;
  }
}

export async function getRepairById(
  repairId: string,
  token: string,
): Promise<Repair> {
  return apiRequest<Repair>(`/workshop-repair/${repairId}`, {}, token);
}

export async function startRepair(
  claimId: string,
  data: StartRepairRequest,
  token: string,
): Promise<Repair> {
  return apiRequest<Repair>(
    `/workshop-repair/${claimId}/start`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function updateRepair(
  repairId: string,
  data: UpdateRepairRequest,
  token: string,
): Promise<Repair> {
  return apiRequest<Repair>(
    `/workshop-repair/${repairId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function completeRepair(
  repairId: string,
  data: CompleteRepairRequest,
  token: string,
): Promise<Repair> {
  return apiRequest<Repair>(
    `/workshop-repair/${repairId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}
