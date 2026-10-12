import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProphetProfile } from '../data/islamicContent';
import { stopActiveVoice, base64ToBlobUrl } from '../utils/voicePlayer';
import { Play, Pause, RotateCcw, RotateCw, Loader2, Check, Volume2 } from 'lucide-react';

interface VoiceOption {
  id: string;
  labelEn: string;
  labelUr: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'Kore', labelEn: 'Kore (Clear & Natural Accent)', labelUr: 'کورے (صاف اور قدرتی آواز)' },
  { id: 'Zephyr', labelEn: 'Zephyr (Warm Storyteller)', labelUr: 'زیفر (پرکشش داستان گو)' },
  { id: 'Puck', labelEn: 'Puck (Youthful Guide)', labelUr: 'پک (نوجوان رہنما)' },
  { id: 'Charon', labelEn: 'Charon (Deep Narrator)', labelUr: 'کیرون (سنجیدہ راوی)' },
];

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const rem = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

interface ProphetAudioPlayerProps {
  prophet: ProphetProfile;
  defaultLang?: 'en' | 'ur';
  onCompleteAudio: (lang: 'en' | 'ur') => void;
  completedEn?: boolean;
  completedUr?: boolean;
}

export function ProphetAudioPlayer({
  prophet,
  defaultLang = 'en',
  onCompleteAudio,
  completedEn,
  completedUr,
}: ProphetAudioPlayerProps) {
  const [audioLang, setAudioLang] = useState<'en' | 'ur'>(defaultLang);
  const [voice, setVoice] = useState('Kore');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(45);
  const [audioSourceMode, setAudioSourceMode] = useState<'gemini-wav' | 'browser-speech'>('gemini-wav');

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioKeyRef = useRef('');
  const fallbackTimerRef = useRef<number | null>(null);

  const isUr = defaultLang === 'ur';

  useEffect(() => {
    setAudioLang(defaultLang);
  }, [defaultLang]);

  const scriptText = audioLang === 'en' ? prophet.fullAudioScriptEn : prophet.fullAudioScriptUr;

  const sentences = useMemo(() => {
    const raw =
      audioLang === 'en'
        ? scriptText.split(/(?<=[.!?])\s+/)
        : scriptText.split(/(?<=[۔!\n])\s+/);
    const filtered = raw.map((s) => s.trim()).filter(Boolean);
    const totalChars = filtered.reduce((acc, s) => acc + s.length, 0) || 1;
    const estimatedTotalSeconds = Math.max(30, Math.round(totalChars / 13));

    let accumulated = 0;
    return filtered.map((text) => {
      const segDuration = Math.max(3, (text.length / totalChars) * estimatedTotalSeconds);
      const startSec = accumulated;
      accumulated += segDuration;
      return { text, startSec, endSec: accumulated };
    });
  }, [scriptText, audioLang]);

  const estimatedDuration = useMemo(() => {
    return sentences.length > 0 ? Math.ceil(sentences[sentences.length - 1].endSec) : 45;
  }, [sentences]);

  useEffect(() => {
    stopAllPlayback();
    setCurrentTime(0);
    setDuration(estimatedDuration);
    currentAudioKeyRef.current = '';
  }, [prophet.id, audioLang, voice, estimatedDuration]);

  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, []);

  const stopAllPlayback = () => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const startBrowserSpeechFromTime = (targetSec: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    stopActiveVoice();
    window.speechSynthesis.cancel();
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const clampedSec = Math.max(0, Math.min(targetSec, estimatedDuration - 1));
    setCurrentTime(clampedSec);
    setDuration(estimatedDuration);

    const startIdx = Math.max(
      0,
      sentences.findIndex((s) => clampedSec >= s.startSec && clampedSec < s.endSec)
    );
    const remainingText = sentences
      .slice(startIdx)
      .map((s) => s.text)
      .join(' ');

    const utterance = new SpeechSynthesisUtterance(remainingText);
    utterance.lang = audioLang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = playbackRate;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (audioLang === 'ur') {
        const urduVoice =
          voices.find((v) => v.lang.toLowerCase().includes('ur')) ||
          voices.find((v) => v.lang.toLowerCase().includes('ar'));
        if (urduVoice) utterance.voice = urduVoice;
      } else {
        const enVoice =
          voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.onend = () => {
      if (fallbackTimerRef.current) {
        window.clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(estimatedDuration);
      onCompleteAudio(audioLang);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);

    fallbackTimerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25 * playbackRate;
        if (next >= estimatedDuration) {
          if (fallbackTimerRef.current) {
            window.clearInterval(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
          setIsPlaying(false);
          onCompleteAudio(audioLang);
          return estimatedDuration;
        }
        return next;
      });
    }, 250);
  };

  const handleTogglePlayPause = async () => {
    if (isPlaying) {
      if (audioSourceMode === 'gemini-wav' && htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      } else {
        if (fallbackTimerRef.current) {
          window.clearInterval(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      setIsPlaying(false);
      return;
    }

    stopActiveVoice();
    const desiredKey = `${prophet.id}_${audioLang}_${voice}`;

    if (
      audioSourceMode === 'gemini-wav' &&
      htmlAudioRef.current &&
      currentAudioKeyRef.current === desiredKey
    ) {
      if (htmlAudioRef.current.currentTime >= htmlAudioRef.current.duration - 0.5) {
        htmlAudioRef.current.currentTime = 0;
      }
      htmlAudioRef.current.playbackRate = playbackRate;
      await htmlAudioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          lang: audioLang,
          voiceName: voice,
        }),
      });

      if (!response.ok) {
        throw new Error('Fallback to browser speech');
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('Empty audio');
      }

      const audioUrl = base64ToBlobUrl(data.audioBase64, data.mimeType || 'audio/wav');
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackRate;

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && Number.isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(audio.duration || estimatedDuration);
        onCompleteAudio(audioLang);
      });

      htmlAudioRef.current = audio;
      currentAudioKeyRef.current = desiredKey;
      setAudioSourceMode('gemini-wav');
      setIsLoadingAudio(false);

      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsLoadingAudio(false);
      setAudioSourceMode('browser-speech');
      const resumeSec = currentTime >= estimatedDuration - 1 ? 0 : currentTime;
      startBrowserSpeechFromTime(resumeSec);
    }
  };

  const handleSeekByDelta = (deltaSeconds: number) => {
    const maxDur = duration || estimatedDuration;
    const nextTime = Math.max(0, Math.min(currentTime + deltaSeconds, maxDur));
    setCurrentTime(nextTime);
    if (audioSourceMode === 'gemini-wav' && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = nextTime;
    } else if (isPlaying) {
      startBrowserSpeechFromTime(nextTime);
    }
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (audioSourceMode === 'gemini-wav' && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = nextTime;
    } else if (isPlaying) {
      startBrowserSpeechFromTime(nextTime);
    }
  };

  const activeSentenceIndex = useMemo(() => {
    if (!sentences.length) return 0;
    const ratio = duration > 0 ? currentTime / duration : 0;
    const scaledTime = ratio * estimatedDuration;
    const idx = sentences.findIndex((s) => scaledTime >= s.startSec && scaledTime <= s.endSec);
    return idx === -1 ? sentences.length - 1 : idx;
  }, [currentTime, duration, estimatedDuration, sentences]);

  return (
    <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-4 sm:p-5 mt-4" dir={isUr ? 'rtl' : 'ltr'}>
      {/* Audio Language & Voice selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#0f6b64]/15">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-[#0f6b64] flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>{isUr ? 'کہانی کی صوتی تلاوت و بیان:' : 'Story Audio Narration:'}</span>
          </span>
          <button
            type="button"
            onClick={() => setAudioLang('en')}
            className={`btn-outline text-xs py-1 px-3 ${audioLang === 'en' ? 'active' : ''}`}
          >
            <span>{isUr ? 'انگریزی آڈیو' : 'English Audio'}</span>
            {completedEn && <Check className="w-3.5 h-3.5 text-emerald-300" />}
          </button>
          <button
            type="button"
            onClick={() => setAudioLang('ur')}
            className={`btn-outline text-xs py-1 px-3 ${audioLang === 'ur' ? 'active' : ''}`}
          >
            <span>{isUr ? 'اردو آڈیو' : 'Urdu Audio'}</span>
            {completedUr && <Check className="w-3.5 h-3.5 text-emerald-300" />}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor={`voice-select-${prophet.id}`} className="text-xs font-semibold text-[#4e6b68]">
            {isUr ? 'آواز کا انداز:' : 'Accent Voice:'}
          </label>
          <select
            id={`voice-select-${prophet.id}`}
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#0f6b64]/30 bg-white text-[#183331] text-xs font-semibold cursor-pointer"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {isUr ? v.labelUr : v.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control row */}
      <div className="flex flex-wrap items-center gap-2.5 mt-3">
        <button
          type="button"
          onClick={() => handleSeekByDelta(-10)}
          disabled={isLoadingAudio}
          className="btn-outline text-xs py-1.5 px-3"
          title={isUr ? '۱۰ سیکنڈ پیچھے کریں' : 'Rewind 10 seconds'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isUr ? '-۱۰ سیکنڈ' : '-10s'}</span>
        </button>

        <button
          type="button"
          onClick={handleTogglePlayPause}
          disabled={isLoadingAudio}
          className={isPlaying ? 'btn-gold text-xs py-2 px-4' : 'btn-primary text-xs py-2 px-4'}
        >
          {isLoadingAudio ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isUr ? 'آڈیو تیار ہو رہی ہے...' : 'Generating Audio...'}</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>{isUr ? 'کہانی روکیں' : 'Pause Story'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>
                {isUr
                  ? `کہانی سنیں (${audioLang === 'en' ? 'انگریزی' : 'اردو'})`
                  : `Play Story (${audioLang === 'en' ? 'English' : 'Urdu'})`}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSeekByDelta(10)}
          disabled={isLoadingAudio}
          className="btn-outline text-xs py-1.5 px-3"
          title={isUr ? '۱۰ سیکنڈ آگے کریں' : 'Fast-forward 10 seconds'}
        >
          <span>{isUr ? '+۱۰ سیکنڈ' : '+10s'}</span>
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            const nextRate = playbackRate === 1 ? 1.15 : playbackRate === 1.15 ? 0.85 : 1;
            setPlaybackRate(nextRate);
            if (htmlAudioRef.current) {
              htmlAudioRef.current.playbackRate = nextRate;
            } else if (isPlaying && audioSourceMode === 'browser-speech') {
              startBrowserSpeechFromTime(currentTime);
            }
          }}
          className="btn-outline text-xs py-1.5 px-3"
        >
          {isUr ? `رفتار: ${playbackRate}x` : `Speed: ${playbackRate}x`}
        </button>

        <span
          className={`tabular-nums text-xs font-semibold ${isUr ? 'mr-auto' : 'ml-auto'} text-[#4e6b68]`}
          dir="ltr"
        >
          {formatSeconds(currentTime)} / {formatSeconds(duration)}
        </span>
      </div>

      {/* Scrubber slider */}
      <div className="mt-2.5" dir="ltr">
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.5}
          value={Math.min(currentTime, duration)}
          onChange={handleScrubChange}
          aria-label={isUr ? 'آڈیو پروگریس سلائیڈر' : 'Audio progress scrubber'}
          className="w-full accent-[#0f6b64] cursor-pointer"
        />
      </div>

      {/* Read-along transcript with live highlighting */}
      <div
        dir={audioLang === 'ur' ? 'rtl' : 'ltr'}
        className={`mt-3 p-3.5 rounded-xl bg-[#0f6b64]/5 ${
          audioLang === 'ur' ? 'text-base leading-loose' : 'text-sm leading-relaxed'
        }`}
      >
        {sentences.map((seg, idx) => {
          const isCurrent = idx === activeSentenceIndex && (isPlaying || currentTime > 0);
          return (
            <span
              key={idx}
              onClick={() => {
                const targetSec = (seg.startSec / estimatedDuration) * duration;
                setCurrentTime(targetSec);
                if (audioSourceMode === 'gemini-wav' && htmlAudioRef.current) {
                  htmlAudioRef.current.currentTime = targetSec;
                } else if (isPlaying) {
                  startBrowserSpeechFromTime(targetSec);
                }
              }}
              className={`cursor-pointer px-1 py-0.5 rounded transition-colors ${
                isCurrent ? 'bg-[#d4952c]/35 font-semibold' : ''
              }`}
            >
              {seg.text}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
