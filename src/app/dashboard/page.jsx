"use client";
import { useRouter } from "next/navigation";
import InfoPanel from "@/components/common/InfoPanel";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/context/PermissionContext";

import WelcomeBox from "@/components/pages/dashboard/WelcomeBox";

export default function DashboardPage() {
  const router = useRouter();
  const { can, loading, user } = usePermissions();

  const canViewDashboard =
    can("view dashboard", "dashboard") || can("view dashboard");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning!";
    if (hour >= 12 && hour < 17) return "Good afternoon!";
    return "Good evening!";
  };

  const greeting = getGreeting();

  // Prevent race conditions: PermissionProvider must validate session + load permissions first.
  if (loading) return null;

  // If auth is invalid (or permissions never loaded), redirect once after loading completes.
  // ProtectedRoute isn't used here, so this is our fallback without competing checks during initial render.
  if (!user) {
    router.replace("/login");
    return null;
  }

  if (!canViewDashboard) return null;

  return (
    <div className="min-h-[calc(100vh-150px)]">
      <WelcomeBox />
      <div className="flex flex-col">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
            {greeting}
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)]">
            This is your dashboard
          </p>
        </div>
        <InfoPanel
          description="Head to the Clients page to start assisting with onboarding and support."
          image="/box.png"
          name="Ready to make an impact?"
          buttons={[
            {
              text: "CLIENTS MANAGEMENT",
              className:
                "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
              variant: "primary",
              href: "/clients",
            },
            {
              text: (
                <>
                  <Link href="/help" className="text-base">
                    GO TO HELP{" "}
                    <ArrowUpRight className="inline-block ml-2 w-5 h-5" />
                  </Link>
                </>
              ),
              className:
                "font-medium flex items-center justify-center uppercase",
              variant: "secondary",
            },
          ]}
        />
      </div>
    </div>
  );
}
