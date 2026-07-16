"use client";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "@/components/ui/toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { accountService } from "@/api/services/accountService";
import { getApiError } from "@/api/errorHandler";

export default function WelcomeBox() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({ mode: "onChange" });

  const password = watch("password");
  const displayName = user?.first_name || "there";

  useEffect(() => {
    const hasShownPasswordModal = localStorage.getItem("hasShownPasswordModal");
    if (!hasShownPasswordModal) {
      setModalOpen(true);
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const response = await accountService.updateProfile({
        new_password: data.password,
      });

      if (response?.success) {
        setModalOpen(false);
        localStorage.setItem("hasShownPasswordModal", "true");
        showSuccess("Password set successfully!");
        return;
      }

      showError(getApiError(response));
    } catch (error) {
      showError(getApiError(error));
    } finally {
      setSaving(false);
    }
  };

  function handleSkip() {
    setModalOpen(false);
    localStorage.setItem("hasShownPasswordModal", "true");
  }

  const passwordValidationRules = {
    required: "Password is required",
  };

  const confirmPasswordValidationRules = {
    required: "Please confirm your password",
    validate: (value) =>
      value === password || "Passwords do not match",
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleSkip}
      width="w-[504px] max-w-full"
      height="h-auto max-h-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-full max-w-md mx-auto p-6">
        <img
          src="/welcome-logo.png"
          alt="GrubPac"
          className="w-[300px] h-16 object-contain mb-4"
        />
        <h2 className="text-3xl font-semibold text-[var(--color-neutral-primary)] mb-2 text-center">
          Welcome {displayName}!
        </h2>
        <p className="text-[var(--color-neutral-secondary)] mb-6 text-lg text-center">
          Add a password to make login easy
        </p>
        <div className="w-full space-y-4 mb-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              className={`w-full border placeholder:text-[var(--color-neutral-light)] rounded-lg px-4 py-3 pr-12 text-lg ${errors.password ? "border-red-500 focus:ring-red-500" : "border-[var(--color-stroke-neutral)]"}`}
              placeholder="Enter password"
              {...register("password", passwordValidationRules)}
              isFocused={focusedInput === "password"}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-default)]"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <FiEye className="w-5 h-5 text-[var(--color-brand-default)]" />
              ) : (
                <FiEyeOff className="w-5 h-5 text-[var(--color-brand-default)]" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              className={`w-full border placeholder:text-[var(--color-neutral-light)]  rounded-lg px-4 py-3 pr-12 text-lg ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-[var(--color-stroke-neutral)]"}`}
              placeholder="Re-enter password"
              {...register("confirmPassword", confirmPasswordValidationRules)}
              isFocused={focusedInput === "reenter"}
              onFocus={() => setFocusedInput("reenter")}
              onBlur={() => setFocusedInput(null)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-default)]"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
            >
              {showConfirm ? (
                <FiEye className="w-5 h-5 text-[var(--color-brand-default)]" />
              ) : (
                <FiEyeOff className="w-5 h-5 text-[var(--color-brand-default)]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full py-3 rounded-lg font-medium text-xl mb-2 transition"
          disabled={!isValid || saving}
        >
          SAVE PASSWORD
        </Button>
        <Button
          type="button"
          variant="skip"
          size="lg"
          className="w-full py-2 rounded-lg text-xl font-medium text-[var(--color-stroke-brand)] hover:underline"
          onClick={handleSkip}
        >
          SKIP FOR NOW
        </Button>
      </form>
    </Modal>
  );
}
