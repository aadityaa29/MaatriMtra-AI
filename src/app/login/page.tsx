"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-pink-700 dark:text-orange-200">Log In</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
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
          {loading ? "Logging in..." : "Log In"}
        </button>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-pink-700 hover:underline">Sign Up</a>
        </div>
      </form>
    </main>
  );
}
