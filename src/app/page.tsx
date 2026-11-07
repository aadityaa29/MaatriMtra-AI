
"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Simple translations for demonstration
const translations = {
  hi: {
    heroTitle: "आपकी माँ और बच्चे की सेहत की साथी — मातृमित्र AI",
    heroSubtitle:
      "AI द्वारा संचालित, आपकी भाषा में, आपके गाँव की ज़रूरतों के अनुसार।",
    getStarted: "शुरू करें / Get Started",
    listenHindi: "हिंदी में सुनें / Listen in Hindi",
    howItWorks: "कैसे काम करता है?",
    featuresTitle: "मातृमित्र AI क्या करता है?",
    processTitle: "शुरू कैसे करें?",
    process1: "अपना नाम और जानकारी भरें",
    process2: "AI आपका डिजिटल जुड़वा बनाएगा",
    process3: "स्वास्थ्य योजना और सुझाव पाएँ",
    tryNow: "Try Now / अभी आज़माएं",
    navigation: "नेविगेशन (Navigation)",
    nav1: "👤 Get Started",
    nav2: "📋 My Health Plan",
    nav3: "🗣️ Ask AI / Story Mode",
    nav4: "🎧 Listen Hindi",
    nav1desc: "User inputs age, pregnancy week, health data",
    nav2desc: "See AI-generated plan, track health",
    nav3desc: "Talk to Gemini-powered health assistant",
    nav4desc: "Audio-based guide for users with low literacy",
    about: "About Us",
    contact: "Contact / WhatsApp",
    disclaimer: "This is not a replacement for a doctor.",
    english: "English",
    hindi: "हिंदी",
    diet: "व्यक्तिगत आहार योजना",
    child: "बच्चों के पोषण का मार्गदर्शन",
    health: "स्वास्थ्य सुझाव",
    stories: "कहानियों के माध्यम से सीखना",
    voice: "हिंदी में आवाज़ी मदद",
    dietEn: "Personalized Diet Plan",
    childEn: "Child Nutrition Guidance",
    healthEn: "Health Tips & Risk Prediction",
    storiesEn: "Learn Through Stories",
    voiceEn: "Voice-based Guidance in Hindi",
    fillInfo: "Fill Your Basic Info",
    digitalTwin: "Digital Twin is Created",
    getAdvice: "Get Smart Advice & Diet Plan",
  },
  en: {
    heroTitle:
      "Your Trusted Companion for Maternal & Child Health — MaatriMitra AI",
    heroSubtitle: "AI-powered, in your language, for your village’s needs.",
    getStarted: "Get Started",
    listenHindi: "Listen in Hindi",
    howItWorks: "How does it work?",
    featuresTitle: "What does MaatriMitra AI do?",
    processTitle: "How to Get Started?",
    process1: "Fill Your Basic Info",
    process2: "AI creates your Digital Twin",
    process3: "Get Smart Advice & Diet Plan",
    tryNow: "Try Now",
    navigation: "Navigation",
    nav1: "👤 Get Started",
    nav2: "📋 My Health Plan",
    nav3: "🗣️ Ask AI / Story Mode",
    nav4: "🎧 Listen Hindi",
    nav1desc: "User inputs age, pregnancy week, health data",
    nav2desc: "See AI-generated plan, track health",
    nav3desc: "Talk to Gemini-powered health assistant",
    nav4desc: "Audio-based guide for users with low literacy",
    about: "About Us",
    contact: "Contact / WhatsApp",
    disclaimer: "This is not a replacement for a doctor.",
    english: "English",
    hindi: "Hindi",
    diet: "Personalized Diet Plan",
    child: "Child Nutrition Guidance",
    health: "Health Tips & Risk Prediction",
    stories: "Learn Through Stories",
    voice: "Voice-based Guidance in Hindi",
    dietEn: "",
    childEn: "",
    healthEn: "",
    storiesEn: "",
    voiceEn: "",
    fillInfo: "",
    digitalTwin: "",
    getAdvice: "",
  },
};

export default function HomePage() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAudio, setShowAudio] = useState(false);
  const introAudioUrl = "/intro_hindi.mp3";
  const supabase = createClient();

  // Dark mode state and effect for Tailwind v4
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Splash/auth/profile check
  useEffect(() => {
    async function checkAuthAndProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false); // Show homepage
        return;
      }
      // Check if profile exists for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile && profile.id) {
        router.replace("/dashboard");
      } else {
        router.replace("/create-profile");
      }
    }
    checkAuthAndProfile();
    // eslint-disable-next-line
  }, []);

  // Play audio when button is clicked
  const handleAudioClick = () => {
    setShowAudio(true);
    const audio = new Audio(introAudioUrl);
    audio.play();
  };

  // Splash screen while checking auth/profile
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <img src="/photos/Maatrimitra-hero.jpg" alt="Splash" className="w-40 h-40 rounded-full shadow-lg mb-6" />
        <div className="text-2xl font-bold text-pink-700 dark:text-orange-200 mb-2 animate-pulse">
          मातृमित्र AI
        </div>
        <div className="text-gray-700 dark:text-orange-100 text-lg mb-2 animate-pulse">
          {lang === "hi"
            ? "आपके लिए व्यक्तिगत स्वास्थ्य योजना तैयार की जा रही है..."
            : "Preparing your personalized health experience..."}
        </div>
        <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- HOMEPAGE CONTENT ---
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center px-2 py-6 transition-colors mt-0">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center mb-8">
        <div className="h-80  mb-4 shadow-lg bg-white/30 backdrop-blur-md border border-white/30 rounded-lg overflow-hidden">
          <img src="/photos/Maatrimitra-hero.jpg" alt="Hero Image" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-pink-700 dark:text-orange-200 mb-2 text-center leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 mb-3 text-center">
          {t.heroSubtitle}
        </p>
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          <a
            href="/create-profile"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-full shadow transition"
          >
            {t.getStarted}
          </a>
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-full shadow transition flex items-center gap-2"
            onClick={handleAudioClick}
          >
            🎧 {t.listenHindi}
          </button>
          <a
            href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
            target="_blank"
            rel="noopener"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-full shadow transition flex items-center gap-2"
          >
            📹 {t.howItWorks}
          </a>
        </div>
        {showAudio && (
          <audio src={introAudioUrl} controls autoPlay className="mb-2" />
        )}
      </section>

      {/* Features Section */}
      <section className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-orange-100 mb-4 text-center">
          {t.featuresTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Feature icon="🍲" title={t.diet} subtitle={t.dietEn} />
          <Feature icon="👶" title={t.child} subtitle={t.childEn} />
          <Feature icon="👩‍⚕️" title={t.health} subtitle={t.healthEn} />
          <Feature icon="📖" title={t.stories} subtitle={t.storiesEn} />
          <Feature icon="🔊" title={t.voice} subtitle={t.voiceEn} />
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full bg-orange-50 dark:bg-gray-900 rounded-xl shadow p-6 mb-8 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-orange-100 mb-4 text-center">
          {t.processTitle}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <ProcessStep icon="✅" text={t.process1} sub={t.fillInfo} />
          <span className="text-3xl text-pink-400 dark:text-orange-200 hidden md:inline">
            →
          </span>
          <ProcessStep icon="🧠" text={t.process2} sub={t.digitalTwin} />
          <span className="text-3xl text-pink-400 dark:text-orange-200 hidden md:inline">
            →
          </span>
          <ProcessStep icon="📋" text={t.process3} sub={t.getAdvice} />
        </div>
        <div className="flex justify-center mt-6">
          <a
            href="/create-profile"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-2 rounded-full shadow transition"
          >
            {t.tryNow}
          </a>
        </div>
      </section>

      {/* Navigation Flow Section */}
      <section className="w-full mb-8 max-w-5xl mx-auto ">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-orange-100 mb-2">
          {t.navigation}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200 text-base">
          <NavFlow label={t.nav1} to="/create-profile" desc={t.nav1desc} />
          <NavFlow label={t.nav2} to="/dashboard" desc={t.nav2desc} />
          <NavFlow label={t.nav3} to="/chat" desc={t.nav3desc} />
          <NavFlow label={t.nav4} to="/audio-guide" desc={t.nav4desc} />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-gray-900 rounded-t-xl shadow px-6 py-4 mt-8 flex flex-col md:flex-row items-center justify-between text-gray-600 dark:text-gray-300 text-sm max-w-5xl mx-auto">
        <div className="flex gap-4 mb-2 md:mb-0">
          <a href="/about" className="hover:underline">
            {t.about}
          </a>
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener"
            className="hover:underline"
          >
            {t.contact}
          </a>
          <span className="italic">{t.disclaimer}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span>🌐</span>
          <button
            onClick={() => setLang("en")}
            className={`hover:underline ${lang === "en" ? "font-bold text-pink-700" : ""}`}
          >
            English
          </button>
          <span>|</span>
          <button
            onClick={() => setLang("hi")}
            className={`hover:underline ${lang === "hi" ? "font-bold text-pink-700" : ""}`}
          >
            हिंदी
          </button>
        </div>
      </footer>
    </main>
  );
}

// --- COMPONENTS ---
function Feature({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-pink-50 dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition">
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-pink-700 dark:text-orange-200">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-700 dark:text-gray-200">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ProcessStep({
  icon,
  text,
  sub,
}: {
  icon: string;
  text: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-4xl">{icon}</div>
      <div className="mt-2 font-semibold text-gray-800 dark:text-gray-100">
        {text}
      </div>
      {sub && (
        <div className="text-sm text-gray-600 dark:text-gray-300">{sub}</div>
      )}
    </div>
  );
}

function NavFlow({
  label,
  to,
  desc,
}: {
  label: string;
  to: string;
  desc: string;
}) {
  return (
    <a
      href={to}
      className="block border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:bg-gray-900 shadow"
    >
      <div className="font-bold text-pink-700 dark:text-orange-200">
        {label}
      </div>
      <div className="text-sm">{desc}</div>
    </a>
  );
}
