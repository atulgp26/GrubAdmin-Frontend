import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import React from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { RiLoopRightFill } from 'react-icons/ri';
import EmptyState from '@/components/ui/EmptyState';

const ManagerList = ({ open, onClose, onReassign, title = "Relationship manager", managers = [] }) => {
  // Fallback to mock data only if no managers are provided
  const mockManagers = Array.from({ length: 4 }).map((_, idx) => ({
    id: `EMP-${idx + 1}`,
    name: "Ravi Kumar",
    idNumber: "#DP1234",
    joinDate: "Joined 12 June '25",
    location: "North Delhi",
    phone: "+91 98765 43210",
    email: "ravikr@gmail.com",
    updated: "12 Aug '25",
  }));

  const rows = Array.isArray(managers) ? managers : [];

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} width="!w-[814px]">
    <div className='flex flex-col gap-6'>
        <div>
            <h1 className='text-[var(--color-neutral-primary)] font-semibold text-2xl'>{title}</h1>
        </div>
          {rows.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1">
            <Table className="min-w-full">
              <TableHead>
                <TableRow>
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
                    <TableCell className="px-3 py-3">
                      <div className='w-[350px]'>
                        <div className="font-semibold pb-1 text-base text-[var(--color-neutral-secondary)]">
                          {manager.name}
                        </div>
                        <div className="text-sm text-[var(--color-stroke-brand)]">
                          {manager.idNumber} | {manager.joinDate} | {manager.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 text-[var(--color-neutral-secondary)] text-base">
                      <div className='flex flex-col gap-1'>
                          <span className='text-[var(--color-neutral-neutral)] font-semibold'>
                      {manager.phone}
                          </span>
                          <span className='text-[var(--color-stroke-brand)] text-sm'>
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
            </div>
          ) : (
            <div className='px-3 py-6'>
              <EmptyState
                title="No assignees yet"
                description="No employees are currently assigned to this role."
                buttonLabel={null}
              />
            </div>
          )}
          <hr class="border-t border-[var(--color-box-border)] w-full" />
          <div className='flex items-center justify-between w-full'>
            <span className='text-lg text-[var(--color-neutral-secondary)]'>{rows.length} assignees</span>
            {rows.length > 0 && (
              <Button size="mdLg" variant="secondary" onClick={onReassign} className="flex items-center gap-2 w-1/2">
                  <RiLoopRightFill className='w-5 h-5'/>
                  REASSIGN TO A NEW ROLE
              </Button>
            )}
          </div>

    </div>
    </Modal>
  )
}

export default ManagerList
