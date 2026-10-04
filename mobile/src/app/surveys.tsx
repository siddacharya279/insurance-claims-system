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
  completeSurvey,
  createSurvey,
  getSurvey,
  type Survey,
} from "@/services/surveys";

export default function SurveysScreen() {
  const router = useRouter();
  const { claimId } = useLocalSearchParams<{ claimId: string }>();
  const { token, user } = useAuth();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [damageDescription, setDamageDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSurvey = useCallback(
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

        const result = await getSurvey(claimId, token);

        setSurvey(result);

        if (result) {
          setDamageDescription(result.damageDescription);
          setEstimatedCost(
            result.estimatedCost != null ? String(result.estimatedCost) : "",
          );
        }
      } catch (err: any) {
        setError(err?.message ?? "Unable to load survey.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [claimId, token],
  );

  useEffect(() => {
    loadSurvey();
  }, [loadSurvey]);

  const canCreate =
    user?.role === "ADMIN" ||
    user?.role === "CASE_MANAGER" ||
    user?.role === "SURVEYOR";

  const canComplete = user?.role === "ADMIN" || user?.role === "SURVEYOR";

  const handleCreate = async () => {
    if (!claimId || !token) {
      return;
    }

    const description = damageDescription.trim();

    if (!description) {
      Alert.alert("Required", "Enter the damage assessment.");
      return;
    }

    let cost: number | undefined;

    if (estimatedCost.trim()) {
      cost = Number(estimatedCost);

      if (!Number.isFinite(cost) || cost < 0) {
        Alert.alert("Invalid amount", "Enter a valid estimated repair cost.");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const result = await createSurvey(
        {
          claimId,
          damageDescription: description,
          estimatedCost: cost,
        },
        token,
      );

      setSurvey(result);

      Alert.alert("Survey created", "The survey has been created.");
    } catch (err: any) {
      setError(err?.message ?? "Unable to create survey.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    if (!survey || !token) {
      return;
    }

    Alert.alert(
      "Complete Survey",
      "Are you sure you want to complete this survey?",
      [
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

              const result = await completeSurvey(survey.id, token);

              setSurvey(result);

              Alert.alert(
                "Survey completed",
                "The claim has moved to the next stage.",
              );
            } catch (err: any) {
              setError(err?.message ?? "Unable to complete survey.");
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
        <Text style={styles.muted}>Loading survey...</Text>
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
          onRefresh={() => loadSurvey(true)}
        />
      }
    >
      <Text style={styles.title}>Survey / Assessment</Text>

      <Text style={styles.claimId}>Claim: {claimId}</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {survey ? (
        <>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>

              <Text
                style={[
                  styles.status,
                  survey.status === "COMPLETED"
                    ? styles.completed
                    : styles.pending,
                ]}
              >
                {survey.status}
              </Text>
            </View>

            <Text style={styles.label}>Damage Assessment</Text>

            <Text style={styles.value}>{survey.damageDescription}</Text>

            <Text style={styles.label}>Estimated Repair Cost</Text>

            <Text style={styles.value}>
              {survey.estimatedCost != null
                ? `₹${Number(survey.estimatedCost).toLocaleString("en-IN")}`
                : "Not provided"}
            </Text>

            <Text style={styles.label}>Created</Text>

            <Text style={styles.value}>
              {new Date(survey.createdAt).toLocaleString()}
            </Text>
          </View>

          {survey.status === "PENDING" && canComplete ? (
            <Pressable
              style={[styles.primaryButton, saving && styles.disabled]}
              disabled={saving}
              onPress={handleComplete}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Complete Survey</Text>
              )}
            </Pressable>
          ) : null}

          {survey.status === "COMPLETED" ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Survey Completed</Text>

              <Text style={styles.successText}>
                The claim is ready for adjudication.
              </Text>
            </View>
          ) : null}
        </>
      ) : canCreate ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create Assessment</Text>

          <Text style={styles.inputLabel}>Damage Description</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={damageDescription}
            onChangeText={setDamageDescription}
            placeholder="Describe the vehicle damage..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.inputLabel}>Estimated Repair Cost</Text>

          <TextInput
            style={styles.input}
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            placeholder="12500"
            keyboardType="decimal-pad"
          />

          <Pressable
            style={[styles.primaryButton, saving && styles.disabled]}
            disabled={saving}
            onPress={handleCreate}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Survey</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Survey Yet</Text>

          <Text style={styles.muted}>
            A survey has not been created for this claim.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
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
    color: "#6b7280",
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
    color: "#6b7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 14,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    lineHeight: 23,
  },
  status: {
    fontWeight: "700",
    fontSize: 13,
  },
  pending: {
    color: "#b45309",
  },
  completed: {
    color: "#15803d",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
  },
  textArea: {
    minHeight: 130,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991b1b",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 16,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },
  successText: {
    color: "#166534",
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
});
