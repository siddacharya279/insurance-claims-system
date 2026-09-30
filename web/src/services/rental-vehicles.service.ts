import api from "../api/axios";

export interface RentalVehicle {
  id: string;
  vehicleType: string;
  make: string;
  model: string;
  dailyRate: number;
  securityDeposit: number;
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

export interface RentalVehicleSelection {
  id: string;
  claimId: string;
  rentalVehicleId: string;
  startDate: string;
  endDate: string | null;
  dailyRate: number;
  estimatedTotal: number | null;
  status: "SELECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  rentalVehicle: RentalVehicle;
}

export interface CreateRentalSelectionRequest {
  rentalVehicleId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

const getAvailableVehicles = async (): Promise<RentalVehicle[]> => {
  const response = await api.get<RentalVehicle[]>("/rental-vehicles");
  return response.data;
};

const checkEligibility = async (
  claimId: string,
): Promise<RentalEligibility> => {
  const response = await api.get<RentalEligibility>(
    `/rental-vehicles/claims/${claimId}/eligibility`,
  );
  return response.data;
};

const getSelection = async (
  claimId: string,
): Promise<RentalVehicleSelection | null> => {
  try {
    const response = await api.get<RentalVehicleSelection>(
      `/rental-vehicles/claims/${claimId}/selection`,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const createSelection = async (
  claimId: string,
  data: CreateRentalSelectionRequest,
): Promise<RentalVehicleSelection> => {
  const response = await api.post<RentalVehicleSelection>(
    `/rental-vehicles/claims/${claimId}/selection`,
    data,
  );
  return response.data;
};

const updateSelection = async (
  claimId: string,
  data: Partial<CreateRentalSelectionRequest>,
): Promise<RentalVehicleSelection> => {
  const response = await api.patch<RentalVehicleSelection>(
    `/rental-vehicles/claims/${claimId}/selection`,
    data,
  );
  return response.data;
};

const cancelSelection = async (
  claimId: string,
): Promise<RentalVehicleSelection> => {
  const response = await api.delete<RentalVehicleSelection>(
    `/rental-vehicles/claims/${claimId}/selection`,
  );
  return response.data;
};

export default {
  getAvailableVehicles,
  checkEligibility,
  getSelection,
  createSelection,
  updateSelection,
  cancelSelection,
};
