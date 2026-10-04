import { apiRequest } from "./api";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface Payment {
  id: string;
  claimId: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
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

export async function getPaymentByClaimId(
  claimId: string,
  token: string,
): Promise<Payment | null> {
  try {
    return await apiRequest<Payment>(`/payments/claim/${claimId}`, {}, token);
  } catch (error: any) {
    if (
      error?.message === "Payment not found for this claim" ||
      error?.message === "Payment not found"
    ) {
      return null;
    }

    throw error;
  }
}

export async function createPayment(
  claimId: string,
  data: CreatePaymentRequest,
  token: string,
): Promise<Payment> {
  return apiRequest<Payment>(
    `/payments/${claimId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function completePayment(
  paymentId: string,
  data: CompletePaymentRequest,
  token: string,
): Promise<Payment> {
  return apiRequest<Payment>(
    `/payments/${paymentId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}
