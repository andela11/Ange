import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, User, LogOut, Globe } from 'lucide-react';
import type { Profile, Notification } from '../lib/supabase';
import { translations } from '../translations';

interface HeaderProps {
  locale: 'fr' | 'en';
  setLocale: (l: 'fr' | 'en') => void;
  currentView: string;
  setCurrentView: (v: string) => void;
  session: unknown;
  profile: Profile | null;
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onLogout: () => void;
}

export default function Header({
  locale, setLocale, currentView, setCurrentView, session, profile,
  notifications, unreadCount, onMarkAllRead, onLogout,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const t = translations[locale];
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { key: 'home', label: t.nav_home },
    { key: 'gallery', label: t.nav_gallery },
    { key: 'authorities', label: t.nav_authorities },
    { key: 'events', label: t.nav_events },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-clay-950/90 backdrop-blur-xl shadow-2xl shadow-clay-950/40'
          : 'bg-transparent'
      }`}
    >
      {/* Top accent line — only visible when scrolled */}
      <div className={`h-0.5 bg-gradient-to-r from-forest-600 via-ember-500 to-yellow-400 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-14' : 'h-20'}`}>
          {/* Logo */}
          <button
            onClick={() => { setCurrentView('home'); setMobileOpen(false); }}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className={`rounded-xl bg-gradient-to-br from-forest-500 to-forest-800 flex items-center justify-center shadow-lg shadow-forest-900/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <span className="text-yellow-400 font-serif font-extrabold transition-all duration-300" style={{ fontSize: scrolled ? '0.95rem' : '1.15rem' }}>C</span>
            </div>
            <div className="text-left">
              <span className={`font-serif font-bold leading-none block transition-colors duration-300 ${scrolled ? 'text-white text-base' : 'text-white text-lg'}`}>
                CamHeritage
              </span>
              <span className="text-[9px] text-clay-300/70 font-medium tracking-[0.2em] uppercase mt-0.5 block">
                Grassfields
              </span>
            </div>
          </button>

          {/* Desktop Nav — pill style with animated underline */}
          <nav className="hidden md:flex items-center gap-1 relative">
            {navItems.map(item => {
              const active = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className="relative px-4 py-2 text-sm font-semibold transition-colors duration-300 group"
                >
                  <span className={`relative z-10 transition-colors duration-300 ${
                    active
                      ? scrolled ? 'text-forest-300' : 'text-forest-200'
                      : scrolled ? 'text-clay-300 group-hover:text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  {/* Animated underline */}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-forest-400 to-ember-400 rounded-full transition-all duration-300 ${
                    active ? 'w-3/4 opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-60'
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Language switcher — pill style */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                  scrolled
                    ? 'bg-clay-800/60 border-clay-700 text-clay-200 hover:bg-clay-700'
                    : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                {locale.toUpperCase()}
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 bg-clay-900 rounded-xl shadow-2xl border border-clay-700 z-50 overflow-hidden animate-scale-in">
                    {(['fr', 'en'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => { setLocale(l); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${
                          locale === l ? 'bg-forest-600/20 text-forest-300' : 'text-clay-300 hover:bg-clay-800'
                        }`}
                      >
                        {l === 'fr' ? 'Français' : 'English'}
                        {locale === l && <span className="h-2 w-2 rounded-full bg-forest-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            {session && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`relative p-2 rounded-full transition-all duration-300 border ${
                    scrolled
                      ? 'bg-clay-800/60 border-clay-700 text-clay-200 hover:bg-clay-700'
                      : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-ember-500 text-[9px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 bg-clay-900 rounded-2xl shadow-2xl border border-clay-700 z-50 overflow-hidden animate-scale-in">
                      <div className="bg-clay-950 p-4 border-b border-clay-800 flex justify-between items-center">
                        <span className="font-serif font-bold text-sm text-white">{t.nav_notifications}</span>
                        {unreadCount > 0 && (
                          <button onClick={onMarkAllRead} className="text-[11px] text-forest-400 hover:text-forest-300 font-semibold transition-colors">
                            {t.nav_mark_all_read}
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-clay-500 text-sm">{t.nav_no_notifications}</div>
                        ) : notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-clay-800 transition-colors hover:bg-clay-800/50 ${n.status === 'unread' ? 'bg-forest-600/10 border-l-2 border-l-forest-500' : ''}`}>
                            <p className="font-bold text-xs text-white mb-1">{n.titre}</p>
                            <p className="text-[11px] text-clay-400 leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User / Auth */}
            {session ? (
              <div className="flex items-center gap-2.5">
                {isAdmin && (
                  <button
                    onClick={() => setCurrentView('admin-dashboard')}
                    className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                      scrolled
                        ? 'bg-ember-600/15 text-ember-400 border-ember-600/30 hover:bg-ember-600/25'
                        : 'bg-ember-500/15 text-ember-300 border-ember-400/30 hover:bg-ember-500/25'
                    }`}
                  >
                    {t.nav_backoffice}
                  </button>
                )}
                <div className={`hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all duration-300 border ${
                  scrolled ? 'bg-clay-800/60 border-clay-700' : 'bg-white/10 border-white/20'
                }`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white">{profile?.name}</p>
                    <p className="text-[9px] text-clay-400">{isAdmin ? t.nav_role_admin : t.nav_role_member}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className={`p-2 rounded-full transition-all duration-300 border ${
                    scrolled
                      ? 'bg-clay-800/60 border-clay-700 text-clay-400 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30'
                      : 'bg-white/10 border-white/20 text-white/80 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    scrolled ? 'text-clay-200 hover:text-white' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t.nav_login}
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-forest-600 to-forest-700 text-white hover:from-forest-500 hover:to-forest-600 transition-all duration-300 shadow-lg shadow-forest-900/30 hover:shadow-xl hover:scale-105"
                >
                  {t.nav_register}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-full transition-all duration-300 border ${
                scrolled
                  ? 'bg-clay-800/60 border-clay-700 text-clay-200'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="bg-clay-950/95 backdrop-blur-xl rounded-2xl border border-clay-800 p-3 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setCurrentView(item.key); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    currentView === item.key
                      ? 'text-forest-300 bg-forest-600/15'
                      : 'text-clay-300 hover:bg-clay-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                {(['fr', 'en'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      locale === l ? 'bg-forest-600 text-white' : 'text-clay-400 bg-clay-800'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {!session && (
                <div className="flex gap-2 px-2 pt-2">
                  <button onClick={() => { setCurrentView('login'); setMobileOpen(false); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-clay-800 text-white"> {t.nav_login}</button>
                  <button onClick={() => { setCurrentView('register'); setMobileOpen(false); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-forest-600 to-forest-700 text-white"> {t.nav_register}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
