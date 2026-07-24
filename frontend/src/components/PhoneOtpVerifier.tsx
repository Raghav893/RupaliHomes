"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import {
  isFirebaseConfigured,
  normalizeIndianPhoneNumber,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/lib/firebase";

export interface VerifiedPhone {
  phone: string;
  phoneE164: string;
  firebaseUid: string;
}

interface PhoneOtpVerifierProps {
  phone: string;
  verifiedPhoneE164?: string;
  recaptchaContainerId: string;
  disabled?: boolean;
  onVerified: (verification: VerifiedPhone) => void;
}

function getNormalizedPhone(phone: string) {
  try {
    return normalizeIndianPhoneNumber(phone);
  } catch {
    return "";
  }
}

export default function PhoneOtpVerifier({
  phone,
  verifiedPhoneE164,
  recaptchaContainerId,
  disabled = false,
  onVerified,
}: PhoneOtpVerifierProps) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhoneE164, setOtpPhoneE164] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const normalizedPhone = useMemo(() => getNormalizedPhone(phone), [phone]);
  const isVerified =
    Boolean(normalizedPhone) && verifiedPhoneE164 === normalizedPhone;
  const hasActiveOtp = otpSent && otpPhoneE164 === normalizedPhone;

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!normalizedPhone) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!isFirebaseConfigured()) {
      setError("Firebase phone verification is not configured yet.");
      return;
    }

    setSending(true);
    try {
      const sentPhone = await sendPhoneOtp(phone, recaptchaContainerId);
      setOtpPhoneE164(sentPhone);
      setOtpSent(true);
      setMessage("OTP sent. Please check your phone.");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send OTP. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (!hasActiveOtp) {
      setError("Please request a new OTP for this phone number.");
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyPhoneOtp(otp);
      const verifiedE164 = result.phoneE164 || normalizedPhone;

      if (verifiedE164 !== normalizedPhone) {
        setError("Verified phone number does not match the entered number.");
        return;
      }

      onVerified({
        phone: result.phone || normalizedPhone.slice(3),
        phoneE164: verifiedE164,
        firebaseUid: result.firebaseUid,
      });
      setOtp("");
      setOtpSent(false);
      setMessage("Phone number verified.");
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Could not verify OTP. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={disabled || sending || isVerified}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent-dark/15 px-4 py-2 text-sm font-semibold text-accent-dark hover:border-gold hover:text-gold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <ShieldCheck size={15} />
          )}
          {isVerified ? "Verified" : hasActiveOtp ? "Resend OTP" : "Send OTP"}
        </button>

        {isVerified && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
            <CheckCircle2 size={16} />
            Phone verified
          </span>
        )}
      </div>

      {hasActiveOtp && !isVerified && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit OTP"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-gray-800 text-sm"
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={disabled || verifying}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-dark px-5 py-3 text-sm font-semibold text-white hover:bg-accent-dark/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying && <RefreshCw size={15} className="animate-spin" />}
            Verify OTP
          </button>
        </div>
      )}

      {message && (isVerified || hasActiveOtp) && (
        <p className="text-sm text-green-600">{message}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div id={recaptchaContainerId} />
    </div>
  );
}
