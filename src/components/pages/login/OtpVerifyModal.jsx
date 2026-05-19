"use client"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useState } from "react"
import { showError } from "@/components/ui/toast"
import { HiArrowLeft } from "react-icons/hi"
import { FaAngleLeft } from "react-icons/fa6"
export default function OtpVerifyModal({
  open,
  onClose,
  email,
  otp,
  setOtp,
  timer,
  onBack,
  onVerify,
  otpRefs,
  otpError,
  onResend,
  title = "OTP Verification",
  message = null,
  showBackButton = true,
  buttonText = "VERIFY",
}) {
  function handleVerify() {
    const otpString = otp.join("")
    if (otpString.length !== 4) {
      showError("Please enter a valid 4-digit OTP")
      return
    }
    if (onVerify) {
      onVerify()
    } else {
      showError("Invalid OTP. Please try again.")
    }
  }
  // Same logic as before - button disabled until all 4 digits entered
  const isDisabled = otp.join("").length !== 4
  const defaultMessage = `Enter the OTP sent to ${email || "abc@gmail.com"}`
  const displayMessage = message || defaultMessage
  return (
    <Modal open={open} onClose={onClose} width="w-[554px] max-w-full" height="h-auto max-h-full">
      <div className="flex flex-col items-center justify-center h-full w-full pt-8">
        {showBackButton && (
          <Button
          variant="skip"
            className="absolute left-6 top-6 text-[var(--color-stroke-brand)] rounded-lg flex items-center justify-center gap-2"
            onClick={onBack}
            aria-label="Back"
          >
            <FaAngleLeft className="w-5 h-5" />
            <span className="text-xl font-medium text-[var(--color-stroke-brand)]">BACK</span>
          </Button>
        )}
        <h2 className="text-2xl font-semibold mt-6 text-[var(--color-neutral-primary)] mb-1 mt-0 text-center">
          {title}
        </h2>
        <p className="text-[var(--color-neutral-secondary)] text-lg text-center mb-6">
          {displayMessage}
        </p>
        <OtpInputs otp={otp} setOtp={setOtp} otpRefs={otpRefs} otpError={otpError} />
        <div className="w-full text-left text-lg font-medium mb-4 pl-1 text-[var(--color-box-border)]">
          {timer > 0 ? (
            `RESEND IN 0:${timer.toString().padStart(2, "0")}`
          ) : (
            <Button
            variant="skip"
              type="button"
              className="font-normal !py-1 !px-1 btn-size-md-lg hover:cursor-pointer focus:outline-none text-[var(--color-box-border)]"
              onClick={onResend}
            >
              RESEND OTP
            </Button>
          )}
          <div className="border-t p-px border-[var(--color-box-border)] w-full mt-6 mb-3"></div>
        </div>
        {/* Native HTML button with proper disabled styling */}
        <Button
        variant="primary"
          type="button"
          disabled={isDisabled}
          onClick={handleVerify}
          className={`w-full h-12 btn-size-md-lg font-medium rounded-lg border transition-all ${
            !isDisabled
              ? 'bg-white border-[var(--color-brand-default)] text-[var(--color-brand-default)] hover:bg-[var(--color-details-setting-bg)]'
              : 'bg-[var(--color-stroke-neutral)] border-[var(--color-stroke-neutral)] hover:border-2 text-[var(--color-box-border)] cursor-not-allowed'
          }`}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  )
}
// OtpInputs component for focus shadow effect
function OtpInputs({ otp, setOtp, otpRefs, otpError }) {
  const [focusedIdx, setFocusedIdx] = useState(null)
  return (
    <div className="flex gap-4 mb-12 w-full">
      {otp.map((digit, idx) => (
        <div
          key={idx}
          className={`relative rounded-lg flex items-center transition-colors duration-150 ${
            focusedIdx === idx
              ? "border-2 border-[var(--color-brand-default)] bg-white shadow-[0_0_0_4px_var(--color-shadow-select)]"
              : "border border-[var(--color-box-border)] bg-white"
          }`}
          style={{ overflow: "visible", width: "155px", height: "56px" }}
        >
          <input
            ref={otpRefs[idx]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            placeholder="0"
            className={`w-full h-full rounded-lg text-center text-lg text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] border-none hover:bg-[var(--color-neutral-secondary-bg)] outline-none focus:ring-0 bg-white`}
            value={digit}
            onFocus={() => setFocusedIdx(idx)}
            onBlur={() => setFocusedIdx(null)}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "")
              const newOtp = [...otp]
              newOtp[idx] = val
              setOtp(newOtp)
              if (val && idx < 3) otpRefs[idx + 1].current.focus()
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                otpRefs[idx - 1].current.focus()
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}