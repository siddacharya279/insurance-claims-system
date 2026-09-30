import { List, ListItemButton, ListItemText } from "@mui/material";
import { NavLink } from "react-router-dom";
import authService from "../../services/auth.service";

const menu = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Policies",
    path: "/policies",
  },
  {
    label: "Claims",
    path: "/claims",
  },
  {
    label: "Documents",
    path: "/documents",
  },
  {
    label: "Workshops",
    path: "/workshops",
  },
  {
    label: "Appointments",
    path: "/appointments",
  },
  {
    label: "Surveys",
    path: "/surveys",
  },
  {
    label: "Notifications",
    path: "/notifications",
  },
  {
    label: "Reporting",
    path: "/reporting",
    allowedRoles: ["ADMIN", "CASE_MANAGER", "AUDITOR"],
  },
];

export default function AppMenu() {
  const role = authService.getRole();
  const visibleMenu = menu.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role ?? ""),
  );
  return (
    <List>
      {visibleMenu.map((item) => (
        <ListItemButton
          key={item.path}
          component={NavLink}
          to={item.path}
          sx={{
            "&.active": {
              bgcolor: "primary.main",
              color: "white",
            },
          }}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
}
