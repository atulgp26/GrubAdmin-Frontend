import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox"; // ✅ make sure this is imported
import { RiLoopRightFill } from "react-icons/ri";
import { FaAngleRight } from "react-icons/fa6";

const SelectEmplyeesReassign = ({ open, onClose, onNext, employees = [] }) => {
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const rows = useMemo(() => Array.isArray(employees) ? employees : [], [employees]);

  const handleSelectRole = (roleId, checked) => {
    const newSelected = new Set(selectedRoles);
    if (checked) {
      newSelected.add(roleId);
    } else {
      newSelected.delete(roleId);
    }
    setSelectedRoles(newSelected);
    setSelectAll(newSelected.size === rows.length);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRoles(new Set(rows.map((m) => m.id)));
      setSelectAll(true);
    } else {
      setSelectedRoles(new Set());
      setSelectAll(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl">
            Select employees to reassign
          </h1>
        </div>

        <Table className="min-w-full">
          <TableHead>
            <TableRow>
              <TableCell className="w-12 px-3 py-3">
                {/* Select all checkbox */}
                <TableCheckbox
                  checked={selectAll}
                  indeterminate={
                    selectedRoles.size > 0 &&
                    selectedRoles.size < rows.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell className="px-3 py-3 !text-sm font-medium text-[var(--color-stroke-brand)]">
                Name
              </TableCell>
              <TableCell className="px-3 py-3 !text-sm font-medium text-[var(--color-stroke-brand)] ">
                Contact info
              </TableCell>
              <TableCell className="px-3 py-3 !text-sm font-medium text-[var(--color-stroke-brand)]">
                Updated
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell className="w-12 px-3 py-3">
                  <TableCheckbox
                    checked={selectedRoles.has(manager.id)}
                    onChange={(e) =>
                      handleSelectRole(manager.id, e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell className="px-3 py-3">
                  <div className="w-[350px]">
                    <div className="font-semibold text-base pb-1 text-[var(--color-neutral-secondary)]">
                      {manager.name}
                    </div>
                    <div className="text-sm text-[var(--color-stroke-brand)]">
                      {manager.idNumber} | {manager.joinDate} |{" "}
                      {manager.location}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 text-[var(--color-neutral-secondary)] text-base">
                  <div className="flex flex-col">
                    <span className="text-[var(--color-neutral-neutral)] pb-1 font-semibold">
                      {manager.phone}
                    </span>
                    <span className="text-[var(--color-stroke-brand)] text-sm">
                      {manager.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 text-[var(--color-neutral-secondary)] text-base">
                  {manager.updated}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Divider */}
        <hr className="border-t border-[var(--color-box-border)] w-full" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-lg text-[var(--color-neutral-secondary)]">
            {selectedRoles.size} {selectedRoles.size !== 1 && "s"}{" "}
            selected
          </span>
          <Button
          size="mdLg"
            variant="secondary"
            className="flex gap-2 items-center justify-center w-1/2"
            disabled={selectedRoles.size === 0}
            onClick={() => onNext(Array.from(selectedRoles))}
          >
            NEXT
            <FaAngleRight className="w-5 h-5"/>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectEmplyeesReassign;
