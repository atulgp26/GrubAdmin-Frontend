"use client";
import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";

export default function EmployeeSkeleton({ rows = 5 }) {
  const skeletonRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <div className="animate-pulse">
      <Table className="min-w-full">
        <TableHead>
          <TableRow>
            <TableCell className="w-12 p-4">
              <div className="w-4 h-4 bg-gray-200 rounded" />
            </TableCell>
            <TableCell className="p-4">
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </TableCell>
            <TableCell className="p-4">
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </TableCell>
            <TableCell className="p-4">
              <div className="h-3 w-10 bg-gray-200 rounded" />
            </TableCell>
            <TableCell className="p-4">
              <div className="h-3 w-14 bg-gray-200 rounded" />
            </TableCell>
            <TableCell className="w-12 p-4" />
          </TableRow>
        </TableHead>
        <TableBody>
          {skeletonRows.map((i) => (
            <TableRow key={i}>
              <TableCell className="w-12 p-4">
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </TableCell>
              <TableCell className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                  <div className="h-3 w-56 bg-gray-200 rounded" />
                </div>
              </TableCell>
              <TableCell className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                </div>
              </TableCell>
              <TableCell className="p-4">
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </TableCell>
              <TableCell className="p-4">
                <div className="h-4 w-14 bg-gray-200 rounded" />
              </TableCell>
              <TableCell className="w-12 p-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
