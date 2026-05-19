"use client";
import ClientLogs from "@/components/pages/clients/ClientLogs";
import ClientLogsSidebar, { defaultClientSidebarEntries } from "@/components/pages/clients/ClientLogsSidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState(
    defaultClientSidebarEntries[0]?.id ?? null
  );

  const selectedClient = useMemo(
    () =>
      defaultClientSidebarEntries.find((client) => client.id === selectedClientId) ??
      null,
    [selectedClientId]
  );

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
          clients={defaultClientSidebarEntries}
          currentId={selectedClientId}
          onSelect={setSelectedClientId}
        />
        <ClientLogs client={selectedClient} />
      </div>
    </div>
  )
}

export default page
