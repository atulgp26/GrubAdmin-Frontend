import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import { MdWarning } from "react-icons/md";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function DeleteEmployeeModal({
  open,
  onClose,
  onDelete,
  onSuspend,
  selectedCount = 0,
  firstSelectedName = "this account",
  warning,
  deleteClientSetup
}) {
  if (!open) return null;
  const othersCount = Math.max(0, selectedCount - 1);
  const title = selectedCount <= 0
    ? "Delete selected accounts?"
    : othersCount === 0
      ? `Delete ${firstSelectedName}?`
      : `Delete ${firstSelectedName} and ${othersCount} other account${othersCount === 1 ? "" : "s"}?`;
  const ctaText = selectedCount === 1 
    ? `I UNDERSTAND, DELETE ${firstSelectedName.toUpperCase()}`
    : `I UNDERSTAND, DELETE ${selectedCount || 0} ACCOUNTS`;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center mt-12">
        <div className="flex flex-col items-center justify-center mb-6">
          <Image
            src="/account_delete_profile.svg"
            alt="Location icon"
            width={120}
            height={120}
            className="mb-4"
          />
        </div>
        <div className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
        {deleteClientSetup?"Delete setup for Ravi Kumar?":title}
        </div>
        <div className="text-[var(--color-neutral-secondary)] text-lg mb-4 max-w-xl">
        {deleteClientSetup?<>This will reset the client’s onboarding configuration. Their boxes and account details will remain unchanged, but they will need to <br /> complete setup again. <br /> Use this only if setup errors prevent smooth usage.</>:"This will permanently remove the selected accounts from the system. Their history will remain in logs, but they won’t be able to access the platform again unless re-added as new employees."} 
        </div>
        <div className="border-t border-[var(--color-box-border)] p-[1px] w-full my-6"></div>
        {warning && (
          <div className="flex gap-2 items-center justify-center text-lg text-[var(--color-neutral-secondary)] mb-6">
            <MdWarning className="w-5 h-5 text-[var(--color-neutral-secondary)]" />
            <span>
              This action cannot be undone. Your historical logs will remain.
            </span>
          </div>
        )}
        <Button
        variant="delete"
          className={`w-full btn-size-md-lg bg-[var(--color-checkbox-bg)] border-[var(--color-stroke-brand)] hover:opacity-90 text-white font-medium rounded-lg py-3 text-lg ${deleteClientSetup?"mb-4":"mb-12"} transition`}
          onClick={onDelete}
        >
        {deleteClientSetup?"I UNDERSTAND. DELETE SETUP":ctaText} 
        </Button>
        {deleteClientSetup?
        <Button variant="text" size="mdLg">
          CANCEL
        </Button>
        :
        <div className="flex items-center justify-between w-full">
          <p className="text-left text-lg text-[var(--color-neutral-secondary)]">
            Not sure? You can suspend the<br />
            accounts instead.
          </p>
      <Button
  variant="outline"
  onClick={() => {
    onClose();
    if (onSuspend) onSuspend();
  }}
  className="w-[270px] btn-size-md-lg"
>
  SUSPEND EMPLOYEE
</Button>
        </div>
        } 
      </div>
    </Modal>
  );
}