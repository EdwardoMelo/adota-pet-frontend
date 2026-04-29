import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { CitizenJourneyStrip } from "@/components/citizen/CitizenJourneyStrip";
import { ShelterAdminJourneyStrip } from "@/components/shelter/ShelterAdminJourneyStrip";

export function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {user?.role === "citizen" && <CitizenJourneyStrip />}
      {user?.role === "shelter_admin" && <ShelterAdminJourneyStrip />}
      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}