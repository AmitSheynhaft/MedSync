import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import RequireRole from "./components/RequireRole/RequireRole";
import { Role } from "./constants/roles";

const VisitPage            = lazy(() => import("./pages/VisitPage/VisitPage"));
const DocumentsPage        = lazy(() => import("./pages/DocumentsPage/DocumentsPage"));
const PatientDashboard     = lazy(() => import("./pages/PatientDashboard/PatientDashboard"));
const LoginPage            = lazy(() => import("./pages/LoginPage/LoginPage"));
const RegisterPage         = lazy(() => import("./pages/RegisterPage/RegisterPage"));
const RoleSelectPage       = lazy(() => import("./pages/RoleSelectPage/RoleSelectPage"));
const PatientsListPage     = lazy(() => import("./pages/PatientsListPage/PatientsListPage"));
const PatientDashboardPage = lazy(() => import("./pages/PatientDashboardPage/PatientDashboardPage"));
const ProfilePage          = lazy(() => import("./pages/ProfilePage/ProfilePage"));
const AdminPage            = lazy(() => import("./pages/AdminPage/AdminPage"));
const SecretarySchedulePage = lazy(() => import("./pages/SecretarySchedulePage/SecretarySchedulePage"));
const SecretaryDocumentsPage = lazy(() => import("./pages/SecretaryDocumentsPage/SecretaryDocumentsPage"));
const SecretarySlotsPage = lazy(() => import("./pages/SecretarySlotsPage/SecretarySlotsPage"));
const TherapistSlotsPage = lazy(() => import("./pages/TherapistSlotsPage/TherapistSlotsPage"));
const PatientSlotsPage = lazy(() => import("./pages/PatientSlotsPage/PatientSlotsPage"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  layout?: "auth" | "app";
  allowRoles?: string[];
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  // Public routes
  { path: "/login", element: <RoleSelectPage /> },
  { path: "/register", element: <RoleSelectPage /> },

  // Auth layout routes
  { path: "/login/:role", element: <LoginPage />, layout: "auth" },
  { path: "/register/:role", element: <RegisterPage />, layout: "auth" },

  // App layout — patient + doctor
  { path: "/dashboard", element: <PatientDashboard />, layout: "app", allowRoles: [Role.Patient, Role.Doctor] },
  { path: "/documents", element: <DocumentsPage />, layout: "app", allowRoles: [Role.Patient, Role.Doctor] },

  // App layout — doctor only
  { path: "/visit", element: <VisitPage />, layout: "app", allowRoles: [Role.Doctor] },
  { path: "/patients", element: <PatientsListPage />, layout: "app", allowRoles: [Role.Doctor] },
  { path: "/patients/:id", element: <PatientDashboardPage />, layout: "app", allowRoles: [Role.Doctor] },
  { path: "/patients/:id/visit", element: <VisitPage />, layout: "app", allowRoles: [Role.Doctor] },
  { path: "/patients/:id/visits/:visitId", element: <VisitPage />, layout: "app", allowRoles: [Role.Patient, Role.Doctor] },
  { path: "/patients/:id/documents", element: <DocumentsPage />, layout: "app", allowRoles: [Role.Doctor] },

  // App layout — secretary only
  { path: "/schedule", element: <SecretarySchedulePage />, layout: "app", allowRoles: [Role.Secretary] },
  { path: "/clinic-slots", element: <SecretarySlotsPage />, layout: "app", allowRoles: [Role.Secretary] },
  { path: "/secretary-documents", element: <SecretaryDocumentsPage />, layout: "app", allowRoles: [Role.Secretary] },

  // App layout — doctor slots
  { path: "/slots", element: <TherapistSlotsPage />, layout: "app", allowRoles: [Role.Doctor] },

  // App layout — patient slots
  { path: "/my-slots", element: <PatientSlotsPage />, layout: "app", allowRoles: [Role.Patient] },

  // App layout — any authenticated user
  { path: "/profile", element: <ProfilePage />, layout: "app" },

  // App layout — admin only
  { path: "/admin", element: <AdminPage />, layout: "app", allowRoles: [Role.Admin] },

  // Catch-all redirect
  { path: "/", element: <Navigate to="/login" replace /> },
];


function renderRoute(route: RouteConfig) {
  if (route.layout === "auth") {
    return (
      <Route key={route.path} path={route.path} element={<AuthLayout />}>
        <Route index element={route.element} />
      </Route>
    );
  }

  if (route.layout === "app") {
    return (
      <Route key={route.path} element={<RequireRole allow={route.allowRoles} />}>
        <Route path={route.path} element={route.element} />
      </Route>
    );
  }

  return <Route key={route.path} path={route.path} element={route.element} />;
}

export function Router() {
  const publicRoutes = routes.filter((r) => !r.layout);
  const authRoutes = routes.filter((r) => r.layout === "auth");
  const appRoutes = routes.filter((r) => r.layout === "app");

  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "2rem" }}>Loading...</div>}>
        <Routes>
          {publicRoutes.map(renderRoute)}
          {authRoutes.map(renderRoute)}

          <Route element={<AppLayout />}>
            {appRoutes.map(renderRoute)}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
