import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import policiesService from "../../services/policies.service";

export default function PoliciesPage() {
  const {
    data: policies,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["policies"],
    queryFn: policiesService.getMyPolicies,
  });
  if (isLoading) {
    return <CircularProgress />;
  }
  if (isError) {
    return <Alert severity="error">Unable to load policies.</Alert>;
  }
  if (!policies?.length) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          My Policies
        </Typography>
        <Alert severity="info">No insurance policies found.</Alert>
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Policies
      </Typography>
      <Grid container spacing={3}>
        {policies.map((policy) => (
          <Grid key={policy.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{policy.policyNumber}</Typography>
                  <Chip
                    label={policy.status}
                    color={policy.status === "ACTIVE" ? "success" : "default"}
                    size="small"
                  />
                </Box>
                <Typography color="text.secondary">
                  {policy.insurerName}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  Vehicle:{" "}
                  {[policy.vehicleMake, policy.vehicleModel, policy.vehicleYear]
                    .filter(Boolean)
                    .join(" ") || "Not specified"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  Coverage period:{" "}
                  {new Date(policy.startDate).toLocaleDateString()} –{" "}
                  {new Date(policy.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Coverages
                </Typography>
                {policy.coverages.map((coverage) => (
                  <Box key={coverage.id} sx={{ mb: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {coverage.coverageType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Limit:{" "}
                      {coverage.coverageLimit !== null
                        ? `₹${coverage.coverageLimit.toLocaleString()}`
                        : "Not specified"}
                      {coverage.deductible !== null
                        ? ` · Deductible: ₹${coverage.deductible.toLocaleString()}`
                        : ""}
                    </Typography>
                    {coverage.rentalVehicleEligible && (
                      <Typography variant="body2" color="success.main">
                        Rental vehicle eligible
                        {coverage.rentalVehicleLimit !== null
                          ? ` · Limit: ₹${coverage.rentalVehicleLimit.toLocaleString()}`
                          : ""}
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
