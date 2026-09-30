import api from "../api/axios";
export interface Repair {
  id: string;
  claimId: string;
  workshopId: string;
  status: "IN_PROGRESS" | "COMPLETED";
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
  status?: "IN_PROGRESS";
  expectedDeliveryDate?: string;
  repairNotes?: string;
}
export interface CompleteRepairRequest {
  finalBillAmount: number;
  repairNotes?: string;
}
const getRepairByClaimId = async (claimId: string): Promise<Repair | null> => {
  try {
    const response = await api.get<Repair>(`/workshop-repair/claim/${claimId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
const getRepairById = async (repairId: string): Promise<Repair> => {
  const response = await api.get<Repair>(`/workshop-repair/${repairId}`);
  return response.data;
};
const startRepair = async (
  claimId: string,
  data: StartRepairRequest,
): Promise<Repair> => {
  const response = await api.post<Repair>(
    `/workshop-repair/${claimId}/start`,
    data,
  );
  return response.data;
};
const updateRepair = async (
  repairId: string,
  data: UpdateRepairRequest,
): Promise<Repair> => {
  const response = await api.patch<Repair>(
    `/workshop-repair/${repairId}`,
    data,
  );
  return response.data;
};
const completeRepair = async (
  repairId: string,
  data: CompleteRepairRequest,
): Promise<Repair> => {
  const response = await api.post<Repair>(
    `/workshop-repair/${repairId}/complete`,
    data,
  );
  return response.data;
};
export default {
  getRepairByClaimId,
  getRepairById,
  startRepair,
  updateRepair,
  completeRepair,
};
