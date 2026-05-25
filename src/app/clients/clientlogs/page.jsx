"use client";
import ClientLogs from "@/components/pages/clients/ClientLogs";
import ClientLogsSidebar from "@/components/pages/clients/ClientLogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { customerService } from "@/api/services/customerService";

function ClientLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const clientIdFromUrl = searchParams.get("clientId") || "";
  const clientNameFromUrl = searchParams.get("name") || "";
  const clientVerticalFromUrl = searchParams.get("vertical") || "";

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      setClientsLoading(true);
      const response = await customerService.getCustomers({ fetch_all: true });
      if (response?.success && response?.code === 200) {
        const customers = response.data?.customers || [];
        setClients(customers);
      }
    } catch (error) {
      console.error("Failed to fetch clients list:", error);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center border-b px-6 py-3 border-[var(--color-stroke-neutral)]">
        <Button
          variant="grayOutline"
          className="flex gap-2 w-fit items-center btn-size-md-sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          GO BACK
        </Button>
      </div>
      <div className="flex flex-1">
        <ClientLogsSidebar
          clients={clients}
          currentId={clientIdFromUrl}
          loading={clientsLoading}
        />
        <ClientLogs
          clientId={clientIdFromUrl}
          clientName={clientNameFromUrl}
          clientVertical={clientVerticalFromUrl}
        />
      </div>
    </div>
  );
}

const page = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">Loading...</div>}>
      <ClientLogsContent />
    </Suspense>
  );
};

export default page;