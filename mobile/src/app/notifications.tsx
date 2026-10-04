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
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from "@/services/notifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(
    async (refresh = false) => {
      if (!token) {
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

        const result = await getNotifications(token);
        setNotifications(result);
      } catch (err: any) {
        setError(err?.message ?? "Unable to load notifications.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    if (token && !notification.isRead) {
      try {
        await markNotificationAsRead(notification.id, token);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item,
          ),
        );
      } catch {
        // Keep navigation working even if marking as read fails.
      }
    }

    if (notification.claimId) {
      router.push({
        pathname: "/claims/[id]",
        params: {
          id: notification.claimId,
        },
      });
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading notifications...</Text>
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
          onRefresh={() => loadNotifications(true)}
        />
      }
    >
      <Text style={styles.title}>Notifications</Text>

      <Text style={styles.subtitle}>{unreadCount} unread</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadNotifications()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Notifications</Text>

          <Text style={styles.muted}>
            You don't have any notifications yet.
          </Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <Pressable
            key={notification.id}
            style={[styles.card, !notification.isRead && styles.unreadCard]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.type}>{notification.type}</Text>

              {!notification.isRead ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>NEW</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.message}>{notification.message}</Text>

            <Text style={styles.date}>
              {new Date(notification.createdAt).toLocaleString()}
            </Text>

            {notification.claimId ? (
              <Text style={styles.claimLink}>View Claim →</Text>
            ) : null}
          </Pressable>
        ))
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
  },
  muted: {
    color: "#6b7280",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  type: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  badge: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  message: {
    fontSize: 16,
    lineHeight: 23,
  },
  date: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 10,
  },
  claimLink: {
    fontWeight: "700",
    marginTop: 12,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: "#991b1b",
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
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
  },
});
