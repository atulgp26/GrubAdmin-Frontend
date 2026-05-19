import Button from "@/components/ui/Button";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { LuPencilLine, LuUserMinus, LuUserPlus } from "react-icons/lu";
import { RiLoopRightFill } from "react-icons/ri";

export default function GrubpacRowMenu({
  open,
  onClose,
  onAction,
  isAssigned,
}) {
  if (!open) return null;

  const options = isAssigned
    ? [
        {
          key: "edit",
          label: "Edit box details",
          icon: <LuPencilLine className="mr-2 w-5 h-5 text-[var(--color-neutral-light)]" />,
        },
        {
          key: "remove-assignment",
          label: "Remove box assignment",
          icon: <AiOutlineCloseSquare className="mr-2 w-5 h-5 text-[var(--color-neutral-light)]" />,
        },
        {
          key: "delete",
          label: "Delete box",
          icon: <FiTrash2 className="mr-2 w-5 h-5 text-[var(--notif-error)]" />,
        },
      ]
    : [
        {
          key: "edit",
          label: "Edit box details",
          icon: <FiEdit2 className="mr-2 w-5 h-5 text-[var(--color-neutral-light)]" />,
        },
        {
          key: "assign",
          label: "Assign to client",
          icon: <RiLoopRightFill className="mr-2 w-5 h-5 text-[var(--color-neutral-light)]" />,
        },
        {
          key: "delete",
          label: "Delete box",
          icon: <FiTrash2 className="mr-2 w-5 h-5 text-[var(--notif-error)]" />,
        },
      ];

  return (
    <div className=" w-full bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] z-50">
      {options.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        const roundedClass = isFirst
          ? "!rounded-b-none"
          : isLast
          ? "!rounded-t-none"
          : "!rounded-none";

        return (
          <Button
            key={option.key}
            variant="profile"
            className={`flex btn-size-md-sm items-center w-full px-4 py-3 text-sm text-[var(--color-neutral-secondary)] active:text-[var(--color-neutral-primary)] whitespace-nowrap ${roundedClass}`}
            onClick={() => {
              onAction?.(option.key);
              onClose?.();
            }}
          >
            {option.icon}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

