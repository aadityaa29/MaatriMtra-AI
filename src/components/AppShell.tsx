"use client";
import Navbar from "@/components/navbar";
import { LanguageProvider } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"hi" | "en">("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
    <LanguageProvider>
      <Navbar
        lang={lang}
        onLangChange={setLang}
        theme={theme}
        onThemeChange={setTheme}
        />
      <main className="pt-20">{children}</main>
    </LanguageProvider>
    </>
  );
}
