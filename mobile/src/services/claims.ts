import { apiRequest } from "./api";

export type ClaimStatus =
  | "SUBMITTED"
  | "CASE_ASSIGNED"
  | "SURVEY_PENDING"
  | "SURVEY_COMPLETED"
  | "ADJUDICATION_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REPAIR_IN_PROGRESS"
  | "REPAIR_COMPLETED"
  | "PAYMENT_PENDING"
  | "CLOSED";

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  customerId: string;
  incidentDate: string;
  description: string;
  status: ClaimStatus;
  workshopId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequest {
  title: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  policyId: string;
}

export async function getClaims(token: string): Promise<Claim[]> {
  return apiRequest<Claim[]>("/claims", {}, token);
}

export async function getClaim(claimId: string, token: string): Promise<Claim> {
  return apiRequest<Claim>(`/claims/${claimId}`, {}, token);
}

export async function createClaim(
  data: CreateClaimRequest,
  token: string,
): Promise<Claim> {
  return apiRequest<Claim>(
    "/claims",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}
