import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { getClaim, type Claim } from "@/services/claims";

export default function ClaimDetailsScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { token } = useAuth();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadClaim = useCallback(
    async (refresh = false) => {
      if (!id || !token) {
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

        const result = await getClaim(id, token);
        setClaim(result);
      } catch (err: any) {
        setError(err?.message ?? "Unable to load claim details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, token],
  );

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.muted}>Loading claim...</Text>
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Claim not found</Text>

        <Text style={styles.errorText}>
          {error || "Unable to find this claim."}
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadClaim(true)}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.claimNumber}>{claim.claimNumber}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{formatStatus(claim.status)}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claim Information</Text>

        <InfoRow label="Claim Number" value={claim.claimNumber} />

        <InfoRow label="Status" value={formatStatus(claim.status)} />

        <InfoRow label="Incident Date" value={formatDate(claim.incidentDate)} />

        <InfoRow label="Description" value={claim.description} />

        <InfoRow label="Created" value={formatDateTime(claim.createdAt)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claim Progress</Text>

        <ProgressStep
          label="Claim Submitted"
          active={true}
          completed={claim.status !== "SUBMITTED"}
        />

        <ProgressStep
          label="Case Assigned"
          active={getStatusOrder(claim.status) >= 1}
          completed={getStatusOrder(claim.status) > 1}
        />

        <ProgressStep
          label="Survey"
          active={getStatusOrder(claim.status) >= 2}
          completed={getStatusOrder(claim.status) > 3}
        />

        <ProgressStep
          label="Adjudication"
          active={getStatusOrder(claim.status) >= 4}
          completed={getStatusOrder(claim.status) > 5}
        />

        <ProgressStep
          label="Repair"
          active={getStatusOrder(claim.status) >= 6}
          completed={getStatusOrder(claim.status) > 7}
        />

        <ProgressStep
          label="Payment"
          active={getStatusOrder(claim.status) >= 8}
          completed={claim.status === "CLOSED"}
        />

        <ProgressStep
          label="Closed"
          active={claim.status === "CLOSED"}
          completed={claim.status === "CLOSED"}
          last
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workshop</Text>

        {claim.workshopId ? (
          <>
            <InfoRow label="Workshop ID" value={claim.workshopId} />

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: "/workshops",
                  params: {
                    claimId: claim.id,
                  },
                })
              }
            >
              <Text style={styles.actionButtonText}>View Workshop</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sectionText}>
              No workshop has been assigned yet.
            </Text>

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: "/workshops",
                  params: {
                    claimId: claim.id,
                  },
                })
              }
            >
              <Text style={styles.actionButtonText}>Select Workshop</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment</Text>

        <Text style={styles.sectionText}>
          Schedule and manage the workshop appointment.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/appointments",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Appointment</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survey / Assessment</Text>

        <Text style={styles.sectionText}>
          View the vehicle damage assessment and estimated repair cost.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/surveys",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Survey</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adjudication</Text>

        <Text style={styles.sectionText}>
          View the claim approval or rejection decision.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/adjudication",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Adjudication</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workshop Repair</Text>

        <Text style={styles.sectionText}>
          View repair progress, expected delivery, repair notes, and final
          repair bill.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/workshop-repair",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Workshop Repair</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>

        <Text style={styles.sectionText}>
          View the final repair bill and complete payment for your claim.
        </Text>

        <Pressable
          style={[
            styles.actionButton,
            claim.status !== "PAYMENT_PENDING" &&
              claim.status !== "CLOSED" &&
              styles.actionButtonSecondary,
          ]}
          onPress={() =>
            router.push({
              pathname: "/payments",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Payment</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rental Vehicle</Text>

        <Text style={styles.sectionText}>
          Check rental vehicle eligibility and manage your rental selection.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/rental-vehicles",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Rental Vehicle</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documents</Text>

        <Text style={styles.sectionText}>
          Upload and manage documents associated with this claim.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/documents",
              params: {
                claimId: claim.id,
              },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Documents</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <Text style={styles.sectionText}>
          View claim-related notifications and updates.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/notifications",
            })
          }
        >
          <Text style={styles.actionButtonText}>View Notifications</Text>
        </Pressable>
      </View>

      <Pressable style={styles.refreshButton} onPress={() => loadClaim(true)}>
        <Text style={styles.refreshButtonText}>Refresh Claim</Text>
      </Pressable>
    </ScrollView>
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

function ProgressStep({
  label,
  active,
  completed,
  last = false,
}: {
  label: string;
  active: boolean;
  completed: boolean;
  last?: boolean;
}) {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressIndicatorColumn}>
        <View
          style={[
            styles.progressCircle,
            active && styles.progressCircleActive,
            completed && styles.progressCircleCompleted,
          ]}
        >
          {completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>

        {!last ? (
          <View
            style={[
              styles.progressLine,
              completed && styles.progressLineCompleted,
            ]}
          />
        ) : null}
      </View>

      <Text
        style={[styles.progressLabel, active && styles.progressLabelActive]}
      >
        {label}
      </Text>
    </View>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusOrder(status: string): number {
  const statuses = [
    "SUBMITTED",
    "CASE_ASSIGNED",
    "SURVEY_PENDING",
    "SURVEY_COMPLETED",
    "ADJUDICATION_PENDING",
    "APPROVED",
    "REJECTED",
    "REPAIR_IN_PROGRESS",
    "REPAIR_COMPLETED",
    "PAYMENT_PENDING",
    "CLOSED",
  ];

  return statuses.indexOf(status);
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

  header: {
    marginBottom: 18,
  },

  claimNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },

  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  sectionText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },

  infoRow: {
    marginTop: 13,
  },

  infoLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    lineHeight: 22,
  },

  actionButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },

  actionButtonSecondary: {
    backgroundColor: "#374151",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  refreshButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  refreshButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  progressRow: {
    flexDirection: "row",
    minHeight: 55,
  },

  progressIndicatorColumn: {
    width: 30,
    alignItems: "center",
  },

  progressCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircleActive: {
    borderColor: "#111827",
  },

  progressCircleCompleted: {
    backgroundColor: "#15803D",
    borderColor: "#15803D",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  progressLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 2,
  },

  progressLineCompleted: {
    backgroundColor: "#15803D",
  },

  progressLabel: {
    color: "#9CA3AF",
    fontSize: 15,
    paddingTop: 1,
    paddingLeft: 8,
  },

  progressLabelActive: {
    color: "#111827",
    fontWeight: "600",
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  errorTitle: {
    color: "#991B1B",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  errorText: {
    color: "#991B1B",
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 18,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
