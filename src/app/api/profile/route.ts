import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Create or update profile
export async function POST(request: NextRequest) {
  const data = await request.json();
  const { user_id, age, pregnancyStage, weight, healthConditions, localFoods, language } = data;

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // Upsert profile
  const { error } = await supabase.from('profiles').upsert({
    user_id,
    age,
    pregnancy_stage: pregnancyStage,
    weight,
    health_conditions: healthConditions,
    local_foods: localFoods,
    language_preference: language,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Profile saved successfully' });
}
