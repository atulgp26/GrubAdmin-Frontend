"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useImpersonation } from "@/context/ImpersonationContext";

export default function ImpersonationDashboard({ vertical }) {
  const router = useRouter();
  const { impersonation, isImpersonating } = useImpersonation();

  useEffect(() => {
    if (!isImpersonating) {
      router.replace("/clients");
    }
  }, [isImpersonating, router]);

  if (!isImpersonating) return null;

  const clientInfo = impersonation;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-neutral-default)]">
          Client Dashboard
        </h1>
        <p className="text-[var(--color-text-neutral-secondary)] mt-1">
          {vertical ? `${vertical.charAt(0).toUpperCase() + vertical.slice(1)}` : "Client"} Portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[var(--color-stroke-neutral)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-text-neutral-secondary)] mb-1">Client</h2>
          <p className="text-lg font-semibold text-[var(--color-text-neutral-default)]">
            {clientInfo?.clientName || "N/A"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[var(--color-stroke-neutral)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-text-neutral-secondary)] mb-1">Vertical</h2>
          <p className="text-lg font-semibold text-[var(--color-text-neutral-default)]">
            {vertical ? vertical.charAt(0).toUpperCase() + vertical.slice(1) : "N/A"}
          </p>
        </div>

        {clientInfo?.clientEmail && (
          <div className="bg-white rounded-lg border border-[var(--color-stroke-neutral)] p-6">
            <h2 className="text-sm font-medium text-[var(--color-text-neutral-secondary)] mb-1">Email</h2>
            <p className="text-lg font-semibold text-[var(--color-text-neutral-default)]">
              {clientInfo.clientEmail}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-[var(--color-stroke-neutral)] p-6">
          <h2 className="text-sm font-medium text-[var(--color-text-neutral-secondary)] mb-1">Status</h2>
          <p className="text-lg font-semibold text-green-600">Active</p>
        </div>
      </div>
    </div>
  );
}
