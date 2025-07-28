"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const translations = {
  // ... (same as your code)
  hi: {
    headline: "हमारी AI को जानने दीजिए आपके बारे में — ताकि आपकी मदद कर सके।",
    helpAudio: "इस फॉर्म को भरने में मदद चाहिए?",
    step1: "आपके बारे में",
    step2: "गर्भावस्था / स्वास्थ्य",
    step3: "बच्चों की जानकारी",
    step4: "पसंद और सहमति",
    name: "पूरा नाम",
    namePh: "जैसे – राधा देवी",
    age: "आयु (साल)",
    phone: "फोन नंबर (वैकल्पिक)",
    location: "गाँव/जिला",
    locationPh: "गाँव का नाम जैसे – नंदगाँव",
    language: "भाषा पसंद",
    pregnant: "क्या आप गर्भवती हैं?",
    weeks: "अगर हाँ, कितने हफ्ते/महीने?",
    firstPregnancy: "क्या यह पहली गर्भावस्था है?",
    issues: "कोई बीमारी है?",
    issuesPh: "जैसे – एनीमिया, डायबिटीज, बीपी",
    supplements: "क्या आप कोई सप्लीमेंट लेती हैं?",
    meals: "दिन में कितनी बार भोजन करती हैं?",
    breastfeeding: "क्या आप स्तनपान कराती हैं?",
    childrenCount: "कितने बच्चे हैं?",
    childrenAges: "बच्चों की उम्र (कॉमा से अलग करें)",
    underweight: "क्या कोई बच्चा कमजोर या बार-बार बीमार रहता है?",
    voiceAssist: "क्या आप वॉइस आधारित सलाह चाहती हैं?",
    reminder: "कितनी बार याद दिलाएँ?",
    daily: "रोज़",
    weekly: "साप्ताहिक",
    never: "कभी नहीं",
    consent: "मैं सहमत हूँ कि यह जानकारी AI द्वारा इस्तेमाल की जाएगी केवल सुझाव देने हेतु।",
    submit: "मेरा AI साथी बनाइए / Create My Digital Twin",
    loading: "रुकिए, हम आपके लिए योजना बना रहे हैं...",
    required: "आवश्यक",
    yes: "हाँ",
    no: "नहीं",
    select: "चुनें",
  },
  en: {
    headline: "Tell our AI about you — so it can help you better.",
    helpAudio: "Need help filling this form?",
    step1: "About You",
    step2: "Pregnancy / Health",
    step3: "Child Info",
    step4: "Preferences & Consent",
    name: "Full Name",
    namePh: "e.g. Radha Devi",
    age: "Age (years)",
    phone: "Phone Number (optional)",
    location: "Village/District",
    locationPh: "e.g. Nandgaon",
    language: "Language Preference",
    pregnant: "Are you pregnant?",
    weeks: "If yes, how many weeks/months?",
    firstPregnancy: "Is this your first pregnancy?",
    issues: "Any diagnosed issues?",
    issuesPh: "e.g. Anemia, Diabetes, BP",
    supplements: "Do you take any supplements?",
    meals: "How many meals per day?",
    breastfeeding: "Do you breastfeed currently?",
    childrenCount: "Number of children",
    childrenAges: "Ages of children (comma separated)",
    underweight: "Any child underweight or sick often?",
    voiceAssist: "Do you want voice-based advice?",
    reminder: "How often should we remind you?",
    daily: "Daily",
    weekly: "Weekly",
    never: "Never",
    consent: "I agree that this info will be used by AI only for suggestions.",
    submit: "Create My Digital Twin",
    loading: "Please wait, we are preparing your plan...",
    required: "Required",
    yes: "Yes",
    no: "No",
    select: "Select",
  },
};

const healthOptions = [
  { value: "anemia", hi: "एनीमिया", en: "Anemia" },
  { value: "diabetes", hi: "डायबिटीज", en: "Diabetes" },
  { value: "bp", hi: "बीपी", en: "BP" },
  { value: "thyroid", hi: "थायरॉइड", en: "Thyroid" },
  { value: "other", hi: "अन्य", en: "Other" },
];

export default function CreateProfilePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    location: "",
    language: lang,
    pregnant: "yes",
    weeks: "",
    firstPregnancy: "yes",
    issues: [] as string[],
    supplements: "",
    meals: "",
    breastfeeding: "no",
    childrenCount: "",
    childrenAges: "",
    underweight: "no",
    voiceAssist: "yes",
    reminder: "daily",
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Audio help (replace with actual audio file if available)
  const [showAudio, setShowAudio] = useState(false);
  const helpAudioUrl = lang === "hi"
    ? "/audios/help_hi.mp3"
    : "/audios/help_en.mp3";

  // --- FEATURE: Ensure user is signed in and profile exists on first load ---
  useEffect(() => {
    async function ensureProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      // 1. Check if profile exists
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // 2. If not, insert profile using user_metadata.name
      if (!profileData) {
        await supabase.from("profiles").insert([{
          user_id: user.id,
          name: user.user_metadata?.name || "",
          age: null,
          pregnancy_stage: "",
          weight: null,
          health_conditions: "",
          local_foods: "",
          language_preference: lang,
        }]);
      }
    }
    ensureProfile();
    // eslint-disable-next-line
  }, [router, supabase, lang]);

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "issues") {
      setForm((prev) => ({
        ...prev,
        issues: checked
          ? [...prev.issues, value]
          : prev.issues.filter((v) => v !== value),
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    if (!form.consent) return;

    setLoading(true);

    try {
      // 1. Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        router.push("/login");
        return;
      }

      // 2. Insert profile (if not exists)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([{
          user_id: user.id,
          name: form.name,
          age: parseInt(form.age),
          pregnancy_stage: form.pregnant === "yes" ? (form.weeks || "pregnant") : "not_pregnant",
          weight: 0, // You can add a weight field to your form if needed
          health_conditions: form.issues.join(","),
          local_foods: "",
          language_preference: form.language,
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // 3. Insert digital twin (empty for now, can add more logic)
      const { error: twinError } = await supabase
        .from("digital_twins")
        .insert([{
          profile_id: profile.id,
          user_id: user.id,
          twin_data: {},
        }]);

      if (twinError) throw twinError;

      // 4. Call the digital twin API to generate personalized plan
      await fetch('/api/generateDigitalTwin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            user_id: user.id,
            id: profile.id, // profile_id
            age: profile.age,
            pregnancy_week: form.weeks,
            health_conditions: form.issues,
          }
        }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        lang === "hi"
          ? "प्रोफ़ाइल बनाने में त्रुटि, कृपया बाद में पुनः प्रयास करें"
          : "Error creating profile, please try again later"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center px-2 py-6 transition-colors pt-16">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-10">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/photos/formpage-img.png"
            alt="Mother, Child, and Mobile"
            className="w-150 h-90 mb-2 rounded-lg shadow-lg bg-white/30 backdrop-blur-md border border-white/30 object-cover"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-pink-700 dark:text-orange-200 text-center mb-2">
            {t.headline}
          </h1>
          <button
            type="button"
            className="flex items-center gap-2 text-pink-700 dark:text-orange-200 font-medium hover:underline mb-2"
            onClick={() => setShowAudio((v) => !v)}
          >
            🎧 {t.helpAudio}
          </button>
          {showAudio && (
            <audio src={helpAudioUrl} controls autoPlay className="mb-2" />
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 font-semibold">{error}</div>
          )}

          {/* Step 1: About You */}
          <section>
            <h2 className="font-semibold mb-2 text-lg text-gray-900 dark:text-orange-100">{t.step1}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">
                  {t.name} <span className="text-pink-600">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={t.namePh}
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">
                  {t.age} <span className="text-pink-600">*</span>
                </label>
                <input
                  name="age"
                  type="number"
                  required
                  min={14}
                  max={60}
                  placeholder="24"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.phone}</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">
                  {t.location} <span className="text-pink-600">*</span>
                </label>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder={t.locationPh}
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.language}</label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="hi">हिंदी</option>
                  <option value="en">English</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>
            </div>
          </section>
          {/* Step 2: Pregnancy/Health */}
          <section>
            <h2 className="font-semibold mb-2 text-lg text-gray-900 dark:text-orange-100">{t.step2}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.pregnant}</label>
                <select
                  name="pregnant"
                  value={form.pregnant}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </div>
              {form.pregnant === "yes" && (
                <div>
                  <label className="block font-medium text-gray-900 dark:text-orange-100">{t.weeks}</label>
                  <input
                    name="weeks"
                    type="number"
                    min={1}
                    max={40}
                    placeholder="12"
                    value={form.weeks}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.firstPregnancy}</label>
                <select
                  name="firstPregnancy"
                  value={form.firstPregnancy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.issues}</label>
                <div className="flex flex-wrap gap-2">
                  {healthOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1 dark:text-orange-100">
                      <input
                        type="checkbox"
                        name="issues"
                        value={opt.value}
                        checked={form.issues.includes(opt.value)}
                        onChange={handleChange}
                        className="accent-pink-600 "
                      />
                      <span>{opt[lang]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.supplements}</label>
                <input
                  name="supplements"
                  type="text"
                  placeholder={lang === "hi" ? "जैसे – आयरन, कैल्शियम" : "e.g. Iron, Calcium"}
                  value={form.supplements}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.meals}</label>
                <input
                  name="meals"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="3"
                  value={form.meals}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.breastfeeding}</label>
                <select
                  name="breastfeeding"
                  value={form.breastfeeding}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </div>
            </div>
          </section>
          {/* Step 3: Child Info */}
          <section>
            <h2 className="font-semibold mb-2 text-lg text-gray-900 dark:text-orange-100">{t.step3}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.childrenCount}</label>
                <input
                  name="childrenCount"
                  type="number"
                  min={0}
                  max={10}
                  placeholder="1"
                  value={form.childrenCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.childrenAges}</label>
                <input
                  name="childrenAges"
                  type="text"
                  placeholder={lang === "hi" ? "जैसे – 2, 5" : "e.g. 2, 5"}
                  value={form.childrenAges}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.underweight}</label>
                <select
                  name="underweight"
                  value={form.underweight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="no">{t.no}</option>
                  <option value="yes">{t.yes}</option>
                </select>
              </div>
            </div>
          </section>
          {/* Step 4: Preferences & Consent */}
          <section>
            <h2 className="font-semibold mb-2 text-lg text-gray-900 dark:text-orange-100">{t.step4}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.voiceAssist}</label>
                <select
                  name="voiceAssist"
                  value={form.voiceAssist}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-orange-100">{t.reminder}</label>
                <select
                  name="reminder"
                  value={form.reminder}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                >
                  <option value="daily">{t.daily}</option>
                  <option value="weekly">{t.weekly}</option>
                  <option value="never">{t.never}</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                className="accent-pink-600"
                required
              />
              <label className="text-gray-900 dark:text-orange-100">{t.consent}</label>
            </div>
          </section>

          <button
            type="submit"
            className={`w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-full shadow transition text-lg ${
              !form.consent ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={!form.consent || loading}
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
