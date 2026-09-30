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

const getSurvey = async (claimId: string): Promise<Survey | null> => {
  try {
    const response = await api.get<Survey>(`/surveys/claim/${claimId}`);

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

const createSurvey = async (
  claimId: string,
  data: CreateSurveyRequest,
): Promise<Survey> => {
  const response = await api.post<Survey>(`/surveys`, {
    claimId,
    damageDescription: data.damageDescription,
    estimatedCost: data.estimatedCost,
  });

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
