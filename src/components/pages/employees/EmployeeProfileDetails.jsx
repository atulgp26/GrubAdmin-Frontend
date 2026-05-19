"use client";
import { FiEdit2 } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ArrowUpRight } from "lucide-react";

export default function EmployeeProfileDetails({ open, onClose, onEdit,status }) {
  const details = [
    { label: "Status", value: status },
    { label: "Employee ID", value: "#DP1234" },
    {
      label: "Role",
      value: (
        <div className="flex gap-42 text-[var(--color-neutral-secondary)]">
          <p>Manager</p>
          <p><ArrowUpRight className="w-5 h-5 text-[var(--color-stroke-brand)]"/></p>
        </div>
      ),
    },
    {
      label: "Contact details",
      value: (
        <div className="flex flex-col gap-6 text-[var(--color-neutral-secondary)]">
          <p>+91 98000 00000</p>
          <p>ravikr@gmail.com</p>
        </div>
      ),
    },
    { label: "Location", value: "North India" },
    { label: "Joining date", value: "12 June ‘25" },
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

        <div className="mt-6 ml-3 flex justify-between items-center">
          <Button variant="cancel" onClick={onClose}>DELETE</Button>
          <Button
            onClick={onEdit}
            variant="secondary"
            className="flex items-center gap-3 px-8"
          >
            <FiEdit2 className="w-4 h-4" />
            EDIT DETAILS
          </Button>
        </div>
      </div>
    </Modal>
  );
}
