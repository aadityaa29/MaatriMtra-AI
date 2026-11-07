"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";

type NavItem = {
  name: string;
  path: string;
  authOnly?: boolean;
};

export default function Navbar({
  theme,
  onThemeChange,
}: {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}) {
  const { lang, setLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Listen to auth state changes for real-time updates
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    };
    getUserAndProfile();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserAndProfile();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  // Nav items (Dashboard only for logged-in users)
  const navItems: NavItem[] =
    lang === "hi"
      ? [
          { name: "होम", path: "/" },
          ...(user ? [{ name: "डैशबोर्ड", path: "/dashboard" }] : []),
          { name: "प्रोफ़ाइल", path: "/profile" },
          { name: "हमारे बारे में", path: "/about" },
          { name: "संपर्क", path: "/contact" },
        ]
      : [
          { name: "Home", path: "/" },
          ...(user ? [{ name: "Dashboard", path: "/dashboard" }] : []),
          { name: "Profile", path: "/profile" },
          { name: "About", path: "/about" },
          { name: "Contact", path: "/contact" },
        ];

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setDropdownOpen(false);
    window.location.href = "/login";
  }

  // "Get Started" handler
  const handleGetStarted = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/create-profile";
    }
  };

  return (
    <nav className="w-full bg-white/90 dark:bg-gray-900/90 shadow fixed top-0 left-0 z-50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xl font-bold text-pink-700 dark:text-orange-200 hover:text-pink-800 dark:hover:text-orange-300 transition"
          >
            MaatriMitra AI
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-orange-300 font-medium transition"
            >
              {item.name}
            </Link>
          ))}

          {/* If not logged in, show Log In */}
          {!user ? (
            <Link
              href="/login"
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded font-semibold shadow transition"
            >
              {lang === "hi" ? "लॉग इन" : "Log In"}
            </Link>
          ) : (
            // If logged in, show profile dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-pink-700 dark:text-orange-200 font-semibold transition"
                aria-label="Open profile menu"
              >
                <span className="w-8 h-8 rounded-full bg-pink-200 dark:bg-orange-200 flex items-center justify-center font-bold text-lg text-pink-700 dark:text-gray-900">
                  {profile?.name
                    ? profile.name.charAt(0).toUpperCase()
                    : "U"}
                </span>
                <span className="hidden md:inline">
                  {profile?.name
                    ? profile.name.split(" ")[0]
                    : lang === "hi" ? "प्रोफ़ाइल" : "Profile"}
                </span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-gray-700 dark:text-orange-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {lang === "hi" ? "डैशबोर्ड" : "Dashboard"}
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-gray-700 dark:text-orange-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {lang === "hi" ? "प्रोफ़ाइल" : "Profile"}
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-gray-700 dark:text-orange-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {lang === "hi" ? "सेटिंग्स" : "Settings"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                  >
                    {lang === "hi" ? "लॉग आउट" : "Log Out"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme switcher button */}
          <button
            onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
            className="ml-2 px-2 py-1 rounded transition bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-orange-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          {/* Language switcher buttons */}
          <button
            onClick={() => setLang("hi")}
            className={`px-4 py-1 rounded-l-full border border-pink-600 font-bold transition ${
              lang === "hi"
                ? "bg-pink-600 text-white"
                : "bg-white text-pink-600 hover:bg-pink-100"
            }`}
            aria-label="Switch to Hindi"
          >
            हिंदी
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-4 py-1 rounded-r-full border border-pink-600 font-bold transition ${
              lang === "en"
                ? "bg-pink-600 text-white"
                : "bg-white text-pink-600 hover:bg-pink-100"
            }`}
            aria-label="Switch to English"
          >
            English
          </button>
        </div>

        {/* Hamburger for mobile */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="block md:hidden text-2xl text-pink-700 dark:text-orange-200 focus:outline-none"
          aria-label="Open menu"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
            <circle cx="5" cy="5" r="2"/>
            <circle cx="12" cy="5" r="2"/>
            <circle cx="19" cy="5" r="2"/>
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
            <circle cx="5" cy="19" r="2"/>
            <circle cx="12" cy="19" r="2"/>
            <circle cx="19" cy="19" r="2"/>
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 px-4 pb-4 pt-2 shadow-lg border-t border-pink-100 dark:border-gray-800">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-orange-300 font-medium transition"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {/* "Get Started" in mobile menu */}
            <button
              onClick={handleGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-full shadow transition mt-2"
            >
              {lang === "hi" ? "शुरू करें" : "Get Started"}
            </button>
            {!user ? (
              <Link
                href="/login"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded font-semibold shadow transition"
                onClick={() => setMobileOpen(false)}
              >
                {lang === "hi" ? "लॉग इन" : "Log In"}
              </Link>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-gray-700 dark:text-orange-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === "hi" ? "डैशबोर्ड" : "Dashboard"}
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-gray-700 dark:text-orange-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === "hi" ? "प्रोफ़ाइल" : "Profile"}
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-gray-700 dark:text-orange-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === "hi" ? "सेटिंग्स" : "Settings"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                >
                  {lang === "hi" ? "लॉग आउट" : "Log Out"}
                </button>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
                className="px-2 py-1 rounded transition bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-orange-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>
              <button
                onClick={() => setLang("hi")}
                className={`px-4 py-1 rounded-l-full border border-pink-600 font-bold transition ${
                  lang === "hi"
                    ? "bg-pink-600 text-white"
                    : "bg-white text-pink-600 hover:bg-pink-100"
                }`}
                aria-label="Switch to Hindi"
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-1 rounded-r-full border border-pink-600 font-bold transition ${
                  lang === "en"
                    ? "bg-pink-600 text-white"
                    : "bg-white text-pink-600 hover:bg-pink-100"
                }`}
                aria-label="Switch to English"
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
