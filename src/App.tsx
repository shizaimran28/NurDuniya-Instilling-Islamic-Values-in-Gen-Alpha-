import React, { useState, useEffect, useMemo } from 'react';
import {
  PROPHET_PROFILES,
  MORAL_STORIES,
  FOUNDATION_LESSONS,
  DAILY_SALAH_LIST,
  NUR_DAILY_DUAS,
  ZIKR_PHRASES,
  ZIKR_PHRASES_UR,
  MADRASA_URDU_MAP,
  LESSON_URDU_MAP,
  SUBJECT_LABELS_UR,
  AGE_GROUP_LABELS_UR,
  localizeUserName,
} from './data/islamicContent';
import { ProphetAudioPlayer } from './components/ProphetAudioPlayer';
import { MadrasaHub } from './components/MadrasaHub';
import { QuizStatsModal } from './components/QuizStatsModal';
import { Navbar } from './components/Navbar';
import { playVoiceClip, subscribeVoiceState } from './utils/voicePlayer';
import { Madrasa, StoredActivity, StoredUser } from '../server';
import {
  GraduationCap,
  BookOpen,
  Volume2,
  VolumeX,
  Compass,
  TrendingUp,
  BarChart2,
  Check,
  X,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  ChevronRight,
  Shield,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const PLANT_STAGE_LABELS_EN = [
  'Stage 1: Seed Planted',
  'Stage 2: Sprout Formed',
  'Stage 3: Young Sapling',
  'Stage 4: Fruitful Tree',
  'Stage 5: Full Bloom',
];

const PLANT_STAGE_LABELS_UR = [
  'مرحلہ ۱: نیکی کا بیج بویا گیا',
  'مرحلہ ۲: کونپل پھوٹ پڑی',
  'مرحلہ ۳: ننھا پودا پروان چڑھا',
  'مرحلہ ۴: پھل دار درخت بنا',
  'مرحلہ ۵: مکمل بہار اور نور',
];

export default function App() {
  const todayStr = useMemo(() => getTodayDateString(), []);

  // UI Language
  const [lang, setLang] = useState<'en' | 'ur' | 'ro'>('en');
  const isUr = lang === 'ur';

  // Age filter on Homepage
  const [ageFilter, setAgeFilter] = useState<'all' | '5-8' | '9-11' | '12-15'>('all');

  // Lesson subject filter on Homepage
  const [lessonSubjectFilter, setLessonSubjectFilter] = useState<string>('all');

  // Selected Prophet index
  const [selectedProphetIdx, setSelectedProphetIdx] = useState(0);

  // Active voice button tracker
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  useEffect(() => {
    return subscribeVoiceState((id) => setActiveVoiceId(id));
  }, []);

  // Navigation view: 'home' | 'madrasa' | 'lessons' | 'quizzes' | 'prophets' | 'salah_dua' | 'iman_tree' | 'leaderboard'
  const [currentView, setCurrentView] = useState<string>('home');
  const [madrasaInitialTab, setMadrasaInitialTab] = useState<
    'lessons' | 'quizzes' | 'leaderboard' | 'teacher_console'
  >('lessons');

  // State from server
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);
  const [madrasas, setMadrasas] = useState<Madrasa[]>([]);
  const [serverActivities, setServerActivities] = useState<StoredActivity[]>([]);
  const [currentMadrasaId, setCurrentMadrasaId] = useState<string>('madrasa_noor_academy');

  // User auth state
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(() => {
    try {
      const saved = localStorage.getItem('nurduniya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [guestActivities, setGuestActivities] = useState<StoredActivity[]>(() => {
    try {
      const saved = localStorage.getItem('nurduniya_guest_acts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Login modal
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authRole, setAuthRole] = useState<'student' | 'teacher'>('student');
  const [authPasscode, setAuthPasscode] = useState('1234');
  const [authError, setAuthError] = useState('');

  // Global Quiz Stats Modal state
  const [isGlobalStatsOpen, setIsGlobalStatsOpen] = useState(false);
  const [globalStatsStudent, setGlobalStatsStudent] = useState<
    StoredUser | { id: string; displayName: string; username: string; ageGroup?: string; role?: string } | null
  >(null);

  // Expanded Lesson Modal on Homepage
  const [readingLesson, setReadingLesson] = useState<{
    id: string;
    title: string;
    titleUr?: string;
    subject: string;
    arabicVerse?: string;
    transliteration?: string;
    translation?: string;
    content: string;
    points: number;
    sourceLabel: string;
  } | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Interactive intro
  const [introStep, setIntroStep] = useState(0);

  // Tree of good deeds
  const [plantStage, setPlantStage] = useState(1);
  const [plantPop, setPlantPop] = useState(false);

  // Zikr reminder
  const [zikrActive, setZikrActive] = useState(false);
  const [zikrIdx, setZikrIdx] = useState(0);

  // Fetch full state from backend
  const fetchState = () => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setRegisteredUsers(data.users);
        if (data.madrasas) {
          setMadrasas(data.madrasas);
          if (data.madrasas.length > 0 && !currentMadrasaId) {
            setCurrentMadrasaId(data.madrasas[0].id);
          }
        }
        if (data.activities) setServerActivities(data.activities);
      })
      .catch((err) => {
        console.error('Error fetching state:', err);
      });
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Sync RTL class on body for Urdu
  useEffect(() => {
    document.body.classList.toggle('nur-rtl', lang === 'ur');
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
  }, [lang]);

  // Zikr interval timer
  useEffect(() => {
    if (!zikrActive) return;
    const id = window.setInterval(() => {
      setZikrIdx((prev) => (prev + 1) % ZIKR_PHRASES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [zikrActive]);

  // Sync guest activities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nurduniya_guest_acts', JSON.stringify(guestActivities));
    } catch {
      // ignore
    }
  }, [guestActivities]);

  const navigateView = (target: string, subTab?: 'lessons' | 'quizzes' | 'leaderboard' | 'teacher_console') => {
    if (subTab) {
      setMadrasaInitialTab(subTab);
    } else if (target === 'quizzes') {
      setMadrasaInitialTab('quizzes');
    } else if (target === 'madrasa') {
      setMadrasaInitialTab('lessons');
    }
    setCurrentView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allActivities = useMemo(() => {
    if (currentUser) return serverActivities;
    return [...guestActivities, ...serverActivities];
  }, [currentUser, guestActivities, serverActivities]);

  const activeUserId = currentUser ? currentUser.id : 'guest_local';

  const hasDoneActivity = (activityKey: string, dateStr?: string) => {
    return allActivities.some(
      (a) =>
        a.userId === activeUserId &&
        a.activityKey === activityKey &&
        (dateStr ? a.date === dateStr : true)
    );
  };

  const recordActivity = async (params: {
    category: StoredActivity['category'];
    label: string;
    points: number;
    activityKey: string;
    madrasaId?: string;
  }) => {
    if (hasDoneActivity(params.activityKey, todayStr)) return;

    if (currentUser) {
      try {
        const res = await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            madrasaId: params.madrasaId || currentMadrasaId,
            date: todayStr,
            category: params.category,
            label: params.label,
            points: params.points,
            activityKey: params.activityKey,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.store?.activities) setServerActivities(data.store.activities);
          showToast(
            isUr
              ? `+${params.points} پوائنٹس لیڈر بورڈ میں شامل کیے گئے!`
              : `+${params.points} pts added to Leadership Board: ${params.label}`
          );
        }
      } catch {
        showToast(isUr ? `+${params.points} پوائنٹس حاصل ہوئے۔` : `+${params.points} pts earned.`);
      }
    } else {
      const guestAct: StoredActivity = {
        id: `guest_${Date.now()}`,
        userId: 'guest_local',
        username: 'guest_explorer',
        displayName: 'Guest Explorer (Not Logged In)',
        ageGroup: '9-11',
        madrasaId: currentMadrasaId,
        date: todayStr,
        category: params.category,
        label: params.label,
        points: params.points,
        activityKey: params.activityKey,
        timestamp: new Date().toISOString(),
      };
      setGuestActivities((prev) => [guestAct, ...prev]);
      showToast(
        isUr
          ? `+${params.points} پوائنٹس حاصل ہوئے۔ اپنے اکاؤنٹ میں محفوظ کرنے کے لیے سائن ان کریں۔`
          : `+${params.points} pts earned. Sign in to save under your profile.`
      );
    }
  };

  const toggleActivityOff = async (activityKey: string) => {
    if (currentUser) {
      const res = await fetch('/api/activity/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          date: todayStr,
          activityKey,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.store?.activities) setServerActivities(data.store.activities);
      }
    } else {
      setGuestActivities((prev) =>
        prev.filter((a) => !(a.activityKey === activityKey && a.date === todayStr))
      );
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          displayName: authDisplayName || authUsername,
          role: authRole,
          ageGroup: '9-11',
          passcode: authPasscode,
          guestActivities,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || (isUr ? 'سائن ان نہیں ہو سکا۔' : 'Login failed.'));
        return;
      }
      const user = data.user;
      setCurrentUser(user);
      localStorage.setItem('nurduniya_user', JSON.stringify(user));
      setGuestActivities([]);
      localStorage.removeItem('nurduniya_guest_acts');
      if (data.store?.users) setRegisteredUsers(data.store.users);
      if (data.store?.madrasas) setMadrasas(data.store.madrasas);
      if (data.store?.activities) setServerActivities(data.store.activities);
      setIsLoginOpen(false);
      showToast(
        isUr
          ? `${user.displayName} کے طور پر سائن ان ہو گیا`
          : `Signed in as ${user.displayName} (${user.role.toUpperCase()})`
      );
    } catch {
      setAuthError(isUr ? 'رابطے میں خرابی۔ دوبارہ کوشش کریں۔' : 'Connection error. Please try again.');
    }
  };

  // Quick switch role
  const handleToggleUserRole = async () => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const nextRole = currentUser.role === 'teacher' ? 'student' : 'teacher';
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          role: nextRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('nurduniya_user', JSON.stringify(data.user));
        showToast(
          isUr
            ? `موڈ تبدیل ہو گیا: ${nextRole === 'teacher' ? 'استاد موڈ' : 'طالب علم موڈ'}`
            : `Role switched to: ${nextRole === 'teacher' ? 'Teacher Mode' : 'Student Mode'}`
        );
        fetchState();
      }
    } catch {
      showToast(isUr ? 'موڈ تبدیل کرنے میں خرابی۔' : 'Error switching role.');
    }
  };

  // Quick login as seeded user
  const handleQuickLoginAs = async (username: string, role: 'teacher' | 'student') => {
    setAuthUsername(username);
    setAuthDisplayName(username.replace('usr_', '').replace('_', ' '));
    setAuthRole(role);
    setAuthPasscode('1234');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          displayName:
            username === 'ustadh_farooq'
              ? 'Ustadh Farooq Al-Azhari'
              : username === 'zayd_explorer'
              ? 'Zayd Al-Mansoor'
              : 'Ayesha Siddiqua',
          role,
          passcode: '1234',
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('nurduniya_user', JSON.stringify(data.user));
        setIsLoginOpen(false);
        showToast(
          isUr ? `${data.user.displayName} کے طور پر سائن ان ہو گیا` : `Signed in as ${data.user.displayName}`
        );
        fetchState();
      }
    } catch {
      showToast(isUr ? 'سائن ان میں خرابی۔' : 'Quick sign-in error.');
    }
  };

  const myTotalPoints = useMemo(() => {
    return allActivities
      .filter((a) => a.userId === activeUserId)
      .reduce((sum, a) => sum + a.points, 0);
  }, [allActivities, activeUserId]);

  const currentProphet = PROPHET_PROFILES[selectedProphetIdx] || PROPHET_PROFILES[0];

  // Combine Foundation Lessons + All Madrasa Classroom Lessons for the Homepage & Lessons view
  const combinedLessons = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      titleUr?: string;
      subject: 'quran' | 'seerah' | 'akhlaq' | 'fiqh' | 'history';
      ageGroup: '5-8' | '9-11' | '12-15' | 'all';
      arabicVerse?: string;
      transliteration?: string;
      translation?: string;
      content: string;
      points: number;
      sourceLabel: string;
      activityKey: string;
    }> = [];

    const seenLessonIds = new Set<string>();

    for (const fnd of FOUNDATION_LESSONS) {
      if (!seenLessonIds.has(fnd.id)) {
        seenLessonIds.add(fnd.id);
        list.push({
          id: fnd.id,
          title: isUr ? fnd.titleUr : fnd.titleEn,
          titleUr: fnd.titleUr,
          subject: fnd.subject,
          ageGroup: fnd.ageGroup,
          arabicVerse: fnd.arabicVerse,
          transliteration: fnd.transliteration,
          translation: isUr ? fnd.translationUr : fnd.translation,
          content: isUr ? fnd.contentUr : fnd.contentEn,
          points: fnd.points,
          sourceLabel: isUr ? 'نور دنیا بنیادی نصاب' : 'Nur Duniya Core Curriculum',
          activityKey: `foundation_lesson_${fnd.id}`,
        });
      }
    }

    for (const m of madrasas) {
      const mTitle = isUr ? MADRASA_URDU_MAP[m.id]?.nameUr || m.nameUr || m.name : m.name;
      for (const les of m.lessons || []) {
        if (!seenLessonIds.has(les.id)) {
          seenLessonIds.add(les.id);
          const mappedUr = LESSON_URDU_MAP[les.id];
          list.push({
            id: les.id,
            title: isUr ? mappedUr?.titleUr || les.titleUr || les.title : les.title,
            titleUr: mappedUr?.titleUr || les.titleUr,
            subject: les.subject,
            ageGroup: les.ageGroup,
            arabicVerse: les.arabicVerse,
            transliteration: les.transliteration,
            translation: isUr ? mappedUr?.translationUr || les.translation : les.translation,
            content: isUr ? mappedUr?.contentUr || les.content : les.content,
            points: les.points,
            sourceLabel: mTitle,
            activityKey: `madrasa_lesson_${les.id}`,
          });
        }
      }
    }

    return list.filter((item) => {
      const ageMatch = ageFilter === 'all' || item.ageGroup === 'all' || item.ageGroup === ageFilter;
      const subjectMatch = lessonSubjectFilter === 'all' || item.subject === lessonSubjectFilter;
      return ageMatch && subjectMatch;
    });
  }, [madrasas, isUr, ageFilter, lessonSubjectFilter]);

  const filteredMoralStories = useMemo(() => {
    return MORAL_STORIES.filter(
      (s) => ageFilter === 'all' || s.ageGroup === 'all' || s.ageGroup === ageFilter
    );
  }, [ageFilter]);

  const isHome = currentView === 'home';
  const plantLabels = isUr ? PLANT_STAGE_LABELS_UR : PLANT_STAGE_LABELS_EN;
  const activeZikrPhrases = isUr ? ZIKR_PHRASES_UR : ZIKR_PHRASES;

  const renderSalahIcon = (iconType: string) => {
    switch (iconType) {
      case 'sunrise':
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'cloud-sun':
        return <CloudSun className="w-5 h-5 text-amber-600" />;
      case 'sunset':
        return <Sunset className="w-5 h-5 text-orange-500" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-teal-600" />;
      default:
        return <Compass className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#183331] flex flex-col font-sans selection:bg-[#d4952c] selection:text-[#0a4a45]">
      {/* ===================================================================
          1. RESPONSIVE NAVBAR (Brand: Nur Duniya)
      =================================================================== */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => navigateView(v)}
        lang={lang}
        onSetLang={setLang}
        currentUser={currentUser}
        myTotalPoints={myTotalPoints}
        onToggleRole={handleToggleUserRole}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('nurduniya_user');
          showToast(
            isUr ? 'سائن آؤٹ ہو گیا۔ مہمان کے طور پر جاری ہے۔' : 'Signed out. Continuing as Guest Explorer.'
          );
        }}
        onOpenStats={() => {
          const target =
            currentUser ||
            registeredUsers.find((u) => u.username === 'ayesha_noor') || {
              id: 'usr_ayesha',
              displayName: 'Ayesha Siddiqua',
              username: 'ayesha_noor',
              ageGroup: '12-15',
              role: 'student',
            };
          setGlobalStatsStudent(target);
          setIsGlobalStatsOpen(true);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0a4a45] text-white px-4 py-3 rounded-xl shadow-lg border border-[#d4952c] text-xs font-semibold flex items-center gap-2.5 max-w-sm">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-white/70 hover:text-white cursor-pointer"
            aria-label={isUr ? 'اطلاع بند کریں' : 'Dismiss notification'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================
          2. NUR DUNIYA HERO BANNER
      =================================================================== */}
      <section className="bg-gradient-to-br from-[#0f6b64] via-[#0a4a45] to-[#073330] text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3.5">
              <div className="text-xs font-semibold text-[#f7dfa4] tracking-wide">
                {currentUser?.role === 'teacher'
                  ? isUr
                    ? 'معلم اور تعلیمی حلقہ موڈ فعال ہے'
                    : 'Educator & Study Circle Mode Active'
                  : isUr
                  ? 'انٹرایکٹو اسلامی تعلیم، اسباق اور سبق آموز کہانیاں'
                  : 'Interactive Islamic Learning, Lessons & Stories'}
              </div>
              <h1 className="brand-font text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-balance">
                {isUr
                  ? 'نور دنیا — اسلامی تعلیم، اسباق اور قصص الانبیاء کا روشن سفر'
                  : 'Nur Duniya — Illuminating Young Hearts with Knowledge & Stories'}
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
                {isUr
                  ? 'قرآنی اسباق، انبیاء کرام کی صوتی کہانیاں، اخلاقی واقعات، روزانہ نماز و دعا ٹریکر اور مدرسہ ہب ایک ہی جگہ پر۔'
                  : 'Explore interactive Quran & Seerah lessons, listen to Prophet and moral audio stories, track your daily Salah and Duas, and join interactive classrooms in the Madrasa Hub.'}
              </p>

              {/* Hero Primary CTA & Quick Navigation Actions */}
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigateView('madrasa', 'lessons')}
                  className="btn-gold text-xs sm:text-sm py-2.5 px-5 shadow-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{isUr ? 'مدرسہ ہب کھولیں' : 'Open Madrasa Hub'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isHome) {
                      navigateView('home');
                    } else {
                      document.getElementById('section-all-lessons')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold border border-white/25 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-[#f7dfa4]" />
                  <span>{isUr ? 'تمام اسباق دیکھیں' : 'Explore Lessons'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isHome) {
                      navigateView('home');
                    } else {
                      document.getElementById('section-all-stories')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold border border-white/25 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4 text-[#f7dfa4]" />
                  <span>{isUr ? 'کہانیاں اور قصص سنیں' : 'Stories & Audio'}</span>
                </button>
              </div>
            </div>

            {/* Age Filter & Summary Metrics Panel */}
            <div className="w-full lg:w-auto flex flex-col gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl">
                <div className="text-xs font-semibold text-[#f7dfa4] mb-2">
                  {isUr ? 'عمر کے مطابق اسباق اور کہانیاں:' : 'Filter Content by Age Group:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', labelEn: 'All Ages', labelUr: 'تمام عمریں' },
                    { id: '5-8', labelEn: 'Ages 5–8', labelUr: '۵ تا ۸ سال' },
                    { id: '9-11', labelEn: 'Ages 9–11', labelUr: '۹ تا ۱۱ سال' },
                    { id: '12-15', labelEn: 'Ages 12–15', labelUr: '۱۲ تا ۱۵ سال' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAgeFilter(item.id as 'all' | '5-8' | '9-11' | '12-15')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        ageFilter === item.id
                          ? 'bg-[#d4952c] text-[#0a4a45] font-bold shadow-2xs'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isUr ? item.labelUr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white/10 border border-white/15 p-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-[#f7dfa4] tabular-nums">{combinedLessons.length}</div>
                  <div className="text-[11px] text-white/80">{isUr ? 'اسباق' : 'Lessons'}</div>
                </div>
                <div className="bg-white/10 border border-white/15 p-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-[#f7dfa4] tabular-nums">
                    {PROPHET_PROFILES.length + MORAL_STORIES.length}
                  </div>
                  <div className="text-[11px] text-white/80">{isUr ? 'کہانیاں' : 'Stories'}</div>
                </div>
                <div className="bg-white/10 border border-white/15 p-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-[#f7dfa4] tabular-nums">{madrasas.length}</div>
                  <div className="text-[11px] text-white/80">{isUr ? 'کلاس رومز' : 'Classrooms'}</div>
                </div>
                <div className="bg-white/10 border border-white/15 p-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-[#f7dfa4] tabular-nums">{registeredUsers.length}</div>
                  <div className="text-[11px] text-white/80">{isUr ? 'طالب علم' : 'Learners'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. MAIN CONTENT CONTAINER
      =================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-12">
        {/* ===============================================================
            HOMEPAGE FEATURE 1: MADRASA HUB OPTION ON HOMEPAGE
        =============================================================== */}
        {isHome && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr ? 'مدرسہ ہب اور تعلیمی حلقے' : 'Madrasa Hub & Interactive Classrooms'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {currentUser?.role === 'teacher'
                    ? isUr
                      ? 'اپنی کلاس بنائیں، نصابی اسباق شائع کریں، کوئز تیار کریں اور طلبہ کی کارکردگی دیکھیں۔'
                      : 'Create and manage classrooms, author curriculum lessons, publish quizzes, and monitor student standings.'
                    : isUr
                    ? 'شمولیت کوڈ کے ذریعے اپنی کلاس میں شامل ہوں، اسباق مکمل کریں، انٹرایکٹو کوئز حل کریں اور لیڈر بورڈ دیکھیں۔'
                    : 'Join a classroom with your join code, complete assigned lessons, take interactive quizzes, and view your standings.'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigateView('madrasa', 'lessons')}
                  className="btn-primary text-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{isUr ? 'مکمل مدرسہ ہب کھولیں' : 'Enter Full Madrasa Hub'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateView('madrasa', 'quizzes')}
                  className="btn-outline text-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isUr ? 'کلاس روم کوئز' : 'Classroom Quizzes'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {madrasas.map((m) => {
                const isSelected = m.id === currentMadrasaId;
                const mTitle = isUr ? MADRASA_URDU_MAP[m.id]?.nameUr || m.nameUr || m.name : m.name;
                const mDesc = isUr ? MADRASA_URDU_MAP[m.id]?.descriptionUr || m.description : m.description;
                return (
                  <div
                    key={m.id}
                    className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                      isSelected
                        ? 'border-2 border-[#0f6b64] shadow-sm'
                        : 'border-[#0f6b64]/15 hover:border-[#0f6b64]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#4e6b68] mb-2">
                        <span className="font-bold text-[#0f6b64]">
                          {isUr ? `کوڈ: ${m.code}` : `Code: ${m.code}`}
                        </span>
                        <span>
                          {isUr
                            ? `${AGE_GROUP_LABELS_UR[m.ageGroup] || m.ageGroup} · ${m.studentIds.length} طلبہ`
                            : `Ages ${m.ageGroup.toUpperCase()} · ${m.studentIds.length} Students`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0a4a45] m-0">{mTitle}</h3>
                      <p className="text-xs text-[#4e6b68] mt-2 mb-0 line-clamp-2">{mDesc}</p>
                    </div>

                    <div className="pt-3 border-t border-[#0f6b64]/10 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-[#4e6b68]">
                        {isUr
                          ? `${m.lessons.length} اسباق · ${m.quizzes.length} کوئز`
                          : `${m.lessons.length} Lessons · ${m.quizzes.length} Quizzes`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentMadrasaId(m.id);
                          navigateView('madrasa', 'lessons');
                        }}
                        className="btn-gold text-xs py-1.5 px-3"
                      >
                        <span>{isUr ? 'کلاس روم کھولیں' : 'Open Classroom'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Role-Aware Action Card on Homepage */}
              {currentUser?.role === 'teacher' ? (
                <div className="bg-[#0f6b64]/5 rounded-2xl p-5 border border-dashed border-[#0f6b64]/30 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#0f6b64] mb-1">
                      {isUr ? 'برائے اساتذہ' : 'Teacher Tools'}
                    </div>
                    <h3 className="text-base font-bold text-[#0a4a45] m-0">
                      {isUr
                        ? 'نیا تعلیمی حلقہ بنائیں اور کلاس کا انتظام کریں'
                        : 'Create or Manage a Study Circle in Madrasa Hub'}
                    </h3>
                    <p className="text-xs text-[#4e6b68] mt-2 mb-0 leading-relaxed">
                      {isUr
                        ? 'نئی کلاس بنائیں، اسباق لکھیں، کوئز شامل کریں اور طلبہ کو اعزازی اسٹار دیں۔'
                        : 'Create custom classrooms, author new lessons, build multiple-choice quizzes, and award recognition stars to students.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => navigateView('madrasa', 'teacher_console')}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {isUr ? 'استاد کنسول کھولیں' : 'Teacher Console'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateView('madrasa', 'leaderboard')}
                      className="btn-outline text-xs py-1.5 px-3"
                    >
                      {isUr ? 'کلاس لیڈر بورڈ' : 'Classroom Standings'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0f6b64]/5 rounded-2xl p-5 border border-dashed border-[#0f6b64]/30 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#0f6b64] mb-1">
                      {isUr ? 'طالب علم پورٹل' : 'Student Study Portal'}
                    </div>
                    <h3 className="text-base font-bold text-[#0a4a45] m-0">
                      {isUr
                        ? 'تعلیمی حلقے میں شامل ہوں اور اپنی پوزیشن دیکھیں'
                        : 'Join a Study Circle & Track Classroom Standings'}
                    </h3>
                    <p className="text-xs text-[#4e6b68] mt-2 mb-0 leading-relaxed">
                      {isUr
                        ? 'اپنے کلاس کوڈ کے ذریعے شامل ہوں، اسباق اور کوئز مکمل کریں اور لیڈر بورڈ پر اپنے پوائنٹس بڑھائیں۔'
                        : 'Enroll using your classroom join code, complete assigned lessons and interactive quizzes, and view your standing on the leaderboard.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => navigateView('madrasa', 'lessons')}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {isUr ? 'کلاس کے اسباق دیکھیں' : 'Browse Classroom Lessons'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateView('madrasa', 'leaderboard')}
                      className="btn-outline text-xs py-1.5 px-3"
                    >
                      {isUr ? 'کلاس لیڈر بورڈ' : 'Classroom Standings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===============================================================
            DEDICATED MADRASA HUB VIEW
        =============================================================== */}
        {(currentView === 'madrasa' || currentView === 'quizzes') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr ? 'نور دنیا — مدرسہ ہب' : 'Nur Duniya — Madrasa Hub'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {isUr
                    ? 'کلاس رومز، نصابی اسباق، انٹرایکٹو کوئز اور طلبہ کا لیڈر بورڈ۔'
                    : 'Manage classrooms, enroll students, study curriculum lessons, and take interactive quizzes.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateView('home')}
                className="btn-outline text-xs"
              >
                {isUr ? '← مرکزی صفحے پر واپس جائیں' : '← Back to Homepage'}
              </button>
            </div>

            <MadrasaHub
              madrasas={madrasas}
              currentMadrasaId={currentMadrasaId}
              onSelectMadrasa={(id) => setCurrentMadrasaId(id)}
              currentUser={currentUser}
              activities={allActivities}
              registeredUsers={registeredUsers}
              onRefreshState={fetchState}
              onShowToast={showToast}
              onOpenLoginModal={() => setIsLoginOpen(true)}
              lang={lang}
              initialTab={madrasaInitialTab}
            />
          </section>
        )}

        {/* ===============================================================
            HOMEPAGE FEATURE 2: INTERACTIVE FOUNDATION INTRO
        =============================================================== */}
        {isHome && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr
                    ? 'سلامتی اور علم کی تین بنیادی کنجیاں'
                    : 'Three Essential Keys of Peace & Knowledge'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {isUr
                    ? '۵ تا ۱۵ سال · ان بابرکت کلمات کو روزانہ سنیں اور اپنی عادت بنائیں'
                    : 'Ages 5 to 15 · Listen and practice these foundational expressions every day'}
                </p>
              </div>
            </div>

            <div className="story-card flex-col gap-4">
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div>
                  <div className="text-xs font-bold text-[#0f6b64]">
                    {isUr ? `مرحلہ ${introStep + 1} از ۳` : `Step ${introStep + 1} of 3`}
                  </div>
                  <h3 className="text-lg font-bold text-[#0a4a45] mt-0.5 m-0">
                    {isUr
                      ? introStep === 0
                        ? '۱۔ سلامتی کا تحفہ (السلام علیکم)'
                        : introStep === 1
                        ? '۲۔ ہر اچھے کام کی ابتدا بسم اللہ سے'
                        : '۳۔ نافع علم میں اضافے کی دعا'
                      : introStep === 0
                      ? '1. Greeting of Peace (Assalamu Alaikum)'
                      : introStep === 1
                      ? '2. Beginning Every Good Action with Bismillah'
                      : '3. Supplicating for Beneficial Knowledge'}
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setIntroStep(s)}
                      className={`btn-outline text-xs px-3 py-1 ${introStep === s ? 'active' : ''}`}
                    >
                      {isUr ? `مرحلہ ${s + 1}` : `Step ${s + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full bg-[#0f6b64]/5 rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-[#0a4a45] mb-1.5" dir="rtl">
                  {introStep === 0
                    ? 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ'
                    : introStep === 1
                    ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
                    : 'رَّبِّ زِدْنِي عِلْمًا'}
                </div>
                <div className="text-xs font-semibold text-[#4e6b68]">
                  {isUr
                    ? introStep === 0
                      ? 'السلام علیکم ورحمۃ اللہ — آپ پر اللہ کی سلامتی اور رحمت ہو'
                      : introStep === 1
                      ? 'بسم اللہ الرحمن الرحیم — شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے'
                      : 'رب زدنی علما — اے میرے رب! میرے علم میں اضافہ فرما'
                    : introStep === 0
                    ? 'Assalamu Alaikum wa Rahmatullah — Peace and mercy of Allah be upon you'
                    : introStep === 1
                    ? 'Bismillahir-Rahmanir-Rahim — In the Name of Allah, the Most Gracious, the Most Merciful'
                    : 'Rabbi Zidni Ilma — My Lord, increase me in beneficial knowledge'}
                </div>
              </div>

              <div className="flex items-center justify-between w-full flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-outline text-xs"
                  onClick={() =>
                    playVoiceClip({
                      id: `intro_voice_${introStep}`,
                      text: isUr
                        ? introStep === 0
                          ? 'السلام علیکم ورحمۃ اللہ! آپ پر اللہ کی سلامتی اور رحمت ہو۔'
                          : introStep === 1
                          ? 'بسم اللہ الرحمن الرحیم! شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔'
                          : 'رب زدنی علما! اے میرے رب، میرے علم میں اضافہ فرما۔'
                        : introStep === 0
                        ? 'Assalamu Alaikum wa Rahmatullah! Peace and blessings upon you.'
                        : introStep === 1
                        ? 'Bismillahir-Rahmanir-Rahim! In the name of Allah, the Most Gracious, the Most Merciful.'
                        : 'Rabbi Zidni Ilma! O Allah, increase me in beneficial knowledge.',
                      lang: isUr ? 'ur' : 'en',
                    })
                  }
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {activeVoiceId === `intro_voice_${introStep}`
                      ? isUr
                        ? 'آڈیو روکیں'
                        : 'Stop Audio'
                      : isUr
                      ? 'تلفظ اور بیان سنیں'
                      : 'Listen Narration'}
                  </span>
                </button>

                <button
                  type="button"
                  className="btn-gold text-xs"
                  onClick={() => {
                    recordActivity({
                      category: 'intro_quest',
                      label: `Completed Intro: Step ${introStep + 1}`,
                      points: 15,
                      activityKey: `intro_quest_step_${introStep}`,
                    });
                    if (introStep < 2) setIntroStep(introStep + 1);
                  }}
                >
                  {hasDoneActivity(`intro_quest_step_${introStep}`, todayStr) && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {hasDoneActivity(`intro_quest_step_${introStep}`, todayStr)
                      ? isUr
                        ? 'مکمل شدہ (+۱۵ پوائنٹس)'
                        : 'Completed (+15 pts)'
                      : isUr
                      ? 'مرحلہ مکمل کریں (+۱۵ پوائنٹس)'
                      : 'Complete Step (+15 pts)'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ===============================================================
            ALL LESSONS SECTION (Shown on Homepage & 'lessons' view)
        =============================================================== */}
        {(isHome || currentView === 'lessons') && (
          <section id="section-all-lessons" className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr
                    ? 'نور دنیا کے تمام اسلامی اسباق (قرآن، سیرت، اخلاق اور فقہ)'
                    : 'All Islamic Lessons & Curriculum Library'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {isUr
                    ? 'نصابی اسباق پڑھیں، صوتی بیان سنیں اور سبق مکمل کر کے پوائنٹس حاصل کریں۔'
                    : 'Read interactive lessons, listen to voice recitations, and complete lessons to earn points.'}
                </p>
              </div>

              {/* Subject Filter Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', labelEn: 'All Subjects', labelUr: 'تمام مضامین' },
                  { id: 'quran', labelEn: 'Quran', labelUr: 'قرآن' },
                  { id: 'seerah', labelEn: 'Seerah', labelUr: 'سیرت' },
                  { id: 'akhlaq', labelEn: 'Akhlaq', labelUr: 'اخلاق' },
                  { id: 'fiqh', labelEn: 'Fiqh & Salah', labelUr: 'فقہ و نماز' },
                  { id: 'history', labelEn: 'History', labelUr: 'تاریخ' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setLessonSubjectFilter(sub.id)}
                    className={`btn-outline text-xs py-1.5 px-3 ${
                      lessonSubjectFilter === sub.id ? 'active' : ''
                    }`}
                  >
                    {isUr ? sub.labelUr : sub.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combinedLessons.map((lesson) => {
                const isDone = hasDoneActivity(lesson.activityKey);
                const voiceId = `home_les_voice_${lesson.id}`;
                const isPlaying = activeVoiceId === voiceId;

                return (
                  <div
                    key={lesson.id}
                    className="story-card flex-col justify-between border-l-4 border-l-[#0f6b64]"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#4e6b68] mb-1.5">
                        <span className="font-semibold text-[#0f6b64]">
                          {isUr
                            ? `${SUBJECT_LABELS_UR[lesson.subject] || lesson.subject} · ${
                                AGE_GROUP_LABELS_UR[lesson.ageGroup] || lesson.ageGroup
                              } · ${lesson.sourceLabel}`
                            : `${lesson.subject.toUpperCase()} · Ages ${lesson.ageGroup.toUpperCase()} · ${lesson.sourceLabel}`}
                        </span>
                        <span className="font-bold text-[#d4952c] tabular-nums">
                          +{lesson.points} {isUr ? 'پوائنٹس' : 'pts'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#0a4a45] m-0 mb-2">{lesson.title}</h3>

                      {lesson.arabicVerse && (
                        <div
                          className="p-3 rounded-xl bg-[#0f6b64]/5 text-center text-lg font-bold text-[#0a4a45] my-2"
                          dir="rtl"
                        >
                          {lesson.arabicVerse}
                        </div>
                      )}

                      {lesson.translation && (
                        <div className="text-xs italic text-[#4e6b68] mb-2">
                          &ldquo;{lesson.translation}&rdquo;
                        </div>
                      )}

                      <p className="text-xs text-[#183331] leading-relaxed m-0 line-clamp-3">
                        {lesson.content}
                      </p>
                    </div>

                    <div className="w-full pt-3 mt-2 border-t border-[#0f6b64]/15 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {lesson.arabicVerse && (
                          <button
                            type="button"
                            onClick={() =>
                              playVoiceClip({
                                id: `${voiceId}_ar`,
                                text: lesson.arabicVerse!,
                                lang: 'ar',
                              })
                            }
                            className={`btn-outline text-xs py-1.5 px-2.5 ${
                              activeVoiceId === `${voiceId}_ar` ? 'active' : ''
                            }`}
                            title={isUr ? 'صرف عربی تلاوت سنیں' : 'Recite Arabic with accurate Tajweed'}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-[#0f6b64]" />
                            <span>{isUr ? 'صرف عربی تلاوت' : 'Read Arabic Only'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            playVoiceClip({
                              id: `${voiceId}_meaning`,
                              text: `${lesson.title}۔ ${lesson.translation || ''} ${lesson.content}`,
                              lang: isUr ? 'ur' : 'en',
                            })
                          }
                          className={`btn-outline text-xs py-1.5 px-2.5 ${
                            activeVoiceId === `${voiceId}_meaning` ? 'active' : ''
                          }`}
                          title={isUr ? 'سبق اور مفہوم کی باآواز پڑھائی' : 'Listen to lesson explanation'}
                        >
                          {activeVoiceId === `${voiceId}_meaning` ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {activeVoiceId === `${voiceId}_meaning`
                              ? isUr
                                ? 'روکیں'
                                : 'Stop'
                              : isUr
                              ? 'سبق و مفہوم سنیں'
                              : 'Read Lesson & Meaning'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReadingLesson(lesson)}
                          className="btn-outline text-xs py-1.5 px-2.5"
                        >
                          <span>{isUr ? 'مکمل پڑھیں' : 'Read Full'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          recordActivity({
                            category: 'madrasa_lesson',
                            label: `Completed Lesson: ${lesson.title}`,
                            points: lesson.points,
                            activityKey: lesson.activityKey,
                          })
                        }
                        className={
                          isDone
                            ? 'btn-outline text-xs py-1.5 px-3 text-[#107e54] border-[#107e54]'
                            : 'btn-primary text-xs py-1.5 px-3'
                        }
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                        <span>
                          {isDone
                            ? isUr
                              ? 'مکمل شدہ'
                              : 'Completed'
                            : isUr
                            ? `مکمل کریں (+${lesson.points} پوائنٹس)`
                            : `Complete (+${lesson.points} pts)`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===============================================================
            ALL STORIES SECTION: PROPHETS AUDIO STORIES & MORAL STORIES
        =============================================================== */}
        {(isHome || currentView === 'prophets') && (
          <section id="section-all-stories" className="space-y-8">
            {/* Part A: Prophets Audio Library */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                    {isUr
                      ? 'قصص الانبیاء (انبیاء کرام کی صوتی کہانیاں)'
                      : 'Prophets Audio Stories Library'}
                  </h2>
                  <p className="text-xs text-[#4e6b68] mt-1 m-0">
                    {isUr
                      ? 'اردو اور انگریزی میں مستند صوتی کہانیاں، معجزات اور اسباق'
                      : 'Authentic Urdu & English audio narrations with interactive chapters and miracles'}
                  </p>
                </div>
              </div>

              <div className="prophet-row">
                {PROPHET_PROFILES.map((p, i) => (
                  <div
                    key={p.id}
                    className={`prophet-card ${selectedProphetIdx === i ? 'active' : ''}`}
                    onClick={() => setSelectedProphetIdx(i)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-center mb-1.5 text-[#0f6b64]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold m-0 text-[#0a4a45]">
                      {isUr ? p.nameUr : p.nameEn}
                    </h4>
                    <span className="text-[11px] text-[#4e6b68] block mt-0.5">
                      {isUr ? p.titleUr : p.titleEn}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-[#0a4a45] m-0">
                      {isUr ? currentProphet.nameUr : currentProphet.nameEn}{' '}
                      <span className="text-sm font-normal text-[#0f6b64]">
                        ({currentProphet.arabicHonorific})
                      </span>
                    </h3>
                    <span className="text-xs text-[#4e6b68]">
                      {isUr
                        ? `${currentProphet.eraUr} · ${currentProphet.regionUr} · قرآن مجید میں ${currentProphet.quranMentions} مرتبہ ذکر`
                        : `${currentProphet.era} · ${currentProphet.region} · Mentioned ${currentProphet.quranMentions} times in the Noble Quran`}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#0f6b64]">
                    {isUr
                      ? `بنیادی اقدار: ${currentProphet.coreValuesUr.join(' · ')}`
                      : `Core Values: ${currentProphet.coreValues.join(' · ')}`}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[#183331] m-0">
                  {isUr ? currentProphet.summaryUr : currentProphet.summaryEn}
                </p>

                {/* Story Chapters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentProphet.chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#faf6ee] border border-[#0f6b64]/15"
                    >
                      <h4 className="text-xs font-bold text-[#0a4a45] m-0 mb-1">
                        {isUr ? ch.titleUr : ch.titleEn}
                      </h4>
                      <p className="text-xs text-[#4e6b68] m-0 leading-relaxed">
                        {isUr ? ch.textUr : ch.textEn}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Key Miracles */}
                <div className="p-3.5 rounded-xl bg-[#0f6b64]/5 border border-[#0f6b64]/15 text-xs text-[#183331]">
                  <strong className="text-[#0f6b64] font-semibold">
                    {isUr ? 'اہم معجزات اور اسباق: ' : 'Key Miracles & Divine Lessons: '}
                  </strong>
                  {(isUr ? currentProphet.keyMiraclesUr : currentProphet.keyMiraclesEn).join(' · ')}
                </div>

                {/* Reflection Prompt */}
                <div className="text-xs italic text-[#4e6b68] border-s-3 border-s-[#d4952c] ps-3">
                  <strong>{isUr ? 'غور و فکر کا سوال:' : 'Reflection Question:'}</strong>{' '}
                  {isUr ? currentProphet.reflectionQuestionUr : currentProphet.reflectionQuestion}
                </div>

                <ProphetAudioPlayer
                  prophet={currentProphet}
                  defaultLang={isUr ? 'ur' : 'en'}
                  completedEn={hasDoneActivity(`prophet_audio_${currentProphet.id}_en`)}
                  completedUr={hasDoneActivity(`prophet_audio_${currentProphet.id}_ur`)}
                  onCompleteAudio={(audioLang) => {
                    recordActivity({
                      category: 'prophet_story',
                      label: `Listened to ${currentProphet.nameEn} (${audioLang.toUpperCase()})`,
                      points: 25,
                      activityKey: `prophet_audio_${currentProphet.id}_${audioLang}`,
                    });
                  }}
                />
              </div>
            </div>

            {/* Part B: Inspiring Islamic Moral Stories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                    {isUr
                      ? 'سبق آموز اسلامی کہانیاں اور اخلاقی واقعات'
                      : 'Inspiring Islamic Moral Stories'}
                  </h2>
                  <p className="text-xs text-[#4e6b68] mt-1 m-0">
                    {isUr
                      ? 'سچائی، امانت داری، رحمدلی اور اعلیٰ کردار کی صوتی کہانیاں'
                      : 'Timeless stories of honesty, mercy, and character with audio narration'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMoralStories.map((story) => {
                  const actKey = `moral_story_${story.id}`;
                  const isDone = hasDoneActivity(actKey);
                  const voiceId = `moral_voice_${story.id}`;
                  const isPlaying = activeVoiceId === voiceId;

                  return (
                    <div key={story.id} className="story-card flex-col justify-between">
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#4e6b68]">
                          <span className="font-bold text-[#d96543]">
                            {isUr
                              ? `${story.moralThemeUr} · ${
                                  AGE_GROUP_LABELS_UR[story.ageGroup] || story.ageGroup
                                }`
                              : `${story.moralThemeEn} · Ages ${story.ageGroup.toUpperCase()}`}
                          </span>
                          <span className="font-bold text-[#d4952c] tabular-nums">
                            +{story.points} {isUr ? 'پوائنٹس' : 'pts'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#0a4a45] m-0">
                          {isUr ? story.titleUr : story.titleEn}
                        </h3>

                        <p className="text-xs text-[#183331] leading-relaxed m-0">
                          {isUr ? story.summaryUr : story.summaryEn}
                        </p>

                        <div className="pt-1 text-xs italic text-[#4e6b68] border-s-3 border-s-[#d4952c] ps-2.5">
                          {isUr ? story.reflectionQuestionUr : story.reflectionQuestionEn}
                        </div>
                      </div>

                      <div className="w-full pt-3 mt-2 border-t border-[#0f6b64]/15 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            playVoiceClip({
                              id: voiceId,
                              text: isUr
                                ? `${story.titleUr}۔ ${story.summaryUr}`
                                : `${story.titleEn}. ${story.summaryEn}`,
                              lang: isUr ? 'ur' : 'en',
                            })
                          }
                          className={`btn-outline text-xs py-1.5 px-3 ${isPlaying ? 'active' : ''}`}
                        >
                          {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>
                            {isPlaying
                              ? isUr
                                ? 'کہانی روکیں'
                                : 'Stop Story'
                              : isUr
                              ? 'کہانی سنیں'
                              : 'Listen Story'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            recordActivity({
                              category: 'prophet_story',
                              label: `Read Moral Story: ${story.titleEn}`,
                              points: story.points,
                              activityKey: actKey,
                            })
                          }
                          className={
                            isDone
                              ? 'btn-outline text-xs py-1.5 px-3 text-[#107e54] border-[#107e54]'
                              : 'btn-gold text-xs py-1.5 px-3'
                          }
                        >
                          {isDone && <Check className="w-3.5 h-3.5" />}
                          <span>
                            {isDone
                              ? isUr
                                ? 'کہانی مکمل شدہ'
                                : 'Story Completed'
                              : isUr
                              ? `کہانی مکمل کریں (+${story.points} پوائنٹس)`
                              : `Complete Story (+${story.points} pts)`}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===============================================================
            DAILY SALAH & DUAS SECTION
        =============================================================== */}
        {(isHome || currentView === 'salah_dua') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr ? 'روزانہ کی ۵ نمازیں اور مسنون دعائیں' : 'Daily 5 Salah & Everyday Duas'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {isUr
                    ? 'ہر نماز پر +۳۰ پوائنٹس · ہر دعا پڑھنے پر +۲۰ پوائنٹس'
                    : '+30 pts per prayer · +20 pts per dua practiced today'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {DAILY_SALAH_LIST.map((prayer) => {
                const key = `salah_${prayer.id}_${todayStr}`;
                const isDone = hasDoneActivity(key, todayStr);
                return (
                  <div key={prayer.id} className="challenge-card">
                    <button
                      type="button"
                      className={`challenge-check ${isDone ? 'done' : ''}`}
                      onClick={() => {
                        if (isDone) {
                          toggleActivityOff(key);
                        } else {
                          recordActivity({
                            category: 'salah',
                            label: `${prayer.en} on Time`,
                            points: prayer.points,
                            activityKey: key,
                          });
                        }
                      }}
                      aria-label={isUr ? `${prayer.ur} نشان زد کریں` : `Mark ${prayer.en}`}
                    >
                      {isDone && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex items-center gap-3 flex-1">
                      {renderSalahIcon(prayer.iconType)}
                      <div>
                        <div className="font-bold text-sm text-[#0a4a45]">
                          {isUr ? prayer.ur : prayer.en}
                        </div>
                        <div className="text-xs text-[#4e6b68]">
                          {isUr ? prayer.descUr : prayer.descEn}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#0f6b64] tabular-nums">
                      {isDone
                        ? isUr
                          ? 'ادا کر لی (+۳۰ پوائنٹس)'
                          : 'Completed (+30)'
                        : isUr
                        ? '+۳۰ پوائنٹس'
                        : '+30 pts'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-b border-[#0f6b64]/15 pb-3 pt-2">
              <h3 className="text-lg font-bold text-[#0a4a45] m-0">
                {isUr ? 'روزمرہ کی مسنون دعائیں اور اذکار' : 'Everyday Supplications & Duas'}
              </h3>
              <p className="text-xs text-[#4e6b68] mt-1 m-0">
                {isUr
                  ? 'دعائیں سنیں، یاد کریں اور پوائنٹس حاصل کرنے کے لیے مکمل کریں۔'
                  : 'Listen, memorize, and mark practiced to earn points.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NUR_DAILY_DUAS.map((dua) => {
                const key = `dua_${dua.id}_${todayStr}`;
                const isDone = hasDoneActivity(key, todayStr);
                const voiceId = `dua_voice_${dua.id}`;
                const isPlaying = activeVoiceId === voiceId;
                return (
                  <div key={dua.id} className="story-card flex-col gap-2.5">
                    <div className="flex justify-between items-center w-full gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-[#0a4a45] m-0">{dua.title[lang]}</h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          className={`btn-outline text-xs py-1 px-2.5 ${
                            activeVoiceId === `${voiceId}_ar` ? 'active' : ''
                          }`}
                          onClick={() =>
                            playVoiceClip({
                              id: `${voiceId}_ar`,
                              text: dua.arabic,
                              lang: 'ar',
                            })
                          }
                          title={isUr ? 'صرف عربی دعا کی تلاوت سنیں' : 'Recite Arabic Dua with Tajweed'}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#0f6b64]" />
                          <span>{isUr ? 'صرف عربی تلاوت' : 'Read Arabic Only'}</span>
                        </button>
                        <button
                          type="button"
                          className={`btn-outline text-xs py-1 px-2.5 ${
                            activeVoiceId === `${voiceId}_meaning` ? 'active' : ''
                          }`}
                          onClick={() =>
                            playVoiceClip({
                              id: `${voiceId}_meaning`,
                              text: dua.meaning[lang],
                              lang: isUr ? 'ur' : 'en',
                            })
                          }
                          title={isUr ? 'دعا کا اردو ترجمہ سنیں' : 'Listen to English meaning'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isUr ? 'صرف ترجمہ سنیں' : 'Read Meaning'}</span>
                        </button>
                      </div>
                    </div>
                    <div
                      className="p-3 bg-[#0f6b64]/5 rounded-xl text-center text-lg font-bold text-[#0a4a45] w-full"
                      dir="rtl"
                    >
                      {dua.arabic}
                    </div>
                    {!isUr && <div className="text-xs italic text-[#4e6b68]">{dua.translit}</div>}
                    <p className="text-xs text-[#183331] m-0">{dua.meaning[lang]}</p>
                    <button
                      type="button"
                      className={`${isDone ? 'btn-outline' : 'btn-primary'} text-xs self-start mt-1`}
                      onClick={() =>
                        recordActivity({
                          category: 'dua',
                          label: `Recited ${dua.title.en}`,
                          points: dua.points,
                          activityKey: key,
                        })
                      }
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                      <span>
                        {isDone
                          ? isUr
                            ? 'آج پڑھ لی (+۲۰ پوائنٹس)'
                            : 'Recited Today (+20 pts)'
                          : isUr
                          ? 'پڑھ لی نشان زد کریں (+۲۰ پوائنٹس)'
                          : 'Mark Recited (+20 pts)'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===============================================================
            IMAN REMINDER & GOOD DEEDS TRACKER
        =============================================================== */}
        {(isHome || currentView === 'iman_tree') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr ? 'ذکرِ الٰہی اور نیک اعمال کا شجر' : 'Iman Reminder & Good Deeds Tracker'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {isUr
                    ? 'روزانہ ذکر اور نیکیوں میں استقامت پیدا کریں'
                    : 'Cultivating daily spiritual consistency'}
                </p>
              </div>
            </div>

            <div className="zikr-card">
              <div>
                <h3 className="text-lg font-bold m-0 mb-1">
                  {isUr ? 'ایک لمحہ رکیں، اللہ کو یاد کریں' : 'Pause for a moment, remember Allah'}
                </h3>
                <p className="text-xs opacity-90 m-0 mb-2">
                  {isUr
                    ? 'ہر ۶ سیکنڈ بعد ذکرِ الٰہی کی یاد دہانی آن کریں۔'
                    : 'Turn on the gentle 6-second remembrance reminder.'}
                </p>
                <div className="zikr-phrase" dir={isUr ? 'rtl' : 'ltr'}>
                  {activeZikrPhrases[zikrIdx]}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-outline text-xs bg-white text-[#0a4a45] font-semibold"
                  onClick={() =>
                    playVoiceClip({
                      id: `zikr_${zikrIdx}`,
                      text: activeZikrPhrases[zikrIdx],
                      lang: 'ar',
                    })
                  }
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isUr ? 'ذکر سنیں' : 'Listen'}</span>
                </button>
                <button
                  type="button"
                  className="zikr-toggle text-xs"
                  onClick={() => {
                    const next = !zikrActive;
                    setZikrActive(next);
                    if (next) {
                      recordActivity({
                        category: 'dua',
                        label: 'Activated Iman Zikr Reminder',
                        points: 15,
                        activityKey: `zikr_toggle_${todayStr}`,
                      });
                    }
                  }}
                >
                  {zikrActive
                    ? isUr
                      ? 'یاد دہانی بند کریں'
                      : 'Turn Off'
                    : isUr
                    ? 'یاد دہانی آن کریں (+۱۵ پوائنٹس)'
                    : 'Turn On (+15 pts)'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-7 text-center shadow-2xs">
              <div
                className={`w-14 h-14 rounded-full bg-[#0f6b64]/10 text-[#0f6b64] flex items-center justify-center mx-auto mb-2 transition-transform duration-300 ${
                  plantPop ? 'scale-115' : 'scale-100'
                }`}
              >
                <TrendingUp className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#0a4a45] m-0 mb-2">{plantLabels[plantStage]}</h4>
              <div className="w-full max-w-xs h-2 bg-[#0f6b64]/10 rounded-full overflow-hidden mx-auto mb-4">
                <div
                  className="h-full bg-[#d4952c] transition-all duration-300"
                  style={{ width: `${((plantStage + 1) / plantLabels.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#4e6b68] max-w-md mx-auto mb-4">
                {isUr
                  ? 'جب بھی آپ کوئی سبق مکمل کرتے ہیں، وقت پر نماز پڑھتے ہیں یا کوئی نیکی کرتے ہیں تو آپ کے نیک اعمال کا پودا آگے بڑھتا ہے۔'
                  : 'Your progress advances every time you complete a lesson, pray on time, or record a good deed.'}
              </p>
              <button
                type="button"
                className="btn-gold text-xs"
                onClick={() => {
                  if (plantStage < plantLabels.length - 1) {
                    const next = plantStage + 1;
                    setPlantStage(next);
                    setPlantPop(true);
                    window.setTimeout(() => setPlantPop(false), 300);
                    recordActivity({
                      category: 'intro_quest',
                      label: `Advanced Good Deeds: ${PLANT_STAGE_LABELS_EN[next]}`,
                      points: 20,
                      activityKey: `tree_grow_${next}_${todayStr}`,
                    });
                  }
                }}
              >
                {plantStage === plantLabels.length - 1
                  ? isUr
                    ? 'ماشاء اللہ! مکمل بہار کا مرحلہ حاصل ہو گیا'
                    : 'Full Bloom Milestone Reached'
                  : isUr
                  ? 'نیک عمل کا مرحلہ آگے بڑھائیں (+۲۰ پوائنٹس)'
                  : 'Advance Good Deed Progress (+20 pts)'}
              </button>
            </div>
          </section>
        )}

        {/* ===============================================================
            GLOBAL LEADERSHIP BOARD
        =============================================================== */}
        {(isHome || currentView === 'leaderboard') && (
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5">
              <div>
                <h2 className="text-xl font-bold text-[#0a4a45] m-0">
                  {isUr ? 'نور دنیا عالمی لیڈر بورڈ' : 'Nur Duniya Global Leadership Board'}
                </h2>
                <p className="text-xs text-[#4e6b68] mt-1 m-0">
                  {isUr ? 'تمام رجسٹرڈ طلبہ اور سیکھنے والے اراکین' : 'All Registered Learners & Explorers'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#0f6b64]/15 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="leaderboard-table text-start w-full">
                  <thead>
                    <tr>
                      <th>{isUr ? 'درجہ' : 'Rank'}</th>
                      <th>{isUr ? 'رکن کا نام' : 'Explorer Member'}</th>
                      <th>{isUr ? 'کردار' : 'Role'}</th>
                      <th>{isUr ? 'عمر کا گروپ' : 'Age Group'}</th>
                      <th className="text-right">{isUr ? 'کل پوائنٹس' : 'Total Points'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers
                      .map((u) => {
                        const pts = allActivities
                          .filter((a) => a.userId === u.id)
                          .reduce((sum, a) => sum + a.points, 0);
                        return { ...u, pts };
                      })
                      .sort((a, b) => b.pts - a.pts)
                      .map((row, idx) => {
                        const isMe = currentUser && row.id === currentUser.id;
                        return (
                          <tr
                            key={row.id}
                            className={isMe ? 'bg-[#d4952c]/10 font-semibold' : ''}
                          >
                            <td className="font-bold tabular-nums">
                              <span
                                className={`inline-block w-7 ${
                                  idx === 0
                                    ? 'text-[#b8860b] font-extrabold'
                                    : idx === 1
                                    ? 'text-slate-600 font-bold'
                                    : idx === 2
                                    ? 'text-[#a0522d] font-bold'
                                    : 'text-slate-500'
                                }`}
                              >
                                #{idx + 1}
                              </span>
                            </td>
                            <td>
                              <div className="font-bold text-sm text-[#0a4a45]">
                                {localizeUserName(row.displayName, isUr)}
                              </div>
                              <div className="text-[11px] text-[#4e6b68]">@{row.username}</div>
                            </td>
                            <td>
                              <span
                                className={`text-xs font-semibold ${
                                  row.role === 'teacher' ? 'text-[#d4952c]' : 'text-[#0f6b64]'
                                }`}
                              >
                                {row.role === 'teacher'
                                  ? isUr
                                    ? 'استاد / معلم'
                                    : 'Teacher'
                                  : isUr
                                  ? 'طالب علم'
                                  : 'Student'}
                              </span>
                            </td>
                            <td className="text-xs text-[#4e6b68]">
                              {isUr
                                ? AGE_GROUP_LABELS_UR[row.ageGroup] || `${row.ageGroup} سال`
                                : `Ages ${row.ageGroup}`}
                            </td>
                            <td className="text-right font-bold text-sm text-[#0a4a45] tabular-nums">
                              {row.pts} {isUr ? 'پوائنٹس' : 'pts'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===================================================================
          FULL LESSON READER MODAL (For Homepage / Lessons View)
      =================================================================== */}
      {readingLesson && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box max-w-xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#0f6b64]/15 pb-2.5">
              <div>
                <span className="text-[11px] font-bold text-[#0f6b64] uppercase">
                  {isUr
                    ? `${SUBJECT_LABELS_UR[readingLesson.subject] || readingLesson.subject} · ${readingLesson.sourceLabel}`
                    : `${readingLesson.subject} · ${readingLesson.sourceLabel}`}
                </span>
                <h3 className="m-0 mt-1 text-lg font-bold text-[#0a4a45]">{readingLesson.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingLesson(null)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {readingLesson.arabicVerse && (
              <div
                className="p-4 rounded-xl bg-[#0f6b64]/10 text-center text-xl font-bold text-[#0a4a45] my-3"
                dir="rtl"
              >
                {readingLesson.arabicVerse}
              </div>
            )}

            {!isUr && readingLesson.transliteration && (
              <div className="text-xs italic text-[#4e6b68] mb-1">{readingLesson.transliteration}</div>
            )}

            {readingLesson.translation && (
              <div className="text-xs font-semibold text-[#0f6b64] mb-3">
                &ldquo;{readingLesson.translation}&rdquo;
              </div>
            )}

            <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#183331]">
              {readingLesson.content}
            </p>

            <div className="mt-5 pt-3 border-t border-[#0f6b64]/15 flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {readingLesson.arabicVerse && (
                  <button
                    type="button"
                    className={`btn-outline text-xs py-1.5 px-3 ${
                      activeVoiceId === `modal_ar_${readingLesson.id}` ? 'active' : ''
                    }`}
                    onClick={() =>
                      playVoiceClip({
                        id: `modal_ar_${readingLesson.id}`,
                        text: readingLesson.arabicVerse!,
                        lang: 'ar',
                      })
                    }
                  >
                    <Volume2 className="w-4 h-4 text-[#0f6b64]" />
                    <span>{isUr ? 'صرف عربی تلاوت' : 'Read Arabic Only'}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-outline text-xs py-1.5 px-3"
                  onClick={() =>
                    playVoiceClip({
                      id: `modal_lesson_${readingLesson.id}`,
                      text: `${readingLesson.title}۔ ${readingLesson.content}`,
                      lang: isUr ? 'ur' : 'en',
                    })
                  }
                >
                  {activeVoiceId === `modal_lesson_${readingLesson.id}` ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span>
                    {activeVoiceId === `modal_lesson_${readingLesson.id}`
                      ? isUr
                        ? 'آڈیو روکیں'
                        : 'Stop Audio'
                      : isUr
                      ? 'سبق و مفہوم سنیں'
                      : 'Read Lesson & Meaning'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => {
                  recordActivity({
                    category: 'madrasa_lesson',
                    label: `Completed Lesson: ${readingLesson.title}`,
                    points: readingLesson.points,
                    activityKey: `lesson_read_${readingLesson.id}`,
                  });
                  setReadingLesson(null);
                }}
              >
                {isUr
                  ? `سبق مکمل کریں (+${readingLesson.points} پوائنٹس)`
                  : `Mark Lesson Complete (+${readingLesson.points} pts)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          LOGIN / SWITCH PROFILE MODAL
      =================================================================== */}
      {isLoginOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#0f6b64]/15 mb-3">
              <h3 className="text-lg font-bold text-[#0a4a45] m-0">
                {isUr ? 'نور دنیا اکاؤنٹ سائن ان' : 'Nur Duniya Account Sign-In'}
              </h3>
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#4e6b68] mb-3">
              {isUr
                ? 'استاد یا طالب علم کے طور پر سائن ان کریں یا پروفائل تبدیل کریں:'
                : 'Sign in or switch profiles as a Teacher or Student:'}
            </p>

            <div className="bg-[#0f6b64]/5 p-3 rounded-xl mb-4">
              <div className="text-[11px] font-bold text-[#0f6b64] mb-2">
                {isUr ? 'فوری ڈیمو اکاؤنٹس:' : 'Quick Demo Accounts:'}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  className="btn-gold text-[11px] py-1 px-2.5"
                  onClick={() => handleQuickLoginAs('ustadh_farooq', 'teacher')}
                >
                  {isUr ? 'استاذ فاروق (معلم)' : 'Ustadh Farooq (Teacher)'}
                </button>
                <button
                  type="button"
                  className="btn-primary text-[11px] py-1 px-2.5"
                  onClick={() => handleQuickLoginAs('zayd_explorer', 'student')}
                >
                  {isUr ? 'زید (طالب علم)' : 'Zayd (Student)'}
                </button>
                <button
                  type="button"
                  className="btn-outline text-[11px] py-1 px-2.5"
                  onClick={() => handleQuickLoginAs('ayesha_noor', 'student')}
                >
                  {isUr ? 'عائشہ (طالب علم)' : 'Ayesha (Student)'}
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#0a4a45]">
                  {isUr ? 'یوزر نیم' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isUr ? 'مثلاً ustadh_farooq یا rayyan_star' : 'e.g. ustadh_farooq or rayyan_star'}
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#0a4a45]">
                  {isUr ? 'پورا نام' : 'Display Name'}
                </label>
                <input
                  type="text"
                  placeholder={isUr ? 'مثلاً استاذ فاروق یا ریان احمد' : 'e.g. Ustadh Farooq or Rayyan Ahmed'}
                  value={authDisplayName}
                  onChange={(e) => setAuthDisplayName(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#0a4a45]">
                  {isUr ? 'اکاؤنٹ کا کردار' : 'Account Role'}
                </label>
                <select
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value as 'student' | 'teacher')}
                  className="form-select text-xs"
                >
                  <option value="student">{isUr ? 'طالب علم (Student)' : 'Student Explorer'}</option>
                  <option value="teacher">
                    {isUr ? 'معلم / استاد (کلاس اور کوئز بنائیں)' : "Teacher / Mu'allim (Create Classrooms & Quizzes)"}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#0a4a45]">
                  {isUr ? '۴ ہندسوں کا پن کوڈ (ڈیفالٹ: 1234)' : '4-Digit PIN (Default: 1234)'}
                </label>
                <input
                  type="password"
                  required
                  value={authPasscode}
                  onChange={(e) => setAuthPasscode(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              {authError && <div className="text-xs text-rose-600 font-semibold">{authError}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-outline text-xs" onClick={() => setIsLoginOpen(false)}>
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button type="submit" className="btn-gold text-xs">
                  {isUr ? 'سائن ان کریں' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          GLOBAL QUIZ STATISTICS MODAL
      =================================================================== */}
      {isGlobalStatsOpen && globalStatsStudent && (
        <QuizStatsModal
          student={globalStatsStudent}
          isOpen={isGlobalStatsOpen}
          onClose={() => {
            setIsGlobalStatsOpen(false);
            setGlobalStatsStudent(null);
          }}
          lang={lang}
        />
      )}

      {/* ===================================================================
          FOOTER
      =================================================================== */}
      <footer className="border-t border-[#0f6b64]/15 py-6 text-center text-xs text-[#4e6b68]">
        {isUr
          ? 'نور دنیا · انٹرایکٹو اسلامی تعلیم، قصص الانبیاء اور نصابی اسباق (۵ تا ۱۵ سال)'
          : 'Nur Duniya · Interactive Islamic Learning, Stories & Lessons (Ages 5 to 15)'}
      </footer>
    </div>
  );
}
