"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useImpersonation } from "@/context/ImpersonationContext";
import { setToken } from "@/api/utils";
import { setAuthCookie } from "@/utils/cookies";
import { resolveDashboardRoute } from "@/utils/routeResolver";
import { customerService } from "@/api/services/customerService";

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.user || payload;
  } catch {
    return null;
  }
}

function ImpersonateHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startImpersonation } = useImpersonation();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const token = searchParams.get("token");
    const returnUrl = searchParams.get("return_url") || "/clients";

    if (!token) {
      setStatus("No impersonation token provided.");
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "impersonation") {
      setStatus("Invalid impersonation token.");
      return;
    }

    const verticalName = payload.vertical_name || null;
    const clientInfo = {
      id: payload.client_id || payload.id,
      name: payload.client_name || "Client",
      vertical: verticalName,
    };

    startImpersonation(clientInfo, token);
    setToken(token);
    setAuthCookie(clientInfo.name || "impersonated", token, 1 / 24);

    // Exchange impersonation token for delivery session
    customerService
      .getDeliveryImpersonationSession(token)
      .then((sessionResponse) => {
        if (sessionResponse?.success && sessionResponse?.data?.auth_token) {
          const deliveryToken = sessionResponse.data.auth_token;
          setToken(deliveryToken);
          setAuthCookie(clientInfo.name || "impersonated", deliveryToken, 1);
        }
      })
      .catch((err) => {
        console.error("[Impersonation] Failed to get delivery session:", err);
      })
      .finally(() => {
        const isCustomReturn = returnUrl && returnUrl !== "/clients";
        const targetRoute = isCustomReturn ? returnUrl : resolveDashboardRoute(verticalName);
        setStatus(`Redirecting to ${targetRoute}...`);
        router.replace(targetRoute);
      });
  }, [searchParams, router, startImpersonation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-default)] mx-auto mb-4" />
        <p className="text-[var(--color-text-neutral-default)]">{status}</p>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-default)] mx-auto mb-4" />
      </div>
    }>
      <ImpersonateHandler />
    </Suspense>
  );
}
