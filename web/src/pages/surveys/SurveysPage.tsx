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
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import claimsService from "../../services/claims.service";
import surveysService from "../../services/surveys.service";
import authService from "../../services/auth.service";

interface SurveyRow {
  id: string;
  claimId: string;
  claimNumber: string;
  damageDescription: string;
  estimatedCost: number | null;
  reportPath: string | null;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  surveyorId?: string;
}

export default function SurveysPage() {
  const queryClient = useQueryClient();

  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRow | null>(null);

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
    queryFn: async (): Promise<SurveyRow[]> => {
      const results = await Promise.all(
        (claims ?? []).map(async (claim) => {
          try {
            const survey = await surveysService.getSurvey(claim.id);

            if (!survey) {
              return {
                id: `pending-${claim.id}`,
                claimId: claim.id,
                claimNumber: claim.claimNumber,
                damageDescription: "Survey not created yet",
                estimatedCost: null,
                reportPath: null,
                status: "PENDING" as const,
                createdAt: claim.createdAt,
                updatedAt: claim.updatedAt,
              };
            }

            return {
              ...survey,
              claimNumber: claim.claimNumber,
            };
          } catch (error: any) {
            if (error?.response?.status === 404) {
              return {
                id: `pending-${claim.id}`,
                claimId: claim.id,
                claimNumber: claim.claimNumber,
                damageDescription: "Survey not created yet",
                estimatedCost: null,
                reportPath: null,
                status: "PENDING" as const,
                createdAt: claim.createdAt,
                updatedAt: claim.updatedAt,
              };
            }

            throw error;
          }
        }),
      );

      return results;
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
      queryClient.invalidateQueries({
        queryKey: ["all-surveys"],
      });

      queryClient.invalidateQueries({
        queryKey: ["survey", selectedClaimId],
      });

      queryClient.invalidateQueries({
        queryKey: ["claim", selectedClaimId],
      });

      queryClient.invalidateQueries({
        queryKey: ["claims"],
      });

      setCreateDialogOpen(false);
      setSelectedClaimId("");
      setDamageDescription("");
      setEstimatedCost("");
      setErrorMessage("");
    },

    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.message ?? "Unable to create the survey.",
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: (surveyId: string) => surveysService.completeSurvey(surveyId),

    onSuccess: (_, surveyId) => {
      queryClient.invalidateQueries({
        queryKey: ["all-surveys"],
      });

      queryClient.invalidateQueries({
        queryKey: ["survey", surveyId],
      });

      queryClient.invalidateQueries({
        queryKey: ["claims"],
      });

      setInspectDialogOpen(false);
      setSelectedSurvey(null);
      setErrorMessage("");
    },

    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.message ?? "Unable to complete the survey.",
      );
    },
  });

  const rows = useMemo(() => surveys ?? [], [surveys]);

  const canCreateSurvey = role === "ADMIN" || role === "CASE_MANAGER";

  const canCompleteSurvey = role === "ADMIN" || role === "SURVEYOR";

  const canStartSurvey = role === "SURVEYOR";

  const availableClaims = useMemo(() => {
    const surveyClaimIds = new Set(
      rows
        .filter((survey) => !survey.id.startsWith("pending-"))
        .map((survey) => survey.claimId),
    );

    return (claims ?? []).filter(
      (claim) =>
        claim.status === "SURVEY_PENDING" && !surveyClaimIds.has(claim.id),
    );
  }, [claims, rows]);

  const handleInspect = (survey: SurveyRow) => {
    setSelectedSurvey(survey);
    setErrorMessage("");
    setInspectDialogOpen(true);
  };

  const handleStartSurvey = (claimId: string) => {
    setSelectedClaimId(claimId);
    setDamageDescription("");
    setEstimatedCost("");
    setErrorMessage("");
    setCreateDialogOpen(true);
  };

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
      width: 310,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isPlaceholder = params.row.id === `pending-${params.row.claimId}`;

        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => handleInspect(params.row)}
              sx={{ whiteSpace: "nowrap" }}
            >
              Inspect
            </Button>

            {isPlaceholder && canStartSurvey && (
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleStartSurvey(params.row.claimId)}
                sx={{ whiteSpace: "nowrap" }}
              >
                Start Survey
              </Button>
            )}

            {params.row.status === "PENDING" &&
              !isPlaceholder &&
              canCompleteSurvey && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => completeMutation.mutate(params.row.id)}
                  disabled={completeMutation.isPending}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Complete
                </Button>
              )}
          </Stack>
        );
      },
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
            onClick={() => {
              setErrorMessage("");
              setCreateDialogOpen(true);
            }}
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

      {errorMessage && !createDialogOpen && !inspectDialogOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
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

      {/* Inspect Survey */}
      <Dialog
        open={inspectDialogOpen}
        onClose={() => {
          if (!completeMutation.isPending) {
            setInspectDialogOpen(false);
            setSelectedSurvey(null);
            setErrorMessage("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Survey Details</DialogTitle>

        <DialogContent>
          {selectedSurvey && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Claim Number
                </Typography>

                <Typography variant="body1">
                  {selectedSurvey.claimNumber}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Survey Status
                </Typography>

                <Typography variant="body1">{selectedSurvey.status}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Damage Description
                </Typography>

                <Typography variant="body1">
                  {selectedSurvey.damageDescription}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Estimated Repair Cost
                </Typography>

                <Typography variant="body1">
                  {selectedSurvey.estimatedCost == null
                    ? "-"
                    : `₹${selectedSurvey.estimatedCost.toLocaleString(
                        "en-IN",
                      )}`}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Survey Created
                </Typography>

                <Typography variant="body1">
                  {new Date(selectedSurvey.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {selectedSurvey.reportPath && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Survey Report
                  </Typography>

                  <Typography variant="body1">
                    {selectedSurvey.reportPath}
                  </Typography>
                </Box>
              )}

              {selectedSurvey.id.startsWith("pending-") && (
                <Alert severity="info">
                  This claim is assigned to you and is ready for survey. Use
                  "Start Survey" to enter the damage assessment and estimated
                  repair cost.
                </Alert>
              )}

              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setInspectDialogOpen(false);
              setSelectedSurvey(null);
              setErrorMessage("");
            }}
            disabled={completeMutation.isPending}
          >
            Close
          </Button>

          {selectedSurvey?.id.startsWith("pending-") && canStartSurvey && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => {
                setInspectDialogOpen(false);
                handleStartSurvey(selectedSurvey.claimId);
              }}
            >
              Start Survey
            </Button>
          )}

          {selectedSurvey &&
            selectedSurvey.status === "PENDING" &&
            !selectedSurvey.id.startsWith("pending-") &&
            canCompleteSurvey && (
              <Button
                variant="contained"
                onClick={() => completeMutation.mutate(selectedSurvey.id)}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending
                  ? "Completing..."
                  : "Complete Survey"}
              </Button>
            )}
        </DialogActions>
      </Dialog>

      {/* Create / Start Survey */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          if (!createMutation.isPending) {
            setCreateDialogOpen(false);
            setErrorMessage("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {role === "SURVEYOR" ? "Start Survey" : "Create Survey"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Claim"
              value={
                claims?.find((claim) => claim.id === selectedClaimId)
                  ?.claimNumber ?? ""
              }
              fullWidth
              disabled
            />

            <TextField
              label="Damage Description"
              value={damageDescription}
              onChange={(event) => setDamageDescription(event.target.value)}
              multiline
              rows={5}
              fullWidth
              disabled={createMutation.isPending}
              required
            />

            <TextField
              label="Estimated Repair Cost"
              type="number"
              value={estimatedCost}
              onChange={(event) => setEstimatedCost(event.target.value)}
              fullWidth
              required
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              disabled={createMutation.isPending}
            />

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setErrorMessage("");
            }}
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
            {createMutation.isPending
              ? "Saving..."
              : role === "SURVEYOR"
                ? "Create Survey"
                : "Create Survey"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
