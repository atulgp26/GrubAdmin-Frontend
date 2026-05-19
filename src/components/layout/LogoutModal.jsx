import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function LogoutModal({ open, onClose, onLogout }) {
  return (
    <Modal open={open} onClose={onClose} width="w-[504px] max-w-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-4">
          Logging out?
        </h2>
        <p className="text-[var(--color-neutral-secondary)] text-lg mb-8 leading-relaxed">
          You'll be signed out of your account on this device.
          <br />
          You can log back in anytime.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={onLogout}
            variant="secondary"
            size="lg"
            className="w-full btn-size-md-lg flex items-center justify-center"
          >
            LOG OUT
          </Button>
          <Button onClick={onClose} variant="cancel" size="mdLg">
            CANCEL
          </Button>
        </div>
      </div>
    </Modal>
  );
}
