import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import reportingService from "../../services/reporting.service";

const statusLabels: Record<string, string> = {
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

export default function ReportingPage() {
  const statusQuery = useQuery({
    queryKey: ["reporting", "status-summary"],
    queryFn: reportingService.getClaimStatusSummary,
  });
  const volumeQuery = useQuery({
    queryKey: ["reporting", "claim-volume"],
    queryFn: () => reportingService.getClaimVolume(),
  });
  const adjudicationQuery = useQuery({
    queryKey: ["reporting", "adjudication-summary"],
    queryFn: reportingService.getAdjudicationSummary,
  });
  const repairPaymentQuery = useQuery({
    queryKey: ["reporting", "repair-payment-summary"],
    queryFn: reportingService.getRepairPaymentSummary,
  });
  const processingQuery = useQuery({
    queryKey: ["reporting", "average-processing-time"],
    queryFn: reportingService.getAverageProcessingTime,
  });
  const isLoading =
    statusQuery.isLoading ||
    volumeQuery.isLoading ||
    adjudicationQuery.isLoading ||
    repairPaymentQuery.isLoading ||
    processingQuery.isLoading;
  const isError =
    statusQuery.isError ||
    volumeQuery.isError ||
    adjudicationQuery.isError ||
    repairPaymentQuery.isError ||
    processingQuery.isError;
  if (isLoading) {
    return <CircularProgress />;
  }
  if (isError) {
    return (
      <Alert severity="error">
        Unable to load reporting data. Please check your reporting access and
        backend logs.
      </Alert>
    );
  }
  const statusSummary = statusQuery.data!;
  const adjudication = adjudicationQuery.data!;
  const repairPayment = repairPaymentQuery.data!;
  const processing = processingQuery.data!;
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Reporting
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Claims processing and operational summary.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Total Claims
            </Typography>
            <Typography variant="h3">{statusSummary.totalClaims}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
            <Typography variant="h3">{adjudication.approved}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Closed
            </Typography>
            <Typography variant="h3">{repairPayment.closed}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Avg. Processing
            </Typography>
            <Typography variant="h3">
              {processing.averageProcessingTimeHours.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              hours
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Claim Status Summary
        </Typography>
        {statusSummary.claimsByStatus.length > 0 ? (
          <Grid container spacing={2}>
            {statusSummary.claimsByStatus.map((item) => (
              <Grid key={item.status} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {statusLabels[item.status] ??
                      item.status.replaceAll("_", " ")}
                  </Typography>
                  <Typography variant="h5">{item.count}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            No claim status data available.
          </Typography>
        )}
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Claim Volume
        </Typography>
        {volumeQuery.data && volumeQuery.data.length > 0 ? (
          <Stack spacing={1}>
            {volumeQuery.data.map((item) => (
              <Box
                key={item.date}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 1,
                }}
              >
                <Typography>
                  {new Date(item.date).toLocaleDateString()}
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {item.count}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No claim volume data available.
          </Typography>
        )}
      </Paper>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Adjudication Summary
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Approved</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {adjudication.approved}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Rejected</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {adjudication.rejected}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Total Adjudicated</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {adjudication.totalAdjudicated}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Repair & Payment Summary
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Repair In Progress</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {repairPayment.repairInProgress}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Repair Completed</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {repairPayment.repairCompleted}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Payment Pending</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {repairPayment.paymentPending}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Closed</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {repairPayment.closed}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Processing Time
        </Typography>
        <Typography>
          Closed Claims: <strong>{processing.closedClaims}</strong>
        </Typography>
        <Typography>
          Average Processing Time:{" "}
          <strong>
            {processing.averageProcessingTimeHours.toFixed(2)} hours
          </strong>
        </Typography>
      </Paper>
    </Box>
  );
}
