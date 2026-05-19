"use client"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import { HiOutlineUser } from "react-icons/hi2"
import Image from "next/image"
import { useState } from "react"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
export default function ForgotPasswordModal({ open, onClose, onNext }) {
  const [email, setEmail] = useState("")
  const [focusedInput, setFocusedInput] = useState(null)
  const onSubmit = (e) => {
    e.preventDefault()
    if (isValidEmail) {
      onNext(email.trim().toLowerCase())
    }
  }
  // Email validation - proper email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = email && email.trim() !== "" && emailRegex.test(email.trim())
  return (
    <Modal open={open} onClose={onClose} width="w-[604px] max-w-full" height="h-auto max-h-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center justify-center h-full w-full pt-12 pb-10"
      >
        <div className="absolute left-10 top-6">
          <Image src="/Login-mark.svg" width={56} height={56} alt="login-mark" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-1 mt-0 text-center">
          Forgot password?
        </h2>
        <p className="text-[var(--color-neutral-secondary)] text-lg text-center mb-6">
          It happens to the best of us. Enter your email and we'll send you a link to reset it
        </p>
        <div className="relative w-full mb-6">
          <Input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-12 pr-3 h-12 text-lg rounded-lg text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] transition-all duration-200`}
            isFocused={focusedInput === "email"}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)]">
            <Icon name="login_user" className="h-6 w-6" />
          </span>
        </div>
        {/* Button enables only when valid email is entered */}
        <div className="pt-6 border-t border-[var(--color-box-border)] w-full">
        <Button
        variant="secondary"
          type="submit"
          disabled={!isValidEmail}
          className={`w-full h-12 btn-size-md-lg font-medium rounded-lg border transition-all ${
            isValidEmail
              ? 'bg-white border-[var(--color-brand-default)] text-[var(--color-brand-default)] hover:bg-[var(--color-details-setting-bg)]'
              : 'bg-[var(--color-neutral-secondary-bg)] border-[var(--color-stroke-neutral)] text-[var(--color-box-border)] cursor-not-allowed'
          }`}
        >
          SEND RESET LINK
        </Button>
        </div>
      </form>
    </Modal>
  )
}