"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default function DeleteAccountModal({
  open,
  onClose,
  onDelete,
  onSupport,
}) {
  return (
    <Modal open={open} width="w-[600px]" onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <Icon name="account_delete_profile" className="mb-6" />
        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-4">
          Delete your Super admin Account?
        </h2>
        <p className="text-[var(--color-neutral-secondary)] mb-2 text-lg leading-relaxed">
You are about to delete your Super admin account. Since other Super admins exist, your profile will be moved to the Dismissed Employees list.
        </p>
        <p className="text-[var(--color-neutral-secondary)] text-lg leading-relaxed">
          You will no longer have access.
        </p>
        <hr className="w-full border-t border-[var(--color-box-border)] my-6"/>
        <Button
        variant="delete"
          onClick={onDelete}
          className="w-full btn-size-md-lg cursor-pointer py-3 px-6 rounded-lg mb-4 !bg-[var(--color-checkbox-bg)] text-lg text-white  font-medium hover:bg-[var(--color-neutral-secondary)] transition-colors"
        >
          I UNDERSTAND, DELETE MY ACCOUNT
        </Button>
        <Button
        variant="cancel"
          onClick={onClose}
          className="w-full btn-size-md-lg cursor-pointer py-3 px-6 rounded-lg !bg-[var(--color-checkbox-bg)] text-lg text-white  font-medium hover:bg-[var(--color-neutral-secondary)] transition-colors"
        >
          CANCEL
        </Button>
      </div>
    </Modal>
  );
}

function UserBanIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="24" r="12" fill="#FEE3D1" />
      <rect x="12" y="44" width="40" height="12" rx="6" fill="#FEE3D1" />
      <circle cx="32" cy="24" r="8" fill="#fff" fillOpacity="0.2" />
      <g>
        <circle cx="44" cy="20" r="8" fill="#fff" fillOpacity="0" />
        <circle cx="44" cy="20" r="6" fill="#fff" fillOpacity="0" />
        <circle
          cx="44"
          cy="20"
          r="7"
          stroke="#F44336"
          strokeWidth="2"
          fill="#fff"
        />
        <path
          d="M40 24L48 16"
          stroke="#F44336"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
