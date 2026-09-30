import api from "../api/axios";

export interface Appointment {
  id: string;
  appointmentDate: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
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
  const response = await api.post<Appointment>(
    `/appointments/claims/${claimId}`,
    data,
  );
  return response.data;
};

const getAppointment = async (claimId: string): Promise<Appointment | null> => {
  const response = await api.get<Appointment | null>(
    `/appointments/claims/${claimId}`,
  );
  return response.data;
};

export default {
  createAppointment,
  getAppointment,
};
