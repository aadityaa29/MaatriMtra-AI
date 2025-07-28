"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"form" | "check-email">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // This will be available in user_metadata
        emailRedirectTo: `${window.location.origin}/dashboard`, // After confirm, redirect to dashboard
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // 2. Insert profile row with name (will fail if user not confirmed yet, so do this after confirmation in dashboard/profile page too)
      setStep("check-email");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <form onSubmit={handleSignup} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-pink-700 dark:text-orange-200">Sign Up</h1>
        {step === "form" && (
          <>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-3 py-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded transition"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-pink-700 hover:underline">Log In</a>
            </div>
          </>
        )}
        {step === "check-email" && (
          <div className="text-center text-lg text-pink-700 dark:text-orange-200">
            Check your email, we’ve sent you a confirmation email.<br />
            After confirming, you’ll be automatically logged in!
          </div>
        )}
      </form>
    </main>
  );
}
