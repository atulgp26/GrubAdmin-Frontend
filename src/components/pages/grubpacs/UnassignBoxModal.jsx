"use client";
import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Image from "next/image";

export default function UnassignBoxModal({
  open,
  onClose,
  onConfirm,
  boxName,
  boxId,
  count,
  ctaLabel = "I UNDERSTAND. UNASSIGN",
  description,
}) {
  if (!open) return null;

  const isBulk = typeof count === "number" && count > 1;
  const title = isBulk
    ? `Unassign ${count} selected boxes?`
    : `Unassign ${boxName ?? "this box"}${boxId ? ` [${boxId}]` : ""}?`;

  const detailText =
    description ??
    (isBulk
      ? "This will remove the boxes from the clients’ accounts. They will remain in the GrubPac list as unassigned."
      : "This will remove the box from the client’s account. It will remain in the GrubPac list as unassigned.");

  return (
    <Modal open={open} onClose={onClose} width="max-w-[604px]" closeOnOutsideClick={false}>
      <div className="px-8 py-8">
        <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex justify-center mb-6">
        <Image src="/exclamation-triangle.svg" width={120} height={120} alt="warning_image" />
        </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] leading-snug">{title}</h2>
            <p className="text-lg text-[var(--color-neutral-secondary)] leading-relaxed">
              {detailText}
            </p>
          </div>
        </div>
        <hr className="mt-8 mb-6 border-[var(--color-box-border)]" />
        <div className="flex flex-col gap-3">
          <Button
            variant="delete"
            size="mdLg"
            onClick={onConfirm}
          >
            {isBulk ? `I UNDERSTAND. UNASSIGN ${count} BOXES` : ctaLabel}
          </Button>
          <Button variant="cancel" size="mdLg" onClick={onClose} className="">
            CANCEL
          </Button>
        </div>
      </div>
    </Modal>
  );
}

