import { apiRequest } from "./api";

export interface RentalVehicle {
  id: string;
  vehicleType: string;
  make: string;
  model: string;
  dailyRate: number;
  securityDeposit: number | null;
  isAvailable: boolean;
  description: string | null;
}

export interface RentalEligibility {
  eligible: boolean;
  reason?: string;
  policyId?: string;
  policyNumber?: string;
  coverageType?: string;
  rentalVehicleLimit?: number | null;
  vehicles?: RentalVehicle[];
}

export type RentalSelectionStatus =
  | "SELECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface RentalVehicleSelection {
  id: string;
  claimId: string;
  rentalVehicleId: string;
  startDate: string;
  endDate: string | null;
  dailyRate: number;
  estimatedTotal: number | null;
  status: RentalSelectionStatus;
  notes: string | null;
  rentalVehicle: RentalVehicle;
}

export interface CreateRentalSelectionRequest {
  rentalVehicleId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export async function checkRentalEligibility(
  claimId: string,
  token: string,
): Promise<RentalEligibility> {
  return apiRequest<RentalEligibility>(
    `/rental-vehicles/claims/${claimId}/eligibility`,
    {},
    token,
  );
}

export async function getRentalSelection(
  claimId: string,
  token: string,
): Promise<RentalVehicleSelection | null> {
  try {
    return await apiRequest<RentalVehicleSelection>(
      `/rental-vehicles/claims/${claimId}/selection`,
      {},
      token,
    );
  } catch (error: any) {
    if (error?.message === "Rental vehicle selection not found") {
      return null;
    }

    throw error;
  }
}

export async function createRentalSelection(
  claimId: string,
  data: CreateRentalSelectionRequest,
  token: string,
): Promise<RentalVehicleSelection> {
  return apiRequest<RentalVehicleSelection>(
    `/rental-vehicles/claims/${claimId}/selection`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function updateRentalSelection(
  claimId: string,
  data: Partial<CreateRentalSelectionRequest>,
  token: string,
): Promise<RentalVehicleSelection> {
  return apiRequest<RentalVehicleSelection>(
    `/rental-vehicles/claims/${claimId}/selection`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function cancelRentalSelection(
  claimId: string,
  token: string,
): Promise<RentalVehicleSelection> {
  return apiRequest<RentalVehicleSelection>(
    `/rental-vehicles/claims/${claimId}/selection`,
    {
      method: "DELETE",
    },
    token,
  );
}
