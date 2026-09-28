import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import ClaimsPage from "../pages/claims/ClaimsPage";
import CreateClaimPage from "../pages/claims/CreateClaimPage";
import ClaimDetailsPage from "../pages/claims/ClaimDetailsPage";
import WorkshopsPage from "../pages/workshops/WorkshopsPage";
import WorkshopDetailsPage from "../pages/workshops/WorkshopDetailsPage";
import PoliciesPage from "../pages/policies/PoliciesPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/policies" element={<PoliciesPage />} />

          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/claims/new" element={<CreateClaimPage />} />
          <Route path="/claims/:id" element={<ClaimDetailsPage />} />

          <Route path="/workshops" element={<WorkshopsPage />} />
          <Route path="/workshops/:id" element={<WorkshopDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
