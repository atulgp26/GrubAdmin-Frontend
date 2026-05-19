import Button from "@/components/ui/Button";

export default function AccountFooter({ createdAt, onDelete, allowDelete = true }) {
  return (
    <div className="flex items-center justify-between pt-8 mt-8 fixed bottom-10 right-0 w-[calc(100vw-16rem-1rem)] ml-60 [.ml-0_&]:ml-0 [.ml-0_&]:left-4 [.ml-0_&]:w-[calc(100vw-4rem-1rem)] px-6">
      <span className="text-[var(--color-neutral-light)]">
        Account created: {createdAt}
      </span>
      {allowDelete && (
        <Button
          variant="grayOutline"
          onClick={onDelete}
          className="text-[var(--color-stroke-brand)] text-base font-medium transition-colors !fixed !right-[19px]"
        >
          DELETE ACCOUNT
        </Button>
      )}
    </div>
  );
}
