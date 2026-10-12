export interface ProphetProfile {
  id: string;
  nameEn: string;
  nameUr: string;
  arabicHonorific: string;
  titleEn: string;
  titleUr: string;
  era: string;
  eraUr: string;
  region: string;
  regionUr: string;
  quranMentions: number;
  emblemTitle: string;
  ageRelevance: {
    '5-8': string;
    '9-11': string;
    '12-15': string;
  };
  keyMiraclesEn: string[];
  keyMiraclesUr: string[];
  coreValues: string[];
  coreValuesUr: string[];
  summaryEn: string;
  summaryUr: string;
  fullAudioScriptEn: string;
  fullAudioScriptUr: string;
  chapters: Array<{
    titleEn: string;
    titleUr: string;
    textEn: string;
    textUr: string;
  }>;
  reflectionQuestion: string;
  reflectionQuestionUr: string;
  pointsReward: number;
}

export interface MoralStory {
  id: string;
  titleEn: string;
  titleUr: string;
  moralThemeEn: string;
  moralThemeUr: string;
  ageGroup: '5-8' | '9-11' | '12-15' | 'all';
  summaryEn: string;
  summaryUr: string;
  reflectionQuestionEn: string;
  reflectionQuestionUr: string;
  points: number;
}

export interface FoundationLesson {
  id: string;
  titleEn: string;
  titleUr: string;
  subject: 'quran' | 'seerah' | 'akhlaq' | 'fiqh' | 'history';
  ageGroup: '5-8' | '9-11' | '12-15' | 'all';
  arabicVerse: string;
  transliteration: string;
  translation: string;
  translationUr: string;
  contentEn: string;
  contentUr: string;
  points: number;
}

export const SUBJECT_LABELS_UR: Record<string, string> = {
  all: 'تمام مضامین',
  quran: 'قرآنی علوم',
  seerah: 'سیرت و حدیث',
  akhlaq: 'اسلامی اخلاق',
  fiqh: 'فقہ اور نماز',
  history: 'اسلامی تاریخ',
  'Quranic Studies': 'قرآنی علوم',
  'Seerah & Hadith': 'سیرت و حدیث',
  'Daily Akhlaq': 'روزمرہ کے اخلاق',
  'Fiqh & Salah': 'فقہ اور نماز',
  'Islamic Studies': 'اسلامی علوم',
};

export const AGE_GROUP_LABELS_UR: Record<string, string> = {
  all: 'تمام عمریں',
  '5-8': '۵ تا ۸ سال',
  '9-11': '۹ تا ۱۱ سال',
  '12-15': '۱۲ تا ۱۵ سال',
};

export const USER_NAME_UR_MAP: Record<string, string> = {
  'Ustadh Farooq Al-Azhari': 'استاذ فاروق الازہری',
  "Mu'allima Fatima Zahra": 'معلمہ فاطمہ زہرا',
  'Zayd Al-Mansoor': 'زید المنصور',
  'Ayesha Siddiqua': 'عائشہ صدیقہ',
  'Rayyan Ahmed': 'ریان احمد',
  'Maryam Khan': 'مریم خان',
  'Hamza Tariq': 'حمزہ طارق',
  'Guest Explorer (Not Logged In)': 'مہمان طالب علم',
};

export function localizeUserName(name: string, isUr: boolean): string {
  if (!isUr || !name) return name;
  return USER_NAME_UR_MAP[name] || name;
}

export const QUIZ_TITLE_UR_MAP: Record<string, string> = {
  'Surah Al-Fatiha Understanding': 'سورۃ الفاتحہ فہم و تدبر',
  'Surah Al-Fatiha Understanding Quiz': 'سورۃ الفاتحہ فہم و تدبر کوئز',
  'Prophets of Resilience & Patience': 'انبیاء کا صبر و استقامت',
  'Islamic Manners & Akhlaq': 'اسلامی آداب اور اخلاق',
  'Islamic Manners & Kindness': 'اسلامی آداب اور رحمدلی',
  'Islamic Manners & Kindness Quiz': 'اسلامی آداب اور رحمدلی کوئز',
  'Pillars of Salah & Conditions': 'نماز کے ارکان اور شرائط',
  'Essential Daily Supplications': 'روزمرہ کی مسنون دعائیں',
  'Character First (Al-Amin)': 'کردار کی عظمت (الامین)',
};

export function localizeQuizTitle(title: string, isUr: boolean, quizId?: string): string {
  if (!isUr || !title) return title;
  if (quizId && QUIZ_URDU_MAP[quizId]?.titleUr) {
    return QUIZ_URDU_MAP[quizId].titleUr;
  }
  return QUIZ_TITLE_UR_MAP[title] || title;
}

export const ACTIVITY_LABEL_UR_MAP: Record<string, string> = {
  'Completed Lesson: The Seven Keys of Surah Al-Fatiha':
    'سبق مکمل کیا: روزانہ نماز میں سورۃ الفاتحہ کی سات کنجیاں',
  'Completed Lesson: The Seven Keys of Surah Al-Fatiha in Daily Salah':
    'سبق مکمل کیا: روزانہ نماز میں سورۃ الفاتحہ کی سات کنجیاں',
  'Completed Lesson: Character First: How the Prophet (SAW) Earned Al-Amin':
    'سبق مکمل کیا: کردار کی عظمت (الامین)',
  'Completed Lesson: The Light of Taharah & Step-by-Step Wudu':
    'سبق مکمل کیا: طہارت کا نور اور وضو کا مسنون طریقہ',
  'Completed Lesson: Smiling is Charity': 'سبق مکمل کیا: مسکرانا بھی صدقہ ہے',
  'Completed Lesson: Smiling is Charity (Tabassumuka Sadaqah)':
    'سبق مکمل کیا: مسکرانا بھی صدقہ ہے',
  'Surah Al-Fatiha Understanding Quiz (3/3 100%)':
    'سورۃ الفاتحہ فہم و تدبر کوئز (۳/۳ ۱۰۰٪)',
  'Fajr & Dhuhr Prayers on Time': 'فجر اور ظہر کی نماز وقت پر ادا کی',
  'Fajr Prayer on Time': 'نمازِ فجر وقت پر ادا کی',
  'Fajr Prayer (2 Fard) on Time': 'نمازِ فجر (۲ فرض) وقت پر ادا کی',
  'Dhuhr Prayer (4 Fard) on Time': 'نمازِ ظہر (۴ فرض) وقت پر ادا کی',
  'Asr Prayer (4 Fard) on Time': 'نمازِ عصر (۴ فرض) وقت پر ادا کی',
  'Maghrib Prayer (3 Fard) on Time': 'نمازِ مغرب (۳ فرض) وقت پر ادا کی',
  'Isha Prayer (4 Fard) on Time': 'نمازِ عشاء (۴ فرض) وقت پر ادا کی',
  'Ustadh Farooq: Star Award for Beautiful Recitation':
    'استاذ فاروق: بہترین تلاوت پر اعزازی اسٹار',
  'Activated Iman Zikr Reminder': 'ذکرِ الٰہی یاد دہانی فعال کی',
};

export function localizeActivityLabel(label: string, isUr: boolean): string {
  if (!isUr || !label) return label;
  if (ACTIVITY_LABEL_UR_MAP[label]) return ACTIVITY_LABEL_UR_MAP[label];
  if (label.startsWith('Completed Lesson: ')) {
    const rest = label.replace('Completed Lesson: ', '');
    return `سبق مکمل کیا: ${rest}`;
  }
  if (label.startsWith('Read Moral Story: ')) {
    const rest = label.replace('Read Moral Story: ', '');
    const found = MORAL_STORIES.find((s) => s.titleEn === rest);
    return `کہانی مکمل کی: ${found ? found.titleUr : rest}`;
  }
  if (label.startsWith('Recited ')) {
    const rest = label.replace('Recited ', '');
    const found = NUR_DAILY_DUAS.find((d) => d.title.en === rest);
    return `دعا پڑھی: ${found ? found.title.ur : rest}`;
  }
  if (label.startsWith('Completed Intro: Step ')) {
    const stepNum = label.replace('Completed Intro: Step ', '');
    return `بنیادی مرحلہ ${stepNum} مکمل کیا`;
  }
  if (label.startsWith('Listened to ')) {
    return `قصص الانبیاء کی صوتی کہانی سنی`;
  }
  if (label.startsWith('Advanced Good Deeds:')) {
    return `نیک اعمال کے شجر کا مرحلہ آگے بڑھایا`;
  }
  return label;
}

// Complete Urdu translations for seeded Madrasas, Lessons, and Quizzes
export const MADRASA_URDU_MAP: Record<
  string,
  {
    nameUr: string;
    descriptionUr: string;
    teacherNameUr: string;
  }
> = {
  madrasa_noor_academy: {
    nameUr: 'دار النور اسلامک اکیڈمی',
    descriptionUr:
      'نوجوان طلبہ کے لیے فہمِ قرآن، سیرت النبی ﷺ، روزانہ کی نمازوں اور اعلیٰ اخلاق و کردار کی تربیت کا جامع تعلیمی حلقہ۔',
    teacherNameUr: 'استاذ فاروق الازہری',
  },
  madrasa_hikmah: {
    nameUr: 'بیت الحکمہ جونیئر سرکل',
    descriptionUr:
      'چھوٹے بچوں (۵ تا ۱۱ سال) کے لیے قصص الانبیاء، روزمرہ کے اسلامی آداب اور مسنون دعاؤں کا دلچسپ تعلیمی حلقہ۔',
    teacherNameUr: 'معلمہ فاطمہ زہرا',
  },
};

export const LESSON_URDU_MAP: Record<
  string,
  {
    titleUr: string;
    contentUr: string;
    translationUr: string;
  }
> = {
  les_fatiha_keys: {
    titleUr: 'روزانہ نماز میں سورۃ الفاتحہ کی سات کنجیاں',
    contentUr:
      'سورۃ الفاتحہ کو ام الکتاب (کتاب کی ماں) کہا جاتا ہے۔ ہم روزانہ اپنی فرض نمازوں میں کم از کم ۱۷ مرتبہ اس کی تلاوت کرتے ہیں۔ اس سبق میں ہم سیکھتے ہیں کہ اللہ تعالیٰ نے الرحمن الرحیم سے آغاز کیوں فرمایا اور "اہدنا الصراط المستقیم" کی دعا ہمیں اسکول، گھر اور دوستوں کے ساتھ ہر فیصلے میں سیدھے راستے کی رہنمائی کیسے دیتی ہے۔',
    translationUr: 'ہمیں سیدھے راستے کی ہدایت عطا فرما۔',
  },
  les_sadiq_amin: {
    titleUr: 'کردار کی عظمت: نبی کریم ﷺ کو الامین کا لقب کیسے ملا',
    contentUr:
      'اعلانِ نبوت سے پہلے بھی مکہ مکرمہ کا ہر شخص حضرت محمد مصطفیٰ ﷺ پر مکمل بھروسہ کرتا تھا کیونکہ آپ ﷺ نے زندگی بھر کبھی جھوٹ نہیں بولا۔ آپ کی کلاس، کھیل کے میدان اور خاندانی زندگی میں آپ کی سچائی اور امانت داری ہی آپ کی سب سے بڑی پہچان ہے۔',
    translationUr: 'اور بے شک آپ عظیم الشان اخلاق کے اعلیٰ مرتبے پر فائز ہیں۔',
  },
  les_wudu_purity: {
    titleUr: 'طہارت کا نور اور وضو کا مسنون طریقہ',
    contentUr:
      'پاکیزگی آدھا ایمان ہے۔ اللہ کے حضور نماز میں کھڑے ہونے سے پہلے ہم بسم اللہ پڑھ کر اپنے ہاتھ، منہ، ناک، چہرہ، بازو، سر کا مسح اور پاؤں دھو کر باوضو ہوتے ہیں۔ وضو کا ہر قطرہ چھوٹی خطاؤں کو دھو دیتا ہے اور دل و دماغ کو روحانی تازگی بخشتا ہے۔',
    translationUr: 'پاکیزگی آدھا ایمان ہے۔',
  },
  les_smile_charity: {
    titleUr: 'مسکرانا بھی صدقہ ہے (تبسمک صدقۃ)',
    contentUr:
      'نبی کریم ﷺ کے چہرہ مبارک پر ہمیشہ نرم اور پیاری مسکراہٹ ہوتی تھی۔ آپ ﷺ نے سکھایا کہ اگر آپ کے پاس دینے کے لیے کچھ نہ بھی ہو تب بھی کسی سے خندہ پیشانی اور مسکراہٹ کے ساتھ ملنا اللہ کے نزدیک ایک خوبصورت صدقہ ہے!',
    translationUr: 'اپنے بھائی سے مسکرا کر ملنا بھی تمہارے لیے صدقہ ہے۔',
  },
  les_parents_respect: {
    titleUr: 'والدین کا احترام اور باادب گفتگو',
    contentUr:
      'قرآن مجید میں اللہ تعالیٰ نے اپنی عبادت کے ساتھ ہی والدین کے ساتھ حسن سلوک کا حکم دیا ہے۔ امی ابو سے ہمیشہ نرمی، محبت اور احترام سے بات کرنا ہر مسلمان بچے کا فرض ہے۔',
    translationUr: 'اور ان دونوں سے ادب اور احترام کی بات کہو۔',
  },
  les_seeking_ilm: {
    titleUr: 'دینی و مفید علم کی فضیلت اور طلب',
    contentUr:
      'پہلی وحی کے لفظ "اقراء" (پڑھو!) سے لے کر کائنات کی سائنسی دریافتوں تک، سچی نیت سے مفید علم حاصل کرنا اسلام میں عظیم عبادت ہے۔',
    translationUr: 'علم حاصل کرنا ہر مسلمان پر فرض ہے۔',
  },
  les_good_manners_scale: {
    titleUr: 'میزان پر سب سے وزنی عمل: حسنِ اخلاق',
    contentUr:
      'نبی کریم ﷺ نے فرمایا کہ قیامت کے دن میزان پر سب سے وزنی چیز حسنِ اخلاق ہو گی۔ دوسروں کو معاف کرنا، سچ بولنا اور غصے پر قابو پانا پہاڑوں سے زیادہ وزنی نیکیاں ہیں۔',
    translationUr: 'مومن کے ترازو میں حسنِ اخلاق سے زیادہ وزنی کوئی چیز نہیں۔',
  },
  les_eating_manners: {
    titleUr: 'کھانے کے مسنون آداب اور شکر گزاری',
    contentUr:
      'کھانے سے پہلے ہاتھ دھونا، بسم اللہ پڑھنا، دائیں ہاتھ سے کھانا اور اختتام پر الحمد للہ کہہ کر اللہ کا شکر ادا کرنا مسنون اور بابرکت عادت ہے۔',
    translationUr: 'اے لڑکے! اللہ کا نام لے کر دائیں ہاتھ سے کھاؤ۔',
  },
  les_truth_honesty: {
    titleUr: 'سچائی نیکی اور سلامتی کا راستہ ہے',
    contentUr:
      'سچ بولنے سے دل کو سکون ملتا ہے، اللہ تعالیٰ کی رضا حاصل ہوتی ہے اور گھر و اسکول میں ہر کوئی آپ پر اعتماد کرتا ہے۔',
    translationUr: 'سچائی کو لازم پکڑو، کیونکہ سچائی نیکی کی طرف لے جاتی ہے۔',
  },
  les_kindness_creatures: {
    titleUr: 'جانوروں اور پرندوں پر رحم اور نگہبانی',
    contentUr:
      'پرندوں کو دانہ ڈالنا، پودوں کو پانی دینا اور جانوروں کے ساتھ نرمی کا برتاؤ کرنا اللہ تعالیٰ کے نزدیک انتہائی پسندیدہ عمل ہے۔',
    translationUr: 'زمین والوں پر رحم کرو، آسمان والا تم پر رحم کرے گا۔',
  },
};

export const QUIZ_URDU_MAP: Record<
  string,
  {
    titleUr: string;
    subjectUr: string;
    questionsUr: Array<{
      q: string;
      options: string[];
      explanation: string;
    }>;
  }
> = {
  quiz_fatiha_mastery: {
    titleUr: 'سورۃ الفاتحہ فہم و تدبر کوئز',
    subjectUr: 'قرآنی علوم',
    questionsUr: [
      {
        q: 'نبی کریم ﷺ نے سورۃ الفاتحہ کا دوسرا نام کیا بیان فرمایا ہے؟',
        options: ['ام الکتاب (کتاب کی اصل/ماں)', 'کھجوروں کا باغ', 'پہاڑی سفر'],
        explanation: 'نبی کریم ﷺ نے اسے ام الکتاب فرمایا کیونکہ اس میں پورے قرآن کا خلاصہ موجود ہے۔',
      },
      {
        q: '"اہدنا الصراط المستقیم" کا اردو ترجمہ کیا ہے؟',
        options: [
          'ہمیں سیدھے راستے کی ہدایت عطا فرما',
          'صحراؤں کے سفر میں ہماری مدد فرما',
          'بارش کی نعمتوں کو شمار کرو',
        ],
        explanation: 'یہ ہماری روزانہ کی دعا ہے جس میں ہم اللہ سے نیکی اور ہدایت کا سیدھا راستہ مانگتے ہیں۔',
      },
      {
        q: 'ہم روزانہ کی ۵ فرض نمازوں میں سورۃ الفاتحہ کم از کم کتنی بار پڑھتے ہیں؟',
        options: ['کم از کم ۱۷ مرتبہ', 'صرف ۳ مرتبہ', '۴۰ مرتبہ'],
        explanation: 'فجر (۲) + ظہر (۴) + عصر (۴) + مغرب (۳) + عشاء (۴) = کل ۱۷ رکعتیں۔',
      },
    ],
  },
  quiz_manners_1: {
    titleUr: 'اسلامی آداب اور رحمدلی کوئز',
    subjectUr: 'روزمرہ کے اخلاق',
    questionsUr: [
      {
        q: 'جب ہم کسی مسلمان بھائی، بہن یا بزرگ سے ملیں تو ہمیں کیا کہنا چاہیے؟',
        options: ['السلام علیکم (آپ پر سلامتی ہو)', 'خدا حافظ کہہ کر بھاگ جائیں', 'خاموش رہیں'],
        explanation: 'السلام علیکم کہنے سے آپس میں محبت اور سلامتی پھیلتی ہے۔',
      },
      {
        q: 'حدیث شریف کے مطابق کسی کے ساتھ محبت سے مسکرا کر پیش آنا کیا کہلاتا ہے؟',
        options: ['صدقہ (نیکی کا انعام)', 'اسکول کا ہوم ورک', 'کھیلوں کی ٹرافی'],
        explanation: 'نبی کریم ﷺ نے فرمایا: اپنے بھائی کے سامنے مسکرانا بھی صدقہ ہے۔',
      },
    ],
  },
};

export const PROPHET_PROFILES: ProphetProfile[] = [
  {
    id: 'adam',
    nameEn: 'Prophet Adam (AS)',
    nameUr: 'حضرت آدم علیہ السلام',
    arabicHonorific: 'عَلَيْهِ السَّلَامُ',
    titleEn: 'Abu al-Bashar (Father of Humankind)',
    titleUr: 'ابو البشر (انسانیت کے باپ)',
    era: 'The Dawn of Creation',
    eraUr: 'تخلیقِ کائنات کا آغاز',
    region: 'Jannah to Earth (Makkah & Arafat)',
    regionUr: 'جنت سے زمین تک (مکہ مکرمہ اور عرفات)',
    quranMentions: 25,
    emblemTitle: 'The Tree of Knowledge & First Clay',
    ageRelevance: {
      '5-8': 'Allah created Adam (AS) with love and taught him the names of everything in creation.',
      '9-11': 'Even when we make a mistake, turning back to Allah sincerely brings immediate forgiveness.',
      '12-15': 'Humanity was honored with intellect, free will, and stewardship (Khilafah) on Earth.',
    },
    keyMiraclesEn: [
      'Created directly by Allah without parents from varied earthly clay',
      'Taught the names and nature of all created things before the angels',
      'Received the first words of repentance (Dua of Adam) directly from Allah',
    ],
    keyMiraclesUr: [
      'اللہ تعالیٰ نے بغیر والدین کے مٹی سے تخلیق فرمایا',
      'فرشتوں کے سامنے تمام اشیاء کے ناموں اور حکمتوں کا علم عطا ہوا',
      'رب العالمین کی طرف سے توبہ کے کلمات سکھائے گئے',
    ],
    coreValues: ['Curiosity & Learning', 'Sincere Repentance', 'Earth Stewardship'],
    coreValuesUr: ['علم اور جستجو', 'سچی توبہ و عاجزی', 'زمین کی امانت و نگہبانی'],
    summaryEn:
      'Prophet Adam (AS) was the very first human being and the first Prophet of Islam. Allah honored him with deep knowledge of the world and taught humanity how to seek forgiveness with humility.',
    summaryUr:
      'حضرت آدم علیہ السلام پہلے انسان اور اسلام کے پہلے نبی تھے۔ اللہ نے انہیں کائنات کے علوم سے نوازا اور انسانیت کو عاجزی کے ساتھ توبہ کرنے کا طریقہ سکھایا۔',
    fullAudioScriptEn:
      'Peace be upon you, young explorer! Today we learn about Prophet Adam, peace be upon him, the very first human and the first Prophet of Allah. Long before cities or oceans had names, Allah shaped Adam from the rich soil of the Earth and breathed life into him. Allah gave Adam a special gift that even the angels admired: the gift of learning and knowing the names of all things, from stars and mountains to birds and trees. When Adam made a mistake, he turned immediately to Allah with humble repentance. Allah forgave him and appointed him a noble guide on Earth.',
    fullAudioScriptUr:
      'السلام علیکم پیارے بچو! آج ہم اللہ کے پہلے نبی اور پہلے انسان حضرت آدم علیہ السلام کی کہانی سنیں گے۔ اللہ تعالیٰ نے حضرت آدم کو زمین کی مٹی سے بنایا اور انہیں ہر چیز کے ناموں اور فائدوں کا علم سکھایا۔ جب ان سے بھول ہوئی تو انہوں نے فوراً اپنے رب سے معافی مانگی اور اللہ نے انہیں معاف کر کے زمین پر اپنا خلیفہ اور رہنما بنایا۔',
    chapters: [
      {
        titleEn: '1. The Gift of Names and Knowledge',
        titleUr: '۱۔ علم اور ناموں کا تحفہ',
        textEn:
          'Allah taught Prophet Adam (AS) the names and properties of everything in the universe. When the angels saw how much Adam knew, they recognized why humans were chosen as caretakers of the Earth.',
        textUr:
          'اللہ نے حضرت آدم علیہ السلام کو کائنات کی ہر چیز کے نام سکھائے۔ یہ علم انسان کی سب سے بڑی فضیلت ہے۔',
      },
      {
        titleEn: '2. Turning Mistakes into Forgiveness',
        titleUr: '۲۔ عاجزی اور سچی توبہ',
        textEn:
          'Unlike Iblis who was proud and arrogant, Prophet Adam (AS) immediately turned to Allah with sincere humility. His prayer in Surah Al-Araf remains our greatest example.',
        textUr:
          'ابلیس نے تکبر کیا لیکن حضرت آدم علیہ السلام نے عاجزی سے اپنے رب کے حضور دعا کی اور اللہ نے انہیں معاف فرما دیا۔',
      },
    ],
    reflectionQuestion:
      'What is one new skill or subject you learned this week that helps you care for the world around you?',
    reflectionQuestionUr:
      'اس ہفتے آپ نے کون سا نیا علم یا ہنر سیکھا جو آپ کو اپنے اردگرد کی دنیا کی بہتری میں مدد دیتا ہے؟',
    pointsReward: 25,
  },
  {
    id: 'nuh',
    nameEn: 'Prophet Nuh (AS)',
    nameUr: 'حضرت نوح علیہ السلام',
    arabicHonorific: 'عَلَيْهِ السَّلَامُ',
    titleEn: 'Shaykh al-Mursalin (The Patient Ark Builder)',
    titleUr: 'شیخ المرسلین (صبر اور کشتی والے نبی)',
    era: 'Ancient Mesopotamia (950 Years of Mission)',
    eraUr: 'قدیم میسوپوٹیمیا (۹۵۰ سالہ دعوتِ حق)',
    region: 'Mesopotamian Plains & Mount Judi',
    regionUr: 'وادیِ دجلہ و فرات اور کوہِ جودی',
    quranMentions: 43,
    emblemTitle: 'The Timber Ark & Olive Branch',
    ageRelevance: {
      '5-8': 'Prophet Nuh (AS) built a giant boat on dry land and saved pairs of animals with Allah’s help.',
      '9-11': 'Even when people laughed at him, Nuh (AS) stayed kind, patient, and never gave up his mission.',
      '12-15': 'Standing firm on truth for centuries shows how resilience and tawakkul overcome peer pressure.',
    },
    keyMiraclesEn: [
      'Preached with unshakable patience for 950 years',
      'Constructed the mighty Ark under Allah’s direct inspiration far from any sea',
      'The Ark sailed safely through towering waves and rested peacefully on Mount Judi',
    ],
    keyMiraclesUr: [
      'ساڑھے نو سو سال تک بے مثال صبر کے ساتھ اللہ کا پیغام پہنچایا',
      'اللہ کے حکم سے خشکی پر عظیم الشان کشتی تیار کی',
      'طوفان کی موجوں سے محفوظ رہ کر کشتی جودی پہاڑ پر ٹھہری',
    ],
    coreValues: ['Unshakeable Patience', 'Courage Against Ridicule', 'Gratitude in Every Moment'],
    coreValuesUr: ['بے مثال صبر و استقامت', 'مشکلات میں حوصلہ', 'ہر حال میں اللہ کا شکر'],
    summaryEn:
      'One of the five greatest Messengers (Ulul-Azm), Prophet Nuh (AS) invited his people to worship Allah alone for 950 years and built the Ark of salvation.',
    summaryUr:
      'حضرت نوح علیہ السلام نے ساڑھے نو سو سال تک اپنی قوم کو نیکی کی دعوت دی اور اللہ کے حکم سے نجات کی کشتی بنائی۔',
    fullAudioScriptEn:
      'Assalamu Alaikum! Let us journey back to the time of Prophet Nuh, peace be upon him. For 950 years, Nuh gently invited his people to worship Allah alone. When the leaders mocked him, Nuh never lost his temper. Then Allah commanded Nuh to build a massive wooden Ark right on dry land! Passersby laughed, yet Nuh hammered every plank with trust in Allah. When the great flood began, the believers and pairs of creatures were saved.',
    fullAudioScriptUr:
      'السلام علیکم! آج ہم حضرت نوح علیہ السلام کے صبر اور ہمت کا واقعہ سنیں گے۔ انہوں نے ساڑھے نو سو سال تک لوگوں کو ایک اللہ کی عبادت کی طرف بلایا۔ پھر اللہ کے حکم سے انہوں نے ایک بڑی کشتی بنائی جس میں ایمان والے اور جانوروں کے جوڑے محفوظ ہو گئے۔',
    chapters: [
      {
        titleEn: '1. Nine Centuries of Gentle Invitation',
        titleUr: '۱۔ صدیوں کا صبر اور دعوت',
        textEn:
          'Prophet Nuh (AS) never gave up on kindness, even when people refused to listen.',
        textUr:
          'حضرت نوح علیہ السلام نے کبھی ہمت نہیں ہاری اور ہمیشہ نرمی سے نصیحت کرتے رہے۔',
      },
      {
        titleEn: '2. Building the Ark of Trust',
        titleUr: '۲۔ توکل کی کشتی',
        textEn:
          'Building a ship in the middle of dry land required complete faith in Allah’s promise.',
        textUr:
          'خشک زمین پر کشتی بنانا اللہ کے وعدے پر کامل یقین کی علامت تھا۔',
      },
    ],
    reflectionQuestion:
      'When a project or task feels slow and difficult, how can Prophet Nuh’s patience inspire you to finish it?',
    reflectionQuestionUr:
      'جب کوئی کام مشکل یا طویل محسوس ہو تو حضرت نوح علیہ السلام کا صبر آپ کو اسے مکمل کرنے کا حوصلہ کیسے دیتا ہے؟',
    pointsReward: 25,
  },
  {
    id: 'ibrahim',
    nameEn: 'Prophet Ibrahim (AS)',
    nameUr: 'حضرت ابراہیم علیہ السلام',
    arabicHonorific: 'عَلَيْهِ السَّلَامُ',
    titleEn: 'Khalilullah (The Intimate Friend of Allah)',
    titleUr: 'خلیل اللہ (اللہ کے سچے دوست)',
    era: 'Ancient Ur & Canaan (~2000 BCE)',
    eraUr: 'قدیم بابل اور کنعان',
    region: 'Babylon, Palestine & Makkah',
    regionUr: 'بابل، فلسطین اور مکہ مکرمہ',
    quranMentions: 69,
    emblemTitle: 'The Sanctuary of Makkah & Cool Fire',
    ageRelevance: {
      '5-8': 'Allah made a blazing fire cool and peaceful like a garden for young Ibrahim (AS)!',
      '9-11': 'Ibrahim (AS) looked at the stars, moon, and sun using his mind to prove only the Creator deserves worship.',
      '12-15': 'Together with his son Ismail (AS), he raised the foundations of the Kaaba in Makkah.',
    },
    keyMiraclesEn: [
      'A roaring furnace became cool and safe (Bardan wa Salaman) by Allah’s command',
      'Built the sacred Kaaba in Makkah alongside his son Prophet Ismail (AS)',
      'Shown the miracle of how Allah restores life to birds across four mountain peaks',
    ],
    keyMiraclesUr: [
      'اللہ کے حکم سے دہکتی ہوئی آگ ٹھنڈی اور سلامتی والی بن گئی',
      'حضرت اسماعیل علیہ السلام کے ساتھ مل کر خانہ کعبہ کی تعمیر کی',
      'عقل و تدبر سے ستاروں اور سورج کے بجائے خالق حقیقی کی پہچان کرائی',
    ],
    coreValues: ['Critical Thinking', 'Wholehearted Hospitality', 'Unwavering Tawakkul'],
    coreValuesUr: ['غور و فکر اور تدبر', 'مہمان نوازی', 'اللہ پر کامل بھروسہ'],
    summaryEn:
      'Known as Khalilullah (Friend of Allah), Prophet Ibrahim (AS) used sharp reasoning in his youth to seek truth, stood bravely before King Nimrod, and built the Kaaba in Makkah.',
    summaryUr:
      'حضرت ابراہیم علیہ السلام کو خلیل اللہ کہا جاتا ہے۔ انہوں نے جوانی میں سچائی کی تلاش کی اور مکہ میں خانہ کعبہ کی بنیادیں اٹھائیں۔',
    fullAudioScriptEn:
      'Greetings of peace, young thinker! Today we meet Prophet Ibrahim, peace be upon him. Even as a youth in Babylon, Ibrahim asked big questions: stars, moon, and sun all set and fade away, but the Creator of the universe is eternal! When King Nimrod threw Ibrahim into a giant blazing fire, Ibrahim said: Hasbunallahu wa Ni’mal Wakeel (Allah is sufficient for us). Instantly Allah ordered the fire: O fire, be coolness and safety for Ibrahim!',
    fullAudioScriptUr:
      'السلام علیکم! حضرت ابراہیم علیہ السلام نے بچپن ہی سے غور و فکر کیا کہ چاند، تارے اور سورج تو ڈوب جاتے ہیں، اس لیے عبادت کے لائق صرف وہی اللہ ہے جس نے یہ سب بنایا۔ جب انہیں آگ میں ڈالا گیا تو اللہ کے حکم سے آگ پھولوں کی طرح ٹھنڈی اور محفوظ بن گئی۔',
    chapters: [
      {
        titleEn: '1. Thinking Deeply About Creation',
        titleUr: '۱۔ کائنات میں غور و فکر',
        textEn:
          'Ibrahim (AS) showed that anything that sets, changes, or needs help cannot be God.',
        textUr:
          'حضرت ابراہیم علیہ السلام نے ثابت کیا کہ ڈوبنے اور بدلنے والی چیزیں معبود نہیں ہو سکتیں۔',
      },
      {
        titleEn: '2. Raising the Foundations of the Kaaba',
        titleUr: '۲۔ خانہ کعبہ کی تعمیر',
        textEn:
          'With every stone placed in Makkah, Ibrahim and Ismail prayed: "Rabbana taqabbal minna" - Our Lord, accept this from us!',
        textUr:
          'کعبہ کی تعمیر کرتے ہوئے دونوں نے دعا کی: اے ہمارے رب! ہم سے یہ خدمت قبول فرما۔',
      },
    ],
    reflectionQuestion:
      'How does looking at the night sky or nature help you feel closer to the Creator, just like young Ibrahim (AS)?',
    reflectionQuestionUr:
      'رات کے آسمان یا قدرت کے نظاروں کو دیکھ کر آپ کو خالقِ کائنات کی عظمت کا احساس کیسے ہوتا ہے؟',
    pointsReward: 25,
  },
  {
    id: 'musa',
    nameEn: 'Prophet Musa (AS)',
    nameUr: 'حضرت موسیٰ علیہ السلام',
    arabicHonorific: 'عَلَيْهِ السَّلَامُ',
    titleEn: 'Kalimullah (The One Who Spoke With Allah)',
    titleUr: 'کلیم اللہ (اللہ سے ہم کلام ہونے والے نبی)',
    era: 'Ancient Egypt & Sinai (~1300 BCE)',
    eraUr: 'قدیم مصر اور وادیِ سینا',
    region: 'Nile River, Mount Sinai & Red Sea',
    regionUr: 'دریائے نیل، کوہِ طور اور بحیرہ احمر',
    quranMentions: 136,
    emblemTitle: 'The Wooden Staff & Parting Sea',
    ageRelevance: {
      '5-8': 'Baby Musa floated safely in a basket on the Nile, and later Allah parted the sea for him!',
      '9-11': 'When Musa (AS) felt nervous, he prayed "Rabbi-shrah li sadri" for confidence and clear speech.',
      '12-15': 'Mentioned 136 times in the Quran, Musa (AS) models standing up for the oppressed with courage.',
    },
    keyMiraclesEn: [
      'Spoke directly with Allah at Mount Sinai (Valley of Tuwa)',
      'Wooden staff transformed into a serpent and parted the Red Sea into safe paths',
      'Twelve springs of fresh water gushed from stone in the desert when struck by his staff',
    ],
    keyMiraclesUr: [
      'کوہِ طور پر اللہ تعالیٰ سے براہِ راست ہم کلامی کا شرف ملا',
      'عصائے موسیٰ کے معجزے سے سمندر میں محفوظ راستہ بن گیا',
      'صحرا میں پتھر سے بارہ چشمے جاری ہوئے',
    ],
    coreValues: ['Courage for Justice', 'Teamwork', 'Humility in Learning'],
    coreValuesUr: ['انصاف کے لیے جرات', 'مل جل کر کام کرنا', 'علم سیکھنے میں عاجزی'],
    summaryEn:
      'The most frequently mentioned Prophet in the Quran, Prophet Musa (AS) was protected by Allah as an infant and led his people to freedom across the parted sea.',
    summaryUr:
      'قرآن مجید میں سب سے زیادہ ذکر حضرت موسیٰ علیہ السلام کا آیا ہے۔ اللہ نے بچپن میں ان کی حفاظت فرمائی اور بنی اسرائیل کو ظلم سے نجات دلائی۔',
    fullAudioScriptEn:
      'Assalamu Alaikum! Did you know Prophet Musa is mentioned 136 times in the Quran? When he was a baby, his mother placed him in a basket on the Nile River, and Allah guided him safely into Pharaoh’s palace where Pharaoh’s kind wife protected him! When chosen to speak before Pharaoh, Musa prayed: Rabbi-shrah li sadri (My Lord, expand for me my chest and ease my task). Allah granted him courage and parted the Red Sea so the believers could walk across safely!',
    fullAudioScriptUr:
      'السلام علیکم! قرآن پاک میں حضرت موسیٰ علیہ السلام کا ذکر ایک سو چھتیس مرتبہ آیا ہے۔ جب وہ ننھے بچے تھے تو اللہ نے دریائے نیل کی موجوں میں ان کی حفاظت فرمائی اور بعد میں سمندر کے بیچ راستہ بنا کر انہیں اور ان کی قوم کو نجات عطا فرمائی۔',
    chapters: [
      {
        titleEn: '1. The Prayer for Confidence',
        titleUr: '۱۔ خود اعتمادی اور ہمت کی دعا',
        textEn:
          'Musa’s dua "Rabbi-shrah li sadri" calms our hearts before speaking in class or taking a test.',
        textUr:
          'رب اشرح لی صدری کی دعا امتحان اور گفتگو سے پہلے دل کو ہمت اور سکون دیتی ہے۔',
      },
      {
        titleEn: '2. "Indeed, My Lord is With Me"',
        titleUr: '۲۔ بے شک میرا رب میرے ساتھ ہے',
        textEn:
          'With the sea ahead and the army behind, Musa declared with total conviction: Never! My Lord will guide me.',
        textUr:
          'مشکل ترین گھڑی میں بھی حضرت موسیٰ علیہ السلام نے فرمایا: میرا رب میرے ساتھ ہے، وہ ضرور راستہ دکھائے گا۔',
      },
    ],
    reflectionQuestion:
      'Next time you feel nervous before a presentation or exam, how can Prophet Musa’s prayer help you?',
    reflectionQuestionUr:
      'جب آپ کسی امتحان یا تقریر سے پہلے گھبراہٹ محسوس کریں تو حضرت موسیٰ علیہ السلام کی دعا آپ کی کیسے مدد کر سکتی ہے؟',
    pointsReward: 25,
  },
  {
    id: 'muhammad',
    nameEn: 'Prophet Muhammad (SAW)',
    nameUr: 'حضرت محمد مصطفیٰ ﷺ',
    arabicHonorific: 'صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ',
    titleEn: 'Rahmatul-lil-Alamin (Mercy to All Worlds)',
    titleUr: 'رحمۃ للعالمین (تمام جہانوں کے لیے رحمت)',
    era: '570 CE - 632 CE (Makkah & Madinah)',
    eraUr: '۵۷۰ء تا ۶۳۲ء (مکہ مکرمہ اور مدینہ منورہ)',
    region: 'Hijaz (Makkah al-Mukarramah & Madinah al-Munawwarah)',
    regionUr: 'حجازِ مقدس (مکہ مکرمہ اور مدینہ منورہ)',
    quranMentions: 4,
    emblemTitle: 'The Radiant Lantern of Madinah',
    ageRelevance: {
      '5-8': 'He always greeted children first with Salam, smiled warmly, and cared gently for animals.',
      '9-11': 'Even before prophethood, everyone in Makkah called him Al-Sadiq (The Truthful) and Al-Amin (The Trustworthy).',
      '12-15': 'Sent as a Mercy to all worlds, he transformed society through character, justice, literacy, and compassion.',
    },
    keyMiraclesEn: [
      'The Living Miracle of the Noble Quran preserved word-for-word for all time',
      'Al-Isra wal-Miraj (The Night Journey to Jerusalem and Ascension through the Heavens)',
      'Water flowing from between his blessed fingers to quench hundreds of companions',
    ],
    keyMiraclesUr: [
      'قرآن مجید کا زندہ اور ابدی معجزہ جو قیامت تک محفوظ ہے',
      'اسراء اور معراج کا بابرکت سفر',
      'اعلیٰ اخلاق، سچائی اور تمام مخلوقات کے لیے رحمت',
    ],
    coreValues: ['Al-Sadiq & Al-Amin (Honesty)', 'Mercy to All Creation', 'Kindness to Children'],
    coreValuesUr: ['الصادق اور الامین (سچائی)', 'تمام مخلوق کے لیے رحمت', 'بچوں پر شفقت و محبت'],
    summaryEn:
      'The final Messenger of Allah, Prophet Muhammad (SAW) was sent as a mercy to all worlds. Known for his unmatched honesty, gentle smile, and kindness to children, he brought the eternal light of the Quran.',
    summaryUr:
      'اللہ کے آخری رسول حضرت محمد مصطفیٰ ﷺ کو تمام جہانوں کے لیے رحمت بنا کر بھیجا گیا۔ آپ ﷺ اپنی سچائی، امانت داری، مسکراہٹ اور بچوں سے شفقت کے لیے مشہور تھے۔',
    fullAudioScriptEn:
      'Assalamu Alaikum wa Rahmatullah! Welcome to the life of the final Messenger of Allah, Prophet Muhammad, peace and blessings be upon him. From his youth, he was known by all as Al-Sadiq, the Truthful, and Al-Amin, the Trustworthy. He smiled warmly, greeted children first with Assalamu Alaikum, and taught us that smiling at your brother is an act of charity. Following his Sunnah means telling the truth, caring for orphans and animals, and spreading peace everywhere!',
    fullAudioScriptUr:
      'السلام علیکم ورحمۃ اللہ! آج ہم خاتم النبیین حضرت محمد مصطفیٰ صلی اللہ علیہ وسلم کی سیرتِ طیبہ کے بارے میں جانیں گے۔ آپ ﷺ کو نبوت سے پہلے ہی الصادق اور الامین پکارا جاتا تھا۔ آپ ﷺ بچوں کو پہلے سلام کرتے، ہمیشہ مسکراتے اور ہر انسان و جانور کے ساتھ رحم کا برتاؤ فرماتے تھے۔',
    chapters: [
      {
        titleEn: '1. Truthfulness and Trustworthiness',
        titleUr: '۱۔ الصادق اور الامین',
        textEn:
          'Even his rivals trusted him with their valuables because he never spoke a single untruth.',
        textUr:
          'مکہ کے لوگ اپنی امانتیں آپ ﷺ کے پاس رکھواتے تھے کیونکہ آپ ﷺ نے کبھی جھوٹ نہیں بولا۔',
      },
      {
        titleEn: '2. Mercy and Love for Children',
        titleUr: '۲۔ بچوں سے محبت اور شفقت',
        textEn:
          'He taught that the best among you are those who are best to their families and communities.',
        textUr:
          'آپ ﷺ نے سکھایا کہ بہترین انسان وہ ہے جو اپنے گھر والوں اور معاشرے کے لیے سب سے اچھا ہو۔',
      },
    ],
    reflectionQuestion:
      'What is one Sunnah of Prophet Muhammad (SAW) you can practice today at home, school, or your study circle?',
    reflectionQuestionUr:
      'آج آپ اپنے گھر، اسکول یا مدرسے میں نبی کریم ﷺ کی کون سی سنت پر عمل کریں گے؟',
    pointsReward: 30,
  },
];

export const MORAL_STORIES: MoralStory[] = [
  {
    id: 'story_truthful_merchant',
    titleEn: 'The Honest Merchant & The Hidden Defect',
    titleUr: 'دیانت دار تاجر اور چھپا ہوا عیب',
    moralThemeEn: 'Honesty in Word & Action (Amanah)',
    moralThemeUr: 'سچائی اور امانت داری',
    ageGroup: 'all',
    summaryEn:
      'One day in Madinah, Prophet Muhammad (SAW) passed by a heap of grain in the marketplace. On the surface, the wheat looked dry and golden, but when he placed his hand inside, his fingers felt dampness. When he asked the seller why the wet grain was hidden underneath, the seller replied that rain had fallen on it. The Prophet (SAW) gently taught him that a believer always shows the truth openly and never conceals flaws from others. From that day forward, the merchant became known across the market for total transparency and earned immense barakah in his trade.',
    summaryUr:
      'مدینہ منورہ کے بازار میں نبی کریم ﷺ نے غلے کے ایک ڈھیر کو دیکھا جو اوپر سے خشک تھا مگر اندر سے بھیگا ہوا تھا۔ آپ ﷺ نے فرمایا کہ مومن کبھی دھوکہ نہیں دیتا اور ہر بات صاف اور سچی بتاتا ہے۔ اس تاجر نے سچائی کو اپنا شعار بنا لیا اور اللہ نے اس کے رزق میں بے پناہ برکت عطا فرمائی۔',
    reflectionQuestionEn:
      'When you make a mistake in schoolwork or at home, why is it better to be upfront right away rather than hiding it?',
    reflectionQuestionUr:
      'جب ہم سے کوئی غلطی ہو جائے تو اسے چھپانے کے بجائے سچ بتانا کیوں بہتر ہے؟',
    points: 25,
  },
  {
    id: 'story_thirsty_creature',
    titleEn: 'Kindness to Every Living Creature',
    titleUr: 'پیاسے جانور کے ساتھ رحمدلی',
    moralThemeEn: 'Mercy & Compassion (Rahmah)',
    moralThemeUr: 'مخلوقِ خدا پر رحم',
    ageGroup: '5-8',
    summaryEn:
      'A traveler was walking across a hot desert road when he became parched with thirst. He found a deep well, climbed down, drank cool water, and thanked Allah. When he climbed back up, he saw a panting dog licking the damp sand out of extreme thirst. The traveler said to himself, "This creature is suffering from the same thirst that I felt!" So he climbed back down into the well, filled his leather shoe with water, held it carefully, and gave the dog water until it was refreshed. Allah was so pleased with this quiet act of mercy that all his sins were forgiven.',
    summaryUr:
      'ایک مسافر نے صحرا میں کنویں سے پانی پیا۔ جب وہ باہر نکلا تو اس نے دیکھا کہ ایک کتا پیاس کی شدت سے گیلی مٹی چاٹ رہا ہے۔ مسافر کو اس پر ترس آیا، وہ دوبارہ کنویں میں اترا اور اپنے موزے میں پانی بھر کر کتے کو پلایا۔ اللہ تعالیٰ کو اس کی یہ رحمدلی اتنی پسند آئی کہ اس کی مغفرت فرما دی۔',
    reflectionQuestionEn:
      'Notice how the Sahabah asked: "Are we rewarded for kindness to animals?" and the Prophet (SAW) answered: "In serving every living creature there is a reward." How can you care for birds or animals near your home?',
    reflectionQuestionUr:
      'آپ اپنے گھر یا محلے میں پرندوں اور جانوروں کے لیے پانی یا دانے کا انتظام کیسے کر سکتے ہیں؟',
    points: 25,
  },
  {
    id: 'story_young_truth_pledge',
    titleEn: 'The Boy Who Kept His Mother’s Promise',
    titleUr: 'سچ بولنے کا وعدہ',
    moralThemeEn: 'Unwavering Truthfulness (Sidq)',
    moralThemeUr: 'ہمیشہ سچ بولنا',
    ageGroup: '9-11',
    summaryEn:
      'When young Abdul Qadir Jilani set out on a journey to seek knowledge in Baghdad, his mother stitched forty gold coins inside his coat and took a promise from him: "My son, never speak an untruth under any circumstance." Along the desert route, a band of horsemen stopped the caravan. One asked the young boy if he was carrying anything. Without hesitation, he replied, "Yes, I have forty gold coins sewn inside my coat." Amazed when the leader verified it, the leader asked why he revealed what was hidden. The boy answered, "I promised my mother I would never lie." Moved to tears by a child’s fear of Allah, the leader repented and returned everything to the travelers.',
    summaryUr:
      'ننھے عبدالقادر جیلانی جب علم حاصل کرنے کے لیے سفر پر روانہ ہوئے تو ان کی والدہ نے انہیں نصیحت کی کہ بیٹا کسی حال میں جھوٹ مت بولنا۔ راستے میں قافلے کو ڈاکوؤں نے روکا تو آپ نے سچ سچ بتا دیا کہ میرے پاس چالیس دینار سلے ہوئے ہیں۔ ایک بچے کی سچائی دیکھ کر ڈاکوؤں کے سردار کا دل بدل گیا اور اس نے سچی توبہ کر لی۔',
    reflectionQuestionEn:
      'How can one person’s honesty inspire an entire group of people to change for the better?',
    reflectionQuestionUr:
      'ایک انسان کی سچائی دوسرے لوگوں کے دلوں کو کیسے بدل سکتی ہے؟',
    points: 25,
  },
  {
    id: 'story_umar_night_care',
    titleEn: 'Serving the Community with Humility',
    titleUr: 'خلیفہ عمرؓ کی رات کی گشت اور خدمت',
    moralThemeEn: 'Leadership as Service & Empathy',
    moralThemeUr: 'عاجزی اور دوسروں کی مدد',
    ageGroup: '12-15',
    summaryEn:
      'Caliph Umar ibn Al-Khattab (RA) used to walk quietly through the streets of Madinah at night to make sure no family was hungry or in need. One chilly night, he noticed a tent where a mother had placed a pot of water and stones over a fire just to comfort her hungry children until they fell asleep. Immediately, Umar (RA) hurried to the storehouse, lifted a heavy sack of flour, oil, and dates onto his own back, refused to let his servant carry it for him, and cooked a warm meal for the children himself until they were laughing and full.',
    summaryUr:
      'امیر المومنین حضرت عمر فاروق رضی اللہ عنہ رات کو مدینہ کی گلیوں میں گشت فرماتے تھے تاکہ کسی ضرورت مند کی مدد کر سکیں۔ ایک رات انہوں نے بھوکے بچوں کو دیکھا تو خود اپنی پیٹھ پر آٹے کی بوری اٹھا کر لائے اور اپنے ہاتھ سے کھانا پکا کر بچوں کو کھلایا۔',
    reflectionQuestionEn:
      'True leadership in Islam means serving others personally with humility. What is one helpful action you can do for your family today without being asked?',
    reflectionQuestionUr:
      'آج آپ بغیر کہے اپنے گھر والوں کی کون سی مدد کر سکتے ہیں؟',
    points: 30,
  },
];

export const FOUNDATION_LESSONS: FoundationLesson[] = [
  {
    id: 'fnd_pillars_islam',
    titleEn: 'The Five Pillars of Islam: Our Spiritual Foundation',
    titleUr: 'اسلام کے پانچ ستون: ہمارے ایمان کی بنیاد',
    subject: 'fiqh',
    ageGroup: 'all',
    arabicVerse: 'بُنِيَ الإِسْلامُ عَلَى خَمْسٍ',
    transliteration: 'Buniya al-Islamu ‘ala khams',
    translation: 'Islam is built upon five pillars.',
    translationUr: 'اسلام کی بنیاد پانچ ستونوں پر رکھی گئی ہے۔',
    contentEn:
      'Just like a strong house stands on firm pillars, a Muslim’s life is supported by five beautiful acts of worship: (1) Shahadah — declaring with heart and tongue that there is no deity worthy of worship except Allah and Muhammad (SAW) is His Messenger; (2) Salah — praying five times daily; (3) Zakah — sharing wealth with those in need; (4) Sawm — fasting during the blessed month of Ramadan; and (5) Hajj — pilgrimage to the sacred House in Makkah for those who are able.',
    contentUr:
      'جس طرح ایک مضبوط عمارت ستونوں پر کھڑی ہوتی ہے، اسی طرح اسلام کی بنیاد پانچ چیزوں پر ہے: (۱) کلمہ شہادت — دل و زبان سے گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور حضرت محمد ﷺ اللہ کے رسول ہیں؛ (۲) نماز — روزانہ پانچ وقت کی نماز قائم کرنا؛ (۳) زکوٰۃ — ضرورت مندوں کی مدد کرنا؛ (۴) روزہ — ماہِ رمضان کے روزے رکھنا؛ اور (۵) حج — استطاعت ہو تو بیت اللہ کا حج کرنا۔',
    points: 40,
  },
  {
    id: 'fnd_surah_ikhlas',
    titleEn: 'Surah Al-Ikhlas: The Pure Oneness of Allah (Tawhid)',
    titleUr: 'سورۃ الاخلاص: اللہ کی خالص توحید',
    subject: 'quran',
    ageGroup: 'all',
    arabicVerse: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ',
    transliteration: 'Qul Huwallahu Ahad. Allahus-Samad.',
    translation: 'Say, "He is Allah, the One. Allah, the Eternal Refuge."',
    translationUr: 'کہہ دیجیے کہ وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔',
    contentEn:
      'Surah Al-Ikhlas holds the reward of one-third of the entire Quran! In just four short verses, it teaches us who our Creator is: Allah is One and Unique (Ahad), everyone and everything depends on Him while He needs nothing (As-Samad), He neither begets nor is born, and nothing in creation is comparable to Him.',
    contentUr:
      'سورۃ الاخلاص کو قرآن مجید کے ایک تہائی حصے کے برابر قرار دیا گیا ہے۔ یہ مختصر سورت ہمیں سکھاتی ہے کہ ہمارا خالق کون ہے: اللہ ایک اور یکتا ہے (احد)، کائنات کی ہر چیز اس کی محتاج ہے اور وہ کسی کا محتاج نہیں (الصمد)، نہ اس کی کوئی اولاد ہے اور نہ وہ کسی سے پیدا ہوا، اور کوئی اس کے برابر نہیں۔',
    points: 45,
  },
  {
    id: 'fnd_birr_walidayn',
    titleEn: 'Honoring Parents (Birr al-Walidayn) & Gentle Speech',
    titleUr: 'والدین کا احترام اور نرمی سے گفتگو',
    subject: 'akhlaq',
    ageGroup: 'all',
    arabicVerse: 'وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
    transliteration: 'Wa qul lahuma qawlan kareema',
    translation: 'And speak to them both a noble, respectful word.',
    translationUr: 'اور ان دونوں (والدین) سے ادب اور احترام کی بات کہو۔',
    contentEn:
      'In Surah Al-Isra, right after commanding us to worship Him alone, Allah commands us to show the highest excellence (Ihsan) to our parents. Even saying a word of annoyance like "Uff" is forbidden; instead, we lower the wing of humility out of mercy and pray for them every day.',
    contentUr:
      'قرآن مجید میں اللہ تعالیٰ نے اپنی عبادت کے فوراً بعد والدین کے ساتھ حسنِ سلوک کا حکم دیا ہے۔ والدین کے سامنے محبت اور عاجزی سے پیش آنا، ان کی بات توجہ سے سننا اور ان کے لیے روزانہ دعا کرنا ہر مسلمان بچے اور بڑے کا فرض ہے۔',
    points: 40,
  },
  {
    id: 'fnd_seeking_knowledge',
    titleEn: 'The Golden Age of Islamic Scholarship & Curiosity',
    titleUr: 'علم کی تلاش اور اسلامی تاریخ کے روشن ستارے',
    subject: 'history',
    ageGroup: '12-15',
    arabicVerse: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    transliteration: 'Talabul-‘ilmi faridatun ‘ala kulli Muslim',
    translation: 'Seeking knowledge is an obligation upon every Muslim.',
    translationUr: 'علم حاصل کرنا ہر مسلمان پر فرض ہے۔',
    contentEn:
      'Inspired by the first word revealed in the Quran — "Iqra" (Read!) — Muslim scholars built libraries like Bait al-Hikmah, pioneered optics (Ibn al-Haytham), algebra (Al-Khwarizmi), and medicine, while preserving Hadith and Tafsir. In Islam, studying both religious guidance and the natural sciences with good intention is an act of worship.',
    contentUr:
      'قرآن مجید کی پہلی وحی کے لفظ "اقراء" (پڑھو!) سے متاثر ہو کر مسلمان علماء اور سائنسدانوں نے بیت الحکمہ جیسی عظیم لائبریریاں قائم کیں، بصریات (ابن الہیثم)، الجبرا (الخوارزمی) اور طب میں گراں قدر خدمات انجام دیں۔ اسلام میں اچھی نیت سے دینی اور دنیاوی علم حاصل کرنا عبادت ہے۔',
    points: 45,
  },
];

export const DAILY_SALAH_LIST = [
  {
    id: 'fajr',
    iconType: 'sunrise' as const,
    en: 'Fajr Prayer (2 Fard)',
    ur: 'نمازِ فجر (۲ فرض)',
    ro: 'Fajr Namaz (2 Fard)',
    descEn: 'Dawn prayer before sunrise - brings light and energy to your whole day.',
    descUr: 'طلوعِ آفتاب سے پہلے کی نماز - پورے دن میں نور اور برکت لاتی ہے۔',
    descRo: 'Suraj nikalne se pehle - poore din ki hifazat aur barkat.',
    points: 30,
  },
  {
    id: 'dhuhr',
    iconType: 'sun' as const,
    en: 'Dhuhr Prayer (4 Fard)',
    ur: 'نمازِ ظہر (۴ فرض)',
    ro: 'Dhuhr Namaz (4 Fard)',
    descEn: 'Midday prayer - a peaceful spiritual pause during school and study hours.',
    descUr: 'دوپہر کی نماز - پڑھائی اور کام کے درمیان روحانی سکون کا لمحہ۔',
    descRo: 'Dopahar ki namaz - school aur kaam ke darmiyan sukoon.',
    points: 30,
  },
  {
    id: 'asr',
    iconType: 'cloud-sun' as const,
    en: 'Asr Prayer (4 Fard)',
    ur: 'نمازِ عصر (۴ فرض)',
    ro: 'Asr Namaz (4 Fard)',
    descEn: 'Late afternoon prayer - guards your focus and patience as daylight fades.',
    descUr: 'سہ پہر کی نماز - صبر اور توجہ کو مضبوط بناتی ہے۔',
    descRo: 'Sham se pehle ki namaz - sabr aur tawajjo barhati hai.',
    points: 30,
  },
  {
    id: 'maghrib',
    iconType: 'sunset' as const,
    en: 'Maghrib Prayer (3 Fard)',
    ur: 'نمازِ مغرب (۳ فرض)',
    ro: 'Maghrib Namaz (3 Fard)',
    descEn: 'Sunset prayer - expressing deep gratitude as night begins to fall.',
    descUr: 'غروبِ آفتاب کے بعد کی نماز - دن کے اختتام پر اللہ کا شکر۔',
    descRo: 'Suraj dhalne ke baad - din guzarne par Allah ka shukr.',
    points: 30,
  },
  {
    id: 'isha',
    iconType: 'moon' as const,
    en: 'Isha Prayer (4 Fard)',
    ur: 'نمازِ عشاء (۴ فرض)',
    ro: 'Isha Namaz (4 Fard)',
    descEn: 'Night prayer - resting your heart in peace and protection before sleep.',
    descUr: 'رات کی نماز - سونے سے پہلے دل کا سکون اور اللہ کی حفاظت۔',
    descRo: 'Raat ki namaz - sone se pehle sukoon aur hifazat.',
    points: 30,
  },
];

export const NUR_DAILY_DUAS = [
  {
    id: 'dua_ilm',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    translit: 'Rabbi zidni ilma',
    title: {
      en: 'Dua for Knowledge (Before Studying)',
      ur: 'علم میں اضافے کی دعا (پڑھائی سے پہلے)',
      ro: 'Ilm Mein Izafe Ki Dua (Parhai Se Pehle)',
    },
    meaning: {
      en: 'My Lord, increase me in beneficial knowledge!',
      ur: 'اے میرے رب! میرے علم اور سمجھ میں اضافہ فرما۔',
      ro: 'Aye mere Rab! Mere ilm aur samajh mein izafa farma.',
    },
    points: 20,
  },
  {
    id: 'dua_wake',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    translit: 'Al-hamdu lillahil-ladhi ahyana ba‘da ma amatana wa ilayhin-nushoor',
    title: {
      en: 'Dua When Waking Up',
      ur: 'صبح نیند سے جاگنے کی دعا',
      ro: 'Subah Neend Se Jagne Ki Dua',
    },
    meaning: {
      en: 'All praise is for Allah Who gave us life after having taken it, and unto Him is the return.',
      ur: 'سب تعریف اللہ کے لیے ہے جس نے ہمیں نیند کے بعد نئی زندگی عطا فرمائی۔',
      ro: 'Sab tareef Allah ke liye jisne humein neend ke baad nayi zindagi di.',
    },
    points: 20,
  },
  {
    id: 'dua_eat',
    arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    translit: 'Bismillahi wa ‘ala barakatillah',
    title: {
      en: 'Dua Before Eating',
      ur: 'کھانا کھانے سے پہلے کی دعا',
      ro: 'Khana Khane Se Pehle Ki Dua',
    },
    meaning: {
      en: 'In the Name of Allah and with the blessings of Allah.',
      ur: 'اللہ کے نام سے اور اللہ کی برکت پر کھانا شروع کرتا ہوں۔',
      ro: 'Allah ke naam se aur Allah ki barkat par shuru karta hoon.',
    },
    points: 20,
  },
  {
    id: 'dua_parents',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    translit: 'Rabbir-hamhuma kama rabbayani sagheera',
    title: {
      en: 'Dua for Parents (Ammi & Abbu)',
      ur: 'والدین (امی ابو) کے لیے دعا',
      ro: 'Walidain (Ammi Abbu) Ke Liye Dua',
    },
    meaning: {
      en: 'My Lord, have mercy upon them both as they brought me up when I was small.',
      ur: 'اے میرے رب! میرے والدین پر رحم فرما جیسے انہوں نے بچپن میں مجھے محبت سے پالا۔',
      ro: 'Aye mere Rab! Mere walidain par reham farma jaise unhone bachpan mein mujhe pala.',
    },
    points: 20,
  },
];

export const ZIKR_PHRASES = [
  'SubhanAllah (Glory be to Allah)',
  'Alhamdulillah (All Praise is for Allah)',
  'Allahu Akbar (Allah is the Greatest)',
  'La ilaha illallah (There is none worthy of worship but Allah)',
  'Astaghfirullah (I seek forgiveness from Allah)',
];

export const ZIKR_PHRASES_UR = [
  'سُبْحَانَ اللّٰهِ — اللہ ہر عیب سے پاک ہے',
  'الْحَمْدُ لِلّٰهِ — تمام تعریفیں اللہ کے لیے ہیں',
  'اللّٰهُ أَكْبَرُ — اللہ سب سے بڑا ہے',
  'لَا إِلٰهَ إِلَّا اللّٰهُ — اللہ کے سوا کوئی معبود نہیں',
  'أَسْتَغْفِرُ اللّٰهَ — میں اللہ سے بخشش مانگتا ہوں',
];
