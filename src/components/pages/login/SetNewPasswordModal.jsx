"use client"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import {
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md"
import { VscKey } from "react-icons/vsc"
import { useState } from "react"
import { showError } from "@/components/ui/toast"
import Button from "@/components/ui/Button"
export default function SetNewPasswordModal({
  open,
  onClose,
  onSave,
}) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const handleSave = () => {
    if (!password || password.trim() === "") {
      showError("Please enter a password")
      return
    }
    if (!confirmPassword || confirmPassword.trim() === "") {
      showError("Please confirm your password")
      return
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match")
      return
    }
    if (onSave) {
      onSave(password)
    }
  }
  const isDisabled = !password || !confirmPassword
  return (
    <Modal open={open} onClose={onClose} width="w-[554px] max-w-full" height="h-auto max-h-full">
      <div className="flex flex-col items-center justify-center h-full w-full px-10 pt-8 pb-10">
        <h2 className="text-2xl font-semibold mt-6 text-[var(--color-neutral-primary)] mb-1 text-center">
          Set new password
        </h2>
        <p className="text-[var(--color-neutral-secondary)] text-lg text-center mb-6">
          Enter and confirm your new password below. Choose a strong password you haven't used before.
        </p>
        {/* Password Input */}
        <div className="relative w-full mb-4">
          <Input
            type={!showConfirmPassword ? "password" : "text"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full pl-10 pr-10 h-12 text-lg rounded-lg text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]`}
            isFocused={focusedInput === "password"}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)]">
            <VscKey size={22} />
          </span>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-default)] focus:outline-none"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
          >
            {!showConfirmPassword ? (
              <MdOutlineVisibility size={22} />
            ) : (
              <MdOutlineVisibilityOff size={22} />
            )}
          </button>
        </div>
        {/* Confirm Password Input */}
        <div className="relative w-full mb-12">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full pl-10 pr-10 h-12 text-lg rounded-lg text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]`}
            isFocused={focusedInput === "confirmPassword"}
            onFocus={() => setFocusedInput("confirmPassword")}
            onBlur={() => setFocusedInput(null)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)]">
            <VscKey size={22} />
          </span>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-default)] focus:outline-none"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <MdOutlineVisibility size={22} />
            ) : (
              <MdOutlineVisibilityOff size={22} />
            )}
          </button>
        </div>
        {/* Save Button */}
        <Button
          variant="secondary"
          type="button"
          disabled={isDisabled}
          onClick={handleSave}
          className={`w-full h-12 btn-size-md-lg font-medium rounded-lg border transition-all ${!isDisabled
              ? 'bg-white border-[var(--color-brand-default)] text-[var(--color-brand-default)] hover:bg-[var(--color-details-setting-bg)]'
              : 'bg-[var(--color-stroke-neutral)] border-[var(--color-stroke-neutral)] hover:border-2 text-[var(--color-box-border)] cursor-not-allowed'
            }`}
        >
          SAVE PASSWORD
        </Button>
      </div>
    </Modal>
  )
}
