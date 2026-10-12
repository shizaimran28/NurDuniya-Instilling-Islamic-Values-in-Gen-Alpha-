import React, { useState, useMemo, useEffect } from 'react';
import { Madrasa, MadrasaLesson, MadrasaQuiz, QuizQuestion, StoredActivity, StoredUser } from '../../server';
import { playVoiceClip, subscribeVoiceState } from '../utils/voicePlayer';
import { QuizStatsModal } from './QuizStatsModal';
import {
  MADRASA_URDU_MAP,
  LESSON_URDU_MAP,
  QUIZ_URDU_MAP,
  SUBJECT_LABELS_UR,
  AGE_GROUP_LABELS_UR,
  localizeUserName,
  localizeActivityLabel,
} from '../data/islamicContent';
import {
  GraduationCap,
  Plus,
  Key,
  BookOpen,
  HelpCircle,
  Trophy,
  ShieldCheck,
  BarChart2,
  Star,
  Volume2,
  VolumeX,
  X,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  ChevronRight,
  RotateCcw,
  Lock,
} from 'lucide-react';

interface MadrasaHubProps {
  madrasas: Madrasa[];
  currentMadrasaId: string;
  onSelectMadrasa: (id: string) => void;
  currentUser: StoredUser | null;
  activities: StoredActivity[];
  registeredUsers: StoredUser[];
  onRefreshState: () => void;
  onShowToast: (msg: string) => void;
  onOpenLoginModal: () => void;
  lang: 'en' | 'ur' | 'ro';
  initialTab?: 'lessons' | 'quizzes' | 'leaderboard' | 'teacher_console';
}

export function MadrasaHub({
  madrasas,
  currentMadrasaId,
  onSelectMadrasa,
  currentUser,
  activities,
  registeredUsers,
  onRefreshState,
  onShowToast,
  onOpenLoginModal,
  lang,
  initialTab = 'lessons',
}: MadrasaHubProps) {
  const isUr = lang === 'ur';

  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  useEffect(() => {
    return subscribeVoiceState((id) => setActiveVoiceId(id));
  }, []);

  const [isCreateMadrasaOpen, setIsCreateMadrasaOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isAwardStarOpen, setIsAwardStarOpen] = useState(false);
  const [starTargetStudent, setStarTargetStudent] = useState<StoredUser | null>(null);

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsTargetStudent, setStatsTargetStudent] = useState<
    StoredUser | { id: string; displayName: string; username: string; ageGroup?: string; role?: string } | null
  >(null);

  const [subTab, setSubTab] = useState<'lessons' | 'quizzes' | 'leaderboard' | 'teacher_console'>(initialTab);

  useEffect(() => {
    setSubTab(initialTab);
  }, [initialTab]);

  const activeMadrasa = useMemo(() => {
    const raw = madrasas.find((m) => m.id === currentMadrasaId) || madrasas[0] || null;
    if (!raw) return null;
    if (!raw.lessons || !Array.isArray(raw.lessons)) return raw;

    const seen = new Set<string>();
    const uniqueLessons = raw.lessons.filter((l) => {
      if (!l?.id || seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    if (uniqueLessons.length === raw.lessons.length) return raw;
    return { ...raw, lessons: uniqueLessons };
  }, [madrasas, currentMadrasaId]);

  const isTeacher = useMemo(() => {
    return currentUser?.role === 'teacher';
  }, [currentUser]);

  useEffect(() => {
    if (!isTeacher && subTab === 'teacher_console') {
      setSubTab('lessons');
    }
  }, [isTeacher, subTab]);

  const isEnrolled = useMemo(() => {
    if (!currentUser || !activeMadrasa) return false;
    return (
      activeMadrasa.studentIds.includes(currentUser.id) ||
      activeMadrasa.teacherId === currentUser.id ||
      currentUser.enrolledMadrasas?.includes(activeMadrasa.id)
    );
  }, [currentUser, activeMadrasa]);

  const enrolledStudents = useMemo(() => {
    if (!activeMadrasa) return [];
    return registeredUsers.filter(
      (u) => activeMadrasa.studentIds.includes(u.id) && u.role !== 'teacher'
    );
  }, [activeMadrasa, registeredUsers]);

  const madrasaActivities = useMemo(() => {
    if (!activeMadrasa) return [];
    return activities.filter((a) => a.madrasaId === activeMadrasa.id);
  }, [activeMadrasa, activities]);

  const [newMadrasaName, setNewMadrasaName] = useState('');
  const [newMadrasaNameUr, setNewMadrasaNameUr] = useState('');
  const [newMadrasaDesc, setNewMadrasaDesc] = useState('');
  const [newMadrasaAge, setNewMadrasaAge] = useState<'5-8' | '9-11' | '12-15' | 'all'>('all');
  const [newMadrasaCode, setNewMadrasaCode] = useState('');
  const [newMadrasaTeacherName, setNewMadrasaTeacherName] = useState(
    currentUser?.displayName || 'Ustadh / Muallim'
  );
  const [isSubmittingMadrasa, setIsSubmittingMadrasa] = useState(false);

  const [enrollJoinCode, setEnrollJoinCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollStudentUsername, setEnrollStudentUsername] = useState('');

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTitleUr, setLessonTitleUr] = useState('');
  const [lessonSubject, setLessonSubject] = useState<'quran' | 'seerah' | 'akhlaq' | 'fiqh' | 'history'>('quran');
  const [lessonAge, setLessonAge] = useState<'5-8' | '9-11' | '12-15' | 'all'>('all');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonArabic, setLessonArabic] = useState('');
  const [lessonPoints, setLessonPoints] = useState(40);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Islamic Studies');
  const [quizPoints, setQuizPoints] = useState(60);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      q: '',
      options: ['', '', ''],
      correct: 0,
      explanation: '',
    },
  ]);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const [activeTakingQuiz, setActiveTakingQuiz] = useState<MadrasaQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const [starPoints, setStarPoints] = useState(25);
  const [starReason, setStarReason] = useState('Consistent prayer and lesson completion.');

  const [expandedLesson, setExpandedLesson] = useState<MadrasaLesson | null>(null);

  const [boardDateFilter, setBoardDateFilter] = useState<'all' | 'today'>('today');
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const madrasaLeaderboard = useMemo(() => {
    if (!activeMadrasa) return [];
    const map = new Map<
      string,
      {
        user: StoredUser;
        totalPoints: number;
        lessonPts: number;
        quizPts: number;
        salahPts: number;
        duaPts: number;
        starPts: number;
        activityCount: number;
      }
    >();

    for (const student of enrolledStudents) {
      map.set(student.id, {
        user: student,
        totalPoints: 0,
        lessonPts: 0,
        quizPts: 0,
        salahPts: 0,
        duaPts: 0,
        starPts: 0,
        activityCount: 0,
      });
    }

    if (currentUser && currentUser.role === 'student' && !map.has(currentUser.id)) {
      if (activeMadrasa.studentIds.includes(currentUser.id)) {
        map.set(currentUser.id, {
          user: currentUser,
          totalPoints: 0,
          lessonPts: 0,
          quizPts: 0,
          salahPts: 0,
          duaPts: 0,
          starPts: 0,
          activityCount: 0,
        });
      }
    }

    for (const act of madrasaActivities) {
      if (boardDateFilter === 'today' && act.date !== todayStr) continue;
      let entry = map.get(act.userId);
      if (!entry) {
        const matchingUser = registeredUsers.find((u) => u.id === act.userId) || {
          id: act.userId,
          username: act.username,
          displayName: act.displayName,
          role: 'student',
          ageGroup: act.ageGroup,
          enrolledMadrasas: [activeMadrasa.id],
          passcode: '1234',
          joinedAt: act.date,
        };
        entry = {
          user: matchingUser,
          totalPoints: 0,
          lessonPts: 0,
          quizPts: 0,
          salahPts: 0,
          duaPts: 0,
          starPts: 0,
          activityCount: 0,
        };
        map.set(act.userId, entry);
      }

      entry.totalPoints += act.points;
      entry.activityCount += 1;
      if (act.category === 'madrasa_lesson') entry.lessonPts += act.points;
      else if (act.category === 'madrasa_quiz') entry.quizPts += act.points;
      else if (act.category === 'salah') entry.salahPts += act.points;
      else if (act.category === 'dua') entry.duaPts += act.points;
      else if (act.category === 'teacher_star') entry.starPts += act.points;
    }

    return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [activeMadrasa, enrolledStudents, currentUser, madrasaActivities, boardDateFilter, todayStr, registeredUsers]);

  const handleOpenStats = (
    target: StoredUser | { id: string; displayName: string; username: string; ageGroup?: string; role?: string }
  ) => {
    setStatsTargetStudent(target);
    setIsStatsModalOpen(true);
  };

  const getMadrasaTitle = (m: Madrasa | null) => {
    if (!m) return isUr ? 'مدرسہ ہب' : 'Madrasa Hub';
    if (isUr) {
      return MADRASA_URDU_MAP[m.id]?.nameUr || m.nameUr || m.name;
    }
    return m.name;
  };

  const getMadrasaDesc = (m: Madrasa | null) => {
    if (!m)
      return isUr
        ? 'طلبہ کو شامل کریں، نصابی اسباق پڑھیں اور کوئز کے نتائج دیکھیں۔'
        : 'Create study circles, enroll students, publish curriculum lessons, and monitor real-time quiz progress.';
    if (isUr) {
      return MADRASA_URDU_MAP[m.id]?.descriptionUr || m.description;
    }
    return m.description;
  };

  const getMadrasaTeacher = (m: Madrasa) => {
    if (isUr) {
      return MADRASA_URDU_MAP[m.id]?.teacherNameUr || m.teacherName;
    }
    return m.teacherName;
  };

  const getLessonTitle = (les: MadrasaLesson) => {
    if (isUr) {
      return LESSON_URDU_MAP[les.id]?.titleUr || les.titleUr || les.title;
    }
    return les.title;
  };

  const getLessonContent = (les: MadrasaLesson) => {
    if (isUr) {
      return LESSON_URDU_MAP[les.id]?.contentUr || les.content;
    }
    return les.content;
  };

  const getQuizTitle = (q: MadrasaQuiz) => {
    if (isUr) {
      return QUIZ_URDU_MAP[q.id]?.titleUr || q.title;
    }
    return q.title;
  };

  const getQuizSubject = (q: MadrasaQuiz) => {
    if (isUr) {
      return QUIZ_URDU_MAP[q.id]?.subjectUr || SUBJECT_LABELS_UR[q.subject] || q.subject;
    }
    return q.subject;
  };

  const handleCreateMadrasaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMadrasaName.trim()) {
      onShowToast(isUr ? 'براہ کرم مدرسے کا نام درج کریں۔' : 'Please enter a name for the Madrasa.');
      return;
    }
    if (!currentUser) {
      onOpenLoginModal();
      onShowToast(isUr ? 'براہ کرم پہلے لاگ ان کریں۔' : 'Please log in first to establish your teacher profile.');
      return;
    }
    setIsSubmittingMadrasa(true);
    try {
      const res = await fetch('/api/madrasa/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMadrasaName,
          nameUr: newMadrasaNameUr,
          description: newMadrasaDesc,
          teacherId: currentUser.id,
          teacherName: newMadrasaTeacherName || currentUser.displayName,
          ageGroup: newMadrasaAge,
          customCode: newMadrasaCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(data.error || (isUr ? 'مدرسہ بنانے میں خرابی۔' : 'Failed to create Madrasa.'));
        setIsSubmittingMadrasa(false);
        return;
      }
      onShowToast(
        isUr
          ? `ماشاء اللہ! "${data.madrasa.name}" بن گیا۔ کوڈ: ${data.madrasa.code}`
          : `MashaAllah! "${data.madrasa.name}" created. Join Code: ${data.madrasa.code}`
      );
      setIsCreateMadrasaOpen(false);
      setNewMadrasaName('');
      setNewMadrasaNameUr('');
      setNewMadrasaDesc('');
      setNewMadrasaCode('');
      onSelectMadrasa(data.madrasa.id);
      onRefreshState();
    } catch {
      onShowToast(isUr ? 'نیٹ ورک کی خرابی۔' : 'Network error creating Madrasa.');
    } finally {
      setIsSubmittingMadrasa(false);
    }
  };

  const handleEnrollWithCode = async (codeToUse?: string) => {
    const code = (codeToUse || enrollJoinCode).trim().toUpperCase();
    if (!code) {
      onShowToast(
        isUr ? 'براہ کرم درست مدرسہ کوڈ درج کریں (مثلاً NUR-786)۔' : 'Please enter a valid Madrasa code (e.g. NUR-786).'
      );
      return;
    }
    if (!currentUser) {
      onOpenLoginModal();
      onShowToast(isUr ? 'براہ کرم شامل ہونے کے لیے پہلے لاگ ان کریں۔' : 'Please login with your name to save your membership.');
      return;
    }
    setIsEnrolling(true);
    try {
      const res = await fetch('/api/madrasa/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          studentId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(data.error || (isUr ? 'شمولیت ممکن نہیں ہو سکی۔' : 'Could not join Madrasa.'));
        setIsEnrolling(false);
        return;
      }
      onShowToast(
        isUr
          ? `${data.madrasa.name} میں کامیابی سے شمولیت ہو گئی!`
          : `Enrolled successfully in ${data.madrasa.name}!`
      );
      setIsEnrollModalOpen(false);
      setEnrollJoinCode('');
      onSelectMadrasa(data.madrasa.id);
      onRefreshState();
    } catch {
      onShowToast(isUr ? 'نیٹ ورک کی خرابی۔' : 'Network error during enrollment.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleTeacherDirectEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentUsername.trim() || !activeMadrasa) {
      onShowToast(isUr ? 'براہ کرم طالب علم کا یوزر نیم درج کریں۔' : 'Please enter the student username.');
      return;
    }
    try {
      const res = await fetch('/api/madrasa/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          madrasaId: activeMadrasa.id,
          studentUsername: enrollStudentUsername,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(data.error || (isUr ? 'طالب علم شامل نہیں ہو سکا۔' : 'Failed to enroll student.'));
        return;
      }
      onShowToast(
        isUr
          ? `طالب علم @${enrollStudentUsername} کو شامل کر لیا گیا۔`
          : `Student @${enrollStudentUsername} enrolled into ${activeMadrasa.name}.`
      );
      setEnrollStudentUsername('');
      onRefreshState();
    } catch {
      onShowToast(isUr ? 'شمولیت میں خرابی۔' : 'Error enrolling student.');
    }
  };

  const handleCreateLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMadrasa || !lessonTitle.trim() || !lessonContent.trim()) {
      onShowToast(isUr ? 'براہ کرم سبق کا عنوان اور مضمون درج کریں۔' : 'Please fill in Lesson Title and Lesson Content.');
      return;
    }
    setIsSubmittingLesson(true);
    try {
      const res = await fetch('/api/madrasa/lesson/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          madrasaId: activeMadrasa.id,
          teacherId: currentUser?.id,
          title: lessonTitle,
          titleUr: lessonTitleUr,
          subject: lessonSubject,
          ageGroup: lessonAge,
          content: lessonContent,
          arabicVerse: lessonArabic,
          points: lessonPoints,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(data.error || (isUr ? 'سبق شائع نہیں ہو سکا۔' : 'Failed to publish lesson.'));
        setIsSubmittingLesson(false);
        return;
      }
      onShowToast(
        isUr
          ? `سبق شائع ہو گیا: "${data.lesson.title}" (+${data.lesson.points} پوائنٹس)`
          : `Lesson published: "${data.lesson.title}" (+${data.lesson.points} pts reward)`
      );
      setIsCreateLessonOpen(false);
      setLessonTitle('');
      setLessonTitleUr('');
      setLessonContent('');
      setLessonArabic('');
      onRefreshState();
    } catch {
      onShowToast(isUr ? 'نیٹ ورک کی خرابی۔' : 'Network error publishing lesson.');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMadrasa || !quizTitle.trim()) {
      onShowToast(isUr ? 'براہ کرم کوئز کا عنوان درج کریں۔' : 'Please enter a Quiz Title.');
      return;
    }
    const cleanQuestions = quizQuestions.filter(
      (q) => q.q.trim() && q.options.filter((o) => o.trim()).length >= 2
    );
    if (cleanQuestions.length === 0) {
      onShowToast(
        isUr
          ? 'براہ کرم کم از کم ایک سوال اور دو جوابات درج کریں۔'
          : 'Please ensure each question has question text and at least 2 non-empty options.'
      );
      return;
    }
    setIsSubmittingQuiz(true);
    try {
      const res = await fetch('/api/madrasa/quiz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          madrasaId: activeMadrasa.id,
          title: quizTitle,
          subject: quizSubject,
          points: quizPoints,
          questions: cleanQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(data.error || (isUr ? 'کوئز شائع نہیں ہو سکا۔' : 'Failed to publish quiz.'));
        setIsSubmittingQuiz(false);
        return;
      }
      onShowToast(
        isUr
          ? `کوئز شائع ہو گیا: "${data.quiz.title}"`
          : `Quiz published: "${data.quiz.title}" with ${cleanQuestions.length} questions.`
      );
      setIsCreateQuizOpen(false);
      setQuizTitle('');
      setQuizQuestions([
        {
          q: '',
          options: ['', '', ''],
          correct: 0,
          explanation: '',
        },
      ]);
      onRefreshState();
    } catch {
      onShowToast(isUr ? 'نیٹ ورک کی خرابی۔' : 'Network error publishing quiz.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleAwardStarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMadrasa || !starTargetStudent) return;
    try {
      const res = await fetch('/api/madrasa/award-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          madrasaId: activeMadrasa.id,
          teacherId: currentUser?.id,
          studentId: starTargetStudent.id,
          points: starPoints,
          reason: starReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(data.error || (isUr ? 'اسٹار نہیں دیا جا سکا۔' : 'Could not award star.'));
        return;
      }
      onShowToast(
        isUr
          ? `${starTargetStudent.displayName} کو +${starPoints} پوائنٹس دیے گئے۔`
          : `Awarded +${starPoints} points to ${starTargetStudent.displayName}.`
      );
      setIsAwardStarOpen(false);
      setStarTargetStudent(null);
      onRefreshState();
    } catch {
      onShowToast(isUr ? 'خرابی پیش آگئی۔' : 'Error awarding star points.');
    }
  };

  const handleCompleteLesson = async (lesson: MadrasaLesson) => {
    if (!currentUser) {
      onOpenLoginModal();
      onShowToast(isUr ? 'براہ کرم سبق مکمل کرنے کے لیے لاگ ان کریں۔' : 'Please login to record your lesson completion.');
      return;
    }
    const key = `madrasa_lesson_${lesson.id}`;
    const alreadyDone = activities.some((a) => a.userId === currentUser.id && a.activityKey === key);
    if (alreadyDone) {
      onShowToast(isUr ? 'آپ یہ سبق پہلے ہی مکمل کر چکے ہیں۔' : 'You have already completed this lesson.');
      return;
    }
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          madrasaId: activeMadrasa?.id,
          date: todayStr,
          category: 'madrasa_lesson',
          label: `Completed Lesson: ${lesson.title}`,
          points: lesson.points,
          activityKey: key,
        }),
      });
      if (res.ok) {
        onShowToast(
          isUr
            ? `+${lesson.points} پوائنٹس حاصل ہوئے: "${getLessonTitle(lesson)}"`
            : `+${lesson.points} pts awarded for completing "${lesson.title}".`
        );
        onRefreshState();
      }
    } catch {
      onShowToast(isUr ? 'خرابی پیش آگئی۔' : 'Error recording lesson completion.');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeTakingQuiz) return;
    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < activeTakingQuiz.questions.length) {
      onShowToast(
        isUr ? 'براہ کرم جمع کرانے سے پہلے تمام سوالات کے جواب دیں۔' : 'Please answer all questions before submitting.'
      );
      return;
    }

    let correctCount = 0;
    activeTakingQuiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correctCount += 1;
    });

    const totalQ = activeTakingQuiz.questions.length;
    const pct = Math.round((correctCount / totalQ) * 100);
    const earnedPts = Math.round((correctCount / totalQ) * activeTakingQuiz.points);

    setQuizResult({
      score: correctCount,
      total: totalQ,
      passed: pct >= 60,
    });

    if (currentUser) {
      try {
        await fetch('/api/quiz/record-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            madrasaId: activeMadrasa?.id,
            quizId: activeTakingQuiz.id,
            quizTitle: activeTakingQuiz.title,
            subject: activeTakingQuiz.subject,
            score: correctCount,
            totalQuestions: totalQ,
            pointsEarned: earnedPts,
          }),
        });
        onRefreshState();
      } catch {
        // ignore
      }
    }

    onShowToast(
      isUr
        ? `کوئز مکمل: ${correctCount}/${totalQ} درست (+${earnedPts} پوائنٹس)`
        : `Quiz Completed: ${correctCount}/${totalQ} correct (+${earnedPts} pts).`
    );
  };

  return (
    <div className="mt-1">
      {/* MADRASA SELECTOR & TOP ACTION BAR */}
      <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-5 sm:p-6 mb-5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-[#0f6b64]/10 text-[#0f6b64] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="m-0 text-xl font-bold text-[#0a4a45]">{getMadrasaTitle(activeMadrasa)}</h2>
              {activeMadrasa?.code && (
                <span className="text-xs font-bold text-[#0f6b64] tracking-wide">
                  · {isUr ? `شمولیت کوڈ: ${activeMadrasa.code}` : `Join Code: ${activeMadrasa.code}`}
                </span>
              )}
            </div>
            <p className="mt-1.5 mb-0 text-sm text-[#4e6b68] max-w-2xl">{getMadrasaDesc(activeMadrasa)}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isTeacher && (
              <button
                type="button"
                className="btn-gold text-xs"
                onClick={() => setIsCreateMadrasaOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>{isUr ? 'نیا مدرسہ بنائیں' : 'Create Madrasa'}</span>
              </button>
            )}

            <button
              type="button"
              className="btn-primary text-xs"
              onClick={() => setIsEnrollModalOpen(true)}
            >
              <Key className="w-4 h-4" />
              <span>{isUr ? 'کوڈ کے ذریعے شامل ہوں' : 'Enroll with Code'}</span>
            </button>

            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() => {
                const target =
                  currentUser ||
                  registeredUsers.find((u) => u.username === 'ayesha_noor') || {
                    id: 'usr_ayesha',
                    displayName: 'Ayesha Siddiqua',
                    username: 'ayesha_noor',
                    ageGroup: '12-15',
                    role: 'student',
                  };
                handleOpenStats(target);
              }}
            >
              <BarChart2 className="w-4 h-4 text-[#0f6b64]" />
              <span>{isUr ? 'کوئز شماریات' : 'Quiz Statistics'}</span>
            </button>

            {madrasas.length > 1 && (
              <select
                value={activeMadrasa?.id || ''}
                onChange={(e) => onSelectMadrasa(e.target.value)}
                className="form-select w-auto py-1.5 px-3 text-xs font-semibold"
                aria-label={isUr ? 'مدرسہ تبدیل کریں' : 'Switch Madrasa'}
              >
                {madrasas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getMadrasaTitle(m)} ({m.code})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Classroom Metadata Row */}
        {activeMadrasa && (
          <div className="mt-3.5 pt-3 border-t border-[#0f6b64]/15 flex items-center justify-between gap-3 flex-wrap text-xs text-[#4e6b68]">
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                <strong>{isUr ? 'نگران معلم:' : "Head Mu'allim:"}</strong> {getMadrasaTeacher(activeMadrasa)}
              </span>
              <span>·</span>
              <span>
                <strong>{isUr ? 'عمر کا گروپ:' : 'Target Age:'}</strong>{' '}
                {isUr
                  ? AGE_GROUP_LABELS_UR[activeMadrasa.ageGroup] || activeMadrasa.ageGroup
                  : `Ages ${activeMadrasa.ageGroup.toUpperCase()}`}
              </span>
              <span>·</span>
              <span>
                <strong>{isUr ? 'شامل طلبہ:' : 'Enrolled Students:'}</strong> {enrolledStudents.length}
              </span>
              <span>·</span>
              <span>
                <strong>{isUr ? 'اسباق:' : 'Lessons:'}</strong> {activeMadrasa.lessons.length}
              </span>
              <span>·</span>
              <span>
                <strong>{isUr ? 'کوئز:' : 'Quizzes:'}</strong> {activeMadrasa.quizzes.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isTeacher ? (
                <span className="text-xs font-bold text-[#107e54]">
                  {isUr ? '● استاد موڈ فعال ہے' : '● Teacher Mode Active'}
                </span>
              ) : isEnrolled ? (
                <span className="text-xs font-semibold text-[#0f6b64]">
                  {isUr ? '● شامل شدہ طالب علم' : '● Enrolled Student'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleEnrollWithCode(activeMadrasa.code)}
                  className="btn-outline text-xs py-1 px-2.5"
                >
                  {isUr ? 'اس مدرسے میں شامل ہوں' : '1-Click Enroll in this Madrasa'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'lessons'}
          onClick={() => setSubTab('lessons')}
          className={`screen-tab inline-flex items-center gap-1.5 ${subTab === 'lessons' ? 'active' : ''}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            {isUr
              ? `کلاس کے اسباق (${activeMadrasa?.lessons?.length || 0})`
              : `Classroom Lessons (${activeMadrasa?.lessons?.length || 0})`}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'quizzes'}
          onClick={() => setSubTab('quizzes')}
          className={`screen-tab inline-flex items-center gap-1.5 ${subTab === 'quizzes' ? 'active' : ''}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>
            {isUr
              ? `انٹرایکٹو کوئز (${activeMadrasa?.quizzes?.length || 0})`
              : `Interactive Quizzes (${activeMadrasa?.quizzes?.length || 0})`}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'leaderboard'}
          onClick={() => setSubTab('leaderboard')}
          className={`screen-tab inline-flex items-center gap-1.5 ${subTab === 'leaderboard' ? 'active' : ''}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>{isUr ? 'کلاس لیڈر بورڈ' : 'Classroom Standings'}</span>
        </button>

        {isTeacher && (
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'teacher_console'}
            onClick={() => setSubTab('teacher_console')}
            className={`screen-tab inline-flex items-center gap-1.5 ${subTab === 'teacher_console' ? 'active' : ''}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isUr ? 'استاد کنسول' : 'Teacher Console'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: CLASSROOM LESSONS */}
      {subTab === 'lessons' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
            <div>
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {getMadrasaTitle(activeMadrasa)}: {isUr ? 'نصابی اسباق' : 'Curriculum Lessons'}
              </h3>
              <p className="mt-1 mb-0 text-xs text-[#4e6b68]">
                {isUr
                  ? 'اسباق پڑھیں، صوتی تلاوت سنیں اور پوائنٹس حاصل کرنے کے لیے مکمل کریں۔'
                  : 'Read lessons, listen to audio recitations, and mark them completed to earn points.'}
              </p>
            </div>
            {isTeacher && (
              <button
                type="button"
                className="btn-gold text-xs"
                onClick={() => setIsCreateLessonOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>{isUr ? 'نیا سبق اپ لوڈ کریں' : 'Upload New Lesson'}</span>
              </button>
            )}
          </div>

          {/* Enrollment status banner */}
          {isEnrolled ? (
            <div className="mb-4 p-3.5 rounded-xl bg-[#107e54]/10 border border-[#107e54]/30 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#107e54] shrink-0" />
                <div>
                  <div className="font-bold text-xs text-[#0a4a45]">
                    {isUr
                      ? `آپ ${getMadrasaTitle(activeMadrasa)} میں باقاعدہ داخل ہیں!`
                      : `You are Enrolled in ${getMadrasaTitle(activeMadrasa)}!`}
                  </div>
                  <div className="text-[11px] text-[#4e6b68]">
                    {isUr
                      ? `مکمل نصاب (${activeMadrasa?.lessons?.length || 0} اسباق)، تمام امتحانات اور انعامی ستارے کھلے ہوئے ہیں۔`
                      : `Full curriculum (${activeMadrasa?.lessons?.length || 0} lessons), interactive quizzes, and teacher awards unlocked.`}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#107e54] bg-white px-2.5 py-1 rounded-full border border-[#107e54]/30">
                {isUr ? '✓ تمام مواد دستیاب ہے' : '✓ Full Curriculum Unlocked'}
              </span>
            </div>
          ) : (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-amber-900">
                    {isUr
                      ? `تعارفی موڈ: صرف ۲ مفت اسباق دستیاب ہیں`
                      : `Preview Mode: Showing 2 Free Lessons`}
                  </div>
                  <div className="text-[11px] text-amber-800">
                    {isUr
                      ? `اس مدرسہ میں داخلہ لیں تاکہ بقیہ تمام (${Math.max(
                          0,
                          (activeMadrasa?.lessons?.length || 0) - 2
                        )}) اسباق، امتحانات اور پوائنٹس حاصل کیے جا سکیں۔`
                      : `Enroll in this Madrasa to unlock the remaining ${Math.max(
                          0,
                          (activeMadrasa?.lessons?.length || 0) - 2
                        )} curriculum lessons, quizzes, and earn stars!`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-gold text-xs py-1.5 px-3"
                onClick={() => setIsEnrollModalOpen(true)}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isUr ? 'مدرسہ میں داخلہ لیں' : 'Enroll to Unlock All'}</span>
              </button>
            </div>
          )}

          {activeMadrasa?.lessons?.length === 0 ? (
            <div className="bg-white rounded-2xl p-9 text-center border border-dashed border-[#0f6b64]/25">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="m-0 mb-1.5 text-base font-bold">
                {isUr ? 'ابھی تک کوئی سبق شائع نہیں ہوا' : 'No Lessons Published Yet'}
              </h4>
              <p className="m-0 mb-4 text-xs text-[#4e6b68]">
                {isUr
                  ? 'اس کلاس میں ابھی کوئی سبق شامل نہیں کیا گیا۔'
                  : 'No curriculum lessons have been published to this classroom yet.'}
              </p>
              {isTeacher && (
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={() => setIsCreateLessonOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUr ? 'پہلا سبق اپ لوڈ کریں' : 'Upload First Lesson'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMadrasa?.lessons?.map((lesson, idx) => {
                const isPreview = !isEnrolled && idx < 2;
                const isLocked = !isEnrolled && idx >= 2;
                const actKey = `madrasa_lesson_${lesson.id}`;
                const isCompleted = currentUser
                  ? activities.some((a) => a.userId === currentUser.id && a.activityKey === actKey)
                  : false;
                const voiceId = `lesson_voice_${lesson.id}`;
                const localizedTitle = getLessonTitle(lesson);
                const localizedContent = getLessonContent(lesson);

                if (isLocked) {
                  return (
                    <div
                      key={lesson.id}
                      className="story-card flex-col justify-between border-l-4 border-l-slate-300 bg-slate-50/70 opacity-90"
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#4e6b68]">
                          <span className="font-semibold text-slate-500 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {isUr
                                ? `${SUBJECT_LABELS_UR[lesson.subject] || lesson.subject} · صرف داخلہ شدہ طلبہ`
                                : `${lesson.subject.toUpperCase()} · Enrolled Only`}
                            </span>
                          </span>
                          <span className="font-bold text-slate-400 tabular-nums">
                            +{lesson.points} {isUr ? 'پوائنٹس' : 'pts'}
                          </span>
                        </div>

                        <h4 className="m-0 mb-1.5 text-base font-bold text-slate-700 flex items-center gap-1.5">
                          <span>{localizedTitle}</span>
                        </h4>

                        <div className="p-3 my-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 leading-relaxed">
                          {isUr
                            ? '🔒 یہ سبق صرف داخلہ شدہ طلبہ کے لیے ہے۔ مکمل متن، صوتی تلاوت اور پوائنٹس حاصل کرنے کے لیے اس مدرسہ میں داخلہ لیں۔'
                            : '🔒 This curriculum lesson is reserved for enrolled students. Enroll in this Madrasa to access the full lesson, audio recitations, and earn points.'}
                        </div>
                      </div>

                      <div className="w-full pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs text-slate-500 font-medium">
                          {isUr ? 'لاک شدہ سبق' : 'Locked Lesson'}
                        </span>
                        <button
                          type="button"
                          className="btn-gold text-xs py-1.5 px-3"
                          onClick={() => setIsEnrollModalOpen(true)}
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>{isUr ? 'داخلہ لے کر کھولیں' : 'Enroll to Unlock'}</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Unlocked or Preview Lesson
                return (
                  <div
                    key={lesson.id}
                    className="story-card flex-col justify-between border-l-4 border-l-[#0f6b64]"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#4e6b68]">
                        <span className="font-semibold text-[#0f6b64] flex items-center gap-1.5">
                          {isPreview && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {isUr ? 'پیش نظارہ' : 'Free Preview'}
                            </span>
                          )}
                          <span>
                            {isUr
                              ? `${SUBJECT_LABELS_UR[lesson.subject] || lesson.subject} · ${
                                  AGE_GROUP_LABELS_UR[lesson.ageGroup] || lesson.ageGroup
                                }`
                              : `${lesson.subject.toUpperCase()} · Ages ${lesson.ageGroup.toUpperCase()}`}
                          </span>
                        </span>
                        <span className="font-bold text-[#d4952c] tabular-nums">
                          +{lesson.points} {isUr ? 'پوائنٹس' : 'pts'}
                        </span>
                      </div>

                      <h4 className="m-0 mb-1.5 text-base font-bold text-[#0a4a45]">{localizedTitle}</h4>

                      {lesson.arabicVerse && (
                        <div
                          className="p-3 rounded-xl bg-[#0f6b64]/5 text-center text-lg font-bold text-[#0a4a45] my-2.5"
                          dir="rtl"
                        >
                          {lesson.arabicVerse}
                        </div>
                      )}

                      <p className="m-0 mb-3 text-xs leading-relaxed text-[#183331] line-clamp-3">
                        {localizedContent}
                      </p>
                    </div>

                    <div className="w-full pt-3 border-t border-[#0f6b64]/15 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {lesson.arabicVerse && (
                          <button
                            type="button"
                            className={`btn-outline text-xs py-1.5 px-2.5 ${
                              activeVoiceId === `${voiceId}_ar` ? 'active' : ''
                            }`}
                            onClick={() =>
                              playVoiceClip({
                                id: `${voiceId}_ar`,
                                text: lesson.arabicVerse!,
                                lang: 'ar',
                              })
                            }
                            title={isUr ? 'صرف عربی تلاوت سنیں' : 'Recite Arabic with accurate Tajweed'}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-[#0f6b64]" />
                            <span>{isUr ? 'صرف عربی تلاوت' : 'Read Arabic Only'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className={`btn-outline text-xs py-1.5 px-2.5 ${
                            activeVoiceId === `${voiceId}_meaning` ? 'active' : ''
                          }`}
                          onClick={() =>
                            playVoiceClip({
                              id: `${voiceId}_meaning`,
                              text: isUr
                                ? `${localizedTitle}۔ ${localizedContent}`
                                : `${lesson.title}. ${lesson.content}`,
                              lang: isUr ? 'ur' : 'en',
                            })
                          }
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
                          className="btn-outline text-xs py-1.5 px-2.5"
                          onClick={() => setExpandedLesson(lesson)}
                        >
                          <span>{isUr ? 'مکمل پڑھیں' : 'Read Full'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCompleteLesson(lesson)}
                        disabled={isCompleted}
                        className={
                          isCompleted
                            ? 'btn-outline text-xs py-1.5 px-3 text-[#107e54] border-[#107e54]'
                            : 'btn-primary text-xs py-1.5 px-3'
                        }
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                        <span>
                          {isCompleted
                            ? isUr
                              ? 'مکمل شدہ'
                              : 'Completed'
                            : isUr
                            ? 'مکمل کریں'
                            : 'Mark Done'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUIZZES */}
      {subTab === 'quizzes' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
            <div>
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {getMadrasaTitle(activeMadrasa)}: {isUr ? 'انٹرایکٹو کوئز پورٹل' : 'Interactive Quiz Portal'}
              </h3>
              <p className="mt-1 mb-0 text-xs text-[#4e6b68]">
                {isUr
                  ? 'قرآن، حدیث اور سیرت کے اسباق سے متعلق سوالات حل کریں اور اپنے پوائنٹس بڑھائیں۔'
                  : 'Test your knowledge of Quran, Hadith, and Seerah lessons and track your score history.'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn-outline text-xs"
                onClick={() => {
                  const target =
                    currentUser ||
                    registeredUsers.find((u) => u.username === 'ayesha_noor') || {
                      id: 'usr_ayesha',
                      displayName: 'Ayesha Siddiqua',
                      username: 'ayesha_noor',
                      ageGroup: '12-15',
                      role: 'student',
                    };
                  handleOpenStats(target);
                }}
              >
                <BarChart2 className="w-4 h-4 text-[#0f6b64]" />
                <span>{isUr ? 'کوئز شماریات' : 'Quiz Statistics'}</span>
              </button>
              {isTeacher && (
                <button
                  type="button"
                  className="btn-gold text-xs"
                  onClick={() => setIsCreateQuizOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUr ? 'نیا کوئز بنائیں' : 'Create New Quiz'}</span>
                </button>
              )}
            </div>
          </div>

          {activeTakingQuiz && (
            <div className="bg-white border-2 border-[#0f6b64] rounded-2xl p-6 mb-6 shadow-md">
              <div className="flex items-center justify-between mb-3.5 border-b border-[#0f6b64]/15 pb-3">
                <div>
                  <span className="text-xs font-bold text-[#0f6b64]">
                    {isUr ? 'جاری کوئز' : 'Active Quiz'} · {getQuizSubject(activeTakingQuiz)}
                  </span>
                  <h3 className="m-0 mt-1 text-lg font-bold text-[#0a4a45]">
                    {getQuizTitle(activeTakingQuiz)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTakingQuiz(null);
                    setQuizAnswers({});
                    setQuizResult(null);
                  }}
                  className="btn-outline text-xs py-1 px-2.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isUr ? 'کوئز بند کریں' : 'Close Quiz'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {activeTakingQuiz.questions.map((q, qIdx) => {
                  const pickedOpt = quizAnswers[qIdx];
                  const isSubmitted = quizResult !== null;
                  const urQ = QUIZ_URDU_MAP[activeTakingQuiz.id]?.questionsUr?.[qIdx];
                  const questionText = isUr && urQ ? urQ.q : q.q;
                  const optionsList = isUr && urQ ? urQ.options : q.options;
                  const explanationText = isUr && urQ ? urQ.explanation : q.explanation;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-[#0f6b64]/5 border border-[#0f6b64]/15"
                    >
                      <div className="font-semibold text-sm mb-2.5">
                        {qIdx + 1}. {questionText}
                      </div>
                      <div className="flex flex-col gap-2">
                        {optionsList.map((opt, optIdx) => {
                          const isSelected = pickedOpt === optIdx;
                          const isCorrect = q.correct === optIdx;

                          let stateClass = 'bg-white border-[#0f6b64]/15';
                          if (isSubmitted) {
                            if (isCorrect) {
                              stateClass = 'bg-[#107e54]/15 border-[#107e54]';
                            } else if (isSelected && !isCorrect) {
                              stateClass = 'bg-[#d96543]/15 border-[#d96543]';
                            }
                          } else if (isSelected) {
                            stateClass = 'bg-[#d4952c]/20 border-[#d4952c] font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                if (isSubmitted) return;
                                setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                              }}
                              className={`text-start px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${stateClass}`}
                            >
                              <span>
                                <strong className="mx-1.5">{optIdx + 1}.</strong>
                                {opt}
                              </span>
                              {isSubmitted && isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[#107e54] font-semibold">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{isUr ? 'درست جواب' : 'Correct'}</span>
                                </span>
                              )}
                              {isSubmitted && isSelected && !isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[#d96543] font-semibold">
                                  <XCircle className="w-4 h-4" />
                                  <span>{isUr ? 'آپ کا جواب' : 'Your Answer'}</span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {isSubmitted && explanationText && (
                        <div className="mt-2.5 p-2.5 bg-[#0f6b64]/10 rounded-lg text-xs text-[#4e6b68]">
                          <strong>{isUr ? 'وضاحت:' : 'Explanation:'}</strong> {explanationText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center gap-3 flex-wrap">
                {!quizResult ? (
                  <button type="button" className="btn-gold text-xs" onClick={handleSubmitQuiz}>
                    {isUr
                      ? `کوئز جمع کرائیں (+${activeTakingQuiz.points} پوائنٹس)`
                      : `Submit Quiz (+${activeTakingQuiz.points} pts)`}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className={`px-4 py-2 rounded-lg font-bold text-xs ${
                        quizResult.passed
                          ? 'bg-[#107e54]/15 text-[#107e54]'
                          : 'bg-[#d96543]/15 text-[#d96543]'
                      }`}
                    >
                      {isUr
                        ? `نتیجہ: ${quizResult.score} از ${quizResult.total} درست (${Math.round(
                            (quizResult.score / quizResult.total) * 100
                          )}%)`
                        : `Result: ${quizResult.score} / ${quizResult.total} Correct (${Math.round(
                            (quizResult.score / quizResult.total) * 100
                          )}%)`}
                    </div>
                    <button
                      type="button"
                      className="btn-outline text-xs"
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizResult(null);
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isUr ? 'دوبارہ حل کریں' : 'Retake Quiz'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      onClick={() => {
                        if (currentUser) handleOpenStats(currentUser);
                      }}
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span>{isUr ? 'کوئز شماریات دیکھیں' : 'View in Quiz Statistics'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMadrasa?.quizzes?.length === 0 ? (
            <div className="bg-white rounded-2xl p-9 text-center border border-dashed border-[#0f6b64]/25">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="m-0 mb-1.5 text-base font-bold">
                {isUr ? 'ابھی کوئی کوئز موجود نہیں' : 'No Quizzes Created Yet'}
              </h4>
              <p className="m-0 mb-4 text-xs text-[#4e6b68]">
                {isUr
                  ? 'اس کلاس کے لیے ابھی کوئی کوئز شائع نہیں کیا گیا۔'
                  : 'No interactive quizzes have been published to this classroom yet.'}
              </p>
              {isTeacher && (
                <button type="button" className="btn-primary text-xs" onClick={() => setIsCreateQuizOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span>{isUr ? 'پہلا کوئز بنائیں' : 'Create First Quiz'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMadrasa?.quizzes?.map((quiz) => (
                <div key={quiz.id} className="story-card flex-col justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#4e6b68]">
                      <span className="font-bold text-[#0f6b64] uppercase">{getQuizSubject(quiz)}</span>
                      <span className="font-bold text-[#d4952c] tabular-nums">
                        +{quiz.points} {isUr ? 'پوائنٹس' : 'pts'}
                      </span>
                    </div>
                    <h4 className="m-0 mb-1.5 text-base font-bold text-[#0a4a45]">{getQuizTitle(quiz)}</h4>
                    <p className="m-0 mb-3.5 text-xs text-[#4e6b68]">
                      {isUr
                        ? `${quiz.questions.length} سوالات · فوری نتیجہ اور لیڈر بورڈ پوائنٹس`
                        : `${quiz.questions.length} Questions · Instant Scoring & Leaderboard Sync`}
                    </p>
                  </div>
                  <div className="w-full flex justify-end">
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      onClick={() => {
                        setActiveTakingQuiz(quiz);
                        setQuizAnswers({});
                        setQuizResult(null);
                      }}
                    >
                      <span>{isUr ? 'کوئز شروع کریں' : 'Start Quiz'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLASSROOM STANDINGS */}
      {subTab === 'leaderboard' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
            <div>
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {getMadrasaTitle(activeMadrasa)}: {isUr ? 'کلاس لیڈر بورڈ' : 'Classroom Standings'}
              </h3>
              <p className="mt-1 mb-0 text-xs text-[#4e6b68]">
                {isUr
                  ? 'طلبہ کے پوائنٹس، مکمل کردہ اسباق اور کوئز نتائج کی تفصیل۔'
                  : 'Real-time tracking of enrolled students, points, lesson completions, and quiz performance.'}
              </p>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-[#4e6b68]">{isUr ? 'فلٹر:' : 'Filter:'}</span>
              <button
                type="button"
                className={`btn-outline text-xs py-1 px-2.5 ${boardDateFilter === 'today' ? 'active' : ''}`}
                onClick={() => setBoardDateFilter('today')}
              >
                {isUr ? `آج (${todayStr})` : `Today (${todayStr})`}
              </button>
              <button
                type="button"
                className={`btn-outline text-xs py-1 px-2.5 ${boardDateFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBoardDateFilter('all')}
              >
                {isUr ? 'مکمل ریکارڈ' : 'All-Time Records'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#0f6b64]/15 rounded-2xl overflow-hidden mb-6 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="leaderboard-table w-full text-start">
                <thead>
                  <tr>
                    <th>{isUr ? 'درجہ' : 'Rank'}</th>
                    <th>{isUr ? 'طالب علم کا نام' : 'Student Name'}</th>
                    <th>{isUr ? 'عمر' : 'Age'}</th>
                    <th className="text-right">{isUr ? 'اسباق' : 'Lessons'}</th>
                    <th className="text-right">{isUr ? 'کوئز' : 'Quizzes'}</th>
                    <th className="text-right">{isUr ? 'نماز' : 'Salah'}</th>
                    <th className="text-right">{isUr ? 'دعائیں' : 'Duas'}</th>
                    <th className="text-right">{isUr ? 'اعزازی اسٹار' : 'Teacher Stars'}</th>
                    <th className="text-right">{isUr ? 'کل پوائنٹس' : 'Total Points'}</th>
                    {isTeacher && <th className="text-center">{isUr ? 'عمل' : 'Teacher Action'}</th>}
                  </tr>
                </thead>
                <tbody>
                  {madrasaLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={isTeacher ? 10 : 9} className="text-center p-7 text-[#4e6b68]">
                        {isUr
                          ? 'اس مدت کے لیے ابھی کوئی سرگرمی درج نہیں ہوئی۔'
                          : 'No enrolled student activities logged for this period yet.'}
                      </td>
                    </tr>
                  ) : (
                    madrasaLeaderboard.map((row, idx) => {
                      const isMe = currentUser && row.user.id === currentUser.id;
                      return (
                        <tr
                          key={row.user.id}
                          className={isMe ? 'bg-[#d4952c]/10 font-semibold' : ''}
                        >
                          <td className="font-bold tabular-nums">#{idx + 1}</td>
                          <td>
                            <div className="font-semibold text-[#0a4a45]">
                              {localizeUserName(row.user.displayName, isUr)}
                            </div>
                            <div className="text-[11px] text-[#4e6b68]">
                              @{row.user.username} {isMe ? (isUr ? '· (آپ)' : '· (You)') : ''}
                            </div>
                          </td>
                          <td className="text-xs text-[#4e6b68]">
                            {isUr ? AGE_GROUP_LABELS_UR[row.user.ageGroup] || row.user.ageGroup : row.user.ageGroup}
                          </td>
                          <td className="text-right tabular-nums">{row.lessonPts}</td>
                          <td className="text-right tabular-nums">{row.quizPts}</td>
                          <td className="text-right tabular-nums">{row.salahPts}</td>
                          <td className="text-right tabular-nums">{row.duaPts}</td>
                          <td className="text-right tabular-nums text-[#d4952c]">{row.starPts}</td>
                          <td className="text-right font-bold text-[#0a4a45] tabular-nums">
                            {row.totalPoints} {isUr ? 'پوائنٹس' : 'pts'}
                          </td>
                          {isTeacher && (
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn-outline text-[11px] py-1 px-2.5"
                                onClick={() => {
                                  setStarTargetStudent(row.user);
                                  setIsAwardStarOpen(true);
                                }}
                              >
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                <span>{isUr ? 'اسٹار دیں' : 'Award Star'}</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="m-0 mb-2.5 text-sm font-bold text-[#0a4a45]">
              {isUr
                ? `حالیہ تعلیمی سرگرمیاں (${getMadrasaTitle(activeMadrasa)})`
                : `Recent Student Activity Log (${activeMadrasa?.name})`}
            </h4>
            <div className="flex flex-col gap-2">
              {madrasaActivities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="bg-white border border-[#0f6b64]/15 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0f6b64]/10 text-[#0f6b64] flex items-center justify-center shrink-0">
                      {act.category === 'madrasa_lesson' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : act.category === 'madrasa_quiz' ? (
                        <HelpCircle className="w-4 h-4" />
                      ) : act.category === 'teacher_star' ? (
                        <Star className="w-4 h-4 text-amber-500" />
                      ) : act.category === 'salah' ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Award className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#0a4a45]">
                        {localizeUserName(act.displayName, isUr)} · {localizeActivityLabel(act.label, isUr)}
                      </div>
                      <div className="text-[11px] text-[#4e6b68]">
                        {isUr
                          ? `تاریخ: ${act.date} · عمر ${AGE_GROUP_LABELS_UR[act.ageGroup] || act.ageGroup}`
                          : `Date: ${act.date} · Ages ${act.ageGroup}`}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-[#0f6b64] tabular-nums">
                    +{act.points} {isUr ? 'پوائنٹس' : 'pts'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEACHER CONSOLE */}
      {isTeacher && subTab === 'teacher_console' && (
        <div>
          <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-5 sm:p-6 mb-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3.5">
              <div>
                <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                  {isUr ? 'استاد کنسول:' : 'Teacher Console:'} {getMadrasaTitle(activeMadrasa)}
                </h3>
                <p className="mt-1 mb-0 text-xs text-[#4e6b68]">
                  {isUr
                    ? 'طلبہ کا اندراج، نئے اسباق کی اشاعت، کوئز کی تیاری اور کارکردگی کا جائزہ۔'
                    : 'Direct student enrollment, lesson authoring, quiz creation, and student progress tracking.'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn-gold text-xs"
                  onClick={() => setIsCreateLessonOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUr ? 'نیا سبق لکھیں' : 'Author Lesson'}</span>
                </button>
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={() => setIsCreateQuizOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUr ? 'کوئز بنائیں' : 'Create Quiz'}</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0f6b64]/5 border border-[#0f6b64]/15 rounded-xl p-4 mt-4">
              <h4 className="m-0 mb-1 text-sm font-semibold text-[#0a4a45]">
                {isUr ? 'طالب علم کا براہِ راست اندراج' : 'Direct Student Enrollment'}
              </h4>
              <p className="m-0 mb-2.5 text-xs text-[#4e6b68]">
                {isUr
                  ? 'طالب علم کا یوزر نیم درج کر کے اسے براہِ راست اس مدرسے میں شامل کریں:'
                  : 'Enroll a student directly into this study circle by entering their username:'}
              </p>
              <form onSubmit={handleTeacherDirectEnroll} className="flex gap-2.5 flex-wrap">
                <input
                  type="text"
                  required
                  placeholder={
                    isUr
                      ? 'طالب علم کا یوزر نیم (مثلاً zayd_explorer)'
                      : 'Enter student username (e.g. zayd_explorer or rayyan_star)'
                  }
                  value={enrollStudentUsername}
                  onChange={(e) => setEnrollStudentUsername(e.target.value)}
                  className="form-input flex-1 min-w-[220px] text-xs"
                />
                <button type="submit" className="btn-primary text-xs">
                  {isUr ? 'طالب علم شامل کریں' : 'Enroll Student'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-5">
            <h4 className="m-0 mb-3 text-sm font-bold text-[#0a4a45]">
              {isUr ? `شامل شدہ طلبہ (${enrolledStudents.length})` : `Enrolled Students (${enrolledStudents.length})`}
            </h4>
            {enrolledStudents.length === 0 ? (
              <p className="text-xs text-[#4e6b68]">
                {isUr ? (
                  <>
                    ابھی کوئی طالب علم شامل نہیں۔ شمولیت کوڈ شیئر کریں: <strong>{activeMadrasa?.code}</strong>
                  </>
                ) : (
                  <>
                    No students enrolled yet. Share Join Code: <strong>{activeMadrasa?.code}</strong> or use direct enrollment above.
                  </>
                )}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {enrolledStudents.map((st) => {
                  const studentActs = madrasaActivities.filter((a) => a.userId === st.id);
                  const totalPts = studentActs.reduce((sum, a) => sum + a.points, 0);
                  return (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-xl border border-[#0f6b64]/15 bg-[#f8fbfb] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-sm text-[#0a4a45]">
                          {localizeUserName(st.displayName, isUr)}
                        </div>
                        <div className="text-xs text-[#4e6b68]">
                          @{st.username} ·{' '}
                          {isUr ? `عمر ${AGE_GROUP_LABELS_UR[st.ageGroup] || st.ageGroup}` : `Ages ${st.ageGroup}`}
                        </div>
                        <div className="text-xs text-[#0f6b64] font-semibold mt-0.5 tabular-nums">
                          {isUr
                            ? `کل: ${totalPts} پوائنٹس (${studentActs.length} سرگرمیاں)`
                            : `Total: ${totalPts} pts (${studentActs.length} activities)`}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          className="btn-outline text-[11px] py-1 px-2"
                          onClick={() => handleOpenStats(st)}
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-[#0f6b64]" />
                          <span>{isUr ? 'شماریات' : 'Stats'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-outline text-[11px] py-1 px-2"
                          onClick={() => {
                            setStarTargetStudent(st);
                            setIsAwardStarOpen(true);
                          }}
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isUr ? 'اسٹار' : 'Star'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE MADRASA */}
      {isCreateMadrasaOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {isUr ? 'نیا مدرسہ / اسٹڈی سرکل بنائیں' : 'Create a New Madrasa'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateMadrasaOpen(false)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="m-0 mb-4 text-xs text-[#4e6b68]">
              {isUr
                ? 'اپنی کلاس بنائیں، اسباق شائع کریں اور طلبہ کی کارکردگی دیکھیں۔'
                : 'Set up your classroom. Teachers can publish lessons, create quizzes, and monitor student performance.'}
            </p>
            <form onSubmit={handleCreateMadrasaSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'مدرسے کا نام *' : 'Madrasa Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isUr ? 'مثلاً دار النور اکیڈمی' : 'e.g. Dar-ul-Nur Academy'}
                  value={newMadrasaName}
                  onChange={(e) => setNewMadrasaName(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'اردو نام (اختیاری)' : 'Urdu Name (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="دار النور اکیڈمی"
                  value={newMadrasaNameUr}
                  onChange={(e) => setNewMadrasaNameUr(e.target.value)}
                  className="form-input text-xs"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'عمر کا گروپ' : 'Target Age Group'}
                </label>
                <select
                  value={newMadrasaAge}
                  onChange={(e) => setNewMadrasaAge(e.target.value as '5-8' | '9-11' | '12-15' | 'all')}
                  className="form-select text-xs"
                >
                  <option value="all">{isUr ? 'تمام عمریں (۵ تا ۱۵ سال)' : 'All Age Groups (5 to 15 Years)'}</option>
                  <option value="5-8">{isUr ? 'چھوٹے بچے (۵ تا ۸ سال)' : 'Early Learners (Ages 5 to 8)'}</option>
                  <option value="9-11">{isUr ? 'درمیانی عمر (۹ تا ۱۱ سال)' : 'Middle Explorers (Ages 9 to 11)'}</option>
                  <option value="12-15">{isUr ? 'نوجوان (۱۲ تا ۱۵ سال)' : 'Youth & Teens (Ages 12 to 15)'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'معلم / استاد کا نام' : "Teacher / Mu'allim Display Name"}
                </label>
                <input
                  type="text"
                  required
                  value={newMadrasaTeacherName}
                  onChange={(e) => setNewMadrasaTeacherName(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'شمولیت کوڈ (اختیاری)' : 'Custom Join Code (Optional, leave blank to auto-generate)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. NUR-786"
                  value={newMadrasaCode}
                  onChange={(e) => setNewMadrasaCode(e.target.value.toUpperCase())}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'تعارف اور مقاصد' : 'Description & Goals'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isUr ? 'نصاب اور تعلیمی مقاصد درج کریں...' : 'Describe the curriculum, topics, and objectives...'}
                  value={newMadrasaDesc}
                  onChange={(e) => setNewMadrasaDesc(e.target.value)}
                  className="form-textarea text-xs"
                />
              </div>
              <div className="flex justify-end gap-2.5 mt-2">
                <button type="button" className="btn-outline text-xs" onClick={() => setIsCreateMadrasaOpen(false)}>
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button type="submit" disabled={isSubmittingMadrasa} className="btn-gold text-xs">
                  {isSubmittingMadrasa
                    ? isUr
                      ? 'تیار ہو رہا ہے...'
                      : 'Creating...'
                    : isUr
                    ? 'مدرسہ بنائیں اور کوڈ حاصل کریں'
                    : 'Create Madrasa & Generate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENROLL IN MADRASA */}
      {isEnrollModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {isUr ? 'مدرسے میں شمولیت اختیار کریں' : 'Enroll in a Madrasa'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="m-0 mb-4 text-xs text-[#4e6b68]">
              {isUr
                ? 'اپنے استاد کا دیا ہوا شمولیت کوڈ درج کریں یا نیچے دیے گئے مدارس میں سے کسی ایک میں شامل ہوں:'
                : 'Enter the unique join code given to you by your teacher, or select from available study circles:'}
            </p>
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1">
                {isUr ? 'شمولیت کوڈ درج کریں' : 'Enter Join Code'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. NUR-786"
                  value={enrollJoinCode}
                  onChange={(e) => setEnrollJoinCode(e.target.value.toUpperCase())}
                  className="form-input uppercase font-bold tracking-wider text-xs"
                />
                <button
                  type="button"
                  disabled={isEnrolling}
                  onClick={() => handleEnrollWithCode()}
                  className="btn-primary text-xs"
                >
                  {isEnrolling
                    ? isUr
                      ? 'شمولیت جاری ہے...'
                      : 'Joining...'
                    : isUr
                    ? 'شامل ہوں'
                    : 'Join'}
                </button>
              </div>
            </div>

            <div className="border-t border-[#0f6b64]/15 pt-4">
              <div className="text-xs font-bold text-[#0f6b64] mb-2">
                {isUr ? 'یا موجودہ مدرسے میں ایک کلک سے شامل ہوں:' : 'Or 1-Click Join an Existing Madrasa:'}
              </div>
              <div className="flex flex-col gap-2">
                {madrasas.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-[#0f6b64]/15 bg-[#f8fbfb] flex items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#0a4a45]">{getMadrasaTitle(m)}</div>
                      <div className="text-xs text-[#4e6b68]">
                        {isUr ? 'کوڈ:' : 'Code:'} <strong>{m.code}</strong> · {isUr ? 'معلم:' : 'Teacher:'}{' '}
                        {getMadrasaTeacher(m)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-outline text-xs py-1 px-3"
                      onClick={() => handleEnrollWithCode(m.code)}
                    >
                      {isUr ? 'ابھی شامل ہوں' : 'Enroll Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AUTHOR LESSON */}
      {isCreateLessonOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {isUr ? 'نیا سبق لکھیں اور شائع کریں' : 'Author & Upload Lesson'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateLessonOpen(false)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLessonSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'سبق کا عنوان *' : 'Lesson Title (English) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isUr ? 'سبق کا عنوان درج کریں' : 'e.g. Importance of Taharah and Wudu in Daily Prayer'}
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'اردو عنوان (اختیاری)' : 'Lesson Title (Urdu, optional)'}
                </label>
                <input
                  type="text"
                  placeholder="طہارت اور وضو کی اہمیت"
                  value={lessonTitleUr}
                  onChange={(e) => setLessonTitleUr(e.target.value)}
                  className="form-input text-xs"
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">{isUr ? 'مضمون' : 'Subject'}</label>
                  <select
                    value={lessonSubject}
                    onChange={(e) =>
                      setLessonSubject(e.target.value as 'quran' | 'seerah' | 'akhlaq' | 'fiqh' | 'history')
                    }
                    className="form-select text-xs"
                  >
                    <option value="quran">{isUr ? 'قرآنی علوم' : 'Quranic Studies'}</option>
                    <option value="seerah">{isUr ? 'سیرت و حدیث' : 'Seerah & Hadith'}</option>
                    <option value="akhlaq">{isUr ? 'اسلامی اخلاق' : 'Daily Akhlaq'}</option>
                    <option value="fiqh">{isUr ? 'فقہ اور نماز' : 'Fiqh & Salah'}</option>
                    <option value="history">{isUr ? 'اسلامی تاریخ' : 'Islamic History'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isUr ? 'عمر کا گروپ' : 'Target Age'}</label>
                  <select
                    value={lessonAge}
                    onChange={(e) => setLessonAge(e.target.value as '5-8' | '9-11' | '12-15' | 'all')}
                    className="form-select text-xs"
                  >
                    <option value="all">{isUr ? 'تمام عمریں' : 'All Ages'}</option>
                    <option value="5-8">{isUr ? '۵ تا ۸ سال' : 'Ages 5-8'}</option>
                    <option value="9-11">{isUr ? '۹ تا ۱۱ سال' : 'Ages 9-11'}</option>
                    <option value="12-15">{isUr ? '۱۲ تا ۱۵ سال' : 'Ages 12-15'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isUr ? 'پوائنٹس انعام' : 'Points Reward'}</label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={lessonPoints}
                    onChange={(e) => setLessonPoints(Number(e.target.value))}
                    className="form-input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'قرآنی آیت یا حدیث (اختیاری)' : 'Arabic Text / Verse (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                  value={lessonArabic}
                  onChange={(e) => setLessonArabic(e.target.value)}
                  className="form-input text-xs"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'سبق کی مکمل تفصیل *' : 'Lesson Content / Body Text *'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    isUr
                      ? 'طلبہ کے لیے سبق کی وضاحت لکھیں...'
                      : 'Explain the lesson clearly for students to understand, reflect upon, and practice...'
                  }
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="form-textarea text-xs"
                />
              </div>
              <div className="flex justify-end gap-2.5 mt-2">
                <button type="button" className="btn-outline text-xs" onClick={() => setIsCreateLessonOpen(false)}>
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button type="submit" disabled={isSubmittingLesson} className="btn-primary text-xs">
                  {isSubmittingLesson
                    ? isUr
                      ? 'شائع ہو رہا ہے...'
                      : 'Publishing...'
                    : isUr
                    ? 'سبق شائع کریں'
                    : 'Publish Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE QUIZ */}
      {isCreateQuizOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {isUr ? 'نیا انٹرایکٹو کوئز بنائیں' : 'Create Custom Interactive Quiz'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateQuizOpen(false)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateQuizSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1">
                    {isUr ? 'کوئز کا عنوان *' : 'Quiz Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isUr ? 'مثلاً انبیاء اور صبر کوئز' : 'e.g. Prophets & Patience Quiz'}
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isUr ? 'مضمون' : 'Subject'}</label>
                  <input
                    type="text"
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{isUr ? 'پوائنٹس' : 'Points'}</label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={quizPoints}
                    onChange={(e) => setQuizPoints(Number(e.target.value))}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold text-[#0f6b64]">
                  {isUr ? `سوالات (${quizQuestions.length})` : `Questions (${quizQuestions.length})`}
                </div>
                {quizQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3.5 rounded-xl border border-[#0f6b64]/15 bg-[#0f6b64]/5"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-xs">
                        {isUr ? `سوال نمبر ${qIdx + 1}` : `Question ${qIdx + 1}`}
                      </span>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx));
                          }}
                          className="text-xs text-[#d96543] font-semibold cursor-pointer"
                        >
                          {isUr ? 'سوال حذف کریں' : 'Delete Question'}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={isUr ? 'سوال لکھیں...' : 'Type the question...'}
                      value={q.q}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuizQuestions((prev) =>
                          prev.map((item, i) => (i === qIdx ? { ...item, q: val } : item))
                        );
                      }}
                      className="form-input text-xs mb-2"
                    />
                    <div className="text-[11px] font-semibold text-[#4e6b68] mb-1">
                      {isUr
                        ? 'ممکنہ جوابات (درست جواب کے سامنے دائرہ منتخب کریں):'
                        : 'Options (Select the radio button for the correct answer):'}
                    </div>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 mb-1.5">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correct === optIdx}
                          onChange={() => {
                            setQuizQuestions((prev) =>
                              prev.map((item, i) => (i === qIdx ? { ...item, correct: optIdx } : item))
                            );
                          }}
                          className="accent-[#0f6b64] cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          placeholder={isUr ? `آپشن ${optIdx + 1}` : `Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuizQuestions((prev) =>
                              prev.map((item, i) =>
                                i === qIdx
                                  ? {
                                      ...item,
                                      options: item.options.map((o, oi) => (oi === optIdx ? val : o)),
                                    }
                                  : item
                              )
                            );
                          }}
                          className="form-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setQuizQuestions((prev) => [
                      ...prev,
                      {
                        q: '',
                        options: ['', '', ''],
                        correct: 0,
                        explanation: '',
                      },
                    ]);
                  }}
                  className="btn-outline self-start text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUr ? 'ایک اور سوال شامل کریں' : 'Add Another Question'}</span>
                </button>
              </div>

              <div className="flex justify-end gap-2.5 mt-2">
                <button type="button" className="btn-outline text-xs" onClick={() => setIsCreateQuizOpen(false)}>
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button type="submit" disabled={isSubmittingQuiz} className="btn-gold text-xs">
                  {isSubmittingQuiz
                    ? isUr
                      ? 'شائع ہو رہا ہے...'
                      : 'Publishing...'
                    : isUr
                    ? 'کوئز شائع کریں'
                    : 'Publish Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: AWARD STAR */}
      {isAwardStarOpen && starTargetStudent && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-lg font-bold text-[#0a4a45]">
                {isUr ? 'اعزازی اسٹار اور پوائنٹس دیں' : 'Award Star Recognition'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAwardStarOpen(false)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="m-0 mb-3.5 text-xs text-[#4e6b68]">
              {isUr ? (
                <>
                  <strong>{starTargetStudent.displayName}</strong> کی حوصلہ افزائی کے لیے پوائنٹس منتخب کریں۔
                </>
              ) : (
                <>
                  Award encouragement points directly to <strong>{starTargetStudent.displayName}</strong>.
                </>
              )}
            </p>
            <form onSubmit={handleAwardStarSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'پوائنٹس منتخب کریں' : 'Points to Award'}
                </label>
                <div className="flex gap-2">
                  {[10, 25, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStarPoints(val)}
                      className={`btn-outline flex-1 justify-center text-xs font-bold ${
                        starPoints === val ? 'active' : ''
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isUr ? 'حوصلہ افزائی کا پیغام / وجہ' : 'Teacher Note / Reason'}
                </label>
                <input
                  type="text"
                  required
                  value={starReason}
                  onChange={(e) => setStarReason(e.target.value)}
                  className="form-input text-xs"
                  placeholder={isUr ? 'مثلاً بہترین تلاوت اور کلاس میں توجہ' : 'e.g. Excellent recitation and classroom focus'}
                />
              </div>
              <div className="flex justify-end gap-2.5 mt-1.5">
                <button type="button" className="btn-outline text-xs" onClick={() => setIsAwardStarOpen(false)}>
                  {isUr ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button type="submit" className="btn-gold text-xs">
                  {isUr ? `+${starPoints} پوائنٹس دیں` : `Award +${starPoints} pts`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EXPANDED LESSON READER */}
      {expandedLesson && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box max-w-xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#0f6b64]/15 pb-2.5">
              <div>
                <span className="text-[11px] font-bold text-[#0f6b64] uppercase">
                  {isUr
                    ? `${SUBJECT_LABELS_UR[expandedLesson.subject] || expandedLesson.subject} · ${getMadrasaTitle(
                        activeMadrasa
                      )}`
                    : `${expandedLesson.subject} · ${activeMadrasa?.name}`}
                </span>
                <h3 className="m-0 mt-1 text-lg font-bold text-[#0a4a45]">{getLessonTitle(expandedLesson)}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedLesson(null)}
                className="btn-outline p-1.5 border-none"
                aria-label={isUr ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {expandedLesson.arabicVerse && (
              <div
                className="p-4 rounded-xl bg-[#0f6b64]/10 text-center text-xl font-bold text-[#0a4a45] my-3"
                dir="rtl"
              >
                {expandedLesson.arabicVerse}
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{getLessonContent(expandedLesson)}</p>
            <div className="mt-4 pt-3 border-t border-[#0f6b64]/15 flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {expandedLesson.arabicVerse && (
                  <button
                    type="button"
                    className={`btn-outline text-xs py-1.5 px-3 ${
                      activeVoiceId === `expanded_ar_${expandedLesson.id}` ? 'active' : ''
                    }`}
                    onClick={() =>
                      playVoiceClip({
                        id: `expanded_ar_${expandedLesson.id}`,
                        text: expandedLesson.arabicVerse!,
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
                      id: `expanded_meaning_${expandedLesson.id}`,
                      text: isUr
                        ? `${getLessonTitle(expandedLesson)}۔ ${getLessonContent(expandedLesson)}`
                        : `${expandedLesson.title}. ${expandedLesson.content}`,
                      lang: isUr ? 'ur' : 'en',
                    })
                  }
                >
                  {activeVoiceId === `expanded_meaning_${expandedLesson.id}` ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span>
                    {activeVoiceId === `expanded_meaning_${expandedLesson.id}`
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
                  handleCompleteLesson(expandedLesson);
                  setExpandedLesson(null);
                }}
              >
                {isUr
                  ? `سبق مکمل کریں (+${expandedLesson.points} پوائنٹس)`
                  : `Mark Lesson Complete (+${expandedLesson.points} pts)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: QUIZ STATISTICS MODAL */}
      {isStatsModalOpen && statsTargetStudent && (
        <QuizStatsModal
          student={statsTargetStudent}
          isOpen={isStatsModalOpen}
          onClose={() => {
            setIsStatsModalOpen(false);
            setStatsTargetStudent(null);
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
