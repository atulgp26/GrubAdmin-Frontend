"use client"
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { mockDetailsData } from "@/hooks/useBoxDetailsData";
import { FaAngleLeft } from "react-icons/fa6";

const EmployeeDetails = () => {
  return (
    <div>
      <h1 className="flex gap-2 items-center text-2xl text-[var(--color-neutral-primary)] font-semi mb-6">
        <FaAngleLeft className="w-5 h-5 text-[var(--color-stroke-brand)]"/>
        Details
      </h1>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="!text-[var(--color-stroke-brand)] !text-sm font-normal !w-50">
                Time stamp
              </TableCell>
              <TableCell className="!pr-32 !text-[var(--color-stroke-brand)] !text-sm font-normal ">
                Employee
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] !text-sm font-normal ">
                Action
              </TableCell>
              <TableCell className="w-12"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockDetailsData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="!text-base font-semibold !text-[var(--color-neutral-secondary)]">
                  {item.timestamp}
                  </TableCell>
                <TableCell>
                  <div>
                    <div
                      className="!text-base cursor-pointer font-semibold text-[var(--color-neutral-secondary)]"
                      onClick={() => setOpenGroupModal(true)}
                    >
                      {item.name || `BOX-${item.code || item.id}`}
                    </div>
                    <div className=" text-[var(--color-stroke-brand)] pt-1">
                      {item.code || item.id} | {item.location || "Room 202"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="!text-base !text-[var(--color-neutral-secondary)]">{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};

export default EmployeeDetails;
