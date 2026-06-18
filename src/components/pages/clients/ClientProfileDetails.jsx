"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { customerService } from "@/api/services/customerService";

export default function ClientProfileDetails({ open, onClose, clientId, clientName, clientVertical }) {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !clientId) return;
    setLoading(true);
    customerService
      .getCustomer(clientId)
      .then((res) => {
        const raw = res?.data;
        const customer = raw?.customers?.[0] || raw || null;
        setClientData(customer);
      })
      .catch(() => {
        setClientData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, clientId]);

  const details = [
    { label: "Name", value: clientName || clientData?.name || "—" },
    { label: "Organization", value: clientData?.organization_name || "—" },
    { label: "Client ID", value: clientData?.client_id || clientId || "—" },
    { label: "Vertical", value: clientVertical || clientData?.vertical || "—" },
    { label: "Email", value: clientData?.email || "—" },
    { label: "Contact", value: clientData?.mobile_number || "—" },
    {
      label: "Region",
      value: [clientData?.state, clientData?.country].filter(Boolean).join(", ") || "—",
    },
    { label: "Address", value: clientData?.address || "—" },
    { label: "City", value: clientData?.city || "—" },
    { label: "Zip Code", value: clientData?.zipcode || "—" },
  ];

  return (
    <Modal
      noBlur={true}
      open={open}
      onClose={onClose}
      width="max-w-[450px]"
      positionClass="items-start justify-start"
      top="top-30"
      left="left-52"
    >
      <div className="bg-white">
        {loading ? (
          <div className="text-center py-8 text-sm text-[var(--color-neutral-secondary)]">
            Loading...
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {details.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-0">
                <span className="text-[var(--color-neutral-secondary)]">
                  {item.label} :
                </span>
                <span className="text-[var(--color-neutral-secondary)]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
