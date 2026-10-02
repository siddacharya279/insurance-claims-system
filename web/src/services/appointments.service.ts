import api from "../api/axios";

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

export interface CreateAppointmentRequest {
  appointmentDate: string;
  workshopId: string;
}

const createAppointment = async (
  claimId: string,
  data: CreateAppointmentRequest,
): Promise<Appointment> => {
  const response = await api.post<Appointment>("/appointments", {
    claimId,
    appointmentDate: data.appointmentDate,
  });

  return response.data;
};

const getAppointment = async (claimId: string): Promise<Appointment | null> => {
  try {
    const response = await api.get<Appointment>(
      `/appointments/claim/${claimId}`,
    );

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment> => {
  const response = await api.patch<Appointment>(
    `/appointments/${appointmentId}/status`,
    {
      status,
    },
  );

  return response.data;
};

export default {
  createAppointment,
  getAppointment,
  updateAppointmentStatus,
};
