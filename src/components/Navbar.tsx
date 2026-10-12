import React, { useState } from 'react';
import {
  Home,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Volume2,
  Compass,
  TrendingUp,
  Trophy,
  BarChart2,
  UserCheck,
  Award,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
} from 'lucide-react';
import { StoredUser } from '../../server';
import { localizeUserName } from '../data/islamicContent';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  lang: 'en' | 'ur' | 'ro';
  onSetLang: (lang: 'en' | 'ur' | 'ro') => void;
  currentUser: StoredUser | null;
  myTotalPoints: number;
  onToggleRole: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenStats: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  lang,
  onSetLang,
  currentUser,
  myTotalPoints,
  onToggleRole,
  onOpenLogin,
  onLogout,
  onOpenStats,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isUr = lang === 'ur';

  const navLinks = [
    { id: 'home', label: 'Home', labelUr: 'مرکزی صفحہ', icon: Home },
    { id: 'madrasa', label: 'Madrasa Hub', labelUr: 'مدرسہ ہب', icon: GraduationCap },
    { id: 'lessons', label: 'Lessons', labelUr: 'اسباق', icon: BookOpen },
    { id: 'prophets', label: 'Stories & Prophets', labelUr: 'قصص الانبیاء و کہانیاں', icon: Volume2 },
    { id: 'quizzes', label: 'Quizzes', labelUr: 'کوئز', icon: HelpCircle },
    { id: 'salah_dua', label: 'Salah & Duas', labelUr: 'نماز اور دعائیں', icon: Compass },
    { id: 'iman_tree', label: 'Deeds Tracker', labelUr: 'نیک اعمال', icon: TrendingUp },
    { id: 'leaderboard', label: 'Leaderboard', labelUr: 'لیڈر بورڈ', icon: Trophy },
  ];

  const desktopLinks = navLinks.slice(0, 6);

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#0f6b64]/15 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* ZONE 1: BRAND WORDMARK */}
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className="text-left cursor-pointer shrink-0 select-none focus:outline-hidden group"
            aria-label={isUr ? 'نور دنیا مرکزی صفحہ' : 'Nur Duniya Home'}
          >
            <span className="brand-font font-extrabold text-2xl tracking-tight text-[#0a4a45] group-hover:text-[#0f6b64] transition-colors whitespace-nowrap">
              {isUr ? 'نور دنیا' : 'Nur Duniya'}
            </span>
          </button>

          {/* ZONE 2: PRIMARY NAVIGATION LINKS (Desktop) */}
          <nav
            className="hidden lg:flex items-center gap-5 overflow-x-auto"
            aria-label={isUr ? 'بنیادی نیویگیشن' : 'Primary Navigation'}
          >
            {desktopLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link.id)}
                  className={`py-2 text-sm font-semibold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                    isActive
                      ? 'text-[#0a4a45] border-[#0f6b64]'
                      : 'text-[#4e6b68] border-transparent hover:text-[#0a4a45] hover:border-[#0f6b64]/40'
                  }`}
                >
                  {isUr ? link.labelUr : link.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleLinkClick('leaderboard')}
              className={`hidden xl:inline-block py-2 text-sm font-semibold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                currentView === 'leaderboard'
                  ? 'text-[#0a4a45] border-[#0f6b64]'
                  : 'text-[#4e6b68] border-transparent hover:text-[#0a4a45] hover:border-[#0f6b64]/40'
              }`}
            >
              {isUr ? 'لیڈر بورڈ' : 'Leaderboard'}
            </button>
          </nav>

          {/* ZONE 3: ACTIONS & USER PROFILE (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center p-0.5 bg-[#faf6ee] rounded-lg border border-[#0f6b64]/20">
              <button
                type="button"
                onClick={() => onSetLang('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  lang === 'en'
                    ? 'bg-[#0f6b64] text-white shadow-2xs'
                    : 'text-[#4e6b68] hover:text-[#0a4a45]'
                }`}
                title={isUr ? 'انگریزی زبان منتخب کریں' : 'Switch to English'}
              >
                {isUr ? 'انگریزی' : 'EN'}
              </button>
              <button
                type="button"
                onClick={() => onSetLang('ur')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  lang === 'ur'
                    ? 'bg-[#0f6b64] text-white shadow-2xs'
                    : 'text-[#4e6b68] hover:text-[#0a4a45]'
                }`}
                title="اردو میں تبدیل کریں"
              >
                اردو
              </button>
            </div>

            {/* Points & Leaderboard Trigger */}
            <button
              type="button"
              onClick={() => handleLinkClick('leaderboard')}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#faf6ee] border border-[#d4952c]/50 text-[#0a4a45] inline-flex items-center gap-1.5 hover:bg-[#f4ede0] transition-colors cursor-pointer whitespace-nowrap"
              title={isUr ? 'پوائنٹس اور لیڈر بورڈ دیکھیں' : 'View Points & Leaderboard'}
            >
              <Award className="w-3.5 h-3.5 text-[#d4952c]" />
              <span className="tabular-nums">
                {myTotalPoints} {isUr ? 'پوائنٹس' : 'pts'}
              </span>
            </button>

            {/* Account Profile or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0f6b64]/10 text-[#0a4a45] border border-[#0f6b64]/25 inline-flex items-center gap-1.5 hover:bg-[#0f6b64]/15 transition-colors cursor-pointer whitespace-nowrap"
                  aria-expanded={userDropdownOpen}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#0f6b64]" />
                  <span className="truncate max-w-[110px]">
                    {localizeUserName(currentUser.displayName, isUr)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#4e6b68]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className={`absolute ${
                      isUr ? 'left-0' : 'right-0'
                    } mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-[#0f6b64]/20 py-1.5 z-50 text-xs`}
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-[#0a4a45] truncate">
                        {localizeUserName(currentUser.displayName, isUr)}
                      </div>
                      <div className="text-[11px] text-[#4e6b68] truncate">
                        @{currentUser.username} ·{' '}
                        {currentUser.role === 'teacher'
                          ? isUr
                            ? 'استاد / معلم'
                            : 'Teacher'
                          : isUr
                          ? 'طالب علم'
                          : 'Student'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleRole();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-start hover:bg-[#faf6ee] flex items-center justify-between text-[#183331] transition-colors cursor-pointer"
                    >
                      <span>
                        {isUr
                          ? currentUser.role === 'teacher'
                            ? 'طالب علم ویو میں جائیں'
                            : 'استاد ویو میں جائیں'
                          : `Switch to ${currentUser.role === 'teacher' ? 'Student View' : 'Teacher View'}`}
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-[#0f6b64]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenStats();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-start hover:bg-[#faf6ee] flex items-center justify-between text-[#183331] transition-colors cursor-pointer"
                    >
                      <span>{isUr ? 'کوئز نتائج اور شماریات' : 'Quiz Analytics & Scores'}</span>
                      <BarChart2 className="w-3.5 h-3.5 text-[#0f6b64]" />
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-start hover:bg-rose-50 flex items-center justify-between text-rose-600 transition-colors cursor-pointer"
                    >
                      <span>{isUr ? 'سائن آؤٹ کریں' : 'Sign Out'}</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0f6b64] hover:bg-[#18867d] text-white shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isUr ? 'سائن ان کریں' : 'Sign In'}</span>
              </button>
            )}
          </div>

          {/* MOBILE & TABLET MENU TOGGLE CONTROLS */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => handleLinkClick('leaderboard')}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#faf6ee] text-[#0a4a45] border border-[#d4952c]/50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              aria-label={isUr ? 'کل پوائنٹس' : 'Total Points'}
            >
              <Award className="w-3.5 h-3.5 text-[#d4952c]" />
              <span className="tabular-nums">
                {myTotalPoints} {isUr ? 'پوائنٹس' : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2.5 rounded-xl text-[#0a4a45] bg-[#faf6ee] hover:bg-[#0f6b64]/10 border border-[#0f6b64]/20 transition-colors cursor-pointer"
              aria-label={
                mobileMenuOpen
                  ? isUr
                    ? 'مینو بند کریں'
                    : 'Close navigation menu'
                  : isUr
                  ? 'مینو کھولیں'
                  : 'Open navigation menu'
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET COLLAPSIBLE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#0f6b64]/15 bg-[#faf6ee] px-4 pt-4 pb-6 space-y-4 shadow-lg">
          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link.id)}
                  className={`p-3 text-start text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0f6b64] text-white shadow-xs'
                      : 'bg-white text-[#183331] border border-[#0f6b64]/15 hover:border-[#0f6b64]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#f7dfa4]' : 'text-[#0f6b64]'}`} />
                  <span className="truncate">{isUr ? link.labelUr : link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Utilities Row: Quiz Statistics & Language Toggle */}
          <div className="pt-3 border-t border-[#0f6b64]/15 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onOpenStats();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-white border border-[#0f6b64]/25 text-[#0a4a45] flex items-center justify-center gap-2 hover:border-[#0f6b64] cursor-pointer whitespace-nowrap"
            >
              <BarChart2 className="w-4 h-4 text-[#0f6b64]" />
              <span>{isUr ? 'کوئز شماریات' : 'Quiz Statistics'}</span>
            </button>

            <div className="flex items-center p-1 bg-white rounded-xl border border-[#0f6b64]/20">
              <button
                type="button"
                onClick={() => onSetLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap ${
                  lang === 'en' ? 'bg-[#0f6b64] text-white' : 'text-[#4e6b68]'
                }`}
              >
                {isUr ? 'انگریزی' : 'English'}
              </button>
              <button
                type="button"
                onClick={() => onSetLang('ur')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap ${
                  lang === 'ur' ? 'bg-[#0f6b64] text-white' : 'text-[#4e6b68]'
                }`}
              >
                اردو
              </button>
            </div>
          </div>

          {/* Account / Sign In Row */}
          <div className="pt-3 border-t border-[#0f6b64]/15">
            {currentUser ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#0f6b64]/15 gap-3 flex-wrap">
                <div>
                  <div className="font-bold text-xs text-[#0a4a45]">
                    {localizeUserName(currentUser.displayName, isUr)}
                  </div>
                  <div className="text-[11px] text-[#4e6b68]">
                    @{currentUser.username} ·{' '}
                    {currentUser.role === 'teacher'
                      ? isUr
                        ? 'استاد موڈ'
                        : 'Teacher Mode'
                      : isUr
                      ? 'طالب علم موڈ'
                      : 'Student Mode'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleRole();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0f6b64]/10 text-[#0f6b64] cursor-pointer whitespace-nowrap"
                  >
                    {isUr ? 'کردار تبدیل کریں' : 'Switch Role'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title={isUr ? 'سائن آؤٹ کریں' : 'Sign Out'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 text-center text-xs font-bold rounded-xl bg-[#0f6b64] text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>{isUr ? 'سائن ان / اکاؤنٹ تبدیل کریں' : 'Sign In / Switch Account'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
