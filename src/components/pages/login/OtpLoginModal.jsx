"use client"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { MdOutlinePersonOutline } from "react-icons/md"
import Image from "next/image"
import { useState } from "react"
import Icon from "@/components/ui/Icon"
export default function OtpLoginModal({ open, onClose, onNext }) {
  const [email, setEmail] = useState("")
  const [focusedInput, setFocusedInput] = useState(null)
  const onSubmit = (e) => {
    e.preventDefault()
    if (isValidEmail) {
      onNext(email.trim())
    }
  }
  // Email validation - proper email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = email && email.trim() !== "" && emailRegex.test(email.trim())
  return (
    <Modal open={open} onClose={onClose} width="w-[554px] max-w-full" height="h-[380px] max-h-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center justify-center h-full w-full mt-6"
      >
        <div className="absolute left-10 top-6">
          <Image src="/Login-mark.svg" width={56} height={56} alt="login-mark" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-1 mt-0 text-center">
          OTP Login
        </h2>
        <p className="text-[var(--color-neutral-secondary)] text-lg text-center mb-6">
          Enter your registered email ID
        </p>
        <div className="relative w-full mb-18">
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
            className={`w-full h-12 btn-size-md-lg font-medium rounded-lg border transition-all ${isValidEmail
                ? 'bg-white border-[var(--color-brand-default)] text-[var(--color-brand-default)] hover:bg-[var(--color-details-setting-bg)]'
                : 'bg-[var(--color-neutral-secondary-bg)] border-[var(--color-stroke-neutral)] text-[var(--color-box-border)] cursor-not-allowed'
              }`}
          >
            NEXT
          </Button>
        </div>
      </form>
    </Modal>
  )
}
