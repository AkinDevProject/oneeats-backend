import React from "react";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  role: "admin" | "restaurant";
}

const Navigation: React.FC<NavigationProps> = ({ role }) => {
  const location = useLocation();
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 700 }}>
          DelishGo
        </Typography>
        <Stack direction="row" spacing={2}>
          {role === "admin" && (
            <>
              <Button
                component={Link}
                to="/admin/dashboard"
                color={location.pathname.startsWith("/admin/dashboard") ? "primary" : "inherit"}
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/admin/users"
                color={location.pathname.startsWith("/admin/users") ? "primary" : "inherit"}
                startIcon={<PeopleIcon />}
              >
                Utilisateurs
              </Button>
              {/* Ajoute ici d'autres liens admin si besoin */}
            </>
          )}
          {role === "restaurant" && (
            <>
              <Button
                component={Link}
                to="/restaurant/orders"
                color={location.pathname.startsWith("/restaurant/orders") ? "primary" : "inherit"}
                startIcon={<ReceiptLongIcon />}
              >
                Commandes
              </Button>
              <Button
                component={Link}
                to="/restaurant/menu"
                color={location.pathname.startsWith("/restaurant/menu") ? "primary" : "inherit"}
                startIcon={<RestaurantMenuIcon />}
              >
                Menu
              </Button>
              {/* Ajoute ici d'autres liens restaurateur si besoin */}
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
