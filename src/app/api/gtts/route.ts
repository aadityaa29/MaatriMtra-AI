// app/api/gtts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import googleTTS from 'google-tts-api';

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const url = googleTTS.getAudioUrl(text, {
    lang: 'hi',
    slow: false,
    host: 'https://translate.google.com',
  });
  // Proxy the audio file to the frontend
  const audioRes = await fetch(url);
  const audioBuffer = await audioRes.arrayBuffer();
  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="output.mp3"',
    },
  });
}
