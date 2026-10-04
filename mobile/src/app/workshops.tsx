import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  assignWorkshop,
  getWorkshops,
  type Workshop,
} from "@/services/workshops";

export default function WorkshopsScreen() {
  const { token } = useAuth();

  const { claimId } = useLocalSearchParams<{
    claimId?: string;
  }>();

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    loadWorkshops();
  }, [token]);

  async function loadWorkshops() {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getWorkshops(token);

      setWorkshops(data.filter((workshop) => workshop.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load workshops");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectWorkshop(workshop: Workshop) {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    if (!claimId) {
      setError("This workshop selection must be opened from a claim.");
      return;
    }

    try {
      setSelectingId(workshop.id);
      setError(null);

      await assignWorkshop(claimId, workshop.id, token);

      router.replace({
        pathname: "/claims/[id]",
        params: {
          id: claimId,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to select workshop",
      );
    } finally {
      setSelectingId(null);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && workshops.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable style={styles.retryButton} onPress={loadWorkshops}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
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

        <Text style={styles.title}>Select Workshop</Text>

        <Text style={styles.subtitle}>
          Choose a workshop for your vehicle repair.
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {workshops.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No workshops available</Text>

          <Text style={styles.emptyText}>
            There are currently no active workshops available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelecting = selectingId === item.id;

            return (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>

                <Text style={styles.address}>{item.address}</Text>

                <Text style={styles.location}>
                  {item.city}, {item.state}
                </Text>

                <Text style={styles.phone}>Phone: {item.phoneNumber}</Text>

                {item.email && (
                  <Text style={styles.email}>Email: {item.email}</Text>
                )}

                <Pressable
                  style={[
                    styles.selectButton,
                    isSelecting && styles.selectButtonDisabled,
                  ]}
                  onPress={() => handleSelectWorkshop(item)}
                  disabled={selectingId !== null}
                >
                  {isSelecting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.selectButtonText}>Select Workshop</Text>
                  )}
                </Pressable>
              </View>
            );
          }}
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

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  address: {
    marginTop: 10,
    fontSize: 14,
    color: "#444444",
  },

  location: {
    marginTop: 4,
    fontSize: 14,
    color: "#555555",
  },

  phone: {
    marginTop: 10,
    fontSize: 13,
    color: "#666666",
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    color: "#666666",
  },

  selectButton: {
    marginTop: 16,
    backgroundColor: "#208AEF",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },

  selectButtonDisabled: {
    opacity: 0.7,
  },

  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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

  errorBanner: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FDECEC",
  },

  errorBannerText: {
    color: "#B00020",
    fontSize: 13,
  },

  retryButton: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  backButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  backButtonText: {
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
});
