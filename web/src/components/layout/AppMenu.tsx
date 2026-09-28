import { List, ListItemButton, ListItemText } from "@mui/material";

import { NavLink } from "react-router-dom";

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
];

export default function AppMenu() {
  return (
    <List>
      {menu.map((item) => (
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
