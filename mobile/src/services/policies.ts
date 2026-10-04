import { apiRequest } from "./api";

export interface PolicyCoverage {
  id: string;
  coverageType: string;
  coverageLimit?: number | null;
  deductible?: number | null;
  rentalVehicleEligible: boolean;
  rentalVehicleLimit?: number | null;
  description?: string | null;
}

export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  startDate: string;
  endDate: string;
  insurerName: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  status: string;
  coverages: PolicyCoverage[];
}

export async function getPolicies(token: string): Promise<Policy[]> {
  return apiRequest<Policy[]>("/policies", {}, token);
}

export async function getPolicy(
  policyId: string,
  token: string,
): Promise<Policy> {
  return apiRequest<Policy>(`/policies/${policyId}`, {}, token);
}
