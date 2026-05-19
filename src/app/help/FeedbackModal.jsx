import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function FeedbackModal({ open, onClose, onFeedback }) {
  return (
    <Modal open={open} onClose={onClose} width="w-[560px] max-w-full" height="h-[320px] max-h-full">
      <div className="relative p-2 w-full">
        <div className="text-2xl font-semibold text-[var(--color-neutral-primary)] text-center mb-3">
          Got a minute?
        </div>
        <div className="text-center text-lg text-[var(--color-neutral-secondary)] mb-7">
          We'd love to hear how your experience has been so far.
          <br />
          Your feedback helps us improve GrubPac for you and others.
        </div>
        <div className="flex flex-col gap-3">
          <Button
            className="bg-[var(--color-brand-default)] hover:bg-[var(--color-brand-primary-btn)] text-white font-medium rounded-lg py-3 !text-xl transition-colors"
            onClick={onFeedback}
            size="lgText"
          >
            GIVE FEEDBACK
          </Button>
          <p
          size="lg"
            variant="cancel"
            className="text-[var(--color-stroke-brand)] text-center cursor-pointer text-xl font-medium py-2 rounded-lg"
            onClick={onClose}
            
          >
            NO THANKS
          </p>
        </div>
      </div>
    </Modal>
  );
}
