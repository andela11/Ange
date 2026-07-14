import React, { useState } from 'react';
import { Bell, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
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
  const t = translations[locale];
  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { key: 'home', label: t.nav_home },
    { key: 'gallery', label: t.nav_gallery },
    { key: 'authorities', label: t.nav_authorities },
    { key: 'events', label: t.nav_events },
  ];

  return (
    <header className="sticky top-0 z-50 bg-clay-950/95 backdrop-blur-lg border-b border-clay-800">
      <div className="h-1 bg-gradient-to-r from-forest-600 via-ember-500 to-yellow-400" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => { setCurrentView('home'); setMobileOpen(false); }} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center shadow-lg shadow-forest-900/30 group-hover:scale-105 transition-transform">
              <span className="text-yellow-400 font-serif font-extrabold text-lg">C</span>
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-serif font-bold text-white text-lg leading-none block">CamHeritage</span>
              <span className="text-[10px] text-clay-400 font-medium tracking-wider uppercase">Cameroun</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === item.key
                    ? 'text-forest-300 bg-forest-600/15'
                    : 'text-clay-300 hover:text-white hover:bg-clay-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="hidden sm:flex items-center bg-clay-800/80 rounded-lg p-0.5 border border-clay-700">
              <button onClick={() => setLocale('fr')} className={`text-[11px] px-2 py-1 rounded font-bold transition-colors ${locale === 'fr' ? 'bg-forest-600 text-white' : 'text-clay-400'}`}>FR</button>
              <button onClick={() => setLocale('en')} className={`text-[11px] px-2 py-1 rounded font-bold transition-colors ${locale === 'en' ? 'bg-ember-600 text-white' : 'text-clay-400'}`}>EN</button>
            </div>

            {/* Notifications */}
            {session && (
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg bg-clay-800/80 hover:bg-clay-700 transition-colors border border-clay-700">
                  <Bell className="h-4 w-4 text-clay-300" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-ember-500 text-[9px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse">{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-clay-900 rounded-2xl shadow-2xl border border-clay-700 z-50 overflow-hidden animate-scale-in">
                      <div className="bg-clay-950 p-3.5 border-b border-clay-800 flex justify-between items-center">
                        <span className="font-bold text-sm text-white">{t.nav_notifications}</span>
                        {unreadCount > 0 && <button onClick={onMarkAllRead} className="text-[11px] text-forest-400 hover:underline font-semibold">{t.nav_mark_all_read}</button>}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-clay-500 text-sm">{t.nav_no_notifications}</div>
                        ) : notifications.map(n => (
                          <div key={n.id} className={`p-3.5 border-b border-clay-800 ${n.status === 'unread' ? 'bg-forest-600/10 border-l-2 border-l-forest-500' : ''}`}>
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
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button onClick={() => setCurrentView('admin-dashboard')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-ember-600/15 text-ember-400 border border-ember-600/30 hover:bg-ember-600/25 transition-colors">
                    {t.nav_backoffice}
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-clay-800/80 border border-clay-700">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none">{profile?.name}</p>
                    <p className="text-[9px] text-clay-400 mt-0.5">{isAdmin ? t.nav_role_admin : t.nav_role_member}</p>
                  </div>
                </div>
                <button onClick={onLogout} className="p-2 rounded-lg bg-clay-800/80 hover:bg-red-600/20 text-clay-400 hover:text-red-400 transition-colors border border-clay-700">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => setCurrentView('login')} className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-clay-300 hover:text-white hover:bg-clay-800 transition-colors">{t.nav_login}</button>
                <button onClick={() => setCurrentView('register')} className="px-3.5 py-1.5 rounded-lg text-sm font-bold bg-forest-600 text-white hover:bg-forest-700 transition-colors shadow-lg shadow-forest-900/20">{t.nav_register}</button>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg bg-clay-800/80 border border-clay-700 text-clay-300">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-clay-800 py-3 space-y-1 animate-fade-in">
            {navItems.map(item => (
              <button key={item.key} onClick={() => { setCurrentView(item.key); setMobileOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold ${currentView === item.key ? 'text-forest-300 bg-forest-600/15' : 'text-clay-300 hover:bg-clay-800'}`}>
                {item.label}
              </button>
            ))}
            <div className="flex items-center gap-2 px-4 pt-2">
              <button onClick={() => setLocale('fr')} className={`text-[11px] px-2 py-1 rounded font-bold ${locale === 'fr' ? 'bg-forest-600 text-white' : 'text-clay-400 bg-clay-800'}`}>FR</button>
              <button onClick={() => setLocale('en')} className={`text-[11px] px-2 py-1 rounded font-bold ${locale === 'en' ? 'bg-ember-600 text-white' : 'text-clay-400 bg-clay-800'}`}>EN</button>
            </div>
            {!session && (
              <div className="flex gap-2 px-4 pt-2">
                <button onClick={() => { setCurrentView('login'); setMobileOpen(false); }} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-clay-800 text-white">{t.nav_login}</button>
                <button onClick={() => { setCurrentView('register'); setMobileOpen(false); }} className="flex-1 py-2 rounded-lg text-sm font-bold bg-forest-600 text-white">{t.nav_register}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
