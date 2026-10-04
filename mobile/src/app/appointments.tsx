import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  createAppointment,
  getAppointment,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from "@/services/appointments";

export default function AppointmentsScreen() {
  const { token } = useAuth();

  const { claimId } = useLocalSearchParams<{
    claimId?: string;
  }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const [appointmentDate, setAppointmentDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !claimId) return;

    loadAppointment();
  }, [token, claimId]);

  async function loadAppointment() {
    if (!token || !claimId) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getAppointment(claimId, token);

      setAppointment(data);

      if (data) {
        setAppointmentDate(new Date(data.appointmentDate).toISOString());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load appointment",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!token || !claimId) {
      setError("Claim information is missing.");
      return;
    }

    if (!appointmentDate.trim()) {
      setError("Please enter an appointment date.");
      return;
    }

    const parsedDate = new Date(appointmentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      setError("Please enter a valid date, for example 2026-10-05T10:00:00.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const data = await createAppointment(
        claimId,
        parsedDate.toISOString(),
        token,
      );

      setAppointment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to schedule appointment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(status: AppointmentStatus) {
    if (!token || !appointment) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const data = await updateAppointmentStatus(appointment.id, status, token);

      setAppointment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update appointment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Workshop Appointment</Text>

        <Text style={styles.subtitle}>
          Schedule an appointment for your vehicle inspection or repair.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {!appointment ? (
          <View style={styles.card}>
            <Text style={styles.label}>Appointment Date & Time</Text>

            <TextInput
              style={styles.input}
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              placeholder="2026-10-05T10:00:00"
              autoCapitalize="none"
            />

            <Text style={styles.hint}>
              Enter the date and time in ISO format.
            </Text>

            <Pressable
              style={[
                styles.primaryButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Schedule Appointment
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>

            <InfoRow
              label="Date"
              value={new Date(appointment.appointmentDate).toLocaleDateString()}
            />

            <InfoRow
              label="Time"
              value={new Date(appointment.appointmentDate).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            />

            <InfoRow label="Status" value={appointment.status} />

            <InfoRow label="Workshop ID" value={appointment.workshopId} />

            {appointment.status === "SCHEDULED" && (
              <View style={styles.actions}>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleStatusChange("CONFIRMED")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryButtonText}>
                    Confirm Appointment
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => handleStatusChange("CANCELLED")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel Appointment
                  </Text>
                </Pressable>
              </View>
            )}

            {appointment.status === "CONFIRMED" && (
              <View style={styles.actions}>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleStatusChange("COMPLETED")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryButtonText}>Mark Completed</Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => handleStatusChange("CANCELLED")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel Appointment
                  </Text>
                </Pressable>
              </View>
            )}

            {appointment.status === "COMPLETED" && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>Appointment completed.</Text>
              </View>
            )}

            {appointment.status === "CANCELLED" && (
              <View style={styles.cancelledBox}>
                <Text style={styles.cancelledText}>Appointment cancelled.</Text>
              </View>
            )}
          </View>
        )}

        <Pressable style={styles.refreshButton} onPress={loadAppointment}>
          <Text style={styles.refreshText}>Refresh Appointment</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 15,
    color: "#666666",
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },

  hint: {
    marginTop: 7,
    fontSize: 12,
    color: "#777777",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  infoLabel: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 14,
    color: "#222222",
  },

  actions: {
    marginTop: 18,
    gap: 10,
  },

  primaryButton: {
    marginTop: 18,
    backgroundColor: "#208AEF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#B00020",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#B00020",
    fontSize: 15,
    fontWeight: "700",
  },

  successBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#EAF7EE",
  },

  successText: {
    color: "#18733A",
    fontSize: 14,
    fontWeight: "600",
  },

  cancelledBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FDECEC",
  },

  cancelledText: {
    color: "#B00020",
    fontSize: 14,
    fontWeight: "600",
  },

  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FDECEC",
  },

  error: {
    color: "#B00020",
    fontSize: 14,
  },

  refreshButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#208AEF",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },

  refreshText: {
    color: "#208AEF",
    fontSize: 15,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
