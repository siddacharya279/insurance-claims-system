import api from "../api/axios";

export interface Survey {
  id: string;
  claimId: string;
  surveyorId: string;
  damageDescription: string;
  estimatedCost: number | null;
  reportPath: string | null;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurveyRequest {
  damageDescription: string;
  estimatedCost: number;
}

const getSurvey = async (claimId: string): Promise<Survey> => {
  const response = await api.get<Survey>(`/surveys/claim/${claimId}`);
  return response.data;
};

const createSurvey = async (
  claimId: string,
  data: CreateSurveyRequest,
): Promise<Survey> => {
  const response = await api.post<Survey>(`/surveys/claim/${claimId}`, data);
  return response.data;
};

const completeSurvey = async (id: string): Promise<Survey> => {
  const response = await api.patch<Survey>(`/surveys/${id}/complete`);
  return response.data;
};

export default {
  getSurvey,
  createSurvey,
  completeSurvey,
};
