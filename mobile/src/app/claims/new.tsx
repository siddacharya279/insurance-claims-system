import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { createClaim } from "@/services/claims";

export default function NewClaimScreen() {
  const { token } = useAuth();
  const { policyId } = useLocalSearchParams<{ policyId?: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPolicyId = policyId ?? "";

  async function handleSubmit() {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    if (
      !title.trim() ||
      !description.trim() ||
      !incidentDate.trim() ||
      !incidentLocation.trim() ||
      !selectedPolicyId
    ) {
      setError("Please complete all fields and select a policy.");
      return;
    }

    const parsedDate = new Date(incidentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      setError(
        "Please enter a valid incident date, for example 2026-09-26T10:30:00.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const claim = await createClaim(
        {
          title: title.trim(),
          description: description.trim(),
          incidentDate: parsedDate.toISOString(),
          incidentLocation: incidentLocation.trim(),
          policyId: selectedPolicyId,
        },
        token,
      );

      router.replace(`/claims/${claim.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit claim");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Submit Claim</Text>

        <Text style={styles.subtitle}>
          Provide the details of the incident.
        </Text>

        <View style={styles.card}>
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Front bumper damaged"
          />

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what happened"
            multiline
          />

          <Field
            label="Incident Date"
            value={incidentDate}
            onChangeText={setIncidentDate}
            placeholder="2026-09-26T10:30:00"
          />

          <Field
            label="Incident Location"
            value={incidentLocation}
            onChangeText={setIncidentLocation}
            placeholder="e.g. Bhubaneswar, Odisha"
          />

          <View style={styles.selectedPolicy}>
            <Text style={styles.label}>Selected Policy</Text>

            <Text
              style={[
                styles.selectedPolicyText,
                !selectedPolicyId && styles.noPolicyText,
              ]}
            >
              {selectedPolicyId ? selectedPolicyId : "No policy selected"}
            </Text>

            <Pressable onPress={() => router.push("/policies")}>
              <Text style={styles.changePolicy}>
                {selectedPolicyId ? "Change Policy" : "Select Policy"}
              </Text>
            </Pressable>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit Claim</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        editable
      />
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
    paddingTop: 64,
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
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },

  field: {
    marginBottom: 18,
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
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },

  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  selectedPolicy: {
    marginBottom: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F2F6FA",
  },

  selectedPolicyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },

  noPolicyText: {
    color: "#777777",
    fontWeight: "400",
  },

  changePolicy: {
    fontSize: 14,
    fontWeight: "600",
    color: "#208AEF",
  },

  error: {
    marginTop: 12,
    color: "#B00020",
    fontSize: 14,
  },

  submitButton: {
    marginTop: 20,
    backgroundColor: "#208AEF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
