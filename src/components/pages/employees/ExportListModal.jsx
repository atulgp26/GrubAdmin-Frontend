import Button from "@/components/ui/Button";
import CheckBoxDisable from "@/components/ui/CheckBoxDisable";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import Modal from "@/components/ui/Modal";
import Radio from "@/components/ui/Radio";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { Description } from "@headlessui/react";
import React, { useState, useEffect, useRef } from "react";
import { IoChevronBack } from "react-icons/io5";
const ExportListModal = ({
  open,
  onClose,
  title,
  description,
  footer,
  options = [],
  midLevelData = [],
  onConfirm,
}) => {
  const [scope, setScope] = useState("");
  const [checked, setChecked] = useState({});
  const [openCollapse, setOpenCollapse] = useState("");
  const optionsRef = useRef(JSON.stringify(options));
  const midLevelDataRef = useRef(JSON.stringify(midLevelData));
  const isInitializedRef = useRef(false);
  // Initialize checked state from options and midLevelData when modal opens or data changes
  useEffect(() => {
    if (!open) {
      isInitializedRef.current = false;
      return;
    }
    // Only initialize once when modal opens, or if options/midLevelData actually changed
    const currentOptionsStr = JSON.stringify(options);
    const currentMidLevelDataStr = JSON.stringify(midLevelData);
    if (isInitializedRef.current &&
      optionsRef.current === currentOptionsStr &&
      midLevelDataRef.current === currentMidLevelDataStr) {
      return; // Skip if already initialized and no change
    }
    optionsRef.current = currentOptionsStr;
    midLevelDataRef.current = currentMidLevelDataStr;
    isInitializedRef.current = true;
    const initialChecked = {};
    // Initialize from permissions options
    if (options.length > 0) {
      options.forEach((group) => {
      group.items.forEach((opt) => {
        if (opt.checked !== undefined) {
            initialChecked[opt.id] = opt.checked;
        } else if (opt.disabled) {
            initialChecked[opt.id] = true;
        }
    });
});
    }
    // Initialize from verticals (midLevelData)
    if (midLevelData.length > 0) {
      midLevelData.forEach((v) => {
        if (v.checked !== undefined) {
          initialChecked[v.id] = v.checked;
        }
      });
    }
    setChecked(initialChecked);
  }, [open, options, midLevelData]);
  return (
    <Modal open={open} onClose={onClose} width="w-[814px]">
      <div className={`${description ? "hidden" : ""} mb-6`}>
        <Button
          variant="skip"
          size="mdLg"
          className="flex gap-2 group"
          onClick={onClose}
        >
          <IoChevronBack className="w-6 h-6 text-[var(--color-stroke-brand)]" />
          BACK
        </Button>
      </div>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            {title || `Customise your export`}
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)]">
            {description ||
              `Select the scope, and details you’d like to include in the export file.`}
          </p>
        </div>
        {title && title !== "Customise your export" && midLevelData.length > 0 && (
          <div className="grid grid-cols-4 gap-x-6">
            {midLevelData.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center border-b border-[var(--color-stroke-neutral)] p-6 gap-2"
              >
                <TableCheckbox
                  checked={checked[opt.id] || false}
                  onChange={(e) => setChecked({ ...checked, [opt.id]: e.target.checked })}
                />
                <span className="pl-3 text-[var(--color-neutral-secondary)]">
                  {opt.label}
                </span>
              </div>
            ))}
          </div>
        )}
        <div>
          {options.map((group, index) => (
            <DetailsCollapse
              key={group.group}
              title={
                group.items.some((opt) => opt.type === "checkbox")
                  ? `${group.title} (${group.items.filter(
                    (opt) => opt.type === "checkbox" && checked[opt.id]
                  ).length
                  } of ${group.items.filter((opt) => opt.type === "checkbox")
                    .length
                  })`
                  : group.title
              }
              open={openCollapse === group.group}
              onClick={() =>
                setOpenCollapse(openCollapse === group.group ? "" : group.group)
              }
              exportModal={title && title !== "Customise your export" ? true : false}
            >
              <div className="grid grid-cols-2">
                {group.items.map((opt, index) => (
                  <div
                    key={opt.id}
                    className={`flex w-full items-center border-b border-[var(--color-stroke-neutral)] px-6 py-4 gap-2 ${
                      // if it's the last item AND total count is odd → span full width
                      index === group.items.length - 1 && group.items.length % 2 !== 0
                        ? "col-span-2"
                        : ""
                      }`}
                  >
                    {opt.type === "radio" ? (
                      <Radio
                        checked={scope === opt.id}
                        onChange={() => setScope(opt.id)}
                        variant={opt.variant || "default"} // <-- use variant if provided
                      />
                    ) : opt.disabled ? (
                      <CheckBoxDisable
                        checked={checked[opt.id] || false}
                        disabled
                        onChange={() => { }}
                      />
                    ) : (
                      <TableCheckbox
                        checked={checked[opt.id] || false}
                        onChange={(e) =>
                          setChecked({ ...checked, [opt.id]: e.target.checked })
                        }
                      />
                    )}
                    <span className="pl-3 text-[var(--color-neutral-secondary)]">
                      {opt.label}
                    </span>
                  </div>
                ))}
              </div>
            </DetailsCollapse>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-stroke-neutral)]">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {footer ? footer : "Export will be provided in CSV format."}
          </div>
      <Button
    onClick={() => {
        if (onConfirm) {
            onConfirm({ scope, checked });
        } else {
            onClose();
        }
    }}
    variant="outline"
    size="mdLg"
    className="w-1/2"
>
    {title && title !== "Customise your export" ? "CLOSE" : "EXPORT NOW"}
</Button>
        </div>
      </div>
    </Modal>
  );
};
export default ExportListModal;