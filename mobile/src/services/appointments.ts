import { apiRequest } from "./api";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface Appointment {
  id: string;
  appointmentDate: string;
  status: AppointmentStatus;
  claimId: string;
  workshopId: string;
  createdAt: string;
}

export async function getAppointment(
  claimId: string,
  token: string,
): Promise<Appointment | null> {
  try {
    return await apiRequest<Appointment>(
      `/appointments/claim/${claimId}`,
      {},
      token,
    );
  } catch (error: any) {
    if (error?.message === "Appointment not found") {
      return null;
    }

    throw error;
  }
}

export async function createAppointment(
  claimId: string,
  appointmentDate: string,
  token: string,
): Promise<Appointment> {
  return apiRequest<Appointment>(
    "/appointments",
    {
      method: "POST",
      body: JSON.stringify({
        claimId,
        appointmentDate,
      }),
    },
    token,
  );
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  token: string,
): Promise<Appointment> {
  return apiRequest<Appointment>(
    `/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    token,
  );
}
