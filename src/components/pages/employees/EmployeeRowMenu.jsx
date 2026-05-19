import Icon from "@/components/ui/Icon";
import { useRef, useEffect } from "react";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { LuRefreshCw, LuCircleMinus, LuPencilLine } from "react-icons/lu";
import { RxCrossCircled } from "react-icons/rx";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/context/PermissionContext";

export default function EmployeeRowMenu({
  open,
  onClose,
  onRowAction,
  groupId,
  employeeId,
  allowEdit,
  allowDelete,
}) {
  const menuRef = useRef(null);
  const { can } = usePermissions();
  const canEdit = typeof allowEdit === 'boolean' ? allowEdit : can('edit employees', 'employees');
  const canDelete = typeof allowDelete === 'boolean' ? allowDelete : can('delete employees', 'employees');
  const canSuspend = can('suspend employees','employees') || can('suspend employees');
  const canViewLogs = can('view employee logs','employees') || can('view employee logs');

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50"
    >
      {canEdit && (
        <Button
          variant="profile"
          className="flex btn-size-md-sm !rounded-b-none items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)] active:text-[var(--color-neutral-primary)]"
          onClick={() => {
            onRowAction('edit', employeeId);
            onClose();
          }}
        >
          <LuPencilLine className="mr-2 w-5 h-5 text-[var(--color-neutral-light)] " /> Edit employee details
        </Button>
      )}
      {groupId !== 'unassigned' && canViewLogs && (
        <Link href="/employees/activelogs" className="block">
      <Button
      variant="profile"
            className="flex btn-size-md-sm !rounded-none items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)] active:text-[var(--color-neutral-primary)]"
            onClick={() => { onClose(); }}
          >
            <Icon name="note" className="mr-2 w-5 h-5 text-[var(--color-neutral-light)] " /> View logs
          </Button>
        </Link>
      )}
      {canSuspend && (
        <Button
          variant="profile"
          className="flex btn-size-md-sm !rounded-none items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)] active:text-[var(--color-neutral-primary)]"
          onClick={() => { onRowAction('suspend', employeeId); onClose(); }}
        >
          <RxCrossCircled className="mr-2 w-5 h-5 text-[var(--color-neutral-light)] " /> Suspend employee
        </Button>
      )}
      {canDelete && (
        <Button
          variant="profile"
          className="flex btn-size-md-sm !rounded-t-none items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)] active:text-[var(--color-neutral-primary)]"
          onClick={() => { onRowAction('delete', employeeId); onClose(); }}
        >
          <FiTrash2 className="mr-2 w-5 h-5 text-[var(--notif-error)] group-hover:text-[var(--info-panel-view-bg)] group-active:text-[var(--color-filter-text)]" /> Delete employee
        </Button>
      )}
    </div>
  );
}
