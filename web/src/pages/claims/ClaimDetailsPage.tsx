import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import claimsService from "../../services/claims.service";
import ClaimStatusChip from "../../components/common/ClaimStatusChip";
import ClaimDocuments from "../../components/documents/ClaimDocuments";
import AssignWorkshopDialog from "../../components/common/AssignWorkshopDialog";
import workshopsService from "../../services/workshops.service";
import appointmentsService from "../../services/appointments.service";
import surveysService from "../../services/surveys.service";
import adjudicationService from "../../services/adjudication.service";
import rentalVehiclesService from "../../services/rental-vehicles.service";
import workshopRepairService from "../../services/workshop-repair.service";
import paymentsService from "../../services/payments.service";
import authService from "../../services/auth.service";
import type {
  RentalEligibility,
  RentalVehicle,
} from "../../services/rental-vehicles.service";

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
  const queryClient = useQueryClient();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [appointmentSubmitting, setAppointmentSubmitting] = useState(false);
  const [adjudicationDecision, setAdjudicationDecision] = useState<
    "APPROVED" | "REJECTED"
  >("APPROVED");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [adjudicationError, setAdjudicationError] = useState("");
  const [adjudicationSubmitting, setAdjudicationSubmitting] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [rentalEndDate, setRentalEndDate] = useState("");
  const [rentalNotes, setRentalNotes] = useState("");
  const [rentalError, setRentalError] = useState("");
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [repairAction, setRepairAction] = useState<
    "start" | "update" | "complete" | null
  >(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [repairNotes, setRepairNotes] = useState("");
  const [finalBillAmount, setFinalBillAmount] = useState("");
  const [repairError, setRepairError] = useState("");
  const [repairSubmitting, setRepairSubmitting] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
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
  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ["appointment", claim?.id],
    queryFn: () => appointmentsService.getAppointment(claim!.id),
    enabled: !!claim?.id,
    retry: false,
  });
  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ["survey", claim?.id],
    queryFn: () => surveysService.getSurvey(claim!.id),
    enabled: !!claim?.id,
    retry: false,
  });
  const { data: adjudication, isLoading: adjudicationLoading } = useQuery({
    queryKey: ["adjudication", claim?.id],
    queryFn: () => adjudicationService.getAdjudication(claim!.id),
    enabled: !!claim?.id,
    retry: false,
  });
  const { data: rentalEligibility, isLoading: rentalEligibilityLoading } =
    useQuery<RentalEligibility>({
      queryKey: ["rental-eligibility", claim?.id],
      queryFn: () => rentalVehiclesService.checkEligibility(claim!.id),
      enabled: !!claim?.id,
      retry: false,
    });
  const { data: rentalSelection, isLoading: rentalSelectionLoading } = useQuery(
    {
      queryKey: ["rental-selection", claim?.id],
      queryFn: () => rentalVehiclesService.getSelection(claim!.id),
      enabled: !!claim?.id,
      retry: false,
    },
  );
  const { data: repair, isLoading: repairLoading } = useQuery({
    queryKey: ["repair", claim?.id],
    queryFn: () => workshopRepairService.getRepairByClaimId(claim!.id),
    enabled: !!claim?.id,
    retry: false,
  });
  const { data: payment, isLoading: paymentLoading } = useQuery({
    queryKey: ["payment", claim?.id],
    queryFn: () => paymentsService.getPaymentByClaimId(claim!.id),
    enabled: !!claim?.id,
    retry: false,
  });
  const startRepairMutation = useMutation({
    mutationFn: () =>
      workshopRepairService.startRepair(claim!.id, {
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate).toISOString()
          : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["repair", claim!.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["claim", claim!.id],
      });
      setRepairDialogOpen(false);
      setRepairAction(null);
      setExpectedDeliveryDate("");
      setRepairNotes("");
      setRepairError("");
    },
    onError: (error: any) => {
      setRepairError(
        error?.response?.data?.message || "Unable to start the repair.",
      );
    },
    onSettled: () => {
      setRepairSubmitting(false);
    },
  });
  const updateRepairMutation = useMutation({
    mutationFn: () => {
      if (!repair) {
        throw new Error("Repair details are not available.");
      }
      return workshopRepairService.updateRepair(repair.id, {
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate).toISOString()
          : undefined,
        repairNotes: repairNotes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["repair", claim!.id],
      });
      setRepairDialogOpen(false);
      setRepairAction(null);
      setExpectedDeliveryDate("");
      setRepairNotes("");
      setRepairError("");
    },
    onError: (error: any) => {
      setRepairError(
        error?.response?.data?.message || "Unable to update the repair.",
      );
    },
    onSettled: () => {
      setRepairSubmitting(false);
    },
  });
  const completeRepairMutation = useMutation({
    mutationFn: () => {
      if (!repair) {
        throw new Error("Repair details are not available.");
      }
      return workshopRepairService.completeRepair(repair.id, {
        finalBillAmount: Number(finalBillAmount),
        repairNotes: repairNotes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["repair", claim!.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["claim", claim!.id],
      });
      setRepairDialogOpen(false);
      setRepairAction(null);
      setFinalBillAmount("");
      setRepairNotes("");
      setRepairError("");
    },
    onError: (error: any) => {
      setRepairError(
        error?.response?.data?.message || "Unable to complete the repair.",
      );
    },
    onSettled: () => {
      setRepairSubmitting(false);
    },
  });
  const createPaymentMutation = useMutation({
    mutationFn: () =>
      paymentsService.createPayment(claim!.id, {
        paymentMethod,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["payment", claim!.id],
      });
      setPaymentError("");
      setTransactionReference("");
    },
    onError: (error: any) => {
      setPaymentError(
        error?.response?.data?.message || "Unable to initiate payment.",
      );
    },
    onSettled: () => {
      setPaymentSubmitting(false);
    },
  });
  const completePaymentMutation = useMutation({
    mutationFn: () => {
      if (!payment) {
        throw new Error("Payment details are not available.");
      }
      return paymentsService.completePayment(payment.id, {
        transactionReference: transactionReference.trim(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["payment", claim!.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["claim", claim!.id],
      });
      setPaymentDialogOpen(false);
      setPaymentError("");
      setTransactionReference("");
    },
    onError: (error: any) => {
      setPaymentError(
        error?.response?.data?.message || "Unable to complete payment.",
      );
    },
    onSettled: () => {
      setPaymentSubmitting(false);
    },
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
  const canCreateAppointment =
    userRole === "CUSTOMER" &&
    !!claim.workshopId &&
    !appointment &&
    ["CASE_ASSIGNED", "SURVEY_PENDING", "SURVEY_COMPLETED"].includes(
      claim.status,
    );
  const canCompleteSurvey =
    !!survey &&
    survey.status !== "COMPLETED" &&
    (userRole === "ADMIN" || userRole === "SURVEYOR");
  const canAdjudicate =
    (userRole === "ADMIN" || userRole === "ADJUSTER") &&
    !adjudication &&
    claim.status === "ADJUDICATION_PENDING";
  const canSelectRentalVehicle =
    userRole === "CUSTOMER" &&
    rentalEligibility?.eligible === true &&
    !rentalSelection &&
    claim.status === "APPROVED";
  const canStartRepair =
    userRole === "WORKSHOP" && !repair && claim.status === "APPROVED";
  const canUpdateRepair =
    userRole === "WORKSHOP" &&
    !!repair &&
    repair.status === "IN_PROGRESS" &&
    claim.status === "REPAIR_IN_PROGRESS";
  const canCompleteRepair =
    userRole === "WORKSHOP" &&
    !!repair &&
    repair.status === "IN_PROGRESS" &&
    claim.status === "REPAIR_IN_PROGRESS";
  const canInitiatePayment =
    userRole === "CUSTOMER" && claim.status === "PAYMENT_PENDING" && !payment;
  const canCompletePayment =
    userRole === "CUSTOMER" &&
    !!payment &&
    payment.status === "PENDING" &&
    claim.status === "PAYMENT_PENDING";
  const handleCreateAppointment = async () => {
    if (!appointmentDate || !claim.workshopId) {
      return;
    }
    setAppointmentError("");
    setAppointmentSubmitting(true);
    try {
      await appointmentsService.createAppointment(claim.id, {
        appointmentDate: new Date(appointmentDate).toISOString(),
        workshopId: claim.workshopId,
      });
      await queryClient.invalidateQueries({
        queryKey: ["appointment", claim.id],
      });
      setAppointmentDate("");
    } catch (error: any) {
      setAppointmentError(
        error?.response?.data?.message || "Unable to schedule the appointment.",
      );
    } finally {
      setAppointmentSubmitting(false);
    }
  };
  const handleCompleteSurvey = async () => {
    if (!survey) {
      return;
    }
    try {
      await surveysService.completeSurvey(survey.id);
      await queryClient.invalidateQueries({
        queryKey: ["survey", claim.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["claim", claim.id],
      });
    } catch {
      // Query state will remain unchanged if completion fails.
    }
  };
  const handleAdjudicate = async () => {
    if (!decisionReason.trim()) {
      setAdjudicationError("Decision reason is required.");
      return;
    }
    if (
      adjudicationDecision === "APPROVED" &&
      (!approvedAmount || Number(approvedAmount) <= 0)
    ) {
      setAdjudicationError("Approved amount must be greater than zero.");
      return;
    }
    setAdjudicationError("");
    setAdjudicationSubmitting(true);
    try {
      await adjudicationService.adjudicate(claim.id, {
        decision: adjudicationDecision,
        decisionReason: decisionReason.trim(),
        ...(adjudicationDecision === "APPROVED"
          ? { approvedAmount: Number(approvedAmount) }
          : {}),
      });
      await queryClient.invalidateQueries({
        queryKey: ["adjudication", claim.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["claim", claim.id],
      });
      setApprovedAmount("");
      setDecisionReason("");
    } catch (error: any) {
      setAdjudicationError(
        error?.response?.data?.message || "Unable to complete adjudication.",
      );
    } finally {
      setAdjudicationSubmitting(false);
    }
  };
  const handleCreateRentalSelection = async () => {
    if (!selectedVehicleId || !rentalStartDate) {
      setRentalError("Rental vehicle and start date are required.");
      return;
    }
    setRentalError("");
    setRentalSubmitting(true);
    try {
      await rentalVehiclesService.createSelection(claim.id, {
        rentalVehicleId: selectedVehicleId,
        startDate: new Date(rentalStartDate).toISOString(),
        ...(rentalEndDate
          ? { endDate: new Date(rentalEndDate).toISOString() }
          : {}),
        ...(rentalNotes.trim() ? { notes: rentalNotes.trim() } : {}),
      });
      await queryClient.invalidateQueries({
        queryKey: ["rental-selection", claim.id],
      });
      setSelectedVehicleId("");
      setRentalStartDate("");
      setRentalEndDate("");
      setRentalNotes("");
    } catch (error: any) {
      setRentalError(
        error?.response?.data?.message ||
          "Unable to select the rental vehicle.",
      );
    } finally {
      setRentalSubmitting(false);
    }
  };
  const openStartRepairDialog = () => {
    setRepairAction("start");
    setExpectedDeliveryDate("");
    setRepairNotes("");
    setFinalBillAmount("");
    setRepairError("");
    setRepairDialogOpen(true);
  };
  const openUpdateRepairDialog = () => {
    if (!repair) {
      return;
    }
    setRepairAction("update");
    setExpectedDeliveryDate(
      repair.expectedDeliveryDate
        ? new Date(repair.expectedDeliveryDate).toISOString().slice(0, 16)
        : "",
    );
    setRepairNotes(repair.repairNotes || "");
    setFinalBillAmount("");
    setRepairError("");
    setRepairDialogOpen(true);
  };
  const openCompleteRepairDialog = () => {
    if (!repair) {
      return;
    }
    setRepairAction("complete");
    setExpectedDeliveryDate("");
    setRepairNotes(repair.repairNotes || "");
    setFinalBillAmount(
      repair.finalBillAmount !== null ? String(repair.finalBillAmount) : "",
    );
    setRepairError("");
    setRepairDialogOpen(true);
  };
  const handleRepairSubmit = () => {
    if (repairAction === "start") {
      setRepairSubmitting(true);
      startRepairMutation.mutate();
      return;
    }
    if (repairAction === "update") {
      setRepairSubmitting(true);
      updateRepairMutation.mutate();
      return;
    }
    if (repairAction === "complete") {
      if (!finalBillAmount || Number(finalBillAmount) < 0) {
        setRepairError("Final bill amount must be zero or greater.");
        return;
      }
      setRepairSubmitting(true);
      completeRepairMutation.mutate();
    }
  };
  const openPaymentDialog = () => {
    setPaymentMethod("ONLINE");
    setTransactionReference("");
    setPaymentError("");
    setPaymentDialogOpen(true);
  };
  const handlePaymentSubmit = () => {
    setPaymentError("");
    if (!payment) {
      setPaymentSubmitting(true);
      createPaymentMutation.mutate();
      return;
    }
    if (!transactionReference.trim()) {
      setPaymentError("Transaction reference is required.");
      return;
    }
    setPaymentSubmitting(true);
    completePaymentMutation.mutate();
  };
  const selectedVehicle = rentalEligibility?.vehicles?.find(
    (vehicle: RentalVehicle) => vehicle.id === selectedVehicleId,
  );
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
      {claim.workshopId && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appointment
          </Typography>
          {appointmentLoading ? (
            <CircularProgress size={24} />
          ) : appointment ? (
            <Stack spacing={1}>
              <Typography>
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointmentDate).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Status:</strong> {appointment.status}
              </Typography>
            </Stack>
          ) : canCreateAppointment ? (
            <Stack spacing={2}>
              <Typography color="text.secondary">
                Schedule an appointment with the assigned workshop.
              </Typography>
              <TextField
                label="Appointment Date and Time"
                type="datetime-local"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              {appointmentError && (
                <Alert severity="error">{appointmentError}</Alert>
              )}
              <Box>
                <Button
                  variant="contained"
                  onClick={handleCreateAppointment}
                  disabled={!appointmentDate || appointmentSubmitting}
                >
                  {appointmentSubmitting
                    ? "Scheduling..."
                    : "Schedule Appointment"}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No appointment scheduled yet.
            </Typography>
          )}
        </Paper>
      )}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Survey
        </Typography>
        {surveyLoading ? (
          <CircularProgress size={24} />
        ) : survey ? (
          <Stack spacing={1}>
            <Typography>
              <strong>Survey Created:</strong>{" "}
              {new Date(survey.createdAt).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Status:</strong> {survey.status}
            </Typography>
            <Typography>
              <strong>Damage:</strong> {survey.damageDescription}
            </Typography>
            <Typography>
              <strong>Estimated Cost:</strong>{" "}
              {survey.estimatedCost !== null
                ? survey.estimatedCost.toLocaleString()
                : "Not provided"}
            </Typography>
            {canCompleteSurvey && (
              <Box sx={{ pt: 1 }}>
                <Button variant="contained" onClick={handleCompleteSurvey}>
                  Complete Survey
                </Button>
              </Box>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No survey information available yet.
          </Typography>
        )}
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Adjudication
        </Typography>
        {adjudicationLoading ? (
          <CircularProgress size={24} />
        ) : adjudication ? (
          <Stack spacing={1}>
            <Typography>
              <strong>Decision:</strong> {adjudication.decision}
            </Typography>
            <Typography>
              <strong>Approved Amount:</strong>{" "}
              {adjudication.approvedAmount !== null
                ? adjudication.approvedAmount.toLocaleString()
                : "Not applicable"}
            </Typography>
            <Typography>
              <strong>Reason:</strong> {adjudication.decisionReason}
            </Typography>
            <Typography>
              <strong>Decided At:</strong>{" "}
              {new Date(adjudication.decidedAt).toLocaleString()}
            </Typography>
          </Stack>
        ) : canAdjudicate ? (
          <Stack spacing={2}>
            <TextField
              select
              label="Decision"
              value={adjudicationDecision}
              onChange={(event) =>
                setAdjudicationDecision(
                  event.target.value as "APPROVED" | "REJECTED",
                )
              }
              fullWidth
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </TextField>
            {adjudicationDecision === "APPROVED" && (
              <TextField
                label="Approved Amount"
                type="number"
                value={approvedAmount}
                onChange={(event) => setApprovedAmount(event.target.value)}
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
                fullWidth
              />
            )}
            <TextField
              label="Decision Reason"
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            {adjudicationError && (
              <Alert severity="error">{adjudicationError}</Alert>
            )}
            <Box>
              <Button
                variant="contained"
                onClick={handleAdjudicate}
                disabled={adjudicationSubmitting}
              >
                {adjudicationSubmitting
                  ? "Submitting..."
                  : "Submit Adjudication"}
              </Button>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No adjudication information available yet.
          </Typography>
        )}
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Rental Vehicle
        </Typography>
        {rentalEligibilityLoading || rentalSelectionLoading ? (
          <CircularProgress size={24} />
        ) : rentalSelection ? (
          <Stack spacing={1}>
            <Typography variant="h6">
              {rentalSelection.rentalVehicle.make}{" "}
              {rentalSelection.rentalVehicle.model}
            </Typography>
            <Typography>
              <strong>Type:</strong> {rentalSelection.rentalVehicle.vehicleType}
            </Typography>
            <Typography>
              <strong>Start Date:</strong>{" "}
              {new Date(rentalSelection.startDate).toLocaleDateString()}
            </Typography>
            <Typography>
              <strong>End Date:</strong>{" "}
              {rentalSelection.endDate
                ? new Date(rentalSelection.endDate).toLocaleDateString()
                : "Not specified"}
            </Typography>
            <Typography>
              <strong>Daily Rate:</strong>{" "}
              {rentalSelection.dailyRate.toLocaleString()}
            </Typography>
            <Typography>
              <strong>Estimated Total:</strong>{" "}
              {rentalSelection.estimatedTotal !== null
                ? rentalSelection.estimatedTotal.toLocaleString()
                : "Not calculated"}
            </Typography>
            <Typography>
              <strong>Status:</strong> {rentalSelection.status}
            </Typography>
            {rentalSelection.notes && (
              <Typography>
                <strong>Notes:</strong> {rentalSelection.notes}
              </Typography>
            )}
          </Stack>
        ) : rentalEligibility?.eligible ? (
          <Stack spacing={2}>
            <Alert severity="info">
              Rental vehicle coverage is available under policy{" "}
              {rentalEligibility.policyNumber}.
              {rentalEligibility.rentalVehicleLimit !== null &&
                rentalEligibility.rentalVehicleLimit !== undefined &&
                ` Rental limit: ${rentalEligibility.rentalVehicleLimit.toLocaleString()}.`}
            </Alert>
            {canSelectRentalVehicle ? (
              <>
                <TextField
                  select
                  label="Rental Vehicle"
                  value={selectedVehicleId}
                  onChange={(event) => setSelectedVehicleId(event.target.value)}
                  fullWidth
                  slotProps={{
                    select: {
                      native: true,
                    },
                  }}
                >
                  <option value="">Select a vehicle</option>
                  {rentalEligibility.vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} -{" "}
                      {vehicle.dailyRate.toLocaleString()} / day
                    </option>
                  ))}
                </TextField>
                {selectedVehicle && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </Typography>
                      <Typography>
                        <strong>Type:</strong> {selectedVehicle.vehicleType}
                      </Typography>
                      <Typography>
                        <strong>Daily Rate:</strong>{" "}
                        {selectedVehicle.dailyRate.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Security Deposit:</strong>{" "}
                        {selectedVehicle.securityDeposit.toLocaleString()}
                      </Typography>
                      {selectedVehicle.description && (
                        <Typography color="text.secondary">
                          {selectedVehicle.description}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                )}
                <TextField
                  label="Rental Start Date"
                  type="date"
                  value={rentalStartDate}
                  onChange={(event) => setRentalStartDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  label="Rental End Date"
                  type="date"
                  value={rentalEndDate}
                  onChange={(event) => setRentalEndDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  label="Notes"
                  value={rentalNotes}
                  onChange={(event) => setRentalNotes(event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
                {rentalError && <Alert severity="error">{rentalError}</Alert>}
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleCreateRentalSelection}
                    disabled={
                      !selectedVehicleId || !rentalStartDate || rentalSubmitting
                    }
                  >
                    {rentalSubmitting
                      ? "Selecting..."
                      : "Select Rental Vehicle"}
                  </Button>
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">
                Rental vehicle selection is available after claim approval.
              </Typography>
            )}
          </Stack>
        ) : (
          <Alert severity="info">
            {rentalEligibility?.reason ||
              "Rental vehicle coverage is not available for this claim."}
          </Alert>
        )}
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Workshop Repair
        </Typography>
        {repairLoading ? (
          <CircularProgress size={24} />
        ) : repair ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Repair Status
              </Typography>
              <Typography variant="h6">
                {repair.status.replaceAll("_", " ")}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Started At
              </Typography>
              <Typography>
                {repair.startedAt
                  ? new Date(repair.startedAt).toLocaleString()
                  : "Not started"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Expected Delivery
              </Typography>
              <Typography>
                {repair.expectedDeliveryDate
                  ? new Date(repair.expectedDeliveryDate).toLocaleString()
                  : "Not provided"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Repair Notes
              </Typography>
              <Typography>
                {repair.repairNotes || "No repair notes provided"}
              </Typography>
            </Box>
            {repair.completedAt && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completed At
                </Typography>
                <Typography>
                  {new Date(repair.completedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
            {repair.finalBillAmount !== null && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Final Bill Amount
                </Typography>
                <Typography variant="h6">
                  ₹{repair.finalBillAmount.toLocaleString()}
                </Typography>
              </Box>
            )}
            {userRole === "WORKSHOP" && (
              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                {canUpdateRepair && (
                  <Button variant="outlined" onClick={openUpdateRepairDialog}>
                    Update Repair
                  </Button>
                )}
                {canCompleteRepair && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={openCompleteRepairDialog}
                  >
                    Complete Repair
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        ) : canStartRepair ? (
          <Stack spacing={2}>
            <Typography color="text.secondary">
              This claim has been approved and is ready for workshop repair.
            </Typography>
            <Box>
              <Button variant="contained" onClick={openStartRepairDialog}>
                Start Repair
              </Button>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No repair information available yet.
          </Typography>
        )}
      </Paper>
      <Dialog
        open={repairDialogOpen}
        onClose={() => {
          if (!repairSubmitting) {
            setRepairDialogOpen(false);
            setRepairAction(null);
            setRepairError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {repairAction === "start" && "Start Repair"}
          {repairAction === "update" && "Update Repair"}
          {repairAction === "complete" && "Complete Repair"}
        </DialogTitle>
        <DialogContent>
          {repairAction === "start" && (
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Starting the repair will move the claim from Approved to Repair In
              Progress.
            </Typography>
          )}
          {repairAction !== "complete" && (
            <TextField
              fullWidth
              margin="normal"
              label="Expected Delivery Date"
              type="datetime-local"
              value={expectedDeliveryDate}
              onChange={(event) => setExpectedDeliveryDate(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          )}
          {repairAction === "complete" && (
            <TextField
              fullWidth
              required
              margin="normal"
              label="Final Bill Amount"
              type="number"
              value={finalBillAmount}
              onChange={(event) => setFinalBillAmount(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
            />
          )}
          <TextField
            fullWidth
            multiline
            minRows={3}
            margin="normal"
            label="Repair Notes"
            value={repairNotes}
            onChange={(event) => setRepairNotes(event.target.value)}
          />
          {repairError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {repairError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRepairDialogOpen(false);
              setRepairAction(null);
              setRepairError("");
            }}
            disabled={repairSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={repairAction === "complete" ? "success" : "primary"}
            onClick={handleRepairSubmit}
            disabled={
              repairSubmitting ||
              (repairAction === "complete" &&
                (!finalBillAmount || Number(finalBillAmount) < 0))
            }
          >
            {repairSubmitting
              ? "Saving..."
              : repairAction === "start"
                ? "Start Repair"
                : repairAction === "update"
                  ? "Save Changes"
                  : "Complete Repair"}
          </Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment
        </Typography>
        {paymentLoading ? (
          <CircularProgress size={24} />
        ) : payment ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Payment Status
              </Typography>
              <Typography variant="h6">{payment.status}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="h6">
                ₹{payment.amount.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography>{payment.paymentMethod}</Typography>
            </Box>
            {payment.transactionReference && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Transaction Reference
                </Typography>
                <Typography>{payment.transactionReference}</Typography>
              </Box>
            )}
            {payment.paidAt && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Paid At
                </Typography>
                <Typography>
                  {new Date(payment.paidAt).toLocaleString()}
                </Typography>
              </Box>
            )}
            {canCompletePayment && (
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  onClick={openPaymentDialog}
                >
                  Complete Payment
                </Button>
              </Box>
            )}
          </Stack>
        ) : canInitiatePayment ? (
          <Stack spacing={2}>
            <Alert severity="info">
              Your repair is complete and payment is now required.
            </Alert>
            {repair?.finalBillAmount !== null &&
              repair?.finalBillAmount !== undefined && (
                <Typography variant="h5">
                  Amount Due: ₹{repair.finalBillAmount.toLocaleString()}
                </Typography>
              )}
            <Box>
              <Button variant="contained" onClick={openPaymentDialog}>
                Initiate Payment
              </Button>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No payment information available yet.
          </Typography>
        )}
      </Paper>
      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          if (!paymentSubmitting) {
            setPaymentDialogOpen(false);
            setPaymentError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {payment ? "Complete Payment" : "Initiate Payment"}
        </DialogTitle>
        <DialogContent>
          {!payment ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography color="text.secondary">
                Payment amount is based on the final repair bill.
              </Typography>
              {repair?.finalBillAmount !== null &&
                repair?.finalBillAmount !== undefined && (
                  <Typography variant="h5">
                    ₹{repair.finalBillAmount.toLocaleString()}
                  </Typography>
                )}
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
              >
                <option value="ONLINE">Online</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </TextField>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography color="text.secondary">
                Enter the transaction reference returned by the payment process.
              </Typography>
              <Typography variant="h5">
                ₹{payment.amount.toLocaleString()}
              </Typography>
              <TextField
                fullWidth
                required
                label="Transaction Reference"
                value={transactionReference}
                onChange={(event) =>
                  setTransactionReference(event.target.value)
                }
              />
            </Stack>
          )}
          {paymentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {paymentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPaymentDialogOpen(false);
              setPaymentError("");
            }}
            disabled={paymentSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handlePaymentSubmit}
            disabled={
              paymentSubmitting || (!!payment && !transactionReference.trim())
            }
          >
            {paymentSubmitting
              ? "Processing..."
              : payment
                ? "Complete Payment"
                : "Create Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
