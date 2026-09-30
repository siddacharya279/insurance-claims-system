import api from "../api/axios";

export interface Adjudication {
  id: string;
  claimId: string;
  adjusterId: string;
  decision: "APPROVED" | "REJECTED";
  approvedAmount: number | null;
  decisionReason: string;
  decidedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdjudicationRequest {
  decision: "APPROVED" | "REJECTED";
  approvedAmount?: number;
  decisionReason: string;
}

const getAdjudication = async (
  claimId: string,
): Promise<Adjudication | null> => {
  const response = await api.get<Adjudication | null>(
    `/adjudication/claims/${claimId}/result`,
  );

  return response.data;
};

const getForReview = async (claimId: string) => {
  const response = await api.get(`/adjudication/claims/${claimId}`);

  return response.data;
};

const adjudicate = async (
  claimId: string,
  data: AdjudicationRequest,
): Promise<Adjudication> => {
  const response = await api.patch<Adjudication>(
    `/adjudication/claims/${claimId}`,
    data,
  );

  return response.data;
};

export default {
  getAdjudication,
  getForReview,
  adjudicate,
};
