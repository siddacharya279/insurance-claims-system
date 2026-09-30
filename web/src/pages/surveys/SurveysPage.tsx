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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AssignmentIcon from "@mui/icons-material/Assignment";
import claimsService from "../../services/claims.service";
import surveysService, { type Survey } from "../../services/surveys.service";
import authService from "../../services/auth.service";

interface SurveyRow extends Survey {
  claimNumber: string;
}

export default function SurveysPage() {
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [damageDescription, setDamageDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const role = authService.getRole();

  const {
    data: claims,
    isLoading: claimsLoading,
    isError: claimsError,
  } = useQuery({
    queryKey: ["claims"],
    queryFn: () => claimsService.getClaims(),
  });

  const {
    data: surveys,
    isLoading: surveysLoading,
    isError: surveysError,
  } = useQuery({
    queryKey: ["all-surveys", claims?.map((claim) => claim.id)],
    queryFn: async () => {
      const results = await Promise.all(
        (claims ?? []).map(async (claim) => {
          try {
            const survey = await surveysService.getSurvey(claim.id);
            return {
              ...survey,
              claimNumber: claim.claimNumber,
            };
          } catch (error: any) {
            if (error?.response?.status === 404) {
              return null;
            }
            throw error;
          }
        }),
      );

      return results.filter((survey): survey is SurveyRow => survey !== null);
    },
    enabled: !!claims,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedClaimId) {
        throw new Error("Claim is required");
      }

      return surveysService.createSurvey(selectedClaimId, {
        damageDescription,
        estimatedCost: Number(estimatedCost),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-surveys"] });
      queryClient.invalidateQueries({
        queryKey: ["survey", selectedClaimId],
      });
      queryClient.invalidateQueries({
        queryKey: ["claim", selectedClaimId],
      });
      setDialogOpen(false);
      setSelectedClaimId("");
      setDamageDescription("");
      setEstimatedCost("");
      setErrorMessage("");
    },
    onError: () => {
      setErrorMessage(
        "Unable to create the survey. Please verify the claim status and surveyor assignment.",
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: (surveyId: string) => surveysService.completeSurvey(surveyId),
    onSuccess: (_, surveyId) => {
      queryClient.invalidateQueries({ queryKey: ["all-surveys"] });
      queryClient.invalidateQueries({ queryKey: ["survey", surveyId] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
    onError: () => {
      setErrorMessage("Unable to complete the survey.");
    },
  });

  const rows = useMemo(() => surveys ?? [], [surveys]);

  const canCreateSurvey = role === "ADMIN" || role === "CASE_MANAGER";

  const canCompleteSurvey = role === "ADMIN" || role === "SURVEYOR";

  const availableClaims = useMemo(() => {
    const surveyClaimIds = new Set(rows.map((survey) => survey.claimId));

    return (claims ?? []).filter(
      (claim) =>
        claim.status === "SURVEY_PENDING" && !surveyClaimIds.has(claim.id),
    );
  }, [claims, rows]);

  const columns: GridColDef<SurveyRow>[] = [
    {
      field: "claimNumber",
      headerName: "Claim Number",
      flex: 1.2,
    },
    {
      field: "damageDescription",
      headerName: "Damage Description",
      flex: 2,
    },
    {
      field: "estimatedCost",
      headerName: "Estimated Cost",
      flex: 1,
      valueFormatter: (value) =>
        value == null ? "-" : `₹${Number(value).toLocaleString("en-IN")}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1.1,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.status === "PENDING" && canCompleteSurvey ? (
          <Button
            size="small"
            variant="contained"
            onClick={() => completeMutation.mutate(params.row.id)}
            disabled={completeMutation.isPending}
          >
            Complete
          </Button>
        ) : null,
    },
  ];

  if (claimsLoading || surveysLoading) {
    return <CircularProgress />;
  }

  if (claimsError || surveysError) {
    return <Alert severity="error">Unable to load surveys.</Alert>;
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
          <Typography variant="h4">Surveys</Typography>
          <Typography color="text.secondary">
            Manage claim damage surveys and estimated repair costs.
          </Typography>
        </Box>

        {canCreateSurvey && (
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={availableClaims.length === 0}
          >
            Create Survey
          </Button>
        )}
      </Box>

      {availableClaims.length === 0 && canCreateSurvey && (
        <Alert severity="info" sx={{ mb: 2 }}>
          There are currently no claims waiting for a survey.
        </Alert>
      )}

      <Box sx={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={rows}
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
                  No surveys available.
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
        <DialogTitle>Create Survey</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Claim"
              value={selectedClaimId}
              onChange={(event) => setSelectedClaimId(event.target.value)}
              fullWidth
              disabled={createMutation.isPending}
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              <option value="" />
              {availableClaims.map((claim) => (
                <option key={claim.id} value={claim.id}>
                  {claim.claimNumber} - {claim.title}
                </option>
              ))}
            </TextField>

            <TextField
              label="Damage Description"
              value={damageDescription}
              onChange={(event) => setDamageDescription(event.target.value)}
              multiline
              rows={4}
              fullWidth
              disabled={createMutation.isPending}
            />

            <TextField
              label="Estimated Cost"
              type="number"
              value={estimatedCost}
              onChange={(event) => setEstimatedCost(event.target.value)}
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
              disabled={createMutation.isPending}
            />

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
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
              !damageDescription.trim() ||
              !estimatedCost ||
              Number(estimatedCost) < 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Creating..." : "Create Survey"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
