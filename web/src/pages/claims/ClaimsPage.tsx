import { useQuery } from "@tanstack/react-query";
import claimsService from "../../services/claims.service";
import type { Claim } from "../../types/claim";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import ClaimStatusChip from "../../components/common/ClaimStatusChip";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

export default function ClaimsPage() {
  const navigate = useNavigate();

  const {
    data: claims,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["claims"],
    queryFn: () => claimsService.getClaims(),
  });

  const role = authService.getRole();
  const canCreateClaim = role === "CUSTOMER";

  const columns: GridColDef<Claim>[] = [
    {
      field: "claimNumber",
      headerName: "Claim Number",
      flex: 1,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <ClaimStatusChip status={params.value} />,
    },
    {
      field: "incidentLocation",
      headerName: "Location",
      flex: 1,
    },
    {
      field: "incidentDate",
      headerName: "Incident Date",
      flex: 1,
      valueFormatter: (_value, row) =>
        new Date(row.incidentDate).toLocaleDateString(),
    },
  ];
  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Unable to load claims.</Alert>;
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
        <Typography variant="h4">Claims</Typography>

        {canCreateClaim && (
          <Button variant="contained" onClick={() => navigate("/claims/new")}>
            Create Claim
          </Button>
        )}
      </Box>

      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={claims ?? []}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 20]}
          onRowClick={(params) => navigate(`/claims/${params.row.id}`)}
        />
      </Box>
    </Box>
  );
}
