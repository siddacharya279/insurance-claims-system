import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import claimsService from "../../services/claims.service";
import appointmentsService, {
  type Appointment,
} from "../../services/appointments.service";
import workshopsService from "../../services/workshops.service";
import type { Claim } from "../../types/claim";
import type { Workshop } from "../../types/workshop";

interface AppointmentRow extends Appointment {
  claimNumber: string;
  workshopName: string;
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: claims,
    isLoading: claimsLoading,
    isError: claimsError,
  } = useQuery({
    queryKey: ["claims"],
    queryFn: () => claimsService.getClaims(),
  });

  const {
    data: workshops,
    isLoading: workshopsLoading,
    isError: workshopsError,
  } = useQuery({
    queryKey: ["workshops"],
    queryFn: () => workshopsService.getWorkshops(),
  });

  const {
    data: appointments,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
  } = useQuery({
    queryKey: ["all-appointments", claims?.map((claim) => claim.id)],
    queryFn: async () => {
      const results = await Promise.all(
        (claims ?? []).map(async (claim) => {
          const appointment = await appointmentsService.getAppointment(
            claim.id,
          );
          return appointment
            ? {
                ...appointment,
                claimNumber: claim.claimNumber,
                workshopName:
                  workshops?.find(
                    (workshop) => workshop.id === appointment.workshopId,
                  )?.name ?? "Unknown workshop",
              }
            : null;
        }),
      );
      return results.filter(
        (appointment): appointment is AppointmentRow => appointment !== null,
      );
    },
    enabled: !!claims && !!workshops,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedClaimId || !selectedWorkshopId || !appointmentDate) {
        throw new Error("All appointment fields are required");
      }
      return appointmentsService.createAppointment(selectedClaimId, {
        workshopId: selectedWorkshopId,
        appointmentDate: new Date(appointmentDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-appointments"] });
      queryClient.invalidateQueries({
        queryKey: ["appointment", selectedClaimId],
      });
      setDialogOpen(false);
      setSelectedClaimId("");
      setSelectedWorkshopId("");
      setAppointmentDate("");
      setSuccessMessage("Appointment scheduled successfully.");
    },
  });

  const appointmentRows = useMemo(() => appointments ?? [], [appointments]);

  const availableClaims = useMemo(() => {
    return (claims ?? []).filter(
      (claim: Claim) =>
        claim.workshopId &&
        ["CASE_ASSIGNED", "SURVEY_PENDING", "SURVEY_COMPLETED"].includes(
          claim.status,
        ),
    );
  }, [claims]);

  const selectedClaim = useMemo(
    () => claims?.find((claim) => claim.id === selectedClaimId),
    [claims, selectedClaimId],
  );

  const availableWorkshops = useMemo(() => {
    if (!selectedClaim?.workshopId) {
      return [];
    }
    return (workshops ?? []).filter(
      (workshop: Workshop) => workshop.id === selectedClaim.workshopId,
    );
  }, [selectedClaim, workshops]);

  const columns: GridColDef<AppointmentRow>[] = [
    {
      field: "claimNumber",
      headerName: "Claim Number",
      flex: 1.2,
    },
    {
      field: "workshopName",
      headerName: "Workshop",
      flex: 1.5,
    },
    {
      field: "appointmentDate",
      headerName: "Appointment Date",
      flex: 1.3,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
  ];

  if (claimsLoading || workshopsLoading || appointmentsLoading) {
    return <CircularProgress />;
  }

  if (claimsError || workshopsError || appointmentsError) {
    return <Alert severity="error">Unable to load appointments.</Alert>;
  }

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
          <Typography variant="h4">Appointments</Typography>
          <Typography color="text.secondary">
            Manage workshop appointments for insurance claims.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={availableClaims.length === 0}
        >
          Schedule Appointment
        </Button>
      </Box>

      {availableClaims.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          There are currently no claims eligible for appointment scheduling.
        </Alert>
      )}

      <Box sx={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={appointmentRows}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  No appointments scheduled yet.
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!createMutation.isPending) {
            setDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Schedule Appointment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="appointment-claim-label">Claim</InputLabel>
              <Select
                labelId="appointment-claim-label"
                value={selectedClaimId}
                label="Claim"
                onChange={(event) => {
                  setSelectedClaimId(event.target.value);
                  setSelectedWorkshopId("");
                }}
                disabled={createMutation.isPending}
              >
                {availableClaims.map((claim) => (
                  <MenuItem key={claim.id} value={claim.id}>
                    {claim.claimNumber} - {claim.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedClaimId}>
              <InputLabel id="appointment-workshop-label">Workshop</InputLabel>
              <Select
                labelId="appointment-workshop-label"
                value={selectedWorkshopId}
                label="Workshop"
                onChange={(event) => setSelectedWorkshopId(event.target.value)}
                disabled={createMutation.isPending}
              >
                {availableWorkshops.map((workshop) => (
                  <MenuItem key={workshop.id} value={workshop.id}>
                    {workshop.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Appointment Date & Time"
              type="datetime-local"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={createMutation.isPending}
            />

            {createMutation.isError && (
              <Alert severity="error">
                Unable to schedule the appointment. Please check the claim,
                workshop and appointment date.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={
              !selectedClaimId ||
              !selectedWorkshopId ||
              !appointmentDate ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={2500}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Box>
  );
}
