import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const SelectedAction = ({ open, onClose, onPublishFAQs, onUnpublishFAQs }) => {
  if (!open) return null;

  const handleAction = (callback) => {
    if (typeof onClose === "function") onClose();
    if (typeof callback === "function") callback();
  };

  return (
    <div className="absolute bottom-14 left-0 flex w-64 flex-col divide-y divide-[var(--color-stroke-neutral)] rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-xl">
      <Button
        variant="profile"
        className="flex w-full items-center gap-3 !rounded-b-none !py-3"
        onClick={() => handleAction(onPublishFAQs)}
      >
        <Icon name="file_check" className="text-[var(--notif-success)]" />
        Publish selected FAQs
      </Button>
      <Button
        variant="profile"
        className="flex w-full items-center gap-3 !rounded-t-none !py-3"
        onClick={() => handleAction(onUnpublishFAQs)}
      >
        <Icon name="file_cross" className="text-[var(--notif-error)]" />
        Unpublish selected FAQs
      </Button>
    </div>
  );
};

export default SelectedAction;
