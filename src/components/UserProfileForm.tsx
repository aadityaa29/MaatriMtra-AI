"use client";
import { useState } from 'react';

type UserProfile = {
  age: string;
  pregnancyStage: string;
  weight: string;
  healthConditions: string;
  localFoods: string;
  language: string;
};

interface Props {
  onSubmit: (profile: UserProfile) => void;
}

export default function UserProfileForm({ onSubmit }: Props) {
  const [age, setAge] = useState('');
  const [pregnancyStage, setPregnancyStage] = useState('');
  const [weight, setWeight] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [localFoods, setLocalFoods] = useState('');
  const [language, setLanguage] = useState('Hindi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ age, pregnancyStage, weight, healthConditions, localFoods, language });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Age:</label>
        <input type="number" value={age} onChange={e => setAge(e.target.value)} required />
      </div>
      <div>
        <label>Pregnancy Stage:</label>
        <select value={pregnancyStage} onChange={e => setPregnancyStage(e.target.value)} required>
          <option value="">Select stage</option>
          <option value="First Trimester">First Trimester</option>
          <option value="Second Trimester">Second Trimester</option>
          <option value="Third Trimester">Third Trimester</option>
          <option value="Postpartum">Postpartum</option>
          <option value="Not Pregnant">Not Pregnant</option>
        </select>
      </div>
      <div>
        <label>Weight (kg):</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} required />
      </div>
      <div>
        <label>Health Conditions:</label>
        <textarea value={healthConditions} onChange={e => setHealthConditions(e.target.value)} placeholder="e.g. anemia, diabetes" />
      </div>
      <div>
        <label>Available Local Foods:</label>
        <textarea value={localFoods} onChange={e => setLocalFoods(e.target.value)} placeholder="e.g. dal, rice, spinach" />
      </div>
      <div>
        <label>Language Preference:</label>
        <select value={language} onChange={e => setLanguage(e.target.value)} required>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Profile</button>
    </form>
  );
}
