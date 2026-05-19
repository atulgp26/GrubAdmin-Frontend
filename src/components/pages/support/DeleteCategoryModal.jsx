"use client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const DeleteCategoryModal = ({
  open,
  onClose,
  onConfirm,
  categoryTitle = "this category",
  faqCount = 0,
  categoryDescription,
  titleProp,
  descriptionProp,
  ctaProp,
}) => {
  if (!open) return null;

  const countNumber = Number(faqCount);
  const faqCountKnown = faqCount !== undefined && faqCount !== null && !Number.isNaN(countNumber);
  const hasFaqs = faqCountKnown ? countNumber > 0 : null;

  const defaultTitle =
    hasFaqs === null
      ? `Delete “${categoryTitle}” category?`
      : hasFaqs
        ? `Delete “${categoryTitle}” and FAQs?`
        : `Delete “${categoryTitle}” category?`;

  const defaultDescription =
    hasFaqs === null
      ? "Deleting this category will permanently remove it along with any FAQs it may contain."
      : hasFaqs
        ? `This category contains ${countNumber} FAQ${countNumber === 1 ? "" : "s"}. Deleting it will remove the category and all its FAQs permanently. If you only want to hide it, consider suspending instead.`
        : "This category doesn’t have any FAQs. Once deleted, it will be permanently removed from the list.";

  const defaultCta =
    hasFaqs
      ? `YES, DELETE CATEGORY${faqCountKnown ? ` & ${countNumber} FAQ${countNumber === 1 ? "" : "S"}` : ""}`
      : "YES, DELETE CATEGORY";

  const title = titleProp || defaultTitle;
  const description = descriptionProp || categoryDescription || defaultDescription;
  const cta = ctaProp || defaultCta;
  const confirmVariant = ctaProp ? "primary" : "secondary";

  return (
    <Modal open={open} onClose={onClose} width="w-[600px]">
      <div className="flex flex-col justify-center mt-8">
        <h1 className="pb-4 text-2xl font-semibold text-center text-[var(--color-neutral-primary)]">
          {title}
        </h1>
        <p className="px-4 text-lg text-center text-[var(--color-neutral-secondary)]">
          {description}
        </p>
        <hr className="my-6 border-t border-[var(--color-box-border)]" />
        <Button
          onClick={onConfirm}
          variant={confirmVariant}
          size="mdLg"
          className="mb-4"
        >
          {cta}
        </Button>
        <Button onClick={onClose} variant="cancel" size="mdLg">
          CANCEL
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteCategoryModal;
