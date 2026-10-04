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
  adjudicateClaim,
  getAdjudication,
  getAdjudicationForReview,
  type Adjudication,
  type AdjudicationDecision,
  type AdjudicationReview,
} from "@/services/adjudication";

export default function AdjudicationScreen() {
  const router = useRouter();

  const { claimId } = useLocalSearchParams<{
    claimId: string;
  }>();

  const { token, user } = useAuth();

  const [result, setResult] = useState<Adjudication | null>(null);

  const [review, setReview] = useState<AdjudicationReview | null>(null);

  const [decision, setDecision] = useState<AdjudicationDecision>("APPROVED");

  const [approvedAmount, setApprovedAmount] = useState("");

  const [decisionReason, setDecisionReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canAdjudicate = user?.role === "ADMIN" || user?.role === "ADJUSTER";

  const loadAdjudication = useCallback(
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

        const existing = await getAdjudication(claimId, token);

        setResult(existing);

        if (existing) {
          setDecision(existing.decision);

          setApprovedAmount(
            existing.approvedAmount != null
              ? String(existing.approvedAmount)
              : "",
          );

          setDecisionReason(existing.decisionReason ?? "");

          setReview(null);
          return;
        }

        if (canAdjudicate) {
          const reviewData = await getAdjudicationForReview(claimId, token);

          setReview(reviewData);

          if (reviewData.survey?.estimatedCost != null) {
            setApprovedAmount(String(reviewData.survey.estimatedCost));
          }
        } else {
          setReview(null);
        }
      } catch (err: any) {
        setError(err?.message ?? "Unable to load adjudication details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [claimId, token, canAdjudicate],
  );

  useEffect(() => {
    loadAdjudication();
  }, [loadAdjudication]);

  const handleSubmit = () => {
    if (!claimId || !token) {
      return;
    }

    const reason = decisionReason.trim();

    if (reason.length < 5) {
      Alert.alert(
        "Decision reason required",
        "Please provide at least 5 characters explaining the decision.",
      );

      return;
    }

    let amount: number | undefined;

    if (decision === "APPROVED") {
      amount = Number(approvedAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        Alert.alert(
          "Invalid approved amount",
          "Enter a valid approved amount greater than zero.",
        );

        return;
      }
    }

    Alert.alert(
      decision === "APPROVED" ? "Approve Claim" : "Reject Claim",
      decision === "APPROVED"
        ? `Approve this claim for ₹${amount?.toLocaleString("en-IN")}?`
        : "Reject this claim?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: decision === "APPROVED" ? "Approve" : "Reject",
          style: decision === "REJECTED" ? "destructive" : "default",
          onPress: async () => {
            try {
              setSaving(true);
              setError("");

              const adjudication = await adjudicateClaim(
                claimId,
                {
                  decision,
                  ...(decision === "APPROVED"
                    ? {
                        approvedAmount: amount,
                      }
                    : {}),
                  decisionReason: reason,
                },
                token,
              );

              setResult(adjudication);
              setReview(null);

              Alert.alert(
                "Adjudication Complete",
                decision === "APPROVED"
                  ? "The claim has been approved."
                  : "The claim has been rejected.",
              );
            } catch (err: any) {
              setError(err?.message ?? "Unable to complete adjudication.");
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.muted}>Loading adjudication...</Text>
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
          onRefresh={() => loadAdjudication(true)}
        />
      }
    >
      <Text style={styles.title}>Adjudication</Text>

      <Text style={styles.claimId}>Claim: {claimId}</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {result ? <CompletedAdjudication result={result} /> : null}

      {!result && review ? (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Claim Review</Text>

            <InfoRow label="Claim Number" value={review.claimNumber} />

            <InfoRow label="Status" value={formatStatus(review.status)} />

            <InfoRow
              label="Incident Date"
              value={formatDate(review.incidentDate)}
            />

            <InfoRow label="Description" value={review.description} />
          </View>

          {review.survey ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Survey Assessment</Text>

              <InfoRow
                label="Damage Description"
                value={review.survey.damageDescription}
              />

              <InfoRow
                label="Estimated Cost"
                value={
                  review.survey.estimatedCost != null
                    ? `₹${Number(review.survey.estimatedCost).toLocaleString(
                        "en-IN",
                      )}`
                    : "Not provided"
                }
              />

              <InfoRow
                label="Survey Status"
                value={formatStatus(review.survey.status)}
              />
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Decision</Text>

            <Text style={styles.inputLabel}>Decision</Text>

            <View style={styles.choiceRow}>
              <Pressable
                style={[
                  styles.choiceButton,
                  decision === "APPROVED" && styles.choiceApproved,
                ]}
                onPress={() => setDecision("APPROVED")}
              >
                <Text
                  style={[
                    styles.choiceText,
                    decision === "APPROVED" && styles.choiceTextActive,
                  ]}
                >
                  Approve
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.choiceButton,
                  decision === "REJECTED" && styles.choiceRejected,
                ]}
                onPress={() => setDecision("REJECTED")}
              >
                <Text
                  style={[
                    styles.choiceText,
                    decision === "REJECTED" && styles.choiceTextActive,
                  ]}
                >
                  Reject
                </Text>
              </Pressable>
            </View>

            {decision === "APPROVED" ? (
              <>
                <Text style={styles.inputLabel}>Approved Amount</Text>

                <TextInput
                  style={styles.input}
                  value={approvedAmount}
                  onChangeText={setApprovedAmount}
                  placeholder="12500"
                  keyboardType="decimal-pad"
                />
              </>
            ) : null}

            <Text style={styles.inputLabel}>Decision Reason</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={decisionReason}
              onChangeText={setDecisionReason}
              placeholder={
                decision === "APPROVED"
                  ? "Explain why the claim is approved..."
                  : "Explain why the claim is rejected..."
              }
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Pressable
              style={[
                decision === "APPROVED"
                  ? styles.approveButton
                  : styles.rejectButton,
                saving && styles.disabled,
              ]}
              disabled={saving}
              onPress={handleSubmit}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {decision === "APPROVED" ? "Approve Claim" : "Reject Claim"}
                </Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}

      {!result && !review && !error ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Adjudication Not Available</Text>

          <Text style={styles.sectionText}>
            There is no completed adjudication for this claim yet.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function CompletedAdjudication({ result }: { result: Adjudication }) {
  const approved = result.decision === "APPROVED";

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <Text style={styles.sectionTitle}>Decision</Text>

        <Text
          style={[
            styles.status,
            approved ? styles.approvedStatus : styles.rejectedStatus,
          ]}
        >
          {approved ? "Approved" : "Rejected"}
        </Text>
      </View>

      {approved && result.approvedAmount != null ? (
        <InfoRow
          label="Approved Amount"
          value={`₹${Number(result.approvedAmount).toLocaleString("en-IN")}`}
        />
      ) : null}

      <InfoRow label="Decision Reason" value={result.decisionReason} />

      <InfoRow label="Decided At" value={formatDateTime(result.decidedAt)} />

      <InfoRow label="Adjuster ID" value={result.adjusterId} />

      <View
        style={[
          styles.resultBox,
          approved ? styles.approvedBox : styles.rejectedBox,
        ]}
      >
        <Text
          style={[
            styles.resultTitle,
            approved ? styles.approvedTitle : styles.rejectedTitle,
          ]}
        >
          {approved ? "Claim Approved" : "Claim Rejected"}
        </Text>

        <Text
          style={[
            styles.resultText,
            approved ? styles.approvedTitle : styles.rejectedTitle,
          ]}
        >
          {approved
            ? "The claim has been approved and can proceed to workshop repair."
            : "The claim has been rejected."}
        </Text>
      </View>
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

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
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
    marginBottom: 10,
  },

  sectionText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  status: {
    fontSize: 16,
    fontWeight: "700",
  },

  approvedStatus: {
    color: "#15803D",
  },

  rejectedStatus: {
    color: "#B91C1C",
  },

  infoRow: {
    marginTop: 14,
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

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 18,
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

  choiceRow: {
    flexDirection: "row",
    gap: 10,
  },

  choiceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  choiceApproved: {
    backgroundColor: "#15803D",
    borderColor: "#15803D",
  },

  choiceRejected: {
    backgroundColor: "#B91C1C",
    borderColor: "#B91C1C",
  },

  choiceText: {
    fontSize: 15,
    fontWeight: "700",
  },

  choiceTextActive: {
    color: "#FFFFFF",
  },

  approveButton: {
    backgroundColor: "#15803D",
    borderRadius: 10,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  rejectButton: {
    backgroundColor: "#B91C1C",
    borderRadius: 10,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  buttonText: {
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
    lineHeight: 20,
  },

  resultBox: {
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },

  approvedBox: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBox: {
    backgroundColor: "#FEE2E2",
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 5,
  },

  approvedTitle: {
    color: "#166534",
  },

  rejectedTitle: {
    color: "#991B1B",
  },

  resultText: {
    lineHeight: 20,
  },
});
