import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  completePayment,
  createPayment,
  getPaymentByClaimId,
  Payment,
} from "@/services/payments";

export default function PaymentScreen() {
  const router = useRouter();

  const { claimId } = useLocalSearchParams<{
    claimId: string;
  }>();

  const { token, user } = useAuth();

  const [payment, setPayment] = useState<Payment | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPayment = useCallback(
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

        const result = await getPaymentByClaimId(claimId, token);

        setPayment(result);
      } catch (err: any) {
        setError(err?.message ?? "Unable to load payment details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [claimId, token],
  );

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  const handleInitiatePayment = async () => {
    if (!claimId || !token) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await createPayment(
        claimId,
        {
          paymentMethod: "ONLINE",
        },
        token,
      );

      setPayment(result);

      Alert.alert(
        "Payment Initiated",
        "Your payment is ready to be completed.",
      );
    } catch (err: any) {
      setError(err?.message ?? "Unable to initiate payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompletePayment = () => {
    if (!payment || !token) {
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Pay ₹${Number(payment.amount).toLocaleString("en-IN")} online?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay Now",
          onPress: async () => {
            try {
              setSaving(true);
              setError("");

              const transactionReference = createTransactionReference();

              const result = await completePayment(
                payment.id,
                {
                  transactionReference,
                },
                token,
              );

              setPayment(result);

              Alert.alert(
                "Payment Successful",
                `Transaction ${transactionReference} completed successfully.`,
                [
                  {
                    text: "View Claim",
                    onPress: () => {
                      router.replace({
                        pathname: "/claims/[id]",
                        params: {
                          id: claimId,
                        },
                      });
                    },
                  },
                ],
              );
            } catch (err: any) {
              setError(err?.message ?? "Unable to complete payment.");
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

        <Text style={styles.muted}>Loading payment...</Text>
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
          onRefresh={() => loadPayment(true)}
        />
      }
    >
      <Text style={styles.title}>Claim Payment</Text>

      <Text style={styles.claimId}>Claim: {claimId}</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!payment ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Pending</Text>

          <Text style={styles.sectionText}>
            Your vehicle repair has been completed. Payment can now be initiated
            using the final repair bill.
          </Text>

          <Pressable
            style={[styles.primaryButton, saving && styles.disabled]}
            disabled={saving}
            onPress={handleInitiatePayment}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Initiate Online Payment
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Payment Status</Text>

              <Text
                style={[
                  styles.status,
                  payment.status === "SUCCESS"
                    ? styles.successStatus
                    : payment.status === "PENDING"
                      ? styles.pendingStatus
                      : styles.failedStatus,
                ]}
              >
                {formatStatus(payment.status)}
              </Text>
            </View>

            <Text style={styles.label}>Amount</Text>

            <Text style={styles.amount}>
              ₹{Number(payment.amount).toLocaleString("en-IN")}
            </Text>

            <Text style={styles.label}>Payment Method</Text>

            <Text style={styles.value}>{payment.paymentMethod}</Text>

            <Text style={styles.label}>Payment ID</Text>

            <Text style={styles.value}>{payment.id}</Text>

            {payment.transactionReference ? (
              <>
                <Text style={styles.label}>Transaction Reference</Text>

                <Text style={styles.value}>{payment.transactionReference}</Text>
              </>
            ) : null}

            {payment.paidAt ? (
              <>
                <Text style={styles.label}>Paid At</Text>

                <Text style={styles.value}>
                  {new Date(payment.paidAt).toLocaleString()}
                </Text>
              </>
            ) : null}
          </View>

          {payment.status === "PENDING" ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Complete Payment</Text>

              <Text style={styles.sectionText}>
                This demo uses a simulated online payment. Completing it will
                close the claim.
              </Text>

              <Pressable
                style={[styles.payButton, saving && styles.disabled]}
                disabled={saving}
                onPress={handleCompletePayment}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Pay ₹{Number(payment.amount).toLocaleString("en-IN")}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {payment.status === "SUCCESS" ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Payment Successful</Text>

              <Text style={styles.successText}>
                Your payment has been completed and the claim is now closed.
              </Text>

              {payment.transactionReference ? (
                <Text style={styles.successText}>
                  Transaction: {payment.transactionReference}
                </Text>
              ) : null}

              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  router.replace({
                    pathname: "/claims/[id]",
                    params: {
                      id: claimId,
                    },
                  })
                }
              >
                <Text style={styles.secondaryButtonText}>View Claim</Text>
              </Pressable>
            </View>
          ) : null}

          {payment.status === "FAILED" ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Payment Failed</Text>

              <Text style={styles.errorText}>
                This payment was not completed.
              </Text>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function createTransactionReference(): string {
  const timestamp = Date.now();

  return `TXN-${timestamp}`;
}

function formatStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "SUCCESS":
      return "Successful";

    case "FAILED":
      return "Failed";

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

  label: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    lineHeight: 22,
  },

  amount: {
    fontSize: 30,
    fontWeight: "700",
  },

  status: {
    fontSize: 15,
    fontWeight: "700",
  },

  pendingStatus: {
    color: "#B45309",
  },

  successStatus: {
    color: "#15803D",
  },

  failedStatus: {
    color: "#B91C1C",
  },

  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  payButton: {
    backgroundColor: "#15803D",
    borderRadius: 10,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.6,
  },

  successBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },

  successTitle: {
    color: "#166534",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 8,
  },

  successText: {
    color: "#166534",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 5,
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  errorTitle: {
    color: "#991B1B",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },

  errorText: {
    color: "#991B1B",
    lineHeight: 20,
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 10,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  secondaryButtonText: {
    color: "#166534",
    fontSize: 15,
    fontWeight: "700",
  },
});
