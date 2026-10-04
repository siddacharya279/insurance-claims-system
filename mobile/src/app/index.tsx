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
import { getClaims, type Claim, type ClaimStatus } from "@/services/claims";

const STATUS_LABELS: Record<ClaimStatus, string> = {
  SUBMITTED: "Submitted",
  CASE_ASSIGNED: "Case Assigned",
  SURVEY_PENDING: "Survey Pending",
  SURVEY_COMPLETED: "Survey Completed",
  ADJUDICATION_PENDING: "Adjudication Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REPAIR_IN_PROGRESS: "Repair In Progress",
  REPAIR_COMPLETED: "Repair Completed",
  PAYMENT_PENDING: "Payment Pending",
  CLOSED: "Closed",
};

export default function HomeScreen() {
  const { user, token, logout } = useAuth();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadClaims();
  }, [token]);

  async function loadClaims() {
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await getClaims(token);
      setClaims(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load claims");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function renderClaim({ item }: { item: Claim }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/claims/[id]",
            params: {
              id: item.id,
            },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.claimNumber}>{item.claimNumber}</Text>

          <Text style={styles.status}>{STATUS_LABELS[item.status]}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <Text style={styles.date}>
          Incident: {new Date(item.incidentDate).toLocaleDateString()}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Claims</Text>
          <Text style={styles.subtitle}>
            {user?.firstName} {user?.lastName}
          </Text>
        </View>

        <Pressable onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={loadClaims}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : claims.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No claims yet</Text>
          <Text style={styles.emptyText}>
            Your submitted claims will appear here.
          </Text>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.newClaimButton}
            onPress={() => router.push("/claims/new")}
          >
            <Text style={styles.newClaimText}>+ Submit New Claim</Text>
          </Pressable>
          <FlatList
            data={claims}
            keyExtractor={(item) => item.id}
            renderItem={renderClaim}
            contentContainerStyle={styles.list}
            refreshing={isLoading}
            onRefresh={loadClaims}
          />
        </>
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
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: "#666666",
  },
  logout: {
    fontSize: 15,
    fontWeight: "600",
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
  claimNumber: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: "#444444",
  },
  date: {
    marginTop: 12,
    fontSize: 12,
    color: "#777777",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  error: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#208AEF",
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  newClaimButton: {
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: "#208AEF",
    alignItems: "center",
  },
  newClaimText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
