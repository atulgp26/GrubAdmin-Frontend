"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { FaAngleLeft } from "react-icons/fa6";
import { logsService } from "@/api/services/logsService";
import { formatDateTime } from "@/utils/formatDate";
import LoadingDetails from "@/components/ui/LoadingDetails";

const EmployeeDetails = () => {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    if (!employeeId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await logsService.getLogs({
        admin_id: employeeId,
        page: 1,
        limit: 50,
      });
      setLogs(response?.data?.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (loading) {
    return <LoadingDetails />;
  }

  return (
    <div>
      <h1 className="flex gap-2 items-center text-2xl text-[var(--color-neutral-primary)] font-semi mb-6">
        <FaAngleLeft className="w-5 h-5 text-[var(--color-stroke-brand)]" />
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
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="!text-base text-[var(--color-neutral-secondary)]">
                No activity found for this employee.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="!text-base font-semibold !text-[var(--color-neutral-secondary)]">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="!text-base font-semibold text-[var(--color-neutral-secondary)]">
                      {item.actor?.name || "—"}
                    </div>
                    <div className="text-[var(--color-stroke-brand)] pt-1">
                      {item.category || "—"} | {item.type || "—"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="!text-base !text-[var(--color-neutral-secondary)]">
                  {item.description || "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeDetails;
