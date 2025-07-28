"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function Dashboard() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [digitalTwin, setDigitalTwin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ [task: string]: boolean }>({});
  const [affirmation, setAffirmation] = useState<string>("");

  // 1. Fetch profile and digital twin
  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(profileData);

      if (!profileData) {
        setLoading(false);
        return;
      }

      // Fetch digital twin (Gemini LLM output)
      const { data: twinData } = await supabase
        .from("digital_twins")
        .select("twin_data, updated_at")
        .eq("profile_id", profileData.id)
        .single();

      setDigitalTwin(
        twinData
          ? { ...twinData.twin_data, updated_at: twinData.updated_at }
          : null
      );

      // Set initial progress tracker state
      if (twinData?.twin_data?.tasks) {
        const progressState: { [task: string]: boolean } = {};
        twinData.twin_data.tasks.forEach((task: string) => {
          progressState[task] = false;
        });
        setProgress(progressState);
      }

      // Set affirmation if available, else fallback
      if (twinData?.twin_data?.affirmation) {
        setAffirmation(twinData.twin_data.affirmation);
      } else {
        setAffirmation(
          lang === "hi"
            ? "आप मजबूत हैं, आप यह कर सकती हैं।"
            : "You are strong, you can do this!"
        );
      }

      setLoading(false);
    }

    fetchData();
    // eslint-disable-next-line
  }, []);

  // Progress tracker toggle
  function toggleTask(task: string) {
    setProgress((prev) => ({ ...prev, [task]: !prev[task] }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-pink-600 dark:text-orange-200 text-lg">
          Loading...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-red-600 dark:text-red-400 text-lg">
          {lang === "hi" ? "प्रोफ़ाइल नहीं मिली" : "Profile not found"}
        </span>
      </div>
    );
  }

  if (!digitalTwin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-600 dark:text-gray-400 text-lg">
          {lang === "hi" ? "AI डेटा नहीं मिला" : "No AI data found"}
        </span>
      </div>
    );
  }

  // Risk color
  const riskColors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  const riskLevel = (digitalTwin.risk_level || "low").toLowerCase();
  const riskColor = riskColors[riskLevel] || "bg-gray-200 text-gray-700";

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors pt-16 pb-8 px-2">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* 1. Profile Greeting */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0 w-20 h-20 rounded-full bg-pink-100 dark:bg-orange-100 flex items-center justify-center text-4xl font-bold text-pink-700 dark:text-orange-400">
            👩
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold text-pink-700 dark:text-orange-200 mb-1">
              {lang === "hi"
                ? `नमस्ते, ${profile?.name || "माँ"} जी 👋`
                : `Hello, ${profile?.name || "Mother"} 👋`}
            </div>
            <div className="flex flex-wrap gap-4 text-gray-800 dark:text-gray-100 text-base">
              <span>
                📅 {lang === "hi" ? "आयु" : "Age"}: {profile?.age || "-"}
              </span>
              <span>
                🤰 {lang === "hi" ? "गर्भावस्था" : "Pregnancy"}:{" "}
                {profile?.pregnancy_stage || "-"}
              </span>
              <span>
                📍 {lang === "hi" ? "स्थान" : "Location"}:{" "}
                {profile?.location || "-"}
              </span>
              <span className={`px-2 py-1 rounded ${riskColor}`}>
                {lang === "hi" ? "स्वास्थ्य जोखिम:" : "Health risk:"}{" "}
                {digitalTwin.risk_level || "-"}
              </span>
            </div>
            <Link
              href="/profile"
              className="inline-block mt-2 text-pink-700 dark:text-orange-200 hover:underline text-sm"
            >
              🖊️ {lang === "hi" ? "प्रोफ़ाइल संपादित करें" : "Edit Profile"}
            </Link>
            {/* Last updated timestamp */}
            {digitalTwin.updated_at && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {lang === "hi" ? "आखरी अपडेट:" : "Last updated:"}{" "}
                {new Date(digitalTwin.updated_at).toLocaleString("en-IN")}
              </div>
            )}
          </div>
        </section>

        {/* 2. Daily Affirmation / Wellness Tip */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex items-center gap-3">
          <div className="text-2xl">🌸</div>
          <div className="flex-1">
            <div className="text-pink-700 dark:text-orange-200 font-semibold">
              {lang === "hi"
                ? "आज का सकारात्मक विचार:"
                : "Today's Affirmation:"}
            </div>
            <div className="text-gray-800 dark:text-gray-100 text-lg">
              {affirmation}
            </div>
          </div>
        </section>

        {/* 3. AI-Generated Health Plan */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200">
              {lang === "hi" ? "AI स्वास्थ्य योजना" : "AI Health Plan"}
            </h2>
            <button className="text-xl" title="Listen">
              🔊
            </button>
          </div>
          <div className="mb-2">
            <span className="font-medium text-gray-900 dark:text-orange-100">
              {lang === "hi" ? "आज का फोकस:" : "Today's focus:"}
            </span>{" "}
            <span className="text-gray-800 dark:text-gray-100">
              {digitalTwin.focus || "-"}
            </span>
          </div>
          <div className="mb-2">
            <span className="font-medium text-gray-900 dark:text-orange-100">
              {lang === "hi" ? "साप्ताहिक टिप:" : "Weekly Tip:"}
            </span>{" "}
            <span className="text-gray-800 dark:text-gray-100">
              {digitalTwin.weekly_tip || "-"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-orange-100">
              {lang === "hi" ? "जोखिम स्तर:" : "Risk Level:"}
            </span>{" "}
            <span
              className={`px-2 py-1 rounded dark:text-gray-900 ${riskColor}`}
            >
              {digitalTwin.risk_level || "-"}
            </span>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
              {digitalTwin.risk_reason || ""}
            </span>
          </div>
        </section>

        {/* 4. Personalized Diet Plan */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200">
              {lang === "hi"
                ? "व्यक्तिगत आहार योजना"
                : "Personalized Diet Plan"}
            </h2>
            <button className="text-xl" title="Listen">
              🔊
            </button>
          </div>
          <div className="space-y-2">
            {digitalTwin.diet_plan &&
              Object.entries(digitalTwin.diet_plan).map(([meal, desc]) => (
                <div
                  key={meal}
                  className="border-b border-gray-100 dark:border-gray-800 pb-2"
                >
                  <div className="font-semibold text-gray-900 dark:text-orange-100">
                    {meal}
                  </div>
                  <div className="text-gray-800 dark:text-gray-100">
                    {typeof desc === "string" || typeof desc === "number"
                      ? desc
                      : desc == null
                      ? "-"
                      : JSON.stringify(desc)}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* 5. Daily Progress Tracker */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200 mb-2">
            {lang === "hi" ? "आज की प्रगति" : "Today's Progress"}
          </h2>
          <div className="flex flex-col gap-2">
            {digitalTwin.tasks &&
              digitalTwin.tasks.map((task: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={progress[task] || false}
                    onChange={() => toggleTask(task)}
                    className="accent-pink-600"
                  />
                  <span className="text-gray-800 dark:text-gray-100">
                    {task}
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* 6. Child Nutrition */}
        {digitalTwin.child_nutrition && (
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200 mb-2">
              {lang === "hi" ? "बच्चों का पोषण" : "Child Nutrition"}
            </h2>
            <div className="mb-2 text-gray-800 dark:text-gray-100">
              <span>
                📅 {lang === "hi" ? "बच्चे की उम्र:" : "Baby's age:"}{" "}
                {digitalTwin.child_nutrition.age || "-"}
              </span>
            </div>
            <div className="mb-2 text-gray-800 dark:text-gray-100">
              <span>👶 {digitalTwin.child_nutrition.advice || "-"}</span>
              <button className="ml-2 text-lg" title="Listen">
                🔊
              </button>
            </div>
            <div className="mb-2 text-gray-800 dark:text-gray-100">
              <span>🍼 {digitalTwin.child_nutrition.breastfeed || "-"}</span>
              <button className="ml-2 text-lg" title="Listen">
                🔊
              </button>
            </div>
          </section>
        )}

        {/* 7. Story Mode (if present in twin data) */}
        {digitalTwin.stories && (
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200 mb-2">
              {lang === "hi" ? "सीखें कहानियों से" : "Learn from Stories"}
            </h2>
            {digitalTwin.stories.map((story: any, idx: number) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold text-gray-900 dark:text-orange-100">
                  {story.title}
                </div>
                <div className="text-gray-800 dark:text-gray-100">
                  {story.text}
                </div>
                {story.audio && (
                  <audio src={story.audio} controls className="mt-1" />
                )}
              </div>
            ))}
          </section>
        )}

        {/* 8. Ask AI / Chat Support */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200 mb-1">
              {lang === "hi" ? "AI से पूछें" : "Ask AI"}
            </h2>
            <div className="text-gray-700 dark:text-gray-200">
              {lang === "hi"
                ? "अगर आपके कोई सवाल हैं, तो AI से चैट करें।"
                : "If you have any questions, chat with AI."}
            </div>
          </div>
          <Link
            href="/chat"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-full shadow transition"
          >
            🗣️ {lang === "hi" ? "AI से पूछें" : "Ask AI"}
          </Link>
        </section>

        {/* 9. Emergency or Doctor Help */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200 mb-1">
              {lang === "hi" ? "आपातकालीन सहायता" : "Emergency Help"}
            </h2>
            <div className="text-gray-700 dark:text-gray-200">
              {lang === "hi"
                ? "अगर आपको डॉक्टर से बात करनी है, तो नीचे दिए गए बटन पर क्लिक करें।"
                : "If you need to talk to a doctor, click the button below."}
            </div>
          </div>
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full shadow transition"
          >
            🚨 {lang === "hi" ? "डॉक्टर से बात करें" : "Contact Doctor"}
          </a>
        </section>
      </div>
    </main>
  );
}

// Example translations object (expand as needed)
const translations = {
  hi: {},
  en: {},
};
