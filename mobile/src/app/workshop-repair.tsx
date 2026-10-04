import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  completeRepair,
  getRepairByClaimId,
  startRepair,
  updateRepair,
  type Repair,
} from "@/services/workshop-repair";

export default function WorkshopRepairScreen() {
  const router = useRouter();

  const { claimId } = useLocalSearchParams<{
    claimId: string;
  }>();

  const { token, user } = useAuth();

  const [repair, setRepair] = useState<Repair | null>(null);

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  const [repairNotes, setRepairNotes] = useState("");

  const [finalBillAmount, setFinalBillAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRepair = useCallback(
    async (refresh = false) => {
      if (!claimId || !token) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await getRepairByClaimId(claimId, token);

        setRepair(result);

        if (result) {
          setExpectedDeliveryDate(
            result.expectedDeliveryDate
              ? result.expectedDeliveryDate.slice(0, 10)
              : "",
          );

          setRepairNotes(result.repairNotes ?? "");

          setFinalBillAmount(
            result.finalBillAmount != null
              ? String(result.finalBillAmount)
              : "",
          );
        }
      } catch (err: any) {
        setError(err?.message ?? "Unable to load repair details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [claimId, token],
  );

  useEffect(() => {
    loadRepair();
  }, [loadRepair]);

  const isWorkshop = user?.role === "WORKSHOP";
  const isAdmin = user?.role === "ADMIN";

  const canManageRepair = isWorkshop || isAdmin;

  const handleStartRepair = async () => {
    if (!claimId || !token) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await startRepair(
        claimId,
        expectedDeliveryDate.trim()
          ? {
              expectedDeliveryDate: toIsoDate(expectedDeliveryDate),
            }
          : {},
        token,
      );

      setRepair(result);

      Alert.alert("Repair Started", "The repair has started successfully.");
    } catch (err: any) {
      setError(err?.message ?? "Unable to start repair.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRepair = async () => {
    if (!repair || !token) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await updateRepair(
        repair.id,
        {
          expectedDeliveryDate: expectedDeliveryDate.trim()
            ? toIsoDate(expectedDeliveryDate)
            : undefined,
          repairNotes: repairNotes.trim() || undefined,
        },
        token,
      );

      setRepair(result);

      Alert.alert("Repair Updated", "Repair progress has been updated.");
    } catch (err: any) {
      setError(err?.message ?? "Unable to update repair.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteRepair = () => {
    if (!repair || !token) {
      return;
    }

    const amount = Number(finalBillAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("Invalid final bill", "Enter a valid final bill amount.");
      return;
    }

    Alert.alert("Complete Repair", "Are you sure the repair is complete?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Complete",
        onPress: async () => {
          try {
            setSaving(true);
            setError("");

            const result = await completeRepair(
              repair.id,
              {
                finalBillAmount: amount,
                repairNotes: repairNotes.trim() || undefined,
              },
              token,
            );

            setRepair(result);

            Alert.alert(
              "Repair Completed",
              "Repair is complete. The claim is now awaiting payment.",
            );
          } catch (err: any) {
            setError(err?.message ?? "Unable to complete repair.");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.muted}>Loading repair...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadRepair(true)}
        />
      }
    >
      <Text style={styles.title}>Workshop Repair</Text>

      <Text style={styles.claimId}>Claim: {claimId}</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!repair ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Repair Not Started</Text>

          <Text style={styles.sectionText}>
            No repair record exists for this claim yet.
          </Text>

          {canManageRepair ? (
            <>
              <Text style={styles.inputLabel}>Expected Delivery Date</Text>

              <TextInput
                style={styles.input}
                value={expectedDeliveryDate}
                onChangeText={setExpectedDeliveryDate}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />

              <Text style={styles.helperText}>Example: 2026-10-02</Text>

              <Pressable
                style={[styles.primaryButton, saving && styles.disabled]}
                disabled={saving}
                onPress={handleStartRepair}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Start Repair</Text>
                )}
              </Pressable>
            </>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The assigned workshop has not started the repair yet.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Repair Status</Text>

              <Text
                style={[
                  styles.status,
                  repair.status === "COMPLETED"
                    ? styles.completed
                    : styles.inProgress,
                ]}
              >
                {formatStatus(repair.status)}
              </Text>
            </View>

            <Text style={styles.label}>Workshop ID</Text>

            <Text style={styles.value}>{repair.workshopId}</Text>

            <Text style={styles.label}>Started</Text>

            <Text style={styles.value}>
              {repair.startedAt
                ? new Date(repair.startedAt).toLocaleString()
                : "Not started"}
            </Text>

            <Text style={styles.label}>Expected Delivery</Text>

            <Text style={styles.value}>
              {repair.expectedDeliveryDate
                ? new Date(repair.expectedDeliveryDate).toLocaleDateString()
                : "Not provided"}
            </Text>

            {repair.estimatedCost != null ? (
              <>
                <Text style={styles.label}>Estimated Cost</Text>

                <Text style={styles.value}>
                  ₹{Number(repair.estimatedCost).toLocaleString("en-IN")}
                </Text>
              </>
            ) : null}

            {repair.finalBillAmount != null ? (
              <>
                <Text style={styles.label}>Final Bill</Text>

                <Text style={styles.value}>
                  ₹{Number(repair.finalBillAmount).toLocaleString("en-IN")}
                </Text>
              </>
            ) : null}

            {repair.repairNotes ? (
              <>
                <Text style={styles.label}>Repair Notes</Text>

                <Text style={styles.value}>{repair.repairNotes}</Text>
              </>
            ) : null}
          </View>

          {repair.status === "IN_PROGRESS" && canManageRepair ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Update Repair Progress</Text>

              <Text style={styles.inputLabel}>Expected Delivery Date</Text>

              <TextInput
                style={styles.input}
                value={expectedDeliveryDate}
                onChangeText={setExpectedDeliveryDate}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />

              <Text style={styles.helperText}>Example: 2026-10-02</Text>

              <Text style={styles.inputLabel}>Repair Notes</Text>

              <TextInput
                style={[styles.input, styles.textArea]}
                value={repairNotes}
                onChangeText={setRepairNotes}
                placeholder="Describe the current repair progress..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Pressable
                style={[styles.primaryButton, saving && styles.disabled]}
                disabled={saving}
                onPress={handleUpdateRepair}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Update Repair</Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {repair.status === "IN_PROGRESS" && canManageRepair ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Complete Repair</Text>

              <Text style={styles.sectionText}>
                Enter the final repair bill before completing the repair.
              </Text>

              <Text style={styles.inputLabel}>Final Bill Amount</Text>

              <TextInput
                style={styles.input}
                value={finalBillAmount}
                onChangeText={setFinalBillAmount}
                placeholder="11800"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Final Repair Notes</Text>

              <TextInput
                style={[styles.input, styles.textArea]}
                value={repairNotes}
                onChangeText={setRepairNotes}
                placeholder="Final repair details..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Pressable
                style={[styles.completeButton, saving && styles.disabled]}
                disabled={saving}
                onPress={handleCompleteRepair}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Complete Repair</Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {repair.status === "COMPLETED" ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Repair Completed</Text>

              <Text style={styles.successText}>
                The repair has been completed and the claim is now awaiting
                payment.
              </Text>

              {repair.completedAt ? (
                <Text style={styles.successText}>
                  Completed: {new Date(repair.completedAt).toLocaleString()}
                </Text>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function toIsoDate(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const date = new Date(`${trimmed}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return date.toISOString();
}

function formatStatus(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  muted: {
    color: "#6B7280",
    marginTop: 8,
  },

  backButton: {
    marginBottom: 12,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },

  claimId: {
    color: "#6B7280",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  sectionText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 14,
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    lineHeight: 23,
  },

  status: {
    fontSize: 14,
    fontWeight: "700",
  },

  inProgress: {
    color: "#B45309",
  },

  completed: {
    color: "#15803D",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
  },

  textArea: {
    minHeight: 120,
  },

  helperText: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  completeButton: {
    backgroundColor: "#15803D",
    borderRadius: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.6,
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    color: "#991B1B",
  },

  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },

  infoText: {
    color: "#1E40AF",
    lineHeight: 20,
  },

  successBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  successTitle: {
    color: "#166534",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  successText: {
    color: "#166534",
    lineHeight: 20,
    marginTop: 4,
  },
});
