import { RxCross2 } from "react-icons/rx";
import { useState, useRef, useEffect } from "react";
import SelectedAction from "./SelectedAction";
import { RiLoopRightLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
export default function SupportActionBar({
  selectedCount = 0,
  onClearSelection,
  onSuspendBoxes,
  onRemoveVehicles,
  onReassignGroup,
  onRemoveRoom,
  rightActionLabel,
  rightActionIcon,
  onRightAction,
  onPublishFAQs,
  onUnpublishFAQs,
  suspended,
  rightActionVariant,
  onDelete,
  onChange,
  allowDelete = true,
  allowChange = true,
  allowToggle = true
}) {
  const [activeAction, setActiveAction] = useState(null);
  const actionRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (actionRef.current && !actionRef.current.contains(e.target)) {
        setActiveAction(null);
      }
    }
    if (activeAction) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeAction]);
  if (selectedCount === 0) return null;
  const toggleAction = (actionName) => {
    setActiveAction((prev) => (prev === actionName ? null : actionName));
  };
  const ActionButton = ({ name, icon, label }) => {
    const isActive = activeAction === name;
    return (
      <div className="relative">
        <Button
          variant="cancel"
          className={`flex btn-size-md-cancel items-center gap-2 ${isActive ? "underline text-[var(--notif-border)] shadow-[0_0_0_2px_var(--action-btn-bg)] bg-[var(--color-neutral-secondary-bg)]" : "bg-transparent"} uppercase cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors`}
          onClick={() => toggleAction(name)}
        >
          {icon || null}
          {label}
        </Button>
        {isActive && name === "CHECK STATUS" && (
          <SelectedAction
            open={isActive}
            onUnpublishFAQs={onUnpublishFAQs}
            onPublishFAQs={onPublishFAQs}
            onClose={() => setActiveAction(null)}
          />
        )}
      </div>
    );
  };
  return (
    <div className={`fixed bottom-1 left-56 right-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] text-[var(--color-stroke-brand)] rounded-lg shadow-lg flex items-center justify-between px-6 py-3 z-50`}>
      <div className="flex items-center space-x-2">
        <Button
        variant="grayOutline"
          className="flex gap-2 btn-size-md-cancel !border cursor-pointer !border-[var(--color-stroke-brand)] bg-white px-4 py-2 rounded-md !text-base font-medium items-center"
          onClick={onClearSelection}
        >
          <RxCross2 className="text-lg" />
          {selectedCount} SELECTED
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        {suspended ? (
          <Button
          variant="cancel"
            className="px-4 py-3 btn-size-md-cancel cursor-pointer flex items-center gap-3 text-[var(--color-stroke-brand)] hover:underline font-medium uppercase"
            onClick={onRemoveVehicles}
          >
            <Trash2 className="w-5 h-5 text-[var(--color-neutral-light)] active:text-[var(--notif-border)]" />
            Remove Selection
          </Button>
        ) : (
          <div className="flex items-center space-x-4" ref={actionRef}>
            {allowToggle && <ActionButton name="CHECK STATUS" label="CHECK STATUS" />}
            <div className="w-px h-8 bg-[var(--color-box-border)]" />
          {allowChange && (
          <Button
          variant="cancel"
            className=" btn-size-md-cancel cursor-pointer flex items-center gap-3 text-[var(--color-stroke-brand)] hover:underline font-medium uppercase"
            onClick={onChange}
          >
            <RiLoopRightLine className="w-5 h-5" />
            CHANGE CATEGORY
          </Button>
          )}
          {allowDelete && (
          <Button
          variant="cancel"
            className=" btn-size-md-cancel cursor-pointer flex items-center gap-3 text-[var(--color-stroke-brand)] hover:underline font-medium uppercase"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5" />
            DELETE
          </Button>
          )}
            {onSuspendBoxes && (
              <ActionButton name="temperature" icon={<Icon name="thermometer_icon" className="h-5 w-5" />} label="Temperature" />
            )}
          </div>
        )}
        {rightActionLabel && onRightAction && (
          <Button
            variant={rightActionVariant || "lock"}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 ${rightActionLabel === "EMERGENCY UNLOCK"
              ? `border border-[var(--color-warning)] !rounded-full hover:text-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]`
              : "bg-transparent uppercase cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors"
              }`}
            onClick={onRightAction}
          >
            {rightActionIcon && rightActionIcon}
            {rightActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}