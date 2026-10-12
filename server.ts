import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '4mb' }));

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

export interface StoredUser {
  id: string;
  username: string;
  displayName: string;
  role: 'student' | 'teacher';
  ageGroup: '5-8' | '9-11' | '12-15';
  enrolledMadrasas: string[];
  passcode: string;
  joinedAt: string;
}

export interface MadrasaLesson {
  id: string;
  madrasaId: string;
  title: string;
  titleUr?: string;
  subject: 'quran' | 'seerah' | 'akhlaq' | 'fiqh' | 'history';
  ageGroup: '5-8' | '9-11' | '12-15' | 'all';
  content: string;
  arabicVerse?: string;
  transliteration?: string;
  translation?: string;
  audioScript?: string;
  points: number;
  createdAt: string;
  createdBy: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface MadrasaQuiz {
  id: string;
  madrasaId: string;
  lessonId?: string;
  title: string;
  subject: string;
  points: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface Madrasa {
  id: string;
  name: string;
  nameUr?: string;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
  ageGroup: '5-8' | '9-11' | '12-15' | 'all';
  createdDate: string;
  studentIds: string[];
  lessons: MadrasaLesson[];
  quizzes: MadrasaQuiz[];
  announcements?: Array<{
    id: string;
    title: string;
    body: string;
    timestamp: string;
  }>;
}

export interface StoredActivity {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  ageGroup: '5-8' | '9-11' | '12-15';
  madrasaId?: string;
  date: string;
  category:
    | 'salah'
    | 'quran_quiz'
    | 'dua'
    | 'prophet_story'
    | 'intro_quest'
    | 'madrasa_lesson'
    | 'madrasa_quiz'
    | 'teacher_star';
  label: string;
  points: number;
  activityKey: string;
  timestamp: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  madrasaId?: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  pointsEarned: number;
  date: string;
  timestamp: string;
}

export interface DataStore {
  users: StoredUser[];
  madrasas: Madrasa[];
  activities: StoredActivity[];
  quizAttempts: QuizAttempt[];
}

function getOffsetDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createInitialQuizAttempts(): QuizAttempt[] {
  const today = getOffsetDateString(0);
  const yesterday = getOffsetDateString(-1);
  const twoDaysAgo = getOffsetDateString(-2);
  const threeDaysAgo = getOffsetDateString(-3);
  const fourDaysAgo = getOffsetDateString(-4);
  const fiveDaysAgo = getOffsetDateString(-5);

  return [
    {
      id: 'qa_aye_1',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_fatiha_mastery',
      quizTitle: 'Surah Al-Fatiha Understanding',
      subject: 'Quranic Studies',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 60,
      date: today,
      timestamp: `${today}T06:40:00.000Z`,
    },
    {
      id: 'qa_aye_2',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_patience',
      quizTitle: 'Prophets of Resilience & Patience',
      subject: 'Seerah & Hadith',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 60,
      date: yesterday,
      timestamp: `${yesterday}T14:15:00.000Z`,
    },
    {
      id: 'qa_aye_3',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_manners',
      quizTitle: 'Islamic Manners & Akhlaq',
      subject: 'Daily Akhlaq',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 50,
      date: twoDaysAgo,
      timestamp: `${twoDaysAgo}T11:20:00.000Z`,
    },
    {
      id: 'qa_aye_4',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_salah_pillars',
      quizTitle: 'Pillars of Salah & Conditions',
      subject: 'Fiqh & Salah',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      pointsEarned: 48,
      date: threeDaysAgo,
      timestamp: `${threeDaysAgo}T17:30:00.000Z`,
    },
    {
      id: 'qa_aye_5',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_daily_duas',
      quizTitle: 'Essential Daily Supplications',
      subject: 'Quranic Studies',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 60,
      date: fiveDaysAgo,
      timestamp: `${fiveDaysAgo}T09:00:00.000Z`,
    },
    {
      id: 'qa_zayd_1',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_fatiha_mastery',
      quizTitle: 'Surah Al-Fatiha Understanding',
      subject: 'Quranic Studies',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 60,
      date: today,
      timestamp: `${today}T08:15:00.000Z`,
    },
    {
      id: 'qa_zayd_2',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_patience',
      quizTitle: 'Prophets of Resilience & Patience',
      subject: 'Seerah & Hadith',
      score: 2,
      totalQuestions: 3,
      percentage: 67,
      pointsEarned: 40,
      date: yesterday,
      timestamp: `${yesterday}T15:10:00.000Z`,
    },
    {
      id: 'qa_zayd_3',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_manners',
      quizTitle: 'Islamic Manners & Akhlaq',
      subject: 'Daily Akhlaq',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 50,
      date: twoDaysAgo,
      timestamp: `${twoDaysAgo}T10:00:00.000Z`,
    },
    {
      id: 'qa_zayd_4',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_salah_pillars',
      quizTitle: 'Pillars of Salah & Conditions',
      subject: 'Fiqh & Salah',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      pointsEarned: 48,
      date: fourDaysAgo,
      timestamp: `${fourDaysAgo}T16:45:00.000Z`,
    },
    {
      id: 'qa_maryam_1',
      userId: 'usr_maryam',
      username: 'maryam_rose',
      displayName: 'Maryam Khan',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_fatiha_mastery',
      quizTitle: 'Surah Al-Fatiha Understanding',
      subject: 'Quranic Studies',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 60,
      date: today,
      timestamp: `${today}T09:20:00.000Z`,
    },
    {
      id: 'qa_maryam_2',
      userId: 'usr_maryam',
      username: 'maryam_rose',
      displayName: 'Maryam Khan',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_manners',
      quizTitle: 'Islamic Manners & Akhlaq',
      subject: 'Daily Akhlaq',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 50,
      date: yesterday,
      timestamp: `${yesterday}T13:40:00.000Z`,
    },
    {
      id: 'qa_hamza_1',
      userId: 'usr_hamza',
      username: 'hamza_lion',
      displayName: 'Hamza Tariq',
      madrasaId: 'madrasa_noor_academy',
      quizId: 'quiz_amin',
      quizTitle: 'Character First (Al-Amin)',
      subject: 'Seerah & Hadith',
      score: 3,
      totalQuestions: 3,
      percentage: 100,
      pointsEarned: 60,
      date: yesterday,
      timestamp: `${yesterday}T16:20:00.000Z`,
    },
    {
      id: 'qa_rayyan_1',
      userId: 'usr_rayyan',
      username: 'rayyan_star',
      displayName: 'Rayyan Ahmed',
      madrasaId: 'madrasa_hikmah',
      quizId: 'quiz_manners_1',
      quizTitle: 'Islamic Manners & Kindness',
      subject: 'Daily Akhlaq',
      score: 2,
      totalQuestions: 2,
      percentage: 100,
      pointsEarned: 40,
      date: today,
      timestamp: `${today}T10:30:00.000Z`,
    },
  ];
}

function createInitialSeedData(): DataStore {
  const today = getOffsetDateString(0);
  const yesterday = getOffsetDateString(-1);
  const twoDaysAgo = getOffsetDateString(-2);

  const users: StoredUser[] = [
    {
      id: 'usr_ustadh_farooq',
      username: 'ustadh_farooq',
      displayName: 'Ustadh Farooq Al-Azhari',
      role: 'teacher',
      ageGroup: '12-15',
      enrolledMadrasas: ['madrasa_noor_academy'],
      passcode: '1234',
      joinedAt: twoDaysAgo,
    },
    {
      id: 'usr_muallima_fatima',
      username: 'muallima_fatima',
      displayName: "Mu'allima Fatima Zahra",
      role: 'teacher',
      ageGroup: '9-11',
      enrolledMadrasas: ['madrasa_hikmah'],
      passcode: '1234',
      joinedAt: twoDaysAgo,
    },
    {
      id: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      role: 'student',
      ageGroup: '9-11',
      enrolledMadrasas: ['madrasa_noor_academy', 'madrasa_hikmah'],
      passcode: '1234',
      joinedAt: twoDaysAgo,
    },
    {
      id: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      role: 'student',
      ageGroup: '12-15',
      enrolledMadrasas: ['madrasa_noor_academy'],
      passcode: '1234',
      joinedAt: twoDaysAgo,
    },
    {
      id: 'usr_rayyan',
      username: 'rayyan_star',
      displayName: 'Rayyan Ahmed',
      role: 'student',
      ageGroup: '5-8',
      enrolledMadrasas: ['madrasa_hikmah'],
      passcode: '1234',
      joinedAt: yesterday,
    },
    {
      id: 'usr_maryam',
      username: 'maryam_rose',
      displayName: 'Maryam Khan',
      role: 'student',
      ageGroup: '9-11',
      enrolledMadrasas: ['madrasa_noor_academy'],
      passcode: '1234',
      joinedAt: twoDaysAgo,
    },
    {
      id: 'usr_hamza',
      username: 'hamza_lion',
      displayName: 'Hamza Tariq',
      role: 'student',
      ageGroup: '12-15',
      enrolledMadrasas: ['madrasa_noor_academy'],
      passcode: '1234',
      joinedAt: yesterday,
    },
  ];

  const madrasas: Madrasa[] = [
    {
      id: 'madrasa_noor_academy',
      name: 'Dar-ul-Nur Islamic Academy',
      nameUr: 'دار النور اسلامک اکیڈمی',
      code: 'NUR-786',
      description:
        'A comprehensive youth study circle focusing on Quranic understanding, Seerah morals, daily prayers, and character excellence for young Muslims.',
      teacherId: 'usr_ustadh_farooq',
      teacherName: 'Ustadh Farooq Al-Azhari',
      ageGroup: 'all',
      createdDate: twoDaysAgo,
      studentIds: ['usr_zayd', 'usr_ayesha', 'usr_maryam', 'usr_hamza'],
      lessons: [
        {
          id: 'les_fatiha_keys',
          madrasaId: 'madrasa_noor_academy',
          title: 'The Seven Keys of Surah Al-Fatiha in Daily Salah',
          titleUr: 'روزانہ نماز میں سورۃ الفاتحہ کی سات کنجیاں',
          subject: 'quran',
          ageGroup: 'all',
          content:
            'Surah Al-Fatiha is known as Umm al-Kitab (the Mother of the Book). Every day, we recite it at least 17 times in our obligatory prayers. In this lesson, we study why Allah begins with Ar-Rahman Ar-Rahim (The Entirely Merciful, The Especially Merciful) and how calling upon "Ihdinas-Sirat al-Mustaqeem" guides every decision we make in school and with friends.',
          arabicVerse: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
          transliteration: 'Ihdinas-sirat al-mustaqeem',
          translation: 'Guide us to the Straight Path.',
          audioScript:
            'Assalamu Alaikum dear students! In today’s lesson, Ustadh Farooq introduces the beauty of Surah Al-Fatiha. When you stand in prayer, remember you are speaking directly with your Creator. Asking for the Straight Path means asking for guidance in honesty, kindness, and knowledge.',
          points: 50,
          createdAt: twoDaysAgo,
          createdBy: 'Ustadh Farooq Al-Azhari',
        },
        {
          id: 'les_sadiq_amin',
          madrasaId: 'madrasa_noor_academy',
          title: 'Character First: How the Prophet (SAW) Earned Al-Amin',
          titleUr: 'کردار کی عظمت: نبی کریم ﷺ کو الامین کا لقب کیسے ملا',
          subject: 'seerah',
          ageGroup: '9-11',
          content:
            'Even before receiving Revelation, everyone in Makkah trusted Prophet Muhammad (SAW) because he never uttered a single untruth. In your classroom, sports team, and family life, your honesty is your greatest light.',
          arabicVerse: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
          transliteration: 'Wa innaka la‘ala khuluqin ‘adheem',
          translation: 'And indeed, you are of a great moral character.',
          points: 40,
          createdAt: yesterday,
          createdBy: 'Ustadh Farooq Al-Azhari',
        },
        {
          id: 'les_wudu_purity',
          madrasaId: 'madrasa_noor_academy',
          title: 'The Light of Taharah & Step-by-Step Wudu',
          titleUr: 'طہارت کا نور اور وضو کا مسنون طریقہ',
          subject: 'fiqh',
          ageGroup: 'all',
          content:
            'Purity (Taharah) is half of faith. Before we stand before Allah in Salah, we wash our hands, mouth, nose, face, arms, head, and feet with mindfulness. Every drop of water in Wudu washes away minor mistakes and brings spiritual freshness.',
          arabicVerse: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
          transliteration: 'At-tuhuru shatrul-iman',
          translation: 'Purity is half of faith.',
          points: 45,
          createdAt: yesterday,
          createdBy: 'Ustadh Farooq Al-Azhari',
        },
        {
          id: 'les_parents_respect',
          madrasaId: 'madrasa_noor_academy',
          title: 'Honoring Parents & Speaking with Gentleness',
          titleUr: 'والدین کا احترام اور باادب گفتگو',
          subject: 'akhlaq',
          ageGroup: 'all',
          content:
            'In Islam, honoring parents is commanded right alongside the worship of Allah. Treating mother and father with gentleness, gratitude, and patience brings peace into the home and the highest reward in Jannah.',
          arabicVerse: 'وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
          transliteration: 'Wa qul lahuma qawlan kareema',
          translation: 'And speak to them both a noble, respectful word.',
          points: 45,
          createdAt: yesterday,
          createdBy: 'Ustadh Farooq Al-Azhari',
        },
        {
          id: 'les_seeking_ilm',
          madrasaId: 'madrasa_noor_academy',
          title: 'The Value of Seeking Knowledge in Islam',
          titleUr: 'دینی و مفید علم کی فضیلت اور طلب',
          subject: 'history',
          ageGroup: '12-15',
          content:
            'From reading the first word of Revelation "Iqra" to exploring science, nature, and the universe, seeking beneficial knowledge with sincere intention is an act of worship in Islam.',
          arabicVerse: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
          transliteration: 'Talabul-‘ilmi faridatun ‘ala kulli Muslim',
          translation: 'Seeking knowledge is an obligation upon every Muslim.',
          points: 50,
          createdAt: yesterday,
          createdBy: 'Ustadh Farooq Al-Azhari',
        },
        {
          id: 'les_good_manners_scale',
          madrasaId: 'madrasa_noor_academy',
          title: 'The Heaviest Deed on the Scale: Good Character',
          titleUr: 'میزان پر سب سے وزنی عمل: حسنِ اخلاق',
          subject: 'akhlaq',
          ageGroup: '9-11',
          content:
            'A gentle greeting, speaking the truth, forgiving others, and controlling anger are deeds that outweigh vast mountains on the scale of deeds on the Day of Judgment.',
          arabicVerse: 'مَا مِنْ شَيْءٍ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ مِنْ حُسْنِ الْخُلُقِ',
          transliteration: 'Ma min shay’in athqalu fi mizani al-mu’mini min husnil-khuluq',
          translation: 'Nothing is heavier on the scale of a believer than good character.',
          points: 45,
          createdAt: yesterday,
          createdBy: 'Ustadh Farooq Al-Azhari',
        },
      ],
      quizzes: [
        {
          id: 'quiz_fatiha_mastery',
          madrasaId: 'madrasa_noor_academy',
          lessonId: 'les_fatiha_keys',
          title: 'Surah Al-Fatiha Understanding Quiz',
          subject: 'Quranic Studies',
          points: 60,
          createdAt: twoDaysAgo,
          questions: [
            {
              q: 'What is another name for Surah Al-Fatiha mentioned by the Prophet (SAW)?',
              options: ['Umm al-Kitab (Mother of the Book)', 'The Garden of Date Palms', 'The Mountain Journey'],
              correct: 0,
              explanation: 'The Prophet (SAW) called it Umm al-Kitab because it summarizes the entire Quran.',
            },
            {
              q: 'What does "Ihdinas-Sirat al-Mustaqeem" mean in English?',
              options: [
                'Guide us to the Straight Path',
                'Help us travel across deserts',
                'Count the blessings of rain',
              ],
              correct: 0,
              explanation: 'It is our daily supplication for moral and spiritual direction.',
            },
            {
              q: 'How many times do we recite Surah Al-Fatiha in the 5 daily Fard prayers?',
              options: ['17 times minimum', '3 times only', '40 times'],
              correct: 0,
              explanation: 'Fajr (2) + Dhuhr (4) + Asr (4) + Maghrib (3) + Isha (4) = 17 rakats total.',
            },
          ],
        },
      ],
      announcements: [
        {
          id: 'ann_1',
          title: 'Welcome to Dar-ul-Nur Academy!',
          body: 'All students are encouraged to complete the Surah Al-Fatiha lesson and log their 5 daily prayers.',
          timestamp: `${twoDaysAgo}T09:00:00.000Z`,
        },
      ],
    },
    {
      id: 'madrasa_hikmah',
      name: 'Bait-ul-Hikmah Junior Circle',
      nameUr: 'بیت الحکمہ جونیئر سرکل',
      code: 'HIKMAH-101',
      description:
        'A warm, interactive study circle for young children (Ages 5 to 11) focusing on Prophet Stories, everyday Islamic manners, and daily Duas.',
      teacherId: 'usr_muallima_fatima',
      teacherName: "Mu'allima Fatima Zahra",
      ageGroup: '5-8',
      createdDate: yesterday,
      studentIds: ['usr_zayd', 'usr_rayyan'],
      lessons: [
        {
          id: 'les_smile_charity',
          madrasaId: 'madrasa_hikmah',
          title: 'Smiling is Charity (Tabassumuka Sadaqah)',
          titleUr: 'مسکرانا بھی صدقہ ہے',
          subject: 'akhlaq',
          ageGroup: '5-8',
          content:
            'The Prophet (SAW) always had a warm smile on his face. He taught that even if you have nothing to give, meeting someone with a bright smile is recorded by Allah as a beautiful charity!',
          arabicVerse: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
          transliteration: 'Tabassumuka fi wajhi akhika laka sadaqah',
          translation: 'Your smiling in the face of your brother is charity.',
          points: 35,
          createdAt: yesterday,
          createdBy: "Mu'allima Fatima Zahra",
        },
        {
          id: 'les_eating_manners',
          madrasaId: 'madrasa_hikmah',
          title: 'Sunnah Manners of Eating & Gratitude',
          titleUr: 'کھانے کے مسنون آداب اور شکر گزاری',
          subject: 'akhlaq',
          ageGroup: '5-8',
          content:
            'Before eating, we wash our hands, say Bismillah, eat with the right hand from what is near us, and praise Allah with Alhamdulillah when finished.',
          arabicVerse: 'يَا غُلاَمُ سَمِّ اللَّهَ وَكُلْ بِيَمِينِكَ',
          transliteration: 'Ya ghulamu sammillaha wa kul bi-yameenik',
          translation: 'O young boy, mention the Name of Allah and eat with your right hand.',
          points: 35,
          createdAt: yesterday,
          createdBy: "Mu'allima Fatima Zahra",
        },
        {
          id: 'les_truth_honesty',
          madrasaId: 'madrasa_hikmah',
          title: 'Truthfulness Leads to Goodness & Peace',
          titleUr: 'سچائی نیکی اور سلامتی کا راستہ ہے',
          subject: 'akhlaq',
          ageGroup: '5-8',
          content:
            'Speaking the truth even when it feels difficult earns trust, protects our hearts, and brings the love of Allah and our family.',
          arabicVerse: 'عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ',
          transliteration: '‘Alaykum bis-sidqi fa-inna as-sidqa yahdi ilal-birr',
          translation: 'Hold firmly to truthfulness, for truthfulness leads to righteousness.',
          points: 40,
          createdAt: yesterday,
          createdBy: "Mu'allima Fatima Zahra",
        },
        {
          id: 'les_kindness_creatures',
          madrasaId: 'madrasa_hikmah',
          title: 'Caring for Animals and Nature',
          titleUr: 'جانوروں اور پرندوں پر رحم اور نگہبانی',
          subject: 'akhlaq',
          ageGroup: '5-8',
          content:
            'Feeding birds, watering plants, and being gentle with kittens and pets are quiet deeds beloved by Allah.',
          arabicVerse: 'ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
          transliteration: 'Irhamoo man fil-ardi yarhamkum man fis-samaa',
          translation: 'Have mercy upon those on Earth, and the One in the Heavens will have mercy upon you.',
          points: 40,
          createdAt: yesterday,
          createdBy: "Mu'allima Fatima Zahra",
        },
      ],
      quizzes: [
        {
          id: 'quiz_manners_1',
          madrasaId: 'madrasa_hikmah',
          lessonId: 'les_smile_charity',
          title: 'Islamic Manners & Kindness Quiz',
          subject: 'Daily Akhlaq',
          points: 40,
          createdAt: yesterday,
          questions: [
            {
              q: 'What should we say when we meet a Muslim brother, sister, or elder?',
              options: ['Assalamu Alaikum (Peace be upon you)', 'Goodbye and run', 'Stay quiet'],
              correct: 0,
              explanation: 'Saying Assalamu Alaikum spreads love and peace.',
            },
            {
              q: 'According to the Hadith, smiling at someone with kindness counts as what?',
              options: ['Sadaqah (Charity)', 'Homework', 'A sports trophy'],
              correct: 0,
              explanation: 'The Prophet (SAW) taught: Smiling in your brother’s face is charity.',
            },
          ],
        },
      ],
    },
  ];

  const activities: StoredActivity[] = [
    {
      id: 'act_1',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      ageGroup: '12-15',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'madrasa_lesson',
      label: 'Completed Lesson: The Seven Keys of Surah Al-Fatiha',
      points: 50,
      activityKey: 'madrasa_les_fatiha_keys',
      timestamp: `${today}T06:15:00.000Z`,
    },
    {
      id: 'act_2',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      ageGroup: '12-15',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'madrasa_quiz',
      label: 'Surah Al-Fatiha Understanding Quiz (3/3 100%)',
      points: 60,
      activityKey: 'madrasa_quiz_fatiha_mastery',
      timestamp: `${today}T06:40:00.000Z`,
    },
    {
      id: 'act_3',
      userId: 'usr_ayesha',
      username: 'ayesha_noor',
      displayName: 'Ayesha Siddiqua',
      ageGroup: '12-15',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'salah',
      label: 'Fajr & Dhuhr Prayers on Time',
      points: 60,
      activityKey: `salah_dhuhr_${today}`,
      timestamp: `${today}T12:35:00.000Z`,
    },
    {
      id: 'act_4',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      ageGroup: '9-11',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'madrasa_lesson',
      label: 'Completed Lesson: The Seven Keys of Surah Al-Fatiha',
      points: 50,
      activityKey: 'madrasa_les_fatiha_keys',
      timestamp: `${today}T07:10:00.000Z`,
    },
    {
      id: 'act_5',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      ageGroup: '9-11',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'salah',
      label: 'Fajr Prayer on Time',
      points: 30,
      activityKey: `salah_fajr_${today}`,
      timestamp: `${today}T05:30:00.000Z`,
    },
    {
      id: 'act_6',
      userId: 'usr_zayd',
      username: 'zayd_explorer',
      displayName: 'Zayd Al-Mansoor',
      ageGroup: '9-11',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'teacher_star',
      label: 'Ustadh Farooq: Star Award for Beautiful Recitation',
      points: 25,
      activityKey: `star_zayd_${today}`,
      timestamp: `${today}T08:00:00.000Z`,
    },
    {
      id: 'act_7',
      userId: 'usr_maryam',
      username: 'maryam_rose',
      displayName: 'Maryam Khan',
      ageGroup: '9-11',
      madrasaId: 'madrasa_noor_academy',
      date: today,
      category: 'madrasa_quiz',
      label: 'Surah Al-Fatiha Understanding Quiz (3/3 100%)',
      points: 60,
      activityKey: 'madrasa_quiz_fatiha_mastery',
      timestamp: `${today}T09:20:00.000Z`,
    },
    {
      id: 'act_8',
      userId: 'usr_rayyan',
      username: 'rayyan_star',
      displayName: 'Rayyan Ahmed',
      ageGroup: '5-8',
      madrasaId: 'madrasa_hikmah',
      date: today,
      category: 'madrasa_lesson',
      label: 'Completed Lesson: Smiling is Charity',
      points: 35,
      activityKey: 'madrasa_les_smile_charity',
      timestamp: `${today}T10:15:00.000Z`,
    },
  ];

  const quizAttempts = createInitialQuizAttempts();

  return { users, madrasas, activities, quizAttempts };
}

function readStore(): DataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const seed = createInitialSeedData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DataStore;
    if (!parsed.users || !parsed.madrasas || !parsed.activities) {
      const seed = createInitialSeedData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
    if (!parsed.quizAttempts || !Array.isArray(parsed.quizAttempts)) {
      parsed.quizAttempts = createInitialQuizAttempts();
      writeStore(parsed);
    }
    // Safeguard against duplicate lessons within madrasas
    if (Array.isArray(parsed.madrasas)) {
      let changed = false;
      for (const m of parsed.madrasas) {
        if (Array.isArray(m.lessons)) {
          const seen = new Set<string>();
          const dedupedLessons = [];
          for (const les of m.lessons) {
            if (!seen.has(les.id)) {
              seen.add(les.id);
              dedupedLessons.push(les);
            } else {
              changed = true;
            }
          }
          if (dedupedLessons.length !== m.lessons.length) {
            m.lessons = dedupedLessons;
          }
        }
      }
      if (changed) {
        writeStore(parsed);
      }
    }
    return parsed;
  } catch (err) {
    console.error('Error reading JSON store, initializing seed:', err);
    return createInitialSeedData();
  }
}

function writeStore(store: DataStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON store:', err);
  }
}

app.get('/api/state', (_req, res) => {
  const store = readStore();
  res.json(store);
});

app.post('/api/auth/login', (req, res) => {
  const { username, displayName, role, ageGroup, passcode, guestActivities } = req.body as {
    username?: string;
    displayName?: string;
    role?: 'student' | 'teacher';
    ageGroup?: '5-8' | '9-11' | '12-15';
    passcode?: string;
    guestActivities?: StoredActivity[];
  };

  const cleanUsername = (username || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 28);

  if (!cleanUsername || cleanUsername.length < 2) {
    res.status(400).json({ error: 'Please enter a valid username with at least 2 characters.' });
    return;
  }

  const cleanPasscode = (passcode || '1234').trim().slice(0, 20);
  const store = readStore();

  let user = store.users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (user) {
    if (user.passcode !== cleanPasscode) {
      res.status(401).json({
        error: 'Incorrect PIN/passcode for this username. Please try again.',
      });
      return;
    }
    if (displayName && displayName.trim()) {
      user.displayName = displayName.trim().slice(0, 40);
    }
    if (role) {
      user.role = role;
    }
    if (ageGroup) {
      user.ageGroup = ageGroup;
    }
  } else {
    const today = getOffsetDateString(0);
    user = {
      id: `usr_${crypto.randomBytes(5).toString('hex')}`,
      username: cleanUsername,
      displayName: (displayName || cleanUsername).trim().slice(0, 40),
      role: role || 'student',
      ageGroup: ageGroup || '9-11',
      enrolledMadrasas: ['madrasa_noor_academy'],
      passcode: cleanPasscode,
      joinedAt: today,
    };
    store.users.push(user);

    const defaultMadrasa = store.madrasas.find((m) => m.id === 'madrasa_noor_academy');
    if (defaultMadrasa && !defaultMadrasa.studentIds.includes(user.id)) {
      defaultMadrasa.studentIds.push(user.id);
    }
  }

  if (Array.isArray(guestActivities) && guestActivities.length > 0) {
    for (const ga of guestActivities) {
      if (!ga || !ga.activityKey || typeof ga.points !== 'number') continue;
      const alreadyExists = store.activities.some(
        (a) => a.userId === user!.id && a.activityKey === ga.activityKey && a.date === ga.date
      );
      if (!alreadyExists) {
        store.activities.unshift({
          id: `act_${crypto.randomBytes(5).toString('hex')}`,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          ageGroup: user.ageGroup,
          madrasaId: ga.madrasaId || 'madrasa_noor_academy',
          date: ga.date || getOffsetDateString(0),
          category: ga.category || 'intro_quest',
          label: String(ga.label || 'Completed Learning Activity').slice(0, 120),
          points: Math.min(Math.max(Number(ga.points) || 10, 1), 500),
          activityKey: String(ga.activityKey).slice(0, 80),
          timestamp: ga.timestamp || new Date().toISOString(),
        });
      }
    }
  }

  writeStore(store);
  res.json({ user, store });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { userId, role } = req.body as { userId?: string; role?: 'student' | 'teacher' };
  if (!userId || !role) {
    res.status(400).json({ error: 'User ID and Role are required.' });
    return;
  }
  const store = readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  user.role = role;
  writeStore(store);
  res.json({ user, store });
});

app.post('/api/madrasa/create', (req, res) => {
  const { name, nameUr, description, teacherId, teacherName, ageGroup, customCode } = req.body as {
    name?: string;
    nameUr?: string;
    description?: string;
    teacherId?: string;
    teacherName?: string;
    ageGroup?: '5-8' | '9-11' | '12-15' | 'all';
    customCode?: string;
  };

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Madrasa Name is required.' });
    return;
  }
  if (!teacherId || !teacherName) {
    res.status(400).json({ error: 'Teacher credentials required to create a Madrasa.' });
    return;
  }

  const store = readStore();
  let joinCode = (customCode || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!joinCode || joinCode.length < 4) {
    const slug = name.trim().slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'NUR');
    const rand = Math.floor(100 + Math.random() * 900);
    joinCode = `${slug}-${rand}`;
  }
  const existingWithCode = store.madrasas.find((m) => m.code.toUpperCase() === joinCode);
  if (existingWithCode) {
    joinCode = `${joinCode}-${Math.floor(10 + Math.random() * 90)}`;
  }

  const madrasaId = `madrasa_${crypto.randomBytes(4).toString('hex')}`;
  const newMadrasa: Madrasa = {
    id: madrasaId,
    name: name.trim().slice(0, 60),
    nameUr: nameUr?.trim()?.slice(0, 60),
    code: joinCode,
    description: (description || 'A dedicated Islamic learning circle.').trim().slice(0, 300),
    teacherId,
    teacherName: teacherName.trim().slice(0, 40),
    ageGroup: ageGroup || 'all',
    createdDate: getOffsetDateString(0),
    studentIds: [],
    lessons: [],
    quizzes: [],
    announcements: [
      {
        id: `ann_${Date.now()}`,
        title: `Welcome to ${name.trim()}!`,
        body: `Classroom created by ${teacherName}. Students can join using code: ${joinCode}`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  store.madrasas.unshift(newMadrasa);

  const teacher = store.users.find((u) => u.id === teacherId);
  if (teacher) {
    teacher.role = 'teacher';
    if (!teacher.enrolledMadrasas.includes(madrasaId)) {
      teacher.enrolledMadrasas.push(madrasaId);
    }
  }

  writeStore(store);
  res.json({ madrasa: newMadrasa, store });
});

app.post('/api/madrasa/enroll', (req, res) => {
  const { madrasaId, code, studentId, studentUsername } = req.body as {
    madrasaId?: string;
    code?: string;
    studentId?: string;
    studentUsername?: string;
  };

  const store = readStore();
  let targetMadrasa: Madrasa | undefined;

  if (madrasaId) {
    targetMadrasa = store.madrasas.find((m) => m.id === madrasaId);
  } else if (code) {
    const cleanCode = code.trim().toUpperCase();
    targetMadrasa = store.madrasas.find((m) => m.code.toUpperCase() === cleanCode);
  }

  if (!targetMadrasa) {
    res.status(404).json({ error: 'Madrasa not found. Please verify the Join Code.' });
    return;
  }

  let student = store.users.find(
    (u) =>
      (studentId && u.id === studentId) ||
      (studentUsername && u.username.toLowerCase() === studentUsername.trim().toLowerCase())
  );

  if (!student && studentUsername) {
    const cleanUsername = studentUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    student = {
      id: `usr_${crypto.randomBytes(5).toString('hex')}`,
      username: cleanUsername,
      displayName: cleanUsername.replace('_', ' '),
      role: 'student',
      ageGroup: targetMadrasa.ageGroup === 'all' ? '9-11' : targetMadrasa.ageGroup,
      enrolledMadrasas: [targetMadrasa.id],
      passcode: '1234',
      joinedAt: getOffsetDateString(0),
    };
    store.users.push(student);
  }

  if (!student) {
    res.status(404).json({ error: 'Student account not found.' });
    return;
  }

  if (!targetMadrasa.studentIds.includes(student.id)) {
    targetMadrasa.studentIds.push(student.id);
  }
  if (!student.enrolledMadrasas.includes(targetMadrasa.id)) {
    student.enrolledMadrasas.push(targetMadrasa.id);
  }

  const today = getOffsetDateString(0);
  store.activities.unshift({
    id: `act_${crypto.randomBytes(5).toString('hex')}`,
    userId: student.id,
    username: student.username,
    displayName: student.displayName,
    ageGroup: student.ageGroup,
    madrasaId: targetMadrasa.id,
    date: today,
    category: 'intro_quest',
    label: `Enrolled into Madrasa: ${targetMadrasa.name}`,
    points: 20,
    activityKey: `enroll_${targetMadrasa.id}_${student.id}`,
    timestamp: new Date().toISOString(),
  });

  writeStore(store);
  res.json({ success: true, madrasa: targetMadrasa, student, store });
});

app.post('/api/madrasa/lesson/create', (req, res) => {
  const {
    madrasaId,
    teacherId,
    title,
    titleUr,
    subject,
    ageGroup,
    content,
    arabicVerse,
    transliteration,
    translation,
    points,
  } = req.body as {
    madrasaId?: string;
    teacherId?: string;
    title?: string;
    titleUr?: string;
    subject?: 'quran' | 'seerah' | 'akhlaq' | 'fiqh' | 'history';
    ageGroup?: '5-8' | '9-11' | '12-15' | 'all';
    content?: string;
    arabicVerse?: string;
    transliteration?: string;
    translation?: string;
    points?: number;
  };

  if (!madrasaId || !title || !content) {
    res.status(400).json({ error: 'Madrasa ID, Lesson Title, and Lesson Content are required.' });
    return;
  }

  const store = readStore();
  const madrasa = store.madrasas.find((m) => m.id === madrasaId);
  if (!madrasa) {
    res.status(404).json({ error: 'Madrasa not found.' });
    return;
  }

  const teacher = store.users.find((u) => u.id === teacherId) || { displayName: madrasa.teacherName };

  const newLesson: MadrasaLesson = {
    id: `les_${crypto.randomBytes(4).toString('hex')}`,
    madrasaId,
    title: title.trim().slice(0, 100),
    titleUr: titleUr?.trim()?.slice(0, 100),
    subject: subject || 'quran',
    ageGroup: ageGroup || madrasa.ageGroup || 'all',
    content: content.trim(),
    arabicVerse: arabicVerse?.trim(),
    transliteration: transliteration?.trim(),
    translation: translation?.trim(),
    audioScript: `Lesson on ${title.trim()}. ${content.trim().slice(0, 300)}`,
    points: Math.min(Math.max(Number(points) || 40, 10), 200),
    createdAt: getOffsetDateString(0),
    createdBy: teacher.displayName,
  };

  madrasa.lessons.unshift(newLesson);
  writeStore(store);

  res.json({ lesson: newLesson, store });
});

app.post('/api/madrasa/quiz/create', (req, res) => {
  const { madrasaId, lessonId, title, subject, points, questions } = req.body as {
    madrasaId?: string;
    lessonId?: string;
    title?: string;
    subject?: string;
    points?: number;
    questions?: QuizQuestion[];
  };

  if (!madrasaId || !title || !Array.isArray(questions) || questions.length === 0) {
    res.status(400).json({ error: 'Madrasa ID, Quiz Title, and at least 1 Question are required.' });
    return;
  }

  const store = readStore();
  const madrasa = store.madrasas.find((m) => m.id === madrasaId);
  if (!madrasa) {
    res.status(404).json({ error: 'Madrasa not found.' });
    return;
  }

  const newQuiz: MadrasaQuiz = {
    id: `quiz_${crypto.randomBytes(4).toString('hex')}`,
    madrasaId,
    lessonId,
    title: title.trim().slice(0, 100),
    subject: subject || 'Islamic Studies',
    points: Math.min(Math.max(Number(points) || 60, 20), 300),
    questions: questions.map((q) => ({
      q: q.q.trim(),
      options: (q.options || []).map((o) => String(o).trim()).filter(Boolean),
      correct: Number(q.correct) || 0,
      explanation: q.explanation?.trim(),
    })),
    createdAt: getOffsetDateString(0),
  };

  madrasa.quizzes.unshift(newQuiz);
  writeStore(store);

  res.json({ quiz: newQuiz, store });
});

app.post('/api/quiz/record-attempt', (req, res) => {
  const { userId, madrasaId, quizId, quizTitle, subject, score, totalQuestions, pointsEarned } = req.body as {
    userId?: string;
    madrasaId?: string;
    quizId?: string;
    quizTitle?: string;
    subject?: string;
    score?: number;
    totalQuestions?: number;
    pointsEarned?: number;
  };

  if (!userId || !quizTitle || typeof score !== 'number' || typeof totalQuestions !== 'number') {
    res.status(400).json({ error: 'Missing required quiz attempt fields.' });
    return;
  }

  const store = readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  const safeTotal = Math.max(1, totalQuestions);
  const percentage = Math.round((Math.max(0, score) / safeTotal) * 100);
  const pts = typeof pointsEarned === 'number' ? pointsEarned : Math.round((percentage / 100) * 60);
  const today = getOffsetDateString(0);

  const attempt: QuizAttempt = {
    id: `qa_${crypto.randomBytes(5).toString('hex')}`,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    madrasaId: madrasaId || user.enrolledMadrasas[0] || 'madrasa_noor_academy',
    quizId: quizId || `quiz_${Date.now()}`,
    quizTitle: quizTitle.trim(),
    subject: subject || 'Islamic Studies',
    score,
    totalQuestions: safeTotal,
    percentage,
    pointsEarned: pts,
    date: today,
    timestamp: new Date().toISOString(),
  };

  store.quizAttempts.unshift(attempt);

  store.activities.unshift({
    id: `act_${crypto.randomBytes(5).toString('hex')}`,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    ageGroup: user.ageGroup,
    madrasaId: attempt.madrasaId,
    date: today,
    category: 'madrasa_quiz',
    label: `${attempt.quizTitle} Quiz (${score}/${safeTotal} - ${percentage}%)`,
    points: pts,
    activityKey: `quiz_${attempt.quizId}_${Date.now()}`,
    timestamp: attempt.timestamp,
  });

  writeStore(store);
  res.json({ success: true, attempt, store });
});

app.get('/api/quiz-stats/:userId', (req, res) => {
  const { userId } = req.params;
  const store = readStore();
  const student = store.users.find((u) => u.id === userId);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const attempts = store.quizAttempts
    .filter((a) => a.userId === userId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const totalAttempts = attempts.length;
  const avgPercentage =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
      : 0;
  const highestPercentage = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const perfectScores = attempts.filter((a) => a.percentage === 100).length;
  const totalPointsEarned = attempts.reduce((sum, a) => sum + a.pointsEarned, 0);

  res.json({
    student,
    attempts,
    stats: {
      totalAttempts,
      avgPercentage,
      highestPercentage,
      perfectScores,
      totalPointsEarned,
    },
  });
});

app.post('/api/madrasa/award-star', (req, res) => {
  const { madrasaId, teacherId, studentId, points, reason } = req.body as {
    madrasaId?: string;
    teacherId?: string;
    studentId?: string;
    points?: number;
    reason?: string;
  };

  if (!madrasaId || !studentId) {
    res.status(400).json({ error: 'Madrasa ID and Student ID are required.' });
    return;
  }

  const store = readStore();
  const madrasa = store.madrasas.find((m) => m.id === madrasaId);
  const student = store.users.find((u) => u.id === studentId);
  const teacher = store.users.find((u) => u.id === teacherId);

  if (!madrasa || !student) {
    res.status(404).json({ error: 'Madrasa or Student not found.' });
    return;
  }

  const pts = Math.min(Math.max(Number(points) || 25, 5), 100);
  const teacherLabel = teacher?.displayName || madrasa.teacherName;
  const reasonText = reason ? reason.trim().slice(0, 80) : 'Outstanding Participation';
  const today = getOffsetDateString(0);

  const newActivity: StoredActivity = {
    id: `act_${crypto.randomBytes(5).toString('hex')}`,
    userId: student.id,
    username: student.username,
    displayName: student.displayName,
    ageGroup: student.ageGroup,
    madrasaId: madrasa.id,
    date: today,
    category: 'teacher_star',
    label: `${teacherLabel} Recognition: ${reasonText}`,
    points: pts,
    activityKey: `star_${student.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  store.activities.unshift(newActivity);
  writeStore(store);

  res.json({ activity: newActivity, store });
});

app.post('/api/activity', (req, res) => {
  const { userId, madrasaId, date, category, label, points, activityKey } = req.body as {
    userId?: string;
    madrasaId?: string;
    date?: string;
    category?: StoredActivity['category'];
    label?: string;
    points?: number;
    activityKey?: string;
  };

  if (!userId || !activityKey || !label) {
    res.status(400).json({ error: 'Missing required activity fields.' });
    return;
  }

  const store = readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  const targetDate = date || getOffsetDateString(0);
  const existingIndex = store.activities.findIndex(
    (a) => a.userId === user.id && a.activityKey === activityKey && a.date === targetDate
  );

  if (existingIndex === -1) {
    const newActivity: StoredActivity = {
      id: `act_${crypto.randomBytes(5).toString('hex')}`,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      ageGroup: user.ageGroup,
      madrasaId: madrasaId || user.enrolledMadrasas[0] || 'madrasa_noor_academy',
      date: targetDate,
      category: category || 'intro_quest',
      label: String(label).slice(0, 120),
      points: Math.min(Math.max(Number(points) || 10, 1), 500),
      activityKey: String(activityKey).slice(0, 80),
      timestamp: new Date().toISOString(),
    };
    store.activities.unshift(newActivity);
    writeStore(store);
  }

  res.json({ store });
});

app.post('/api/activity/remove', (req, res) => {
  const { userId, date, activityKey } = req.body as {
    userId?: string;
    date?: string;
    activityKey?: string;
  };

  if (!userId || !activityKey) {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  const store = readStore();
  const targetDate = date || getOffsetDateString(0);
  store.activities = store.activities.filter(
    (a) => !(a.userId === userId && a.activityKey === activityKey && a.date === targetDate)
  );
  writeStore(store);
  res.json({ store });
});

const ttsCache = new Map<string, { data: string; mimeType: string }>();
const modelCooldownUntil = new Map<string, number>();

function ensurePlayableWavBase64(base64Data: string, sampleRate = 24000): string {
  const buf = Buffer.from(base64Data, 'base64');
  if (buf.length >= 4 && buf.toString('ascii', 0, 4) === 'RIFF') {
    return base64Data;
  }
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = buf.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, buf]).toString('base64');
}

function splitTextIntoChunks(text: string, maxLen = 170): string[] {
  const sentences = text
    .split(/(?<=[.!?۔؟\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      const words = sentence.split(/\s+/);
      for (const word of words) {
        if ((current + ' ' + word).trim().length > maxLen) {
          if (current) chunks.push(current.trim());
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
    } else if ((current + ' ' + sentence).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

async function synthesizeFallbackMp3(text: string, lang: 'en' | 'ur' | 'ar'): Promise<string> {
  const tl = lang === 'ur' ? 'ur' : lang === 'ar' ? 'ar' : 'en';
  const chunks = splitTextIntoChunks(text, 170);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(
      chunk
    )}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    if (!response.ok) {
      throw new Error(`Fallback TTS HTTP ${response.status}`);
    }
    const arrBuf = await response.arrayBuffer();
    buffers.push(Buffer.from(arrBuf));
  }

  return Buffer.concat(buffers).toString('base64');
}

app.post('/api/tts', async (req, res) => {
  try {
    const { text, lang, voiceName } = req.body as {
      text?: string;
      lang?: 'en' | 'ur' | 'ar';
      voiceName?: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';
    };

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Text is required for speech synthesis.' });
      return;
    }

    const targetLang: 'en' | 'ur' | 'ar' = lang === 'ur' ? 'ur' : lang === 'ar' ? 'ar' : 'en';
    const selectedVoice =
      voiceName || (targetLang === 'ur' ? 'Kore' : targetLang === 'ar' ? 'Charon' : 'Aoede');
    const cleanText = text.trim().slice(0, 2000);
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${targetLang}_${selectedVoice}_${cleanText}`)
      .digest('hex');

    if (ttsCache.has(cacheKey)) {
      const cachedItem = ttsCache.get(cacheKey)!;
      res.json({
        audioBase64: cachedItem.data,
        mimeType: cachedItem.mimeType,
        cached: true,
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let base64Audio: string | undefined;
    let mimeType = 'audio/wav';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const modelsToTry = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];
      const now = Date.now();

      for (const modelName of modelsToTry) {
        const cooldownUntil = modelCooldownUntil.get(modelName) || 0;
        if (now < cooldownUntil) {
          continue;
        }
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: cleanText,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: selectedVoice,
                  },
                },
              },
            },
          });

          const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            base64Audio = ensurePlayableWavBase64(inlineData.data, 24000);
            mimeType = 'audio/wav';
            break;
          }
        } catch (geminiErr) {
          const errMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
          if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
            // Put this model on cooldown for 15 minutes so subsequent requests don't hit 429
            modelCooldownUntil.set(modelName, Date.now() + 15 * 60 * 1000);
          }
        }
      }
    }

    // Guaranteed native Urdu / Arabic / English audio fallback if Gemini TTS is rate-limited (429) or unavailable
    if (!base64Audio) {
      base64Audio = await synthesizeFallbackMp3(cleanText, targetLang);
      mimeType = 'audio/mpeg';
    }

    if (ttsCache.size >= 100) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, { data: base64Audio, mimeType });

    res.json({
      audioBase64: base64Audio,
      mimeType,
      cached: false,
    });
  } catch {
    res.status(200).json({
      audioBase64: '',
      mimeType: 'audio/mpeg',
      fallbackBrowser: true,
    });
  }
});

async function startServer() {
  readStore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nur Duniya server running on http://localhost:${PORT}`);
  });
}

startServer();
