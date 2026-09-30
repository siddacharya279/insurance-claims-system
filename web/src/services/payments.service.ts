import api from "../api/axios";
export interface Payment {
  id: string;
  claimId: string;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface CreatePaymentRequest {
  paymentMethod: string;
}
export interface CompletePaymentRequest {
  transactionReference: string;
}
const getPaymentByClaimId = async (claimId: string): Promise<Payment> => {
  const response = await api.get<Payment>(`/payments/claim/${claimId}`);
  return response.data;
};
const createPayment = async (
  claimId: string,
  data: CreatePaymentRequest,
): Promise<Payment> => {
  const response = await api.post<Payment>(`/payments/${claimId}`, data);
  return response.data;
};
const completePayment = async (
  paymentId: string,
  data: CompletePaymentRequest,
): Promise<Payment> => {
  const response = await api.post<Payment>(
    `/payments/${paymentId}/complete`,
    data,
  );
  return response.data;
};
export default {
  getPaymentByClaimId,
  createPayment,
  completePayment,
};
