"use client"
import toast from "react-hot-toast";
import React from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";


export function showSuccess(title, message, hideDetails = false, href = "", action = null) {
  toast.custom(
    (t) => (
      <div className="w-full flex items-center justify-between gap-3 bg-[var(--toast-success-bg)] border border-[var(--notif-success)] px-4 py-3 rounded-lg z-50">
        <div className="flex gap-4 items-center">
          <FaRegCircleCheck
            strokeWidth={1}
            className="w-6 h-6 text-[var(--notif-success)]"
          />
          <span className="font-semibold text-[var(--color-success-dark)] text-lg">{title}</span>
          <span className="text-[var(--color-success-dark)]">{message}</span>
        </div>
        <div className="flex items-center gap-3">
          {href && (
            <Link
              href={`${href ? href : ""}`}
              className={`${hideDetails ? "hidden" : ""} text-[var(--notif-success)] hover:text-success-toast px-4 font-medium`}
            >
              VIEW DETAILS
            </Link>
          )}
          {/*  ASSIGN BOX button */}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                toast.dismiss(t.id);
              }}
              className="text-[var(--notif-success)] font-medium border border-[var(--notif-success)] rounded px-3 py-1 bg-white hover:bg-white transition-colors"
            >
              {action.label}
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
            className="p-1 hover:bg-black/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Dismiss"
          >
            <IoMdClose strokeWidth={2} className="w-5 h-5 text-[var(--color-success-dark)]" />
          </button>
        </div>
      </div>
    ),
    { position: "top-center" }
  );
}


export function showError(message) {
  toast.custom(
    (t) => (
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-lg z-50 bg-error-toast border border-error-toast shadow-toast text-error-toast">
        <div className="flex gap-4 items-center text-error-toast">
          <Icon name="warning" className="w-5 h-5 text-error-toast" />
          <span className="text-base text-error-toast">{message}</span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          className="p-1 hover:bg-black/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Dismiss"
        >
          <IoMdClose className="w-5 h-5 text-[var(--color-stroke-brand)]" />
        </button>
      </div>
    ),
    { position: "top-center" }
  );
}
