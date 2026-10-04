import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { getPolicies, type Policy } from "@/services/policies";

export default function PoliciesScreen() {
  const { token } = useAuth();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    loadPolicies();
  }, [token]);

  async function loadPolicies() {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getPolicies(token);
      setPolicies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load policies");
    } finally {
      setIsLoading(false);
    }
  }

  function selectPolicy(policy: Policy) {
    router.replace({
      pathname: "/claims/new",
      params: {
        policyId: policy.id,
      },
    });
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable style={styles.button} onPress={loadPolicies}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Select Policy</Text>

        <Text style={styles.subtitle}>
          Choose the policy covering the vehicle involved in the incident.
        </Text>
      </View>

      {policies.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No policies found</Text>

          <Text style={styles.emptyText}>
            You don't have any policies available for claim submission.
          </Text>
        </View>
      ) : (
        <FlatList
          data={policies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => selectPolicy(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.policyNumber}>{item.policyNumber}</Text>

                <Text style={styles.status}>{item.status}</Text>
              </View>

              <Text style={styles.vehicle}>
                {item.vehicleMake ?? "Vehicle"} {item.vehicleModel ?? ""}
                {item.vehicleYear ? ` (${item.vehicleYear})` : ""}
              </Text>

              <Text style={styles.insurer}>{item.insurerName}</Text>

              <Text style={styles.dates}>
                {new Date(item.startDate).toLocaleDateString()} -{" "}
                {new Date(item.endDate).toLocaleDateString()}
              </Text>

              {item.coverages?.length > 0 && (
                <Text style={styles.coverage}>
                  Coverage:{" "}
                  {item.coverages
                    .map((coverage) => coverage.coverageType)
                    .join(", ")}
                </Text>
              )}

              <Text style={styles.selectText}>Select Policy →</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  header: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  back: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  list: {
    padding: 16,
    gap: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  policyNumber: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
  },

  status: {
    fontSize: 12,
    fontWeight: "600",
  },

  vehicle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },

  insurer: {
    marginTop: 6,
    fontSize: 14,
    color: "#555555",
  },

  dates: {
    marginTop: 10,
    fontSize: 12,
    color: "#777777",
  },

  coverage: {
    marginTop: 8,
    fontSize: 12,
    color: "#555555",
  },

  selectText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#208AEF",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  error: {
    textAlign: "center",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  buttonText: {
    color: "#FFFFFF",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#666666",
  },
});
