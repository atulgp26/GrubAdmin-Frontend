"use client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const buildSuspendContent = (categoryTitle, faqCount) => {
  const countNumber = Number(faqCount);
  const hasFaqs = !Number.isNaN(countNumber) && countNumber > 0;
  const title = hasFaqs
    ? `Suspend ${categoryTitle} and FAQs?`
    : `Suspend ${categoryTitle}?`;
  const description = hasFaqs
    ? "This will temporarily hide this category and its FAQs from all client platforms. You can restore it anytime from the suspended list. No data will be lost."
    : "This category doesn’t have any FAQs yet. Suspending it will simply hide it from clients view. You can activate it later anytime.";
  const cta = hasFaqs
    ? `YES, SUSPEND CATEGORY${countNumber ? ` & ${countNumber} FAQ${countNumber === 1 ? "" : "S"}` : ""}`
    : "YES, SUSPEND CATEGORY";

  return { title, description, cta };
};

const SuspendCategoryModal = ({
  open,
  onClose,
  onConfirm,
  categoryTitle = "this category",
  faqCount = 0,
}) => {
  if (!open) return null;

  const { title, description, cta } = buildSuspendContent(categoryTitle, faqCount);

  return (
    <Modal open={open} onClose={onClose} width="w-[600px]">
      <div className="mt-8 flex flex-col justify-center">
        <h1 className="pb-4 text-center text-2xl font-semibold text-[var(--color-neutral-primary)]">
          {title}
        </h1>
        <p className="px-4 text-center text-lg text-[var(--color-neutral-secondary)]">
          {description}
        </p>
        <hr className="my-6 border-t border-[var(--color-box-border)]" />
        <Button onClick={onConfirm} variant="primary" size="mdLg" className="mb-4">
          {cta}
        </Button>
        <Button onClick={onClose} variant="cancel" size="mdLg">
          CANCEL
        </Button>
      </div>
    </Modal>
  );
};

export default SuspendCategoryModal;


