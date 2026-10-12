// Universal voice player for Nur Duniya
// Uses server-side TTS (/api/tts -> WAV/MP3 audio) with Blob URL playback for reliable Urdu, Arabic, and English audio,
// plus automatic fallback to browser speechSynthesis.

let activeAudioElement: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activeButtonId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function notifyListeners() {
  for (const fn of listeners) {
    fn(activeButtonId);
  }
}

export function subscribeVoiceState(callback: (id: string | null) => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function cleanupObjectUrl() {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

export function stopActiveVoice() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  cleanupObjectUrl();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeButtonId = null;
  notifyListeners();
}

export function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType || 'audio/wav' });
  return URL.createObjectURL(blob);
}

export async function playVoiceClip({
  id,
  text,
  lang = 'en',
  voiceName,
}: {
  id: string;
  text: string;
  lang?: 'en' | 'ur' | 'ar';
  voiceName?: string;
}) {
  if (!text) return;

  if (activeButtonId === id) {
    stopActiveVoice();
    return;
  }

  stopActiveVoice();
  activeButtonId = id;
  notifyListeners();

  const ttsLang: 'en' | 'ur' | 'ar' = lang === 'ur' ? 'ur' : lang === 'ar' ? 'ar' : 'en';

  try {
    const payload: { text: string; lang: 'en' | 'ur' | 'ar'; voiceName?: string } = {
      text,
      lang: ttsLang,
    };
    if (voiceName) {
      payload.voiceName = voiceName;
    }
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('TTS fallback');
    }

    const data = await response.json();
    if (!data.audioBase64) {
      throw new Error('No audio base64 payload');
    }

    if (activeButtonId !== id) return;

    const audioUrl = base64ToBlobUrl(data.audioBase64, data.mimeType || 'audio/wav');
    activeObjectUrl = audioUrl;
    const audio = new Audio(audioUrl);
    activeAudioElement = audio;

    audio.onended = () => {
      if (activeButtonId === id) {
        activeButtonId = null;
        activeAudioElement = null;
        cleanupObjectUrl();
        notifyListeners();
      }
    };

    audio.onerror = () => {
      cleanupObjectUrl();
      fallbackBrowserSpeak(id, text, ttsLang);
    };

    await audio.play();
  } catch {
    if (activeButtonId === id) {
      fallbackBrowserSpeak(id, text, ttsLang);
    }
  }
}

function fallbackBrowserSpeak(id: string, text: string, lang: 'en' | 'ur' | 'ar') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    activeButtonId = null;
    notifyListeners();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  if (lang === 'ar') {
    utterance.lang = 'ar-SA';
  } else if (lang === 'ur') {
    utterance.lang = 'ur-PK';
  } else {
    utterance.lang = 'en-US';
  }
  utterance.rate = 0.92;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    if (lang === 'ar') {
      const arVoice = voices.find((v) => v.lang.toLowerCase().includes('ar'));
      if (arVoice) utterance.voice = arVoice;
    } else if (lang === 'ur') {
      const urVoice = voices.find((v) => v.lang.toLowerCase().includes('ur'));
      if (urVoice) utterance.voice = urVoice;
    } else {
      const enVoice =
        voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }
  }

  utterance.onend = () => {
    if (activeButtonId === id) {
      activeButtonId = null;
      notifyListeners();
    }
  };
  utterance.onerror = () => {
    if (activeButtonId === id) {
      activeButtonId = null;
      notifyListeners();
    }
  };

  window.speechSynthesis.speak(utterance);
}
