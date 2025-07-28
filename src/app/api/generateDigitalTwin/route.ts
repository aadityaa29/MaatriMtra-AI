import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { profile } = await request.json();
    if (!profile) {
      return NextResponse.json({ error: "No profile data" }, { status: 400 });
    }

    // 1. Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = `User is ${profile.age} years old, ${profile.pregnancy_week || 'N/A'} weeks pregnant. Known conditions: ${profile.health_conditions || 'none'}. Suggest personalized health and diet plan. Respond ONLY in valid JSON with this structure: {"focus": "...", "weekly_tip": "...", "risk_level": "...", "diet_plan": {"morning": "...", "afternoon": "...", "dinner": "..."}, "child_nutrition": {"age": "...", "advice": "...", "breastfeed": "..."}, "tasks": ["...", "..."]}`;

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const geminiData = await geminiResponse.json();
    console.log("Gemini raw:", JSON.stringify(geminiData));

    // 2. Parse Gemini response (handle markdown code block)
    let twinData = {};
    try {
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Remove Markdown-style code blocks (```json ... ```)
      const cleanJsonString = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      twinData = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("Gemini JSON parse error:", e, geminiData);
      return NextResponse.json({ error: "Invalid JSON format from Gemini" }, { status: 500 });
    }

    // 3. Save to Supabase with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use your service role key here
    );
    const { error } = await supabase.from('digital_twins').upsert(
      [{
        user_id: profile.user_id,
        profile_id: profile.id,
        twin_data: twinData,
        updated_at: new Date().toISOString(),
      }],
      { onConflict: 'profile_id' }
    );

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: "Failed to save digital twin" }, { status: 500 });
    }

    return NextResponse.json({ success: true, twinData });

  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
