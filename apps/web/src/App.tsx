import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import RestaurantApp from "./restaurant/RestaurantApp";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/restaurant" element={<RestaurantApp />} />
        {/* Redirection par défaut vers /restaurant */}
        <Route path="/" element={<Navigate to="/restaurant" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
