import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import React from "react";

const SuspendEmployeeModal = ({ open, onClose, onSuspend, selectedCount = 0, firstSelectedName = "" }) => {
  if (!open) return null;
  const othersCount = Math.max(0, selectedCount - 1);
  const title = selectedCount <= 0
    ? "Suspend selected employees?"
    : othersCount === 0
      ? `Suspend ${firstSelectedName}?`
      : `Suspend ${firstSelectedName} and ${othersCount} other${othersCount === 1 ? "" : "s"}?`;
  const ctaText = selectedCount === 1 
    ? `YES, SUSPEND EMPLOYEE`
    : `YES, SUSPEND ${selectedCount || 0} EMPLOYEES`;
  return (
    <Modal open={open} onClose={onClose} width="w-[600px]">
      <div className="flex justify-center flex-col mt-12">
        <h1 className="text-2xl text-center text-[var(--color-neutral-primary)] font-semibold pb-4">
          {title}
        </h1>
        <p className="text-[var(--color-neutral-secondary)] text-center text-lg">
          This will temporarily deactivate the selected accounts. They won’t be
          able to log in or access any boxes until reactivated. No data will be
          lost, and access can be resumed anytime.
        </p>
        <hr className="border-t border-[var(--color-box-border)] my-6" />
        <Button
          onClick={() => {
            console.log("Suspend button clicked, calling onSuspend");
            onSuspend();
          }}
          variant="primary"
          size="mdLg"
          className="mb-4"
        >
          {ctaText}
        </Button>
        <Button onClick={onClose} variant="cancel" size="mdLg">
          CANCEL
        </Button>
      </div>
    </Modal>
  );
};

export default SuspendEmployeeModal;
