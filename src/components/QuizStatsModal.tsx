import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  Award,
  CheckCircle,
  X,
  BookOpen,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { QuizAttempt, StoredUser } from '../../server';
import { SUBJECT_LABELS_UR, localizeUserName, localizeQuizTitle } from '../data/islamicContent';

interface QuizStatsModalProps {
  student: StoredUser | { id: string; displayName: string; username: string; ageGroup?: string; role?: string };
  isOpen: boolean;
  onClose: () => void;
  localAttempts?: QuizAttempt[];
  lang?: 'en' | 'ur' | 'ro';
}

interface CustomTooltipProps {
  active?: boolean;
  isUr?: boolean;
  payload?: Array<{
    payload: {
      quizTitle: string;
      subject: string;
      percentage: number;
      score: number;
      totalQuestions: number;
      pointsEarned: number;
      date: string;
    };
  }>;
}

function CustomBarTooltip({ active, payload, isUr }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0a4a45] text-white p-3 rounded-xl shadow-lg text-xs border border-[#d4952c] max-w-[260px]">
        <div className="font-bold text-sm mb-1 text-[#f7dfa4]">{data.quizTitle}</div>
        <div className="opacity-85 mb-1.5">
          {isUr ? SUBJECT_LABELS_UR[data.subject] || data.subject : data.subject}
        </div>
        <div className="flex justify-between gap-3 mb-0.5">
          <span>{isUr ? 'اسکور:' : 'Score:'}</span>
          <strong>
            {data.score} / {data.totalQuestions} ({data.percentage}%)
          </strong>
        </div>
        <div className="flex justify-between gap-3 mb-0.5">
          <span>{isUr ? 'پوائنٹس:' : 'Points Earned:'}</span>
          <strong className="text-[#d4952c]">
            +{data.pointsEarned} {isUr ? 'پوائنٹس' : 'pts'}
          </strong>
        </div>
        <div className="flex justify-between gap-3 opacity-75">
          <span>{isUr ? 'تاریخ:' : 'Date:'}</span>
          <span>{data.date}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function QuizStatsModal({
  student,
  isOpen,
  onClose,
  localAttempts = [],
  lang = 'en',
}: QuizStatsModalProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const isUr = lang === 'ur';

  useEffect(() => {
    if (!isOpen || !student?.id) return;
    setIsLoading(true);

    fetch(`/api/quiz-stats/${student.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stats');
        return res.json();
      })
      .then((data) => {
        if (data.attempts && Array.isArray(data.attempts)) {
          setAttempts(data.attempts);
        } else if (localAttempts.length > 0) {
          setAttempts(localAttempts.filter((a) => a.userId === student.id));
        }
      })
      .catch(() => {
        const matched = localAttempts.filter((a) => a.userId === student.id);
        setAttempts(matched);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, student?.id, localAttempts]);

  const stats = useMemo(() => {
    const total = attempts.length;
    if (total === 0) {
      return {
        totalAttempts: 0,
        avgPercentage: 0,
        highestPercentage: 0,
        perfectScores: 0,
        totalPointsEarned: 0,
      };
    }
    const sumPct = attempts.reduce((acc, a) => acc + a.percentage, 0);
    const avgPercentage = Math.round(sumPct / total);
    const highestPercentage = Math.max(...attempts.map((a) => a.percentage));
    const perfectScores = attempts.filter((a) => a.percentage === 100).length;
    const totalPointsEarned = attempts.reduce((acc, a) => acc + a.pointsEarned, 0);

    return {
      totalAttempts: total,
      avgPercentage,
      highestPercentage,
      perfectScores,
      totalPointsEarned,
    };
  }, [attempts]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    attempts.forEach((a) => {
      if (a.subject) set.add(a.subject);
    });
    return Array.from(set);
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    if (subjectFilter === 'all') return attempts;
    return attempts.filter((a) => a.subject === subjectFilter);
  }, [attempts, subjectFilter]);

  const chartData = useMemo(() => {
    return filteredAttempts.map((a, idx) => {
      const displayQuizTitle = localizeQuizTitle(a.quizTitle, isUr, a.quizId);
      const shortTitle =
        displayQuizTitle.length > 16 ? `${displayQuizTitle.slice(0, 14)}...` : displayQuizTitle;
      return {
        id: a.id,
        index: idx + 1,
        shortTitle,
        quizTitle: displayQuizTitle,
        subject: a.subject,
        percentage: a.percentage,
        score: a.score,
        totalQuestions: a.totalQuestions,
        pointsEarned: a.pointsEarned,
        date: a.date,
      };
    });
  }, [filteredAttempts, isUr]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="quiz-stats-title">
      <div className="modal-box max-w-3xl p-6 sm:p-7" dir={isUr ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0f6b64]/15 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f6b64]/12 text-[#0f6b64] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="quiz-stats-title" className="m-0 text-lg font-bold text-[#0a4a45]">
                {isUr ? 'کوئز کارکردگی اور شماریات' : 'Quiz Performance Statistics'}
              </h3>
              <div className="text-xs text-[#4e6b68] mt-0.5">
                {isUr ? 'طالب علم:' : 'Student:'}{' '}
                <strong>{localizeUserName(student.displayName, isUr)}</strong> (@{student.username}) ·{' '}
                {isUr ? `عمر ${student.ageGroup || '9-11'} سال` : `Ages ${student.ageGroup || '9-11'}`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline p-2 rounded-lg"
            aria-label={isUr ? 'بند کریں' : 'Close modal'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-10 px-5 text-[#4e6b68]">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-700" />
            <p className="text-sm m-0">
              {isUr ? 'کوئز کے نتائج لوڈ ہو رہے ہیں...' : 'Loading student quiz history...'}
            </p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-9 px-5 bg-[#f8fbfb] rounded-2xl border border-dashed border-[#0f6b64]/20">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <h4 className="m-0 mb-1.5 text-base font-bold">
              {isUr ? 'ابھی تک کوئی کوئز ریکارڈ نہیں' : 'No Quiz Records Yet'}
            </h4>
            <p className="m-0 text-xs text-[#4e6b68]">
              {isUr
                ? 'اس طالب علم نے ابھی تک کوئی کوئز مکمل نہیں کیا۔ کوئز مکمل ہونے کے بعد نتائج اور گراف یہاں ظاہر ہوں گے۔'
                : 'This student has not submitted any interactive quizzes yet. Once a quiz is completed, scores and analytical progress will appear here.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              <div className="bg-[#f8fbfb] border border-[#0f6b64]/15 rounded-xl p-3">
                <div className="text-xs text-[#4e6b68] flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-teal-700" />
                  <span>{isUr ? 'اوسط اسکور' : 'Average Score'}</span>
                </div>
                <div className="text-xl font-bold text-[#0a4a45] mt-1 tabular-nums">{stats.avgPercentage}%</div>
              </div>

              <div className="bg-[#f8fbfb] border border-[#0f6b64]/15 rounded-xl p-3">
                <div className="text-xs text-[#4e6b68] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isUr ? 'بہترین اسکور' : 'Highest Score'}</span>
                </div>
                <div className="text-xl font-bold text-[#107e54] mt-1 tabular-nums">{stats.highestPercentage}%</div>
              </div>

              <div className="bg-[#f8fbfb] border border-[#0f6b64]/15 rounded-xl p-3">
                <div className="text-xs text-[#4e6b68] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>{isUr ? 'مکمل کردہ کوئز' : 'Quizzes Taken'}</span>
                </div>
                <div className="text-xl font-bold text-[#183331] mt-1 tabular-nums">{stats.totalAttempts}</div>
              </div>

              <div className="bg-[#f8fbfb] border border-[#0f6b64]/15 rounded-xl p-3">
                <div className="text-xs text-[#4e6b68] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isUr ? 'مکمل ۱۰۰٪' : 'Perfect 100%'}</span>
                </div>
                <div className="text-xl font-bold text-[#d4952c] mt-1 tabular-nums">{stats.perfectScores}</div>
              </div>

              <div className="bg-[#f8fbfb] border border-[#0f6b64]/15 rounded-xl p-3">
                <div className="text-xs text-[#4e6b68] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-teal-700" />
                  <span>{isUr ? 'کل پوائنٹس' : 'Total Points'}</span>
                </div>
                <div className="text-xl font-bold text-[#0f6b64] mt-1 tabular-nums">{stats.totalPointsEarned}</div>
              </div>
            </div>

            {/* Chart Section Header with Subject Filter */}
            <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3">
              <div className="text-sm font-bold text-[#0a4a45]">
                {isUr ? 'کوئز اسکور گراف (فیصد اسکور)' : 'Quiz Score Trajectory (% Score per Quiz)'}
              </div>
              {availableSubjects.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-[#4e6b68]">{isUr ? 'مضمون:' : 'Subject:'}</span>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="form-select text-xs py-1 px-2.5 w-auto"
                  >
                    <option value="all">{isUr ? 'تمام مضامین' : 'All Subjects'}</option>
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {isUr ? SUBJECT_LABELS_UR[s] || s : s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Recharts Bar Chart */}
            <div className="bg-white border border-[#0f6b64]/15 rounded-2xl p-4 mb-5" dir="ltr">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 107, 100, 0.12)" vertical={false} />
                    <XAxis
                      dataKey="shortTitle"
                      tick={{ fill: '#4e6b68', fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fill: '#4e6b68', fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip content={<CustomBarTooltip isUr={isUr} />} />
                    <ReferenceLine
                      y={70}
                      stroke="#d4952c"
                      strokeDasharray="4 4"
                      label={{
                        value: isUr ? 'کامیابی کا معیار (70%)' : 'Passing Benchmark (70%)',
                        fill: '#d4952c',
                        fontSize: 11,
                        position: 'insideTopRight',
                      }}
                    />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {chartData.map((entry) => {
                        let fill = '#0f6b64';
                        if (entry.percentage < 70) fill = '#d96543';
                        else if (entry.percentage < 85) fill = '#d4952c';
                        return <Cell key={entry.id} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-[#4e6b68] mt-2 pt-2 border-t border-[#0f6b64]/15 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0f6b64]" />
                  <span>{isUr ? 'ممتاز (85% یا زائد)' : 'Mastery (≥85%)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#d4952c]" />
                  <span>{isUr ? 'بہتر (70% تا 84%)' : 'Proficient (70% - 84%)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#d96543]" />
                  <span>{isUr ? 'دہرانے کی ضرورت (<70%)' : 'Needs Review (<70%)'}</span>
                </div>
              </div>
            </div>

            {/* Historical Quiz Attempts Table */}
            <div className="mt-4">
              <h4 className="m-0 mb-2.5 text-sm font-bold text-[#0a4a45]">
                {isUr ? 'کوئز نتائج کی مکمل تفصیل' : 'Detailed Quiz Attempt History'}
              </h4>
              <div className="bg-white border border-[#0f6b64]/15 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="leaderboard-table w-full text-xs">
                    <thead>
                      <tr>
                        <th>{isUr ? 'تاریخ' : 'Date'}</th>
                        <th>{isUr ? 'کوئز کا عنوان' : 'Quiz Title'}</th>
                        <th>{isUr ? 'مضمون' : 'Subject'}</th>
                        <th className="text-right">{isUr ? 'نمبر' : 'Raw Score'}</th>
                        <th className="text-right">{isUr ? 'فیصد' : 'Percentage'}</th>
                        <th className="text-right">{isUr ? 'پوائنٹس' : 'Points'}</th>
                        <th className="text-center">{isUr ? 'نتیجہ' : 'Outcome'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttempts.map((attempt) => {
                        const isPassed = attempt.percentage >= 70;
                        return (
                          <tr key={attempt.id}>
                            <td className="text-[#4e6b68]">{attempt.date}</td>
                            <td className="font-semibold">
                              {localizeQuizTitle(attempt.quizTitle, isUr, attempt.quizId)}
                            </td>
                            <td className="text-[#4e6b68]">
                              {isUr ? SUBJECT_LABELS_UR[attempt.subject] || attempt.subject : attempt.subject}
                            </td>
                            <td className="text-right tabular-nums">
                              {attempt.score} / {attempt.totalQuestions}
                            </td>
                            <td
                              className={`text-right font-bold tabular-nums ${
                                attempt.percentage >= 85
                                  ? 'text-[#107e54]'
                                  : attempt.percentage >= 70
                                  ? 'text-[#d4952c]'
                                  : 'text-[#d96543]'
                              }`}
                            >
                              {attempt.percentage}%
                            </td>
                            <td className="text-right font-semibold text-[#0f6b64] tabular-nums">
                              +{attempt.pointsEarned} {isUr ? 'پوائنٹس' : 'pts'}
                            </td>
                            <td className="text-center">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                  isPassed ? 'text-[#107e54]' : 'text-[#d96543]'
                                }`}
                              >
                                {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                                {isPassed
                                  ? isUr
                                    ? 'کامیاب'
                                    : 'Passed'
                                  : isUr
                                  ? 'دہرائیں'
                                  : 'Needs Review'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-5">
          <button type="button" onClick={onClose} className="btn-primary">
            {isUr ? 'شماریات بند کریں' : 'Close Statistics'}
          </button>
        </div>
      </div>
    </div>
  );
}
