// components/ConfirmRoleModal.tsx
"use client";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function ConfirmRoleModal({
  open,
  onClose,
  width = "w-[550px]",
  selectedCount,
  roles = [],
  title,
  description,
  onConfirmChanges,
}) {
  if (!open) return null;

  // Split roles into old & new
  const oldRoles = roles.filter((role) => role.type === "old");
  const newRoles = roles.filter((role) => role.type === "new");

  return (
    <Modal open={open} onClose={onClose} width={width}>
      <div className="relative mt-6">
        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] text-center">
          {title || `Apply changes to ${selectedCount} employees?`}
        </h2>
        <p className="text-[var(--color-stroke-brand)] text-center">
          {description ||
            "This will update their existing permissions with the new role’s permissions."}
        </p>

        {/* Roles Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Old Roles */}
          <div className="bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-lg p-4">
            <div className="mb-4">
              <Badge color="red" className="!text-sm">
                OLD
              </Badge>
            </div>
            <div className="mt-2 space-y-4">
              {oldRoles.map((role, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-lg text-[var(--color-neutral-primary)]">
                    {role.name} {role.count ? `(${role.count})` : ""}
                  </p>
                  <p className="text-[var(--color-neutral-secondary)]">
                    {role.permissions} Permissions
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* New Roles */}
          <div className="bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-lg p-4">
            <div className="mb-4">
              <Badge color="green" className="!text-sm">
                NEW
              </Badge>
            </div>
            <div className="mt-2 space-y-4">
              {newRoles.map((role, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-lg text-[var(--color-neutral-primary)]">
                    {role.name} {role.count ? `(${role.count})` : ""}
                  </p>
                  <p className="text-[var(--color-neutral-secondary)]">
                    {role.permissions} Permissions
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-box-border)] my-6"></div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="secondary"
            size="mdLg"
            onClick={onConfirmChanges}
            className="w-full btn-size-md-lg font-medium"
          >
            {title?"I UNDERSTAND, CONFIRM CHANGES":"CONFIRM CHANGES"}
          </Button>
          <Button
            variant="cancel"
            size="mdLg"
            onClick={onClose}
            className="w-full text-lg font-medium"
          >
            CANCEL
          </Button>
        </div>
      </div>
    </Modal>
  );
}
