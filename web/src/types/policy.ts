export interface Coverage {
  id: string;
  policyId: string;
  coverageType: string;
  coverageLimit: number | null;
  deductible: number | null;
  rentalVehicleEligible: boolean;
  rentalVehicleLimit: number | null;
  description: string | null;
}
export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  insurerName: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  coverages: Coverage[];
  createdAt: string;
  updatedAt: string;
}
