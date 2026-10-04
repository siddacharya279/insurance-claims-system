import { apiRequest } from "./api";

export type SurveyStatus = "PENDING" | "COMPLETED";

export interface Survey {
  id: string;
  claimId: string;
  surveyorId: string;
  damageDescription: string;
  estimatedCost: number | null;
  reportPath: string | null;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurveyRequest {
  claimId: string;
  damageDescription: string;
  estimatedCost?: number;
}

export async function getSurvey(
  claimId: string,
  token: string,
): Promise<Survey | null> {
  try {
    return await apiRequest<Survey>(`/surveys/claim/${claimId}`, {}, token);
  } catch (error: any) {
    if (error?.message === "Survey not found") {
      return null;
    }

    throw error;
  }
}

export async function createSurvey(
  data: CreateSurveyRequest,
  token: string,
): Promise<Survey> {
  return apiRequest<Survey>(
    "/surveys",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function completeSurvey(
  id: string,
  token: string,
): Promise<Survey> {
  return apiRequest<Survey>(
    `/surveys/${id}/complete`,
    {
      method: "PATCH",
    },
    token,
  );
}
