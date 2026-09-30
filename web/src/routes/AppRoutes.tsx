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
import NotificationsPage from "../pages/notifications/NotificationsPage";
import ReportingPage from "../pages/reporting/ReportingPage";
import DocumentsPage from "../pages/documents/DocumentsPage";
import AppointmentsPage from "../pages/appointments/AppointmentsPage";
import SurveysPage from "../pages/surveys/SurveysPage";

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
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/reporting" element={<ReportingPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/surveys" element={<SurveysPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
