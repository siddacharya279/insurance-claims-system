import api from "../api/axios";
export interface ClaimStatusItem {
  status: string;
  count: number;
}
export interface ClaimStatusSummary {
  totalClaims: number;
  claimsByStatus: ClaimStatusItem[];
}
export interface ClaimVolumeItem {
  date: string;
  count: number;
}
export interface AdjudicationSummary {
  approved: number;
  rejected: number;
  totalAdjudicated: number;
}
export interface RepairPaymentSummary {
  repairInProgress: number;
  repairCompleted: number;
  paymentPending: number;
  closed: number;
}
export interface AverageProcessingTime {
  closedClaims: number;
  averageProcessingTimeHours: number;
}
const getClaimStatusSummary = async (): Promise<ClaimStatusSummary> => {
  const response = await api.get<ClaimStatusSummary>(
    "/reporting/claims/status-summary",
  );
  return response.data;
};
const getClaimVolume = async (
  startDate?: string,
  endDate?: string,
): Promise<ClaimVolumeItem[]> => {
  const response = await api.get<ClaimVolumeItem[]>(
    "/reporting/claims/volume",
    {
      params: {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    },
  );
  return response.data;
};
const getAdjudicationSummary = async (): Promise<AdjudicationSummary> => {
  const response = await api.get<AdjudicationSummary>(
    "/reporting/claims/adjudication-summary",
  );
  return response.data;
};
const getRepairPaymentSummary = async (): Promise<RepairPaymentSummary> => {
  const response = await api.get<RepairPaymentSummary>(
    "/reporting/claims/repair-payment-summary",
  );
  return response.data;
};
const getAverageProcessingTime = async (): Promise<AverageProcessingTime> => {
  const response = await api.get<AverageProcessingTime>(
    "/reporting/claims/average-processing-time",
  );
  return response.data;
};
export default {
  getClaimStatusSummary,
  getClaimVolume,
  getAdjudicationSummary,
  getRepairPaymentSummary,
  getAverageProcessingTime,
};
