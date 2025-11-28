import React, { useState, useRef, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "antd";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function OTPLoginForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState<any>({});
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [reqId, setReqId] = useState("");

  const { login, setUser, setStaff } = useAuth();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const validatePhone = (num) => /^\d{10}$/.test(num);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validatePhone(phoneNumber)) {
      setErrors({ phoneNumber: "Enter valid 10 digit phone number" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}lab/send-otp-lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setReqId(data?.response?.reqId || "");
      toast.success("OTP sent to your phone!");
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      setErrors({ phoneNumber: err.message });
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setErrors({});
    if (!validatePhone(phoneNumber)) {
      setErrors({ phoneNumber: "Enter valid 10 digit phone number" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}lab/resend-otp-lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
      setReqId(data?.response?.reqId || "");
      toast.success("OTP resent!");
      setResendTimer(30);
    } catch (err) {
      setErrors({ phoneNumber: err.message });
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    const otpValue = otp.join("");
    if (otpValue.length !== 4 || !/^\d{4}$/.test(otpValue)) {
      setErrors({ otp: "Enter the 4-digit OTP" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}lab/verify-otp-lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: otpValue, reqId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      const lab =
        data?.response?.lab || data?.response?.employee?.connectedLabId;
      const employee = data?.response?.employee;
      const token = data?.response?.token;
      if (!token) {
        setShowAccessDenied(true);
        return;
      }

      // login({ lab, token });
      setUser(lab);
      setStaff(employee || []);
      localStorage.setItem("lab", JSON.stringify(lab));
      localStorage.setItem("staff", JSON.stringify(employee || []));
      localStorage.setItem("l_t_K", token);
      navigate("/");
      toast.success("Logged In Successfully!");
    } catch (err) {
      setErrors({ otp: err.message });
    }
    setLoading(false);
  };

  // ✅ OTP Input Logic (Auto-move, backspace, paste)
  const inputsRef = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputsRef[index + 1].current.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef[index - 1].current.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef[index - 1].current.focus();
    } else if (e.key === "ArrowRight" && index < otp.length - 1) {
      inputsRef[index + 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    const newOtp = pasted.split("");
    setOtp(newOtp);
    if (newOtp.length > 0 && newOtp.length <= 4)
      inputsRef[newOtp.length - 1].current.focus();
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm sm:text-title-md">
                Lab Admin Login
              </h1>
              <p className="text-sm text-gray-500">
                Enter your phone number to sign in with OTP
              </p>
            </div>

            {/* STEP 1: PHONE NUMBER */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Phone Number <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm text-right mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#07868D] text-white font-semibold rounded-lg shadow-md hover:bg-[#056d72] transition duration-200"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: OTP VERIFY */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Enter OTP <span className="text-error-500">*</span>
                    </Label>

                    {/* ✅ Inline OTP Inputs */}
                    <div className="flex flex-col items-center">
                      <div className="flex gap-3 justify-center mb-1">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={inputsRef[i]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                            onPaste={handleOtpPaste}
                            className={`w-12 h-12 text-center border rounded-lg text-lg font-semibold tracking-wider focus:outline-none focus:ring-2 transition-all ${
                              errors.otp
                                ? "border-red-500 ring-red-500"
                                : "border-gray-300 focus:border-[#07868D] focus:ring-[#07868D]"
                            }`}
                            autoFocus={i === 0}
                          />
                        ))}
                      </div>
                      {errors.otp && (
                        <p className="text-xs text-red-500">{errors.otp}</p>
                      )}
                    </div>

                    {/* Resend & Back */}
                    <div className="flex justify-between items-center mt-2">
                      <button
                        type="button"
                        disabled={resendTimer > 0 || loading}
                        onClick={handleResendOtp}
                        className={`text-[#07868D] font-medium hover:underline text-sm ${
                          resendTimer > 0 ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {resendTimer > 0
                          ? `Resend OTP in 0:${resendTimer
                              .toString()
                              .padStart(2, "0")}`
                          : "Resend OTP"}
                      </button>
                      <button
                        type="button"
                        className="text-sm text-gray-500"
                        onClick={() => {
                          setOtp(["", "", "", ""]);
                          setStep(1);
                        }}
                      >
                        ← Back
                      </button>
                    </div>
                  </div>

                  <div className="w-full">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#07868D] text-white font-semibold rounded-lg shadow-md hover:bg-[#056d72] transition duration-200"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Access Denied Modal */}
      <Modal
        open={showAccessDenied}
        onCancel={() => setShowAccessDenied(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setShowAccessDenied(false)}
            style={{
              width: 120,
              fontWeight: 600,
              borderRadius: 6,
              background: "#d32029",
              borderColor: "#d32029",
            }}
          >
            Close
          </Button>,
        ]}
        centered
        closable={false}
        width={460}
      >
        <h2
          style={{
            color: "#d32029",
            fontWeight: "bold",
            fontSize: 28,
            marginBottom: 5,
            letterSpacing: 1,
            textShadow: "0 1px 8px rgba(211,32,41,0.08)",
            textAlign: "center",
          }}
        >
          Access Denied
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#595959",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Only admins are allowed to log in.
        </p>
      </Modal>
    </>
  );
}
