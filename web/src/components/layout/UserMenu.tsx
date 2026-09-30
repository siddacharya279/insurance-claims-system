import {
  AdminPanelSettings,
  Assignment,
  Build,
  FactCheck,
  Gavel,
  ManageAccounts,
  Person,
} from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import authService from "../../services/auth.service";

function getRoleIcon(role: string | null) {
  switch (role) {
    case "ADMIN":
      return <AdminPanelSettings />;

    case "CASE_MANAGER":
      return <ManageAccounts />;

    case "SURVEYOR":
      return <Assignment />;

    case "ADJUSTER":
      return <Gavel />;

    case "WORKSHOP":
      return <Build />;

    case "AUDITOR":
      return <FactCheck />;

    case "CUSTOMER":
    default:
      return <Person />;
  }
}

function formatRole(role: string | null) {
  if (!role) {
    return "User";
  }

  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function UserMenu() {
  const navigate = useNavigate();

  const user = authService.getUser();
  const role = authService.getRole();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";

  function logout() {
    authService.logout();
    navigate("/login");
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
        }}
      >
        {getRoleIcon(role)}
      </Avatar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minWidth: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {fullName}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: "inherit",
            opacity: 0.8,
            whiteSpace: "nowrap",
          }}
        >
          {user?.email ?? "User"} · {formatRole(role)}
        </Typography>
      </Box>

      <Button color="inherit" onClick={logout} sx={{ ml: 1 }}>
        Logout
      </Button>
    </Box>
  );
}
