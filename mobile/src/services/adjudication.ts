import { apiRequest } from "./api";

export type AdjudicationDecision = "APPROVED" | "REJECTED";

export interface Adjudication {
  id: string;
  claimId: string;
  adjusterId: string;
  decision: AdjudicationDecision;
  approvedAmount: number | null;
  decisionReason: string;
  decidedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdjudicationReview {
  id: string;
  claimNumber: string;
  status: string;
  customerId: string;
  policyId: string;
  incidentDate: string;
  description: string;
  survey: {
    id: string;
    surveyorId: string;
    damageDescription: string;
    estimatedCost: number | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  documents?: Array<{
    id: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
  }>;
}

export interface AdjudicationRequest {
  decision: AdjudicationDecision;
  approvedAmount?: number;
  decisionReason: string;
}

export async function getAdjudication(
  claimId: string,
  token: string,
): Promise<Adjudication | null> {
  try {
    return await apiRequest<Adjudication | null>(
      `/adjudication/claims/${claimId}/result`,
      {},
      token,
    );
  } catch (error: any) {
    if (
      error?.message === "Adjudication not found" ||
      error?.message === "Adjudication record not found"
    ) {
      return null;
    }

    throw error;
  }
}

export async function getAdjudicationForReview(
  claimId: string,
  token: string,
): Promise<AdjudicationReview> {
  return apiRequest<AdjudicationReview>(
    `/adjudication/claims/${claimId}`,
    {},
    token,
  );
}

export async function adjudicateClaim(
  claimId: string,
  data: AdjudicationRequest,
  token: string,
): Promise<Adjudication> {
  return apiRequest<Adjudication>(
    `/adjudication/claims/${claimId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    token,
  );
}
