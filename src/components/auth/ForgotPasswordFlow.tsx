import React, { useState, useRef, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Link, useNavigate } from "react-router-dom";
import {
  useSendForgotPasswordOtpMutation,
  useVerifyForgotPasswordOtpMutation,
  useChangeForgotPasswordMutation,
} from "../../redux/api/profileApi";
import { toast } from "react-toastify";

// Resend OTP delay in seconds
const RESEND_DELAY = 30;

function OtpInput({ length = 4, value, onChange, error }) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (value.length === length) {
      setOtp(value.split(""));
    }
  }, [value, length]);

  const handleChange = (index, val) => {
    if (!/^\d$/.test(val) && val !== "") return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        handleChange(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        handleChange(index - 1, "");
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {Array(length)
          .fill(0)
          .map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              className={`w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#07868D]"
              }`}
              aria-label={`OTP digit ${i + 1}`}
              autoComplete="off"
            />
          ))}
      </div>
      {error && (
        <span className="absolute right-0 top-14 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

export default function ForgotPasswordFlow() {
  const [errors, setErrors] = useState<any>({});
  const navigate = useNavigate();

  const [sendOtp, { isLoading: sendingOtp }] =
    useSendForgotPasswordOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] =
    useVerifyForgotPasswordOtpMutation();
  const [resetPassword, { isLoading: resetting }] =
    useChangeForgotPasswordMutation();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });

  //========== TIMER STATE ==========
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTimer(RESEND_DELAY);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);
  //=================================

  const hasError = (field) => !!errors[field];

  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrors({});
    if (!form.email) {
      setErrors({ email: "Required" });
      return;
    }
    try {
      await sendOtp({ email: form.email }).unwrap();
      toast.success("Otp sent successfully");
      setStep(2);
      startTimer();
    } catch (err) {
      setErrors({ email: err?.data?.message || "Invalid Email" });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.otp.length !== 4) {
      setErrors({ otp: "Enter 4 digit OTP" });
      return;
    }
    try {
      const res = await verifyOtp({
        email: form.email,
        otp: form.otp,
      }).unwrap();
      if (res.response.token) {
        localStorage.setItem("token", res.response.token);
      }
      setStep(3);
    } catch (err) {
      setErrors({ otp: err?.data?.message || "Invalid OTP" });
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.password) {
      setErrors({ password: "Required" });
      return;
    }
    if (!form.confirm) {
      setErrors({ confirm: "Required" });
      return;
    }
    if (form.password !== form.confirm) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }
    try {
      await resetPassword({ newPassword: form.password }).unwrap();
      toast.success("Password reset successfully!");
      localStorage.removeItem("token");
      navigate("/signin");
    } catch (err) {
      setErrors({ password: err?.data?.message || "Failed to reset password" });
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-10">
        {/* Step Heading */}
        <div className="mb-6 text-center">
          {step === 1 && (
            <>
              <h1 className="mb-2 font-semibold text-gray-800 text-xl">
                Forgot Password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your registered email, and we’ll send you an OTP to reset
                your password.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="mb-2 font-semibold text-gray-800 text-xl">
                Verify OTP
              </h1>
              <p className="text-sm text-gray-500">
                Enter the OTP sent to your{" "}
                <span className="text-[#07868D] font-semibold">{form.email}</span> to proceed.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="mb-2 font-semibold text-gray-800 text-xl">
                Reset Password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your new password and confirm to complete the process.
              </p>
            </>
          )}
        </div>

        {/* Step Forms */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="relative">
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="info@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={hasError("email") ? "border-red-500" : ""}
              />
              {hasError("email") && (
                <span className="absolute right-3 top-7 text-xs text-red-500">
                  {errors.email}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full py-3 bg-[#07868D] text-white font-semibold rounded-lg shadow-md hover:bg-[#07868D] transition disabled:opacity-50"
            >
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
            <p className="text-sm text-center mt-3">
              Back to{" "}
              <Link to="/signin" className="text-[#07868D] hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <Label>
              OTP Code <span className="text-red-500">*</span>
            </Label>
            <OtpInput
              length={4}
              value={form.otp}
              onChange={(val) => setForm({ ...form, otp: val })}
              error={errors.otp}
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:underline"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleEmailSubmit}
                disabled={timer > 0 || sendingOtp}
                className={`text-sm ${
                  timer > 0 ? "text-gray-400" : "text-blue-500"
                } hover:underline`}
              >
                {timer > 0
                  ? `Resend OTP in 0:${timer.toString().padStart(2, "0")}`
                  : "Resend OTP"}
              </button>
            </div>
            <button
              type="submit"
              disabled={verifyingOtp}
              className="w-full py-3 bg-[#07868D] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {verifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
            <div className="relative">
              <Label>
                New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={hasError("password") ? "border-red-500" : ""}
              />
              {hasError("password") && (
                <span className="absolute right-3 top-7 text-xs text-red-500">
                  {errors.password}
                </span>
              )}
            </div>
            <div className="relative">
              <Label>
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className={hasError("confirm") ? "border-red-500" : ""}
              />
              {hasError("confirm") && (
                <span className="absolute right-3 top-7 text-xs text-red-500">
                  {errors.confirm}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-gray-500 hover:underline"
              >
                ← Back
              </button>
            </div>
            <button
              type="submit"
              disabled={resetting}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {resetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
