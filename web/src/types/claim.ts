export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
export interface Claim {
  id: string;
  claimNumber: string;
  customerId: string;
  policyId: string | null;
  title: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  status: string;
  workshopId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}
export interface CreateClaimRequest {
  policyId: string;
  title: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
}
