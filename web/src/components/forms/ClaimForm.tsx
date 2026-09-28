import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import policiesService from "../../services/policies.service";
import claimsService from "../../services/claims.service";
import {
  createClaimSchema,
  type CreateClaimFormData,
} from "../../validations/claim.schema";

export default function ClaimForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submittingRef = useRef(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClaimFormData>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      policyId: "",
      title: "",
      description: "",
      incidentDate: "",
      incidentLocation: "",
    },
  });
  const {
    data: policies,
    isLoading: policiesLoading,
    isError: policiesError,
  } = useQuery({
    queryKey: ["policies"],
    queryFn: policiesService.getMyPolicies,
  });
  const activePolicies =
    policies?.filter((policy) => policy.status === "ACTIVE") ?? [];
  const onSubmit = async (data: CreateClaimFormData) => {
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    try {
      const claim = await claimsService.createClaim({
        ...data,
        incidentDate: new Date(data.incidentDate).toISOString(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["claims"],
      });
      navigate(`/claims/${claim.id}`, { replace: true });
    } catch (error) {
      submittingRef.current = false;
      throw error;
    }
  };
  if (policiesLoading) {
    return <CircularProgress />;
  }
  if (policiesError) {
    return <Alert severity="error">Unable to load your policies.</Alert>;
  }
  if (!activePolicies.length) {
    return (
      <Alert severity="warning">
        You do not have an active insurance policy available for claim
        submission.
      </Alert>
    );
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Controller
          name="policyId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Insurance Policy"
              error={!!errors.policyId}
              helperText={errors.policyId?.message}
            >
              {activePolicies.map((policy) => (
                <MenuItem key={policy.id} value={policy.id}>
                  {policy.policyNumber} — {policy.vehicleMake}{" "}
                  {policy.vehicleModel} {policy.vehicleYear ?? ""}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Claim Title"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />
        <Controller
          name="incidentDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="datetime-local"
              label="Incident Date"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              error={!!errors.incidentDate}
              helperText={errors.incidentDate?.message}
            />
          )}
        />
        <Controller
          name="incidentLocation"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Incident Location"
              error={!!errors.incidentLocation}
              helperText={errors.incidentLocation?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              minRows={4}
              label="Description"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || submittingRef.current}
        >
          {isSubmitting ? "Submitting..." : "Submit Claim"}
        </Button>
      </Stack>
    </form>
  );
}
