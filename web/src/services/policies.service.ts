import api from "../api/axios";
import type { Policy } from "../types/policy";

const getMyPolicies = async (): Promise<Policy[]> => {
  const response = await api.get<Policy[]>("/policies/my");
  return response.data;
};

const getPolicy = async (id: string): Promise<Policy> => {
  const response = await api.get<Policy>(`/policies/${id}`);
  return response.data;
};

export default {
  getMyPolicies,
  getPolicy,
};
