import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";

const AdminDashboard: React.FC = () => {
  return (
    <Box>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <DashboardIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Dashboard Administrateur
          </Typography>
        </Box>
        <Typography variant="body1" mb={2}>
          Bienvenue sur le tableau de bord global de la plateforme DelishGo.
        </Typography>
        <ul style={{ fontSize: 18, marginLeft: 24 }}>
          <li>Nombre de commandes (à intégrer)</li>
          <li>Restaurants actifs (à intégrer)</li>
          <li>Gestion des utilisateurs</li>
          <li>Validation des restaurants</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
