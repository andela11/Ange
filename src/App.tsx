import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Bell, ChevronRight, Calendar, MapPin, User, Plus, Trash2,
  LogOut, Users, Image as ImageIcon, AlertCircle, CheckCircle2,
  ArrowRight, ShieldCheck, Info, Search, Share2, Download, X, Loader2,
} from 'lucide-react';
import { supabase, type Profile, type Evenement, type Autorite, type GalerieItem, type Notification } from './lib/supabase';
import { translations } from './translations';
import RegistrationsChart from './components/RegistrationsChart';
import ProjectScopeDocument from './components/ProjectScopeDocument';

export interface RegistrationCount {
  month: string;
  monthFullEn: string;
  monthFullFr: string;
  count: number;
}

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

export default function App() {
  const [locale, setLocale] = useState<'fr' | 'en'>('en');
  const t = translations[locale];

  const [activeTab, setActiveTab] = useState<'preview' | 'codebase'>('preview');
  const [currentView, setCurrentView] = useState<string>('home');

  // Auth state
  const [session, setSession] = useState<Session>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data state
  const [events, setEvents] = useState<Evenement[]>([]);
  const [authorities, setAuthorities] = useState<Autorite[]>([]);
  const [gallery, setGallery] = useState<GalerieItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Registration chart data (simulated analytics)
  const [registrations, setRegistrations] = useState<RegistrationCount[]>([
    { month: 'Jan', monthFullEn: 'January', monthFullFr: 'Janvier', count: 45 },
    { month: 'Feb', monthFullEn: 'February', monthFullFr: 'Février', count: 62 },
    { month: 'Mar', monthFullEn: 'March', monthFullFr: 'Mars', count: 55 },
    { month: 'Apr', monthFullEn: 'April', monthFullFr: 'Avril', count: 70 },
    { month: 'May', monthFullEn: 'May', monthFullFr: 'Mai', count: 85 },
    { month: 'Jun', monthFullEn: 'June', monthFullFr: 'Juin', count: 120 },
    { month: 'Jul', monthFullEn: 'July', monthFullFr: 'Juillet', count: 165 },
    { month: 'Aug', monthFullEn: 'August', monthFullFr: 'Août', count: 98 },
    { month: 'Sep', monthFullEn: 'September', monthFullFr: 'Septembre', count: 75 },
    { month: 'Oct', monthFullEn: 'October', monthFullFr: 'Octobre', count: 88 },
    { month: 'Nov', monthFullEn: 'November', monthFullFr: 'Novembre', count: 130 },
    { month: 'Dec', monthFullEn: 'December', monthFullFr: 'Décembre', count: 195 },
  ]);

  // Filter states
  const [authorityFilter, setAuthorityFilter] = useState<'all' | 'traditional' | 'administrative'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  const [lightboxImage, setLightboxImage] = useState<{ src: string; titre: string; date: string } | null>(null);

  // Form states
  const [newEvent, setNewEvent] = useState({ titre: '', lieu: '', date_evenement: '2026-08-15', description: '', image_url: '' });
  const [newAuth, setNewAuth] = useState({ nom: '', titre: '', type: 'traditional' as 'traditional' | 'administrative', ordre_affichage: '1', description: '', photo: '' });
  const [newGal, setNewGal] = useState({ titre: '', date_evenement: '2026-03-12', photo: '' });

  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4500); };

  const today = new Date().toISOString().split('T')[0];

  // === Auth ===
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess) setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch profile when session changes
  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return; }
    (async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (error) { console.error('Profile fetch error:', error); return; }
      if (data) setProfile(data as Profile);
      else {
        // Profile might not exist yet if trigger hasn't run; create it
        const { data: newProfile } = await supabase.from('profiles').insert({ id: session.user.id, name: session.user.email?.split('@')[0] || 'User', role: 'user' }).select().maybeSingle();
        if (newProfile) setProfile(newProfile as Profile);
      }
    })();
  }, [session]);

  // === Data fetching ===
  const fetchAllData = useCallback(async () => {
    setDataLoading(true);
    const [evRes, autRes, galRes] = await Promise.all([
      supabase.from('evenements').select('*').order('date_evenement', { ascending: false }),
      supabase.from('autorites').select('*').order('ordre_affichage', { ascending: true }),
      supabase.from('galerie').select('*').order('date_evenement', { ascending: false }),
    ]);
    if (evRes.data) setEvents(evRes.data as Evenement[]);
    if (autRes.data) setAuthorities(autRes.data as Autorite[]);
    if (galRes.data) setGallery(galRes.data as GalerieItem[]);
    setDataLoading(false);
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Fetch notifications for logged-in user
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) { setNotifications([]); return; }
    const { data } = await supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(10);
    if (data) setNotifications(data as Notification[]);
  }, [session]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // URL param for shared events
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');
    if (eventIdParam) {
      setHighlightedEventId(eventIdParam);
      setCurrentView('events');
      setEventFilter('all');
      setTimeout(() => {
        const el = document.getElementById(`event-card-${eventIdParam}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // === Auth handlers ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setAuthSubmitting(false);
    if (error) { setAuthError(error.message); return; }
    setCurrentView('home');
    showToast(locale === 'fr' ? 'Connexion réussie !' : 'Login successful!');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword, options: { data: { name: loginEmail.split('@')[0] } } });
    setAuthSubmitting(false);
    if (error) { setAuthError(error.message); return; }
    if (data.session) {
      setCurrentView('home');
      showToast(locale === 'fr' ? 'Inscription réussie !' : 'Registration successful!');
    } else {
      showToast(locale === 'fr' ? 'Compte créé. Vérifiez votre email.' : 'Account created. Check your email.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('home');
    showToast(locale === 'fr' ? 'Déconnexion réussie.' : 'Logged out.');
  };

  // === CRUD: Events ===
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.titre || !newEvent.description || !newEvent.lieu) { alert('Please fill all required fields.'); return; }
    const { data, error } = await supabase.from('evenements').insert({
      titre: newEvent.titre, description: newEvent.description, date_evenement: newEvent.date_evenement,
      lieu: newEvent.lieu, image_url: newEvent.image_url || null,
    }).select().single();
    if (error) { showToast(`Error: ${error.message}`); return; }

    // Broadcast notifications to all users
    const { data: allProfiles } = await supabase.from('profiles').select('id');
    if (allProfiles && data) {
      const notifTitle = `Nouvel Événement: ${newEvent.titre}`;
      const notifBody = `Un nouvel événement culturel est prévu le ${newEvent.date_evenement} à ${newEvent.lieu}. Cliquez pour en savoir plus.`;
      const notifs = allProfiles.map(p => ({ user_id: p.id, titre: notifTitle, message: notifBody, status: 'unread' as const }));
      await supabase.from('notifications').insert(notifs);
    }

    setEvents([data as Evenement, ...events]);
    setNewEvent({ titre: '', lieu: '', date_evenement: '2026-08-15', description: '', image_url: '' });
    showToast('✓ Événement planifié ! Notification envoyée à tous les membres.');
    fetchNotifications();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    const { error } = await supabase.from('evenements').delete().eq('id', id);
    if (error) { showToast(`Error: ${error.message}`); return; }
    setEvents(events.filter(e => e.id !== id));
    showToast('Événement retiré.');
  };

  // === CRUD: Authorities ===
  const handleCreateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuth.nom || !newAuth.titre || !newAuth.description) { alert('Please fill all required fields.'); return; }
    const { data, error } = await supabase.from('autorites').insert({
      nom: newAuth.nom, titre: newAuth.titre, type: newAuth.type,
      photo: newAuth.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      description: newAuth.description, ordre_affichage: parseInt(newAuth.ordre_affichage) || 1,
    }).select().single();
    if (error) { showToast(`Error: ${error.message}`); return; }
    setAuthorities([...authorities, data as Autorite]);
    setNewAuth({ nom: '', titre: '', type: 'traditional', ordre_affichage: '1', description: '', photo: '' });
    showToast('✓ Autorité enregistrée au répertoire.');
  };

  const handleDeleteAuthority = async (id: string) => {
    if (!confirm('Voulez-vous vraiment retirer cette autorité ?')) return;
    const { error } = await supabase.from('autorites').delete().eq('id', id);
    if (error) { showToast(`Error: ${error.message}`); return; }
    setAuthorities(authorities.filter(a => a.id !== id));
    showToast('Autorité retirée.');
  };

  // === CRUD: Gallery ===
  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGal.titre) { alert('Entrez la légende de la photo.'); return; }
    const { data, error } = await supabase.from('galerie').insert({
      titre: newGal.titre, photo: newGal.photo || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
      date_evenement: newGal.date_evenement,
    }).select().single();
    if (error) { showToast(`Error: ${error.message}`); return; }
    setGallery([data as GalerieItem, ...gallery]);
    setNewGal({ titre: '', date_evenement: '2026-03-12', photo: '' });
    showToast("✓ Image téléversée et publiée dans l'album.");
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette photo de l\'album ?')) return;
    const { error } = await supabase.from('galerie').delete().eq('id', id);
    if (error) { showToast(`Error: ${error.message}`); return; }
    setGallery(gallery.filter(g => g.id !== id));
    showToast('Photo supprimée.');
  };

  // === Notifications ===
  const handleMarkAllRead = async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase.from('notifications').update({ status: 'read' }).eq('user_id', session.user.id).eq('status', 'unread');
    if (error) { showToast(`Error: ${error.message}`); return; }
    setNotifications(notifications.map(n => ({ ...n, status: 'read' as const })));
    showToast('✓ Toutes les notifications ont été marquées lues.');
  };

  // === Event utilities ===
  const handleExportICS = (ev: Evenement) => {
    const cleanDate = ev.date_evenement.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grassfields Culture Hub//Cameroon//EN',
      'BEGIN:VEVENT', `UID:event-${ev.id}@culture.cm`, `DTSTAMP:${cleanDate}T090000Z`,
      `DTSTART:${cleanDate}T090000Z`, `DTEND:${cleanDate}T170000Z`,
      `SUMMARY:${ev.titre}`, `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${ev.lieu}`, 'END:VEVENT', 'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${ev.titre.slice(0, 30).toLowerCase().replace(/\s+/g, '_')}_calendar.ics`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast(locale === 'fr' ? `✓ Fichier .ics exporté : ${ev.titre}` : `✓ .ics exported: ${ev.titre}`);
  };

  const handleShareEvent = (ev: Evenement) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?eventId=${ev.id}`;
    navigator.clipboard.writeText(shareUrl);
    setHighlightedEventId(ev.id);
    showToast(locale === 'fr' ? `✓ Lien copié : ${ev.titre}` : `✓ Link copied: ${ev.titre}`);
  };

  const handleParticipate = (ev: Evenement) => {
    const evDate = new Date(ev.date_evenement);
    const monthIndex = isNaN(evDate.getTime()) ? 5 : evDate.getMonth();
    setRegistrations(prev => prev.map((item, idx) => idx === monthIndex ? { ...item, count: item.count + 1 } : item));
    showToast(locale === 'fr' ? '✓ Inscription enregistrée (+1 sur le graphique D3)' : '✓ Registration recorded (+1 on D3 chart)');
  };

  const isAdmin = profile?.role === 'admin';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* DEVELOPER DASHBOARD TOP BAR */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-b border-emerald-500/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Cameroun Cultural Portal
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Live</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Powered by Supabase — Real data, real auth</p>
            </div>
          </div>
          <div className="bg-slate-950 p-1 rounded-full border border-slate-800 flex items-center">
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'preview' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              ⚡ Live Portal
            </button>
            <button onClick={() => setActiveTab('codebase')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'codebase' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              📁 Source PHP / SQL
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 border-2 border-emerald-400 text-white rounded-xl shadow-2xl p-4 max-w-sm flex items-start gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-200 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">{toast}</p>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* USER INFO BAR */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase block mb-1">{t.dev_testing_title}</span>
              <p className="text-xs text-slate-300">
                {session ? (locale === 'fr' ? `Connecté: ${profile?.name} (${profile?.role})` : `Signed in: ${profile?.name} (${profile?.role})`) : (locale === 'fr' ? 'Visiteur public — connectez-vous pour participer' : 'Public visitor — sign in to participate')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button onClick={() => setLocale('fr')} className={`text-[10px] px-2 py-0.5 rounded font-bold ${locale === 'fr' ? 'bg-[#007A5E] text-white' : 'text-slate-400'}`}>FR</button>
                <button onClick={() => setLocale('en')} className={`text-[10px] px-2 py-0.5 rounded font-bold ${locale === 'en' ? 'bg-[#CE1126] text-white' : 'text-slate-400'}`}>EN</button>
              </div>
              {session ? (
                <>
                  {isAdmin && (
                    <button onClick={() => setCurrentView('admin-dashboard')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                      {t.nav_backoffice}
                    </button>
                  )}
                  <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/10 text-red-400 hover:bg-red-600/20 flex items-center gap-1">
                    <LogOut className="h-3.5 w-3.5" /> {t.nav_logout}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setCurrentView('login')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-slate-300 hover:bg-slate-650">{t.nav_login}</button>
                  <button onClick={() => setCurrentView('register')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-400 text-slate-950">{t.nav_register}</button>
                </>
              )}
            </div>
          </div>

          {/* SIMULATED WEB SITE CONTAINER */}
          <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-300/40 min-h-[600px] flex flex-col">
            <div className="h-2 w-full bg-gradient-to-r from-[#007A5E] via-[#CE1126] to-[#FCD116]" />

            {/* HEADER */}
            <header className="bg-slate-950 text-white border-b border-yellow-500/20">
              <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
                  <div className="text-yellow-400 text-2xl font-serif font-extrabold italic flex items-center gap-1.5">
                    <span className="text-emerald-500">★</span>Cam<span className="text-yellow-400">Heritage</span>
                  </div>
                  <span className="text-[10px] bg-emerald-800 text-emerald-100 font-bold px-2 py-0.5 rounded uppercase">Cameroun</span>
                </div>
                <nav className="flex flex-wrap items-center gap-1.5 font-medium text-sm">
                  <button onClick={() => setCurrentView('home')} className={`px-3 py-1 rounded ${currentView === 'home' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}>{t.nav_home}</button>
                  <button onClick={() => setCurrentView('gallery')} className={`px-3 py-1 rounded ${currentView === 'gallery' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}>{t.nav_gallery}</button>
                  <button onClick={() => setCurrentView('authorities')} className={`px-3 py-1 rounded ${currentView === 'authorities' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}>{t.nav_authorities}</button>
                  <button onClick={() => setCurrentView('events')} className={`px-3 py-1 rounded ${currentView === 'events' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}>{t.nav_events}</button>
                </nav>
                <div className="flex items-center gap-3">
                  {session && (
                    <div className="relative group">
                      <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 relative">
                        <Bell className="h-4 w-4 text-yellow-400" />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-bold text-white rounded-full px-1.5 py-0.2 animate-pulse">{unreadCount}</span>}
                      </button>
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 p-0 hidden group-hover:block z-40">
                        <div className="bg-slate-950 p-3 rounded-t-xl border-b border-slate-800 flex justify-between items-center text-xs">
                          <span className="font-bold">{t.nav_notifications}</span>
                          {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-[10px] text-yellow-400 hover:underline">{t.nav_mark_all_read}</button>}
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs">{t.nav_no_notifications}</div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={`p-3 border-b border-slate-800 text-xs ${n.status === 'unread' ? 'bg-slate-800/40 border-l-4 border-l-yellow-400' : 'text-slate-400'}`}>
                                <div className="flex justify-between items-start mb-1"><span className="font-bold text-slate-200">{n.titre}</span></div>
                                <p className="text-[11px] leading-relaxed">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {session && (
                    <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg px-3 py-1 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-yellow-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-yellow-400">{profile?.name}</p>
                        <p className="text-[9px] text-slate-400">{isAdmin ? t.nav_role_admin : t.nav_role_member}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* SUB-HEADER */}
            <div className="bg-[#005a45] text-white py-2 px-8 text-xs flex justify-between items-center flex-wrap gap-2">
              <span className="text-slate-100 font-medium">{t.banner_promo}</span>
              <span className="bg-slate-900/40 px-3 py-1 rounded text-yellow-400 font-mono">{t.banner_date}: {today}</span>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-grow p-4 md:p-8 bg-slate-50">
              {dataLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
              )}

              {/* HOME */}
              {!dataLoading && currentView === 'home' && (
                <div className="space-y-8 max-w-6xl mx-auto">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[16/7] md:aspect-[16/6] bg-slate-950 flex items-end">
                    <img src={gallery[0]?.photo || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1200'} alt="Cameroun Culture" className="absolute inset-0 w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
                    <div className="relative z-20 p-6 md:p-12 text-left max-w-2xl text-white">
                      <span className="inline-block bg-[#007A5E] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md mb-3">{t.hero_tag}</span>
                      <h2 className="text-2xl md:text-4xl font-serif font-bold text-yellow-400 leading-tight">{t.hero_title}</h2>
                      <p className="text-xs md:text-sm text-slate-200 mt-2">{t.hero_desc}</p>
                      <button onClick={() => setCurrentView('gallery')} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5">{t.hero_explore} <ChevronRight className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 text-left">
                      <div className="bg-[#007A5E]/10 w-fit p-3 rounded-lg text-[#007A5E] mb-3"><ShieldCheck className="h-6 w-6" /></div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">{t.intro_customs_title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t.intro_customs_desc}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 text-left">
                      <div className="bg-amber-100 w-fit p-3 rounded-lg text-amber-600 mb-3"><Users className="h-6 w-6" /></div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">{t.intro_directories_title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t.intro_directories_desc}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 text-left">
                      <div className="bg-red-50 w-fit p-3 rounded-lg text-red-600 mb-3"><Calendar className="h-6 w-6" /></div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">{t.intro_councils_title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t.intro_councils_desc}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6 text-left">
                      <div><h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2"><span className="text-[#CE1126]">●</span> {t.home_events_title}</h3><p className="text-xs text-slate-500">{t.home_events_desc}</p></div>
                      <button onClick={() => { setEventFilter('upcoming'); setCurrentView('events'); }} className="text-xs font-semibold text-[#007A5E] hover:underline">{t.home_view_all} <ArrowRight className="h-3 w-3 inline" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {events.slice(0, 3).map(event => (
                        <div key={event.id} className="bg-white rounded-xl overflow-hidden border border-slate-200/75 shadow-sm hover:shadow-md transition-shadow">
                          <div className="h-40 bg-slate-100 relative">
                            <img src={event.image_url || `https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800`} alt={event.titre} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute top-2.5 right-2.5 bg-red-600 text-[9px] font-extrabold text-white px-2 py-1 rounded uppercase flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {event.lieu}</span>
                          </div>
                          <div className="p-4 text-left">
                            <p className="text-[10px] font-mono font-bold text-[#007A5E]">{event.date_evenement}</p>
                            <h5 className="font-serif font-bold text-slate-900 text-sm mt-1">{event.titre}</h5>
                            <p className="text-xs text-slate-500 mt-1.5 line-clamp-3">{event.description}</p>
                            <button onClick={() => setCurrentView('events')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1.5 px-3 rounded w-full mt-3">{t.home_details_btn}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6 text-left">
                      <div><h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2"><span className="text-[#007A5E]">★</span> {t.home_auth_title}</h3><p className="text-xs text-slate-500">{t.home_auth_desc}</p></div>
                      <button onClick={() => setCurrentView('authorities')} className="text-xs font-semibold text-[#007A5E] hover:underline">{t.home_view_all} <ArrowRight className="h-3 w-3 inline" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {authorities.slice(0, 3).map(auth => (
                        <div key={auth.id} className="bg-white rounded-xl border border-slate-200/75 p-5 text-center shadow-sm">
                          <img src={auth.photo} alt={auth.nom} className="h-24 w-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-3" referrerPolicy="no-referrer" />
                          <span className={`inline-block text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1 border ${auth.type === 'traditional' ? 'bg-[#007A5E]/10 text-[#007A5E] border-[#007A5E]/20' : 'bg-slate-100 text-slate-600'}`}>{auth.type === 'traditional' ? (locale === 'fr' ? 'Règne Traditionnel' : 'Traditional Reign') : (locale === 'fr' ? 'Administratif' : 'State Official')}</span>
                          <h5 className="font-serif font-bold text-slate-900 text-sm">{auth.nom}</h5>
                          <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{auth.titre}</p>
                          <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 text-justify">{auth.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GALLERY */}
              {!dataLoading && currentView === 'gallery' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div><h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2"><ImageIcon className="h-6 w-6 text-yellow-500" /> {t.gallery_title}</h2><p className="text-xs text-slate-500">{t.gallery_desc}</p></div>
                    {isAdmin && <button onClick={() => setCurrentView('admin-gallery')} className="bg-yellow-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1"><Plus className="h-4 w-4" /> {t.gallery_manage}</button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {gallery.map(item => (
                      <div key={item.id} onClick={() => setLightboxImage({ src: item.photo, titre: item.titre, date: item.date_evenement })} className="group relative bg-black rounded-xl overflow-hidden cursor-pointer aspect-square shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1">
                        <img src={item.photo} alt={item.titre} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20 opacity-0 group-hover:opacity-100">
                          <p className="text-[9px] font-mono text-yellow-400">{item.date_evenement}</p>
                          <h6 className="font-serif font-bold text-xs mt-0.5">{item.titre}</h6>
                        </div>
                      </div>
                    ))}
                  </div>
                  {lightboxImage && (
                    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
                      <div className="bg-slate-900 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl relative border border-slate-700" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white h-8 w-8 rounded-full flex items-center justify-center z-10">✕</button>
                        <div className="bg-black flex justify-center items-center min-h-[300px] max-h-[480px]">
                          <img src={lightboxImage.src} alt={lightboxImage.titre} className="max-h-[450px] max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="bg-slate-950 p-4 flex justify-between items-center text-xs">
                          <div><h4 className="font-serif font-bold text-sm text-yellow-400">{lightboxImage.titre}</h4><p className="text-slate-400 text-[11px] mt-0.5">{t.gallery_lightbox_linked}: {lightboxImage.date}</p></div>
                          <span className="bg-emerald-800 text-emerald-100 text-[9px] font-bold px-2 py-1 rounded">{t.gallery_lightbox_tag}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AUTHORITIES */}
              {!dataLoading && currentView === 'authorities' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div><h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2"><Users className="h-6 w-6 text-emerald-600" /> {t.auth_title}</h2><p className="text-xs text-slate-500">{t.auth_desc}</p></div>
                    {isAdmin && <button onClick={() => setCurrentView('admin-authorities')} className="bg-yellow-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1"><Plus className="h-4 w-4" /> {t.auth_manage}</button>}
                  </div>
                  <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-xl max-w-md mb-8 flex gap-1">
                    <button onClick={() => setAuthorityFilter('all')} className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg ${authorityFilter === 'all' ? 'bg-[#007A5E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.auth_filter_all} ({authorities.length})</button>
                    <button onClick={() => setAuthorityFilter('traditional')} className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg ${authorityFilter === 'traditional' ? 'bg-[#007A5E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.auth_filter_trad} ({authorities.filter(a => a.type === 'traditional').length})</button>
                    <button onClick={() => setAuthorityFilter('administrative')} className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg ${authorityFilter === 'administrative' ? 'bg-[#007A5E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.auth_filter_admin} ({authorities.filter(a => a.type === 'administrative').length})</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {authorities.filter(a => authorityFilter === 'all' || a.type === authorityFilter).map(auth => (
                      <div key={auth.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
                        <img src={auth.photo} alt={auth.nom} className="h-28 w-28 rounded-full mx-auto object-cover border-4 border-slate-50 shadow-md mb-4" referrerPolicy="no-referrer" />
                        <span className={`inline-block text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1.5 border ${auth.type === 'traditional' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{auth.type === 'traditional' ? t.auth_badge_trad : t.auth_badge_admin}</span>
                        <h5 className="font-serif font-bold text-slate-900 text-base mb-1">{auth.nom}</h5>
                        <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{auth.titre}</p>
                        <p className="text-[11px] text-slate-500 mt-3 text-justify leading-relaxed">{auth.description}</p>
                        <div className="w-full mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono">{t.auth_priority}: {auth.ordre_affichage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EVENTS */}
              {!dataLoading && currentView === 'events' && (
                <div className="max-w-5xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div><h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2"><Calendar className="h-6 w-6 text-rose-600" /> {t.events_title}</h2><p className="text-xs text-slate-500">{t.events_desc}</p></div>
                    {isAdmin && <button onClick={() => setCurrentView('admin-events')} className="bg-yellow-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1"><Plus className="h-4 w-4" /> {t.events_manage}</button>}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-xl max-w-sm flex gap-1">
                      <button onClick={() => setEventFilter('all')} className={`flex-1 text-center py-1.5 px-3 text-xs font-bold rounded-lg ${eventFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.events_filter_all} ({events.length})</button>
                      <button onClick={() => setEventFilter('upcoming')} className={`flex-1 text-center py-1.5 px-3 text-xs font-bold rounded-lg ${eventFilter === 'upcoming' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.events_filter_upcoming} ({events.filter(e => new Date(e.date_evenement) >= new Date(today)).length})</button>
                      <button onClick={() => setEventFilter('past')} className={`flex-1 text-center py-1.5 px-3 text-xs font-bold rounded-lg ${eventFilter === 'past' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.events_filter_past} ({events.filter(e => new Date(e.date_evenement) < new Date(today)).length})</button>
                    </div>
                    {(eventSearchQuery || eventStartDate || eventEndDate) && <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-1.5 font-semibold">⚠️ Filters active</span>}
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" value={eventSearchQuery} onChange={e => setEventSearchQuery(e.target.value)} placeholder={t.events_search_placeholder} className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 focus:bg-white" />
                      {eventSearchQuery && <button onClick={() => setEventSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="font-semibold text-slate-500 whitespace-nowrap">{t.events_filter_start_date}</span><input type="date" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} className="bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-rose-600" /></div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="font-semibold text-slate-500 whitespace-nowrap">{t.events_filter_end_date}</span><input type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className="bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-rose-600" /></div>
                      {(eventSearchQuery || eventStartDate || eventEndDate) && <button onClick={() => { setEventSearchQuery(''); setEventStartDate(''); setEventEndDate(''); setHighlightedEventId(null); }} className="text-white bg-rose-600 hover:bg-rose-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1"><X className="h-3.5 w-3.5" /> {t.events_filter_clear}</button>}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {(() => {
                      const filtered = events
                        .filter(e => { if (eventFilter === 'upcoming') return new Date(e.date_evenement) >= new Date(today); if (eventFilter === 'past') return new Date(e.date_evenement) < new Date(today); return true; })
                        .filter(e => { if (!eventSearchQuery.trim()) return true; const q = eventSearchQuery.toLowerCase(); return e.titre.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.lieu.toLowerCase().includes(q); })
                        .filter(e => !eventStartDate || e.date_evenement >= eventStartDate)
                        .filter(e => !eventEndDate || e.date_evenement <= eventEndDate);
                      if (filtered.length === 0) return (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
                          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                          <h4 className="font-serif font-bold text-slate-800 text-lg mb-1">{locale === 'fr' ? 'Aucun résultat' : 'No results'}</h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">{t.events_no_results}</p>
                        </div>
                      );
                      return filtered.map(ev => {
                        const upcoming = new Date(ev.date_evenement) >= new Date(today);
                        const isHighlighted = highlightedEventId === ev.id;
                        return (
                          <div key={ev.id} id={`event-card-${ev.id}`} className={`group bg-white rounded-2xl overflow-hidden border transition-all flex flex-col md:flex-row hover:-translate-y-1 hover:shadow-lg ${isHighlighted ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-xl' : 'border-slate-200/80 shadow-sm'}`}>
                            <div className="w-full md:w-1/3 relative min-h-[160px] bg-slate-100 overflow-hidden">
                              <img src={ev.image_url || `https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800`} alt={ev.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded ${upcoming ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-100'}`}>{upcoming ? t.events_badge_upcoming : t.events_badge_past}</span>
                                {isHighlighted && <span className="bg-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded animate-pulse">★ Shared</span>}
                              </div>
                            </div>
                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                              <div>
                                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                                  <span className="text-xs font-mono font-bold text-[#007A5E]">{ev.date_evenement}</span>
                                  <span className="text-[10px] bg-slate-100 border text-slate-700 px-2 py-0.5 rounded flex items-center gap-1.5"><MapPin className="h-3 w-3 text-red-500" /> {ev.lieu}</span>
                                </div>
                                <h4 className="font-serif font-bold text-slate-900 text-lg leading-snug group-hover:text-rose-600 transition-colors">{ev.titre}</h4>
                                <p className="text-xs text-slate-500 mt-2 text-justify leading-relaxed">{ev.description}</p>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
                                <span className="text-[10px] text-slate-400">{t.events_created_at} {ev.created_at.split('T')[0]}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleShareEvent(ev)} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[10px] font-bold border border-slate-200"><Share2 className="h-3 w-3" /> {t.events_share_link}</button>
                                  <button onClick={() => handleExportICS(ev)} className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1 text-[10px] font-bold border border-emerald-100"><Download className="h-3 w-3" /> {t.events_export_calendar}</button>
                                  {upcoming ? <button onClick={() => handleParticipate(ev)} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold py-1.5 px-4 rounded-lg">{t.events_participate}</button> : <button onClick={() => setCurrentView('gallery')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1.5 px-3 rounded">{t.events_photos_album}</button>}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* LOGIN */}
              {currentView === 'login' && (
                <div className="max-w-md mx-auto my-8">
                  <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
                    <div className="h-2 w-full bg-[#007A5E]" />
                    <div className="p-8 text-left">
                      <h3 className="text-xl font-serif font-bold text-slate-900 text-center">Se Connecter</h3>
                      <p className="text-xs text-slate-400 text-center mt-1">Authentification Supabase réelle</p>
                      {authError && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">{authError}</div>}
                      <form onSubmit={handleLogin} className="mt-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                          <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="admin@culture.cm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                          <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={authSubmitting} className="bg-[#007A5E] hover:bg-[#005a45] w-full text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                          {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Connexion
                        </button>
                        <p className="text-center text-xs text-slate-500">Pas de compte ? <button type="button" onClick={() => setCurrentView('register')} className="text-[#007A5E] font-bold hover:underline">S'inscrire</button></p>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* REGISTER */}
              {currentView === 'register' && (
                <div className="max-w-md mx-auto my-8">
                  <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
                    <div className="h-2 w-full bg-yellow-400" />
                    <div className="p-8 text-left">
                      <h3 className="text-xl font-serif font-bold text-slate-900 text-center">Créer un compte</h3>
                      <p className="text-xs text-slate-400 text-center mt-1">Inscription Supabase réelle</p>
                      {authError && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">{authError}</div>}
                      <form onSubmit={handleRegister} className="mt-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                          <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="vous@culture.cm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Password (min 6 chars)</label>
                          <input type="password" required minLength={6} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={authSubmitting} className="bg-yellow-400 hover:bg-yellow-500 w-full text-slate-900 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                          {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} S'inscrire
                        </button>
                        <p className="text-center text-xs text-slate-500">Déjà membre ? <button type="button" onClick={() => setCurrentView('login')} className="text-[#007A5E] font-bold hover:underline">Se connecter</button></p>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN DASHBOARD */}
              {currentView === 'admin-dashboard' && isAdmin && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-red-600" /> Table de Contrôle Administrateur</h2>
                    <p className="text-xs text-slate-500">Backend Supabase — données en temps réel</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Événements</span><h4 className="text-3xl font-serif font-extrabold text-rose-800">{events.length}</h4></div><Calendar className="h-8 w-8 text-rose-600 opacity-20" /></div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autorités</span><h4 className="text-3xl font-serif font-extrabold text-amber-800">{authorities.length}</h4></div><Users className="h-8 w-8 text-amber-600 opacity-20" /></div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Galerie</span><h4 className="text-3xl font-serif font-extrabold text-emerald-800">{gallery.length}</h4></div><ImageIcon className="h-8 w-8 text-emerald-600 opacity-20" /></div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notifs</span><h4 className="text-3xl font-serif font-extrabold text-slate-800">{notifications.length}</h4></div><Bell className="h-8 w-8 text-slate-600 opacity-20" /></div>
                  </div>
                  <RegistrationsChart data={registrations} locale={locale} />
                  <ProjectScopeDocument locale={locale} onShowToast={showToast} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div><h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-600" /> Événements</h4><p className="text-xs text-slate-500 mt-2">Créez des événements. Une notification est envoyée à tous les membres.</p></div>
                      <button onClick={() => setCurrentView('admin-events')} className="mt-4 bg-[#007A5E] hover:bg-[#005a45] text-white text-xs font-bold py-2 px-4 rounded-lg w-fit">Gérer</button>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div><h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Autorités</h4><p className="text-xs text-slate-500 mt-2">Ajoutez Fons traditionnels et officiels administratifs.</p></div>
                      <button onClick={() => setCurrentView('admin-authorities')} className="mt-4 bg-[#007A5E] hover:bg-[#005a45] text-white text-xs font-bold py-2 px-4 rounded-lg w-fit">Gérer</button>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div><h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-400" /> Galerie</h4><p className="text-xs text-slate-500 mt-2">Téléversez des photos d'événements culturels.</p></div>
                      <button onClick={() => setCurrentView('admin-gallery')} className="mt-4 bg-[#007A5E] hover:bg-[#005a45] text-white text-xs font-bold py-2 px-4 rounded-lg w-fit">Gérer</button>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4 flex gap-3">
                    <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div><h6 className="font-serif font-bold text-xs text-emerald-900">Données Supabase en temps réel</h6><p className="text-[11px] text-slate-700 mt-1 leading-relaxed">Toutes les modifications sont sauvegardées dans Supabase. Les notifications sont créées automatiquement lors de la création d'événements.</p></div>
                  </div>
                </div>
              )}

              {/* ADMIN EVENTS */}
              {currentView === 'admin-events' && isAdmin && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                    <div><h2 className="text-2xl font-serif font-bold text-slate-900">Programmer un Événement</h2><p className="text-xs text-slate-500">Créer un événement envoie une notification à tous les membres.</p></div>
                    <button onClick={() => setCurrentView('admin-dashboard')} className="text-xs text-[#007A5E] hover:underline font-bold">← Retour</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <form onSubmit={handleCreateEvent} className="md:col-span-5 bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Titre *</label><input type="text" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="ex: Lela Festival" value={newEvent.titre} onChange={e => setNewEvent({ ...newEvent, titre: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Lieu *</label><input type="text" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="ex: Bamenda" value={newEvent.lieu} onChange={e => setNewEvent({ ...newEvent, lieu: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Date *</label><input type="date" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" value={newEvent.date_evenement} onChange={e => setNewEvent({ ...newEvent, date_evenement: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Description *</label><textarea required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" rows={4} placeholder="..." value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Image URL (optionnel)</label><input type="text" className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="https://..." value={newEvent.image_url} onChange={e => setNewEvent({ ...newEvent, image_url: e.target.value })} /></div>
                      <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-1">Planifier & Notifier <Plus className="h-4 w-4" /></button>
                    </form>
                    <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-950 text-white p-3 font-bold text-xs">Événements dans la base</div>
                      <div className="divide-y text-xs">
                        {events.map(ev => (
                          <div key={ev.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50">
                            <div><span className="font-bold text-slate-900 block">{ev.titre}</span><span className="text-slate-400 block text-[10px]">{ev.date_evenement} | {ev.lieu}</span></div>
                            <button onClick={() => handleDeleteEvent(ev.id)} className="p-1 px-2 hover:bg-red-50 text-red-600 text-xs rounded border border-red-200"><Trash2 className="h-3.5 w-3.5 inline" /> Supprimer</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN AUTHORITIES */}
              {currentView === 'admin-authorities' && isAdmin && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                    <div><h2 className="text-2xl font-serif font-bold text-slate-900">Enregistrer une Autorité</h2><p className="text-xs text-slate-500">Ajouter au répertoire public.</p></div>
                    <button onClick={() => setCurrentView('admin-dashboard')} className="text-xs text-[#007A5E] hover:underline font-bold">← Retour</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <form onSubmit={handleCreateAuthority} className="md:col-span-5 bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Nom *</label><input type="text" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="ex: Fon Angwafo IV" value={newAuth.nom} onChange={e => setNewAuth({ ...newAuth, nom: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Titre / Rôle *</label><input type="text" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="ex: Grand Fon of Mankon" value={newAuth.titre} onChange={e => setNewAuth({ ...newAuth, titre: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Type *</label><select className="w-full bg-slate-50 text-slate-800 border p-2 rounded text-xs" value={newAuth.type} onChange={e => setNewAuth({ ...newAuth, type: e.target.value as 'traditional' | 'administrative' })}><option value="traditional">Traditionnelle</option><option value="administrative">Administrative</option></select></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Ordre *</label><input type="number" required className="w-full bg-slate-50 text-slate-800 border p-2 rounded text-xs" value={newAuth.ordre_affichage} onChange={e => setNewAuth({ ...newAuth, ordre_affichage: e.target.value })} /></div>
                      </div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Bio *</label><textarea required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" rows={4} placeholder="..." value={newAuth.description} onChange={e => setNewAuth({ ...newAuth, description: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Photo URL</label><input type="text" className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="https://..." value={newAuth.photo} onChange={e => setNewAuth({ ...newAuth, photo: e.target.value })} /></div>
                      <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-1">Enregistrer <Plus className="h-4 w-4" /></button>
                    </form>
                    <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-950 text-white p-3 font-bold text-xs">Autorités répertoriées</div>
                      <div className="divide-y text-xs">
                        {authorities.map(au => (
                          <div key={au.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <img src={au.photo} alt={au.nom} className="h-10 w-10 rounded-full object-cover border" referrerPolicy="no-referrer" />
                              <div><span className="font-bold text-slate-900 block">{au.nom}</span><span className="text-slate-400 block text-[10px]">{au.titre} | {au.type}</span></div>
                            </div>
                            <button onClick={() => handleDeleteAuthority(au.id)} className="p-1 px-2 hover:bg-red-50 text-red-600 text-xs rounded border border-red-200"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN GALLERY */}
              {currentView === 'admin-gallery' && isAdmin && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                    <div><h2 className="text-2xl font-serif font-bold text-slate-900">Ajouter des Images</h2><p className="text-xs text-slate-500">Enregistrer des photos dans la galerie publique.</p></div>
                    <button onClick={() => setCurrentView('admin-dashboard')} className="text-xs text-[#007A5E] hover:underline font-bold">← Retour</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <form onSubmit={handleUploadGallery} className="md:col-span-5 bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Légende *</label><input type="text" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="ex: Traditional Drumming" value={newGal.titre} onChange={e => setNewGal({ ...newGal, titre: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Date *</label><input type="date" required className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" value={newGal.date_evenement} onChange={e => setNewGal({ ...newGal, date_evenement: e.target.value })} /></div>
                      <div><label className="block text-xs font-bold text-slate-600 mb-1">Image URL</label><input type="text" className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" placeholder="https://..." value={newGal.photo} onChange={e => setNewGal({ ...newGal, photo: e.target.value })} /></div>
                      <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-1">Téléverser <Plus className="h-4 w-4" /></button>
                    </form>
                    <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-950 text-white p-3 font-bold text-xs">Photos publiées</div>
                      <div className="divide-y text-xs">
                        {gallery.map(gl => (
                          <div key={gl.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <img src={gl.photo} alt={gl.titre} className="h-10 w-16 object-cover border rounded" referrerPolicy="no-referrer" />
                              <div><span className="font-bold text-slate-900 block">{gl.titre}</span><span className="text-slate-400 block text-[10px]">{gl.date_evenement}</span></div>
                            </div>
                            <button onClick={() => handleDeleteGallery(gl.id)} className="p-1 px-2 hover:bg-red-50 text-red-600 text-xs rounded border border-red-200"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="bg-slate-950 text-slate-400 py-10 px-8 border-t border-yellow-500/20 text-xs text-left">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div><h4 className="font-serif font-bold text-sm text-yellow-400 mb-3">Cameroon Anglophone Heritage</h4><p className="leading-relaxed text-slate-400 text-[11px] text-justify">A platform preserving Cameroon Grassfields customs, governance, and cultural events. Powered by Supabase.</p></div>
                <div><h5 className="font-bold text-white uppercase text-[10px] tracking-widest mb-3">Navigation</h5><ul className="space-y-2 text-[11px]"><li><button onClick={() => setCurrentView('home')} className="hover:text-yellow-400 text-slate-400">› Accueil</button></li><li><button onClick={() => setCurrentView('gallery')} className="hover:text-yellow-400 text-slate-400">› Galerie</button></li><li><button onClick={() => setCurrentView('authorities')} className="hover:text-yellow-400 text-slate-400">› Autorités</button></li><li><button onClick={() => setCurrentView('events')} className="hover:text-yellow-400 text-slate-400">› Événements</button></li></ul></div>
                <div><h5 className="font-bold text-white uppercase text-[10px] tracking-widest mb-3">Contact</h5><p className="text-[11px] text-slate-400 leading-relaxed">📍 Bamenda & Buea, Cameroon<br />✉ contact@culture.cm</p></div>
              </div>
              <hr className="my-6 border-slate-800" />
              <div className="text-center text-[10px] text-slate-500 flex flex-wrap justify-between items-center gap-2"><span>&copy; {new Date().getFullYear()} CamHeritage. Powered by Supabase.</span><span className="text-yellow-500/80 font-mono">Grassfields Guardianship</span></div>
            </footer>
          </div>
        </div>
      )}

      {activeTab === 'codebase' && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="bg-slate-850/90 border border-slate-800 p-6 rounded-2xl text-center">
            <Info className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Code Source PHP / SQL</h3>
            <p className="text-xs text-slate-400 max-w-2xl mx-auto">
              L'application est maintenant hébergée avec Supabase (PostgreSQL + Auth). Les fichiers PHP originaux sont conservés sur disque comme référence. Le portail live utilise React + Supabase en temps réel.
            </p>
            <p className="text-xs text-slate-500 mt-4">Pour voir le code source PHP original, consultez les fichiers <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">*.php</code> et <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">schema.sql</code> à la racine du projet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
