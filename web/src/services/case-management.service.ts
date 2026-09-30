import api from "../api/axios";

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
}

export interface CaseAssignment {
  id: string;
  claimId: string;
  caseManagerId: string;
  surveyorId: string;
  assignedAt: string;
  caseManager: AssignableUser;
  surveyor: AssignableUser;
}

const getAssignableUsers = async (): Promise<AssignableUser[]> => {
  const response = await api.get<AssignableUser[]>(
    "/case-management/assignable-users",
  );
  return response.data;
};

const assignCase = async (
  claimId: string,
  surveyorId: string,
): Promise<CaseAssignment> => {
  const response = await api.post<CaseAssignment>(
    `/case-management/claims/${claimId}/assign`,
    { surveyorId },
  );
  return response.data;
};

const getAssignment = async (
  claimId: string,
): Promise<CaseAssignment | null> => {
  try {
    const response = await api.get<CaseAssignment>(
      `/case-management/claims/${claimId}`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export default {
  getAssignableUsers,
  assignCase,
  getAssignment,
};
