import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";

const requiredEnv: Array<[keyof NodeJS.ProcessEnv, string | undefined]> = [
  ["NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
  ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN],
  ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
  ["NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
];

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let authInstance: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

function missingFirebaseEnv() {
  return requiredEnv.filter(([, value]) => !value).map(([key]) => key);
}

function assertFirebaseConfig() {
  const missing = missingFirebaseEnv();
  if (missing.length > 0) {
    throw new Error(
      `Firebase phone verification is not configured. Missing: ${missing.join(", ")}.`,
    );
  }
}

export function isFirebaseConfigured() {
  return missingFirebaseEnv().length === 0;
}

export function normalizeIndianPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const nationalNumber =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;

  if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
    throw new Error("Please enter a valid 10-digit Indian mobile number.");
  }

  return `+91${nationalNumber}`;
}

export function getIndianNationalPhone(phone: string): string {
  return normalizeIndianPhoneNumber(phone).slice(3);
}

export function getFirebaseAuthClient(): Auth {
  assertFirebaseConfig();

  if (!authInstance) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    authInstance.languageCode = "en";
  }

  return authInstance;
}

function getRecaptchaVerifier(auth: Auth, containerId: string) {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
  }

  return recaptchaVerifier;
}

function resetRecaptcha() {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
}

export function firebaseAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code.includes("invalid-phone-number")) {
    return "Please enter a valid phone number.";
  }
  if (code.includes("too-many-requests")) {
    return "Too many OTP requests. Please wait before trying again.";
  }
  if (code.includes("invalid-verification-code")) {
    return "The OTP is incorrect. Please check the code and try again.";
  }
  if (code.includes("code-expired")) {
    return "The OTP has expired. Please request a new one.";
  }
  if (code.includes("captcha-check-failed")) {
    return "reCAPTCHA verification failed. Please try again.";
  }

  return error instanceof Error
    ? error.message
    : "Phone verification failed. Please try again.";
}

export async function sendPhoneOtp(phone: string, recaptchaContainerId: string) {
  const auth = getFirebaseAuthClient();
  const appVerifier = getRecaptchaVerifier(auth, recaptchaContainerId);
  const e164Phone = normalizeIndianPhoneNumber(phone);

  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      e164Phone,
      appVerifier,
    );
    return e164Phone;
  } catch (error) {
    resetRecaptcha();
    throw new Error(firebaseAuthErrorMessage(error));
  }
}

export async function verifyPhoneOtp(code: string) {
  if (!confirmationResult) {
    throw new Error("Please request an OTP first.");
  }

  try {
    const credential = await confirmationResult.confirm(code.trim());
    const phoneNumber = credential.user.phoneNumber || "";
    confirmationResult = null;

    return {
      firebaseUid: credential.user.uid,
      phoneE164: phoneNumber,
      phone: phoneNumber.startsWith("+91") ? phoneNumber.slice(3) : phoneNumber,
    };
  } catch (error) {
    throw new Error(firebaseAuthErrorMessage(error));
  }
}
