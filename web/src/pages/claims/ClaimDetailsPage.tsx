import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import claimsService from "../../services/claims.service";
import ClaimStatusChip from "../../components/common/ClaimStatusChip";
import ClaimDocuments from "../../components/documents/ClaimDocuments";
import AssignWorkshopDialog from "../../components/common/AssignWorkshopDialog";
import workshopsService from "../../services/workshops.service";
import authService from "../../services/auth.service";

const claimSteps = [
  "SUBMITTED",
  "CASE_ASSIGNED",
  "SURVEY_PENDING",
  "SURVEY_COMPLETED",
  "ADJUDICATION_PENDING",
  "APPROVED",
  "REPAIR_IN_PROGRESS",
  "REPAIR_COMPLETED",
  "PAYMENT_PENDING",
  "CLOSED",
];

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  CASE_ASSIGNED: "Case Assigned",
  SURVEY_PENDING: "Survey Pending",
  SURVEY_COMPLETED: "Survey Completed",
  ADJUDICATION_PENDING: "Adjudication Pending",
  APPROVED: "Approved",
  REPAIR_IN_PROGRESS: "Repair In Progress",
  REPAIR_COMPLETED: "Repair Completed",
  PAYMENT_PENDING: "Payment Pending",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

export default function ClaimDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const {
    data: claim,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["claim", id],
    queryFn: () => claimsService.getClaim(id!),
    enabled: !!id,
  });
  const { data: workshop, isLoading: workshopLoading } = useQuery({
    queryKey: ["workshop", claim?.workshopId],
    queryFn: () => workshopsService.getWorkshop(claim!.workshopId!),
    enabled: !!claim?.workshopId,
  });
  if (isLoading) {
    return <CircularProgress />;
  }
  if (isError || !claim) {
    return <Alert severity="error">Unable to load claim.</Alert>;
  }
  const isRejected = claim.status === "REJECTED";
  const currentStep = claimSteps.indexOf(claim.status);

  const userRole = authService.getRole();
  const canAssignWorkshop = userRole === "ADMIN" || userRole === "CASE_MANAGER";

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/claims")}
        sx={{ mb: 2 }}
      >
        Back to Claims
      </Button>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Claim Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Claim Progress
        </Typography>
        {isRejected ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            This claim has been rejected.
          </Alert>
        ) : (
          <Stepper
            activeStep={currentStep}
            orientation="vertical"
            sx={{ mt: 2 }}
          >
            {claimSteps.map((step) => (
              <Step key={step}>
                <StepLabel>{statusLabels[step] ?? step}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          General Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2">Claim Number</Typography>
            <Typography>{claim.claimNumber}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2">Status</Typography>
            <ClaimStatusChip status={claim.status} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2">Incident Date</Typography>
            <Typography>
              {new Date(claim.incidentDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2">Incident Location</Typography>
            <Typography>{claim.incidentLocation}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography>{claim.description}</Typography>
      </Paper>
      <ClaimDocuments claimId={claim.id} />
      <AssignWorkshopDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        claimId={claim.id}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Workshop</Typography>
          {!claim.workshopId && canAssignWorkshop && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setAssignDialogOpen(true)}
            >
              Assign Workshop
            </Button>
          )}
        </Box>
        {claim.workshopId ? (
          <>
            {workshopLoading ? (
              <CircularProgress size={24} />
            ) : workshop ? (
              <Stack spacing={1}>
                <Typography variant="h6">{workshop.name}</Typography>
                <Typography>{workshop.address}</Typography>
                <Typography>
                  {workshop.city}, {workshop.state}
                </Typography>
                <Typography>{workshop.phoneNumber}</Typography>
                <Typography>{workshop.email}</Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/workshops/${workshop.id}`)}
                >
                  View Workshop
                </Button>
              </Stack>
            ) : (
              <Typography color="error">
                Unable to load workshop details.
              </Typography>
            )}
          </>
        ) : (
          <Typography color="text.secondary">
            No workshop assigned yet.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
