import { redirect } from "next/navigation";

// OTP verification is no longer needed with Django JWT auth.
// Redirect to login.
export default function VerifyOtpPage() {
  redirect("/login");
}
