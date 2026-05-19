"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { HiArrowLeft } from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaAngleLeft } from "react-icons/fa6";

export default function PasswordChangeModal({
  open,
  onClose,
  onBack,
  onSave,
}) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isFormValid = passwords.current && passwords.new && passwords.confirm && passwords.new === passwords.confirm;

  const handleSave = () => {
    if (isFormValid) {
      onSave(passwords);
    }
  };

  return (
    <Modal open={open} onClose={onClose} width="w-[554px] max-w-full" height="h-[490px] max-h-full">
      <div className="flex flex-col items-center justify-center h-full w-full">
          <Button
          variant="skip"
            className="absolute left-6 top-5 text-[var(--color-stroke-brand)] rounded-lg flex items-center justify-center gap-2"
            onClick={onBack}
            aria-label="Back"
          >
            <FaAngleLeft className="w-5 h-5"/>
            <span className="text-xl font-medium text-[var(--color-stroke-brand)]">BACK</span>
          </Button>

        <h2 className="text-2xl mt-6 font-semibold text-[var(--color-neutral-primary)] mb-1 mt-0 text-center">
          Hold on!
        </h2>

        <p className="text-[var(--color-neutral-secondary)] text-lg text-center mb-6 px-4">
          To change your password, enter your current password, then your new password and hit save!
        </p>

        <div className="w-full space-y-4 mb-8 px-2">
          <PasswordField
            placeholder="Enter current password"
            value={passwords.current}
            onChange={(value) => handlePasswordChange("current", value)}
            showPassword={showPasswords.current}
            onToggleVisibility={() => togglePasswordVisibility("current")}
          />
          
          <PasswordField
            placeholder="Enter new password"
            value={passwords.new}
            onChange={(value) => handlePasswordChange("new", value)}
            showPassword={showPasswords.new}
            onToggleVisibility={() => togglePasswordVisibility("new")}
          />
          
          <PasswordField
            placeholder="Re-enter new password"
            value={passwords.confirm}
            onChange={(value) => handlePasswordChange("confirm", value)}
            showPassword={showPasswords.confirm}
            onToggleVisibility={() => togglePasswordVisibility("confirm")}
          />
        </div>

        <Button
        variant="disabledPrimary"
          type="button"
          disabled={!isFormValid}
          onClick={handleSave}
          className="w-full btn-size-md-lg"
        >
          SAVE PASSWORD
        </Button>
      </div>
    </Modal>
  );
}

function PasswordField({ placeholder, value, onChange, showPassword, onToggleVisibility }) {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg 
             border border-[var(--color-box-border)] 
             text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]
             bg-white 
             hover:bg-[var(--color-neutral-secondary-bg)]
             focus:border-[var(--info-panel-view-bg)] 
             focus:shadow-[0_0_0_4px_var(--color-shadow-select)]
             focus:ring-0 outline-none"
              autoFocus
            />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-brand-default)] hover:text-[var(--color-brand-default)]"
        onClick={onToggleVisibility}
      >
        {showPassword ? (
          <AiOutlineEyeInvisible size={20} />
        ) : (
          <AiOutlineEye size={20} />
        )}
      </button>
    </div>
  );
} 