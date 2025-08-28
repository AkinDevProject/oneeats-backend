import React from 'react';
import { BarChart3 } from 'lucide-react';

// Import du design Data-Driven uniquement
import TableauDashboard from './designs/TableauDashboard';

// Redirection directe vers TableauDashboard (Data-Driven)
const DashboardDesignSelector: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <TableauDashboard />
    </div>
  );
};

export default DashboardDesignSelector;