import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import notificationsService from "../../services/notifications.service";

const notificationLabels: Record<string, string> = {
  SURVEY_COMPLETED: "Survey Completed",
  CLAIM_APPROVED: "Claim Approved",
  CLAIM_REJECTED: "Claim Rejected",
  REPAIR_STARTED: "Repair Started",
  REPAIR_COMPLETED: "Repair Completed",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_COMPLETED: "Payment Completed",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.getMyNotifications,
  });
  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread"],
      });
    },
  });
  if (isLoading) {
    return <CircularProgress />;
  }
  if (isError) {
    return <Alert severity="error">Unable to load notifications.</Alert>;
  }
  const unreadCount =
    notifications?.filter((notification) => !notification.isRead).length ?? 0;
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">Notifications</Typography>
          <Typography color="text.secondary">
            Claim updates and important actions.
          </Typography>
        </Box>
        <Chip
          label={`${unreadCount} unread`}
          color={unreadCount > 0 ? "primary" : "default"}
        />
      </Box>
      {!notifications || notifications.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            No notifications available.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Paper
              key={notification.id}
              sx={{
                p: 3,
                borderLeft: notification.isRead ? undefined : "4px solid",
                borderColor: notification.isRead ? undefined : "primary.main",
                backgroundColor: notification.isRead
                  ? "background.paper"
                  : "action.hover",
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="h6">
                    {notificationLabels[notification.type] ??
                      notification.type.replaceAll("_", " ")}
                  </Typography>
                  {!notification.isRead && (
                    <Chip label="Unread" size="small" color="primary" />
                  )}
                </Box>
                <Typography>{notification.message}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={
                      notification.isRead || markAsReadMutation.isPending
                    }
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                  >
                    {notification.isRead ? "Read" : "Mark as Read"}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
