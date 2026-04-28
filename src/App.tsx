import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import PetsPage from "./pages/citizen/PetsPage";
import PetDetailPage from "./pages/citizen/PetDetailPage";
import NewAppointmentPage from "./pages/citizen/NewAppointmentPage";
import NewPetVisitPage from "./pages/citizen/NewPetVisitPage";
import MyAppointmentsPage from "./pages/citizen/MyAppointmentsPage";
import MyAdoptionsPage from "./pages/citizen/MyAdoptionsPage";
import MyPetsPage from "./pages/citizen/MyPetsPage";
import ShelterDashboardPage from "./pages/shelter/ShelterDashboardPage";
import ShelterPetsPage from "./pages/shelter/ShelterPetsPage";
import ShelterAppointmentsPage from "./pages/shelter/ShelterAppointmentsPage";
import ShelterAdoptionsPage from "./pages/shelter/ShelterAdoptionsPage";
import ShelterProceduresPage from "./pages/shelter/ShelterProceduresPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminTenantsPage from "./pages/admin/AdminTenantsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage";
import { FeedbackSnackbar } from "./components/FeedbackSnackbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FeedbackSnackbar />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Public catalog */}
            <Route element={<AppLayout />}>
              <Route path="/pets" element={<PetsPage />} />
              <Route path="/pets/:id" element={<PetDetailPage />} />
            </Route>

            {/* Citizen */}
            <Route
              element={
                <ProtectedRoute roles={["citizen", "shelter_admin", "super_admin"]}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/appointments" element={<MyAppointmentsPage />} />
              <Route path="/adoptions" element={<MyAdoptionsPage />} />
              <Route path="/appointments/new" element={<NewAppointmentPage />} />
              <Route path="/appointments/visit/:petId" element={<NewPetVisitPage />} />
              <Route path="/my-pets" element={<MyPetsPage />} />
            </Route>

            {/* Shelter Admin */}
            <Route
              element={
                <ProtectedRoute roles={["shelter_admin"]}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/shelter" element={<ShelterDashboardPage />} />
              <Route path="/shelter/pets" element={<ShelterPetsPage />} />
              <Route path="/shelter/procedures" element={<ShelterProceduresPage />} />
              <Route path="/shelter/appointments" element={<ShelterAppointmentsPage />} />
              <Route path="/shelter/adoptions" element={<ShelterAdoptionsPage />} />
            </Route>

            {/* Super Admin */}
            <Route
              element={
                <ProtectedRoute roles={["super_admin"]}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/solicitacoes" element={<AdminRequestsPage />} />
              <Route path="/admin/tenants" element={<AdminTenantsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
