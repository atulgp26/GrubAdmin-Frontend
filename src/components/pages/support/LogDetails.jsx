"use client";
import { FiEdit2 } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function LogDetails({ open, onClose, onEdit, onDelete, details = [] }) {

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
        <div className="space-y-6 pb-6 border-b border-[var(--color-box-border)]">
          {details.map((item, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-0">
              <span className="text-[var(--color-neutral-secondary)]">
                {item.label} :
              </span>
              <span className="text-[var(--color-neutral-secondary)]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-6 ml-3 flex justify-between items-center">
          <Button variant="cancel" onClick={onDelete || onClose} className="btn-size-md-lg">DELETE</Button>
          <Button
            onClick={onEdit}
            variant="secondary"
            className="flex items-center btn-size-md-lg gap-3 px-8"
          >
            <FiEdit2 className="w-4 h-4" />
            EDIT DETAILS
          </Button>
        </div>
      </div>
    </Modal>
  );
}
