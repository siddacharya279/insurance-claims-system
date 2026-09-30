import api from "../api/axios";
export interface AuditLog {
  id: string;
  claimId: string | null;
  actorUserId: string | null;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  description: string | null;
  createdAt: string;
}
const getByClaimId = async (claimId: string): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>(`/audit/claims/${claimId}`);
  return response.data;
};
export default {
  getByClaimId,
};
