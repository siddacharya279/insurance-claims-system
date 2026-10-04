import { useCallback, useEffect, useState } from "react";
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
  checkRentalEligibility,
  createRentalSelection,
  getRentalSelection,
  RentalVehicle,
  RentalVehicleSelection,
} from "@/services/rental-vehicles";

export default function RentalVehiclesScreen() {
  const { claimId } = useLocalSearchParams<{ claimId?: string }>();
  const { token } = useAuth();

  const [eligibility, setEligibility] = useState<Awaited<
    ReturnType<typeof checkRentalEligibility>
  > | null>(null);
  const [selection, setSelection] = useState<RentalVehicleSelection | null>(
    null,
  );

  const [selectedVehicle, setSelectedVehicle] = useState<RentalVehicle | null>(
    null,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!claimId || !token) {
      setError("Claim information is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [eligibilityResult, selectionResult] = await Promise.all([
        checkRentalEligibility(claimId, token),
        getRentalSelection(claimId, token),
      ]);

      setEligibility(eligibilityResult);
      setSelection(selectionResult);

      if (selectionResult) {
        setStartDate(selectionResult.startDate.slice(0, 10));
        setEndDate(selectionResult.endDate?.slice(0, 10) ?? "");
        setNotes(selectionResult.notes ?? "");

        if (selectionResult.rentalVehicle) {
          setSelectedVehicle(selectionResult.rentalVehicle);
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Unable to load rental vehicle information.");
    } finally {
      setLoading(false);
    }
  }, [claimId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSelect() {
    if (!claimId || !token) return;

    if (!selectedVehicle) {
      setError("Please select a rental vehicle.");
      return;
    }

    if (!startDate.trim()) {
      setError("Please enter a rental start date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await createRentalSelection(
        claimId,
        {
          rentalVehicleId: selectedVehicle.id,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate.trim() ? new Date(endDate).toISOString() : undefined,
          notes: notes.trim() || undefined,
        },
        token,
      );

      setSelection(result);
      setSelectedVehicle(result.rentalVehicle);
    } catch (err: any) {
      setError(err?.message ?? "Unable to select rental vehicle.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading rental options...</Text>
      </View>
    );
  }

  if (error && !eligibility) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable style={styles.primaryButton} onPress={loadData}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!eligibility?.eligible) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Rental Vehicle</Text>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Not Eligible</Text>
          <Text style={styles.warningText}>
            {eligibility?.reason ?? "Rental vehicle coverage is not available."}
          </Text>
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            router.replace({
              pathname: "/claims/[id]",
              params: { id: claimId ?? "" },
            })
          }
        >
          <Text style={styles.secondaryButtonText}>Back to Claim</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const vehicles = eligibility.vehicles ?? [];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Rental Vehicle</Text>

      <Text style={styles.subtitle}>
        Select a rental vehicle covered by your policy.
      </Text>

      <View style={styles.coverageCard}>
        <Text style={styles.cardTitle}>Coverage</Text>

        <Text style={styles.cardText}>
          Policy: {eligibility.policyNumber ?? eligibility.policyId}
        </Text>

        <Text style={styles.cardText}>
          Coverage: {eligibility.coverageType ?? "Rental Vehicle"}
        </Text>

        <Text style={styles.cardText}>
          Limit:{" "}
          {eligibility.rentalVehicleLimit != null
            ? `₹${eligibility.rentalVehicleLimit.toLocaleString()}`
            : "Not specified"}
        </Text>
      </View>

      {selection && (
        <View style={styles.selectedCard}>
          <Text style={styles.cardTitle}>Current Selection</Text>

          <Text style={styles.vehicleName}>
            {selection.rentalVehicle.make} {selection.rentalVehicle.model}
          </Text>

          <Text style={styles.cardText}>Status: {selection.status}</Text>

          <Text style={styles.cardText}>
            Start: {selection.startDate.slice(0, 10)}
          </Text>

          {selection.endDate && (
            <Text style={styles.cardText}>
              End: {selection.endDate.slice(0, 10)}
            </Text>
          )}

          <Text style={styles.cardText}>
            Daily rate: ₹{selection.dailyRate.toLocaleString()}
          </Text>

          {selection.estimatedTotal != null && (
            <Text style={styles.cardText}>
              Estimated total: ₹{selection.estimatedTotal.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Available Vehicles</Text>

      {vehicles.length === 0 ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            No rental vehicles are currently available.
          </Text>
        </View>
      ) : (
        vehicles.map((vehicle) => {
          const selected = selectedVehicle?.id === vehicle.id;

          return (
            <Pressable
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                selected && styles.vehicleCardSelected,
              ]}
              onPress={() => setSelectedVehicle(vehicle)}
              disabled={!vehicle.isAvailable || !!selection}
            >
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleName}>
                  {vehicle.make} {vehicle.model}
                </Text>

                {selected && <Text style={styles.selectedLabel}>SELECTED</Text>}
              </View>

              <Text style={styles.cardText}>Type: {vehicle.vehicleType}</Text>

              <Text style={styles.cardText}>
                Daily rate: ₹{vehicle.dailyRate.toLocaleString()}
              </Text>

              {vehicle.securityDeposit != null && (
                <Text style={styles.cardText}>
                  Security deposit: ₹{vehicle.securityDeposit.toLocaleString()}
                </Text>
              )}

              {vehicle.description && (
                <Text style={styles.description}>{vehicle.description}</Text>
              )}
            </Pressable>
          );
        })
      )}

      {!selection && vehicles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Rental Period</Text>

          <Text style={styles.label}>Start date</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />

          <Text style={styles.label}>End date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD (optional)"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes"
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={handleSelect}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Select Rental Vehicle
              </Text>
            )}
          </Pressable>
        </>
      )}

      {selection && (
        <Pressable style={styles.secondaryButton} onPress={loadData}>
          <Text style={styles.secondaryButtonText}>Refresh</Text>
        </Pressable>
      )}

      <Pressable
        style={styles.linkButton}
        onPress={() =>
          router.replace({
            pathname: "/claims/[id]",
            params: { id: claimId ?? "" },
          })
        }
      >
        <Text style={styles.linkText}>Back to Claim</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  coverageCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginBottom: 16,
  },
  selectedCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#e8f5e9",
    marginBottom: 8,
  },
  vehicleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  vehicleCardSelected: {
    borderWidth: 2,
    borderColor: "#1976d2",
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff3cd",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: "#664d03",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
  },
  error: {
    color: "#c62828",
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
