import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import React from "react";

const ActivateEmployeeModal = ({
  open,
  onClose,
  onActivate,
  selectedCount = 0,
  firstSelectedName = "",
  // Custom modal props
  custom = false,
  onConfirm,
  title,
  description,
  confirmText,
}) => {
  if (!open) return null;

  // Default employee modal logic (only if not custom)
  const othersCount = Math.max(0, selectedCount - 1);
  const defaultTitle =
    selectedCount <= 0
      ? "Reactivate selected employees?"
      : othersCount === 0
      ? `Reactivate ${firstSelectedName}?`
      : `Reactivate ${firstSelectedName} and ${othersCount} other${
          othersCount === 1 ? "" : "s"
        }?`;

  const defaultCtaText = `YES, REACTIVATE ${selectedCount || 0} ${
    selectedCount === 1 ? "EMPLOYEE" : "EMPLOYEES"
  }`;

  const defaultDescription =
    "This will restore the selected accounts and allow them to log in again. They will regain access to their previous roles and permissions.";

  return (
    <Modal open={open} onClose={onClose} width="w-[600px]">
      <div className="flex justify-center flex-col mt-12">
        {/* Title */}
        <h1 className="text-2xl text-center text-[var(--color-neutral-primary)] font-semibold pb-4">
          {custom ? title : defaultTitle}
        </h1>

        {/* Description */}
        <p className="text-[var(--color-neutral-secondary)] text-center text-lg">
          {custom ? description : defaultDescription}
        </p>

        <hr className="border-t border-[var(--color-box-border)] my-6" />

        {/* Confirm button */}
        <Button
          onClick={custom ? onConfirm : onActivate}
          variant="primary"
          size="mdLg"
          className="mb-4"
        >
          {custom ? confirmText : defaultCtaText}
        </Button>

        {/* Cancel button */}
        <Button onClick={onClose} variant="cancel" size="mdLg">
          CANCEL
        </Button>
      </div>
    </Modal>
  );
};

export default ActivateEmployeeModal;
