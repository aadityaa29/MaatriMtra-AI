"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const healthOptions = [
  { value: "diabetes", hi: "डायबिटीज", en: "Diabetes" },
  { value: "thyroid", hi: "थायरॉइड", en: "Thyroid" },
  { value: "anemia", hi: "एनीमिया", en: "Anemia" },
  { value: "bp", hi: "बीपी", en: "Blood Pressure" },
];

const feedingOptions = [
  { value: "breastfeeding", hi: "स्तनपान", en: "Breastfeeding" },
  { value: "formula", hi: "फॉर्मूला दूध", en: "Formula" },
  { value: "weaning", hi: "ऊपरी आहार", en: "Weaning" },
];

export default function ProfilePage() {
  const { lang } = useLanguage();
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Auth check & fetch profile
  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile(data);
        setForm(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase, router]);

  // Handle form changes
  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  }

  // Save section to database and update digital twin
  async function handleSave(section: string) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update the profile with the form data
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update error:", error);
    }

    // Fetch fresh data from database
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (updatedProfile) {
      setProfile(updatedProfile);
      setForm(updatedProfile);

      // Call Gemini digital twin API with latest profile
      await fetch('/api/generateDigitalTwin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...updatedProfile,
            user_id: user.id,
            id: updatedProfile.id, // profile_id
            age: updatedProfile.age,
            pregnancy_week: updatedProfile.pregnancy_week,
            health_conditions: updatedProfile.health_conditions,
          }
        }),
      });
    }
    
    setEditSection(null);
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-2 py-8 transition-colors pt-16">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* 1. Basic Info */}
        <ProfileCard
          title={lang === "hi" ? "मूल जानकारी" : "Basic Information"}
          subtitle={lang === "hi" ? "Basic Info" : "मूल जानकारी"}
          edit={editSection === "basic"}
          onEdit={() => setEditSection("basic")}
          onCancel={() => { setEditSection(null); setForm(profile); }}
          onSave={() => handleSave("basic")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField
              label={lang === "hi" ? "पूरा नाम" : "Full Name"}
              value={form.name}
              edit={editSection === "basic"}
              onChange={handleChange}
              name="name"
            />
            <ProfileField
              label={lang === "hi" ? "आयु" : "Age"}
              value={form.age}
              edit={editSection === "basic"}
              onChange={handleChange}
              name="age"
              type="number"
            />
            <ProfileField
              label={lang === "hi" ? "गाँव/जिला" : "Village/District"}
              value={form.location}
              edit={editSection === "basic"}
              onChange={handleChange}
              name="location"
            />
            <ProfileField
              label={lang === "hi" ? "भाषा" : "Language"}
              value={form.language_preference}
              edit={editSection === "basic"}
              onChange={handleChange}
              name="language_preference"
              type="select"
              options={[
                { value: "hi", label: "हिंदी" },
                { value: "en", label: "English" },
              ]}
            />
          </div>
        </ProfileCard>

        {/* 2. Pregnancy Details */}
        <ProfileCard
          title={lang === "hi" ? "गर्भावस्था विवरण" : "Pregnancy Details"}
          subtitle={lang === "hi" ? "Pregnancy Info" : "गर्भावस्था विवरण"}
          edit={editSection === "pregnancy"}
          onEdit={() => setEditSection("pregnancy")}
          onCancel={() => { setEditSection(null); setForm(profile); }}
          onSave={() => handleSave("pregnancy")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField
              label={lang === "hi" ? "गर्भावस्था चरण" : "Pregnancy Stage"}
              value={form.pregnancy_stage}
              edit={editSection === "pregnancy"}
              onChange={handleChange}
              name="pregnancy_stage"
            />
            <ProfileField
              label={lang === "hi" ? "गर्भावस्था सप्ताह" : "Pregnancy Week"}
              value={form.pregnancy_week}
              edit={editSection === "pregnancy"}
              onChange={handleChange}
              name="pregnancy_week"
              type="number"
            />
            <ProfileField
              label={lang === "hi" ? "वजन" : "Weight"}
              value={form.weight}
              edit={editSection === "pregnancy"}
              onChange={handleChange}
              name="weight"
              type="number"
            />
            <ProfileField
              label={lang === "hi" ? "जटिलताएँ" : "Complications"}
              value={form.complications}
              edit={editSection === "pregnancy"}
              onChange={handleChange}
              name="complications"
            />
          </div>
        </ProfileCard>

        {/* 3. Child Details */}
        <ProfileCard
          title={lang === "hi" ? "बच्चे का विवरण" : "Child Details"}
          subtitle={lang === "hi" ? "Child Info" : "बच्चे का विवरण"}
          edit={editSection === "child"}
          onEdit={() => setEditSection("child")}
          onCancel={() => { setEditSection(null); setForm(profile); }}
          onSave={() => handleSave("child")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField
              label={lang === "hi" ? "बच्चे का नाम" : "Baby Name"}
              value={form.baby_name}
              edit={editSection === "child"}
              onChange={handleChange}
              name="baby_name"
            />
            <ProfileField
              label={lang === "hi" ? "जन्म तिथि" : "Date of Birth"}
              value={form.baby_dob}
              edit={editSection === "child"}
              onChange={handleChange}
              name="baby_dob"
              type="date"
            />
            <ProfileField
              label={lang === "hi" ? "वजन" : "Weight"}
              value={form.baby_weight}
              edit={editSection === "child"}
              onChange={handleChange}
              name="baby_weight"
              type="number"
            />
            <ProfileField
              label={lang === "hi" ? "फीडिंग" : "Feeding"}
              value={form.feeding}
              edit={editSection === "child"}
              onChange={handleChange}
              name="feeding"
              type="select"
              options={feedingOptions.map(opt => ({ value: opt.value, label: opt[lang] }))}
            />
          </div>
        </ProfileCard>

        {/* 4. Health Conditions */}
        <ProfileCard
          title={lang === "hi" ? "स्वास्थ्य स्थिति" : "Health Conditions"}
          subtitle={lang === "hi" ? "Health Info" : "स्वास्थ्य स्थिति"}
          edit={editSection === "health"}
          onEdit={() => setEditSection("health")}
          onCancel={() => { setEditSection(null); setForm(profile); }}
          onSave={() => handleSave("health")}
        >
          <div className="mb-4">
            <ProfileField
              label={lang === "hi" ? "स्वास्थ्य स्थितियाँ" : "Health Conditions"}
              value={form.health_conditions}
              edit={editSection === "health"}
              onChange={handleChange}
              name="health_conditions"
            />
          </div>
          <div>
            <ProfileField
              label={lang === "hi" ? "दवा" : "Medication"}
              value={form.medication}
              edit={editSection === "health"}
              onChange={handleChange}
              name="medication"
            />
          </div>
        </ProfileCard>

        {/* 5. Preferences */}
        <ProfileCard
          title={lang === "hi" ? "पसंद" : "Preferences"}
          subtitle={lang === "hi" ? "Preferences" : "पसंद"}
          edit={editSection === "preferences"}
          onEdit={() => setEditSection("preferences")}
          onCancel={() => { setEditSection(null); setForm(profile); }}
          onSave={() => handleSave("preferences")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField
              label={lang === "hi" ? "वॉइस सहायता" : "Voice Assistance"}
              value={form.voice_assist}
              edit={editSection === "preferences"}
              onChange={handleChange}
              name="voice_assist"
              type="select"
              options={[
                { value: "yes", label: lang === "hi" ? "हाँ" : "Yes" },
                { value: "no", label: lang === "hi" ? "नहीं" : "No" },
              ]}
            />
            <ProfileField
              label={lang === "hi" ? "रिमाइंडर" : "Reminder"}
              value={form.reminder}
              edit={editSection === "preferences"}
              onChange={handleChange}
              name="reminder"
              type="select"
              options={[
                { value: "daily", label: lang === "hi" ? "रोज़" : "Daily" },
                { value: "weekly", label: lang === "hi" ? "साप्ताहिक" : "Weekly" },
                { value: "never", label: lang === "hi" ? "कभी नहीं" : "Never" },
              ]}
            />
            <ProfileField
              label={lang === "hi" ? "WhatsApp नंबर" : "WhatsApp Number"}
              value={form.whatsapp}
              edit={editSection === "preferences"}
              onChange={handleChange}
              name="whatsapp"
            />
          </div>
        </ProfileCard>

        {/* 6. Account Info */}
        <ProfileCard
          title={lang === "hi" ? "खाता जानकारी" : "Account Info"}
          subtitle={lang === "hi" ? "Account" : "खाता"}
          edit={editSection === "account"}
          onEdit={() => setEditSection("account")}
          onCancel={() => { setEditSection(null); setForm(profile); }}
          onSave={() => handleSave("account")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField
              label={lang === "hi" ? "ईमेल" : "Email"}
              value={form.email}
              edit={editSection === "account"}
              onChange={handleChange}
              name="email"
            />
            <ProfileField
              label={lang === "hi" ? "फोन नंबर" : "Phone Number"}
              value={form.phone}
              edit={editSection === "account"}
              onChange={handleChange}
              name="phone"
            />
          </div>
        </ProfileCard>
      </div>
    </main>
  );
}

// Card wrapper component
function ProfileCard({ title, subtitle, edit, onEdit, onCancel, onSave, children }: any) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-pink-700 dark:text-orange-200">{title}</h2>
          <span className="block text-xs text-gray-500 dark:text-gray-300">{subtitle}</span>
        </div>
        {!edit ? (
          <button onClick={onEdit} className="bg-pink-600 text-white px-4 py-1 rounded shadow hover:bg-pink-700">
            ✏️
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onSave} className="bg-green-600 text-white px-4 py-1 rounded shadow hover:bg-green-700">
              💾
            </button>
            <button onClick={onCancel} className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">
              ❌
            </button>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

// Field component
function ProfileField({ label, value, edit, onChange, name, type = "text", options }: any) {
  if (!edit) return (
    <div>
      <label className="block text-gray-700 dark:text-orange-100 text-sm font-medium">{label}</label>
      <div className="font-semibold text-gray-900 dark:text-white">{value || "-"}</div>
    </div>
  );
  
  if (type === "select") {
    return (
      <div>
        <label className="block text-gray-700 dark:text-orange-100 text-sm font-medium">{label}</label>
        <select name={name} value={value || ""} onChange={onChange} className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white">
          <option value="">--</option>
          {options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
  
  return (
    <div>
      <label className="block text-gray-700 dark:text-orange-100 text-sm font-medium">{label}</label>
      <input 
        name={name} 
        type={type} 
        value={value || ""} 
        onChange={onChange} 
        className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white" 
      />
    </div>
  );
}
