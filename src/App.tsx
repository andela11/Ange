import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, MapPin, Plus, Trash2, Users, Image as ImageIcon,
  AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Search,
  Share2, Download, X, Loader as Loader2, Sparkles, Crown, Building2,
  ChevronRight, TrendingUp, Info, Mail, Lock, User as UserIcon,
} from 'lucide-react';
import { supabase, type Profile, type Evenement, type Autorite, type GalerieItem, type Notification } from './lib/supabase';
import { translations } from './translations';
import RegistrationsChart from './components/RegistrationsChart';
import ProjectScopeDocument from './components/ProjectScopeDocument';
import Header from './components/Header';
import Footer from './components/Footer';

export interface RegistrationCount {
  month: string;
  monthFullEn: string;
  monthFullFr: string;
  count: number;
}

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

export default function App() {
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const t = translations[locale];
  const [currentView, setCurrentView] = useState<string>('home');

  const [session, setSession] = useState<Session>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [events, setEvents] = useState<Evenement[]>([]);
  const [authorities, setAuthorities] = useState<Autorite[]>([]);
  const [gallery, setGallery] = useState<GalerieItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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

  const [authorityFilter, setAuthorityFilter] = useState<'all' | 'traditional' | 'administrative'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; titre: string; date: string } | null>(null);

  const [newEvent, setNewEvent] = useState({ titre: '', lieu: '', date_evenement: '2026-08-15', description: '', image_url: '' });
  const [newAuth, setNewAuth] = useState({ nom: '', titre: '', type: 'traditional' as 'traditional' | 'administrative', ordre_affichage: '1', description: '', photo: '' });
  const [newGal, setNewGal] = useState({ titre: '', date_evenement: '2026-03-12', photo: '' });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4500); };

  const today = new Date().toISOString().split('T')[0];
  const isAdmin = profile?.role === 'admin';

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

  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return; }
    (async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (error) { console.error('Profile fetch error:', error); return; }
      if (data) setProfile(data as Profile);
      else {
        const { data: newProfile } = await supabase.from('profiles').insert({ id: session.user.id, name: session.user.email?.split('@')[0] || 'User', role: 'user' }).select().maybeSingle();
        if (newProfile) setProfile(newProfile as Profile);
      }
    })();
  }, [session]);

  // === Data ===
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

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) { setNotifications([]); return; }
    const { data } = await supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(10);
    if (data) setNotifications(data as Notification[]);
  }, [session]);
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

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

  // === Handlers ===
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
    if (data.session) { setCurrentView('home'); showToast(locale === 'fr' ? 'Inscription réussie !' : 'Registration successful!'); }
    else { showToast(locale === 'fr' ? 'Compte créé. Vérifiez votre email.' : 'Account created. Check your email.'); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setCurrentView('home'); showToast(locale === 'fr' ? 'Déconnexion réussie.' : 'Logged out.'); };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.titre || !newEvent.description || !newEvent.lieu) { alert('Please fill all required fields.'); return; }
    const { data, error } = await supabase.from('evenements').insert({
      titre: newEvent.titre, description: newEvent.description, date_evenement: newEvent.date_evenement,
      lieu: newEvent.lieu, image_url: newEvent.image_url || null,
    }).select().single();
    if (error) { showToast(`Error: ${error.message}`); return; }
    const { data: allProfiles } = await supabase.from('profiles').select('id');
    if (allProfiles && data) {
      const notifTitle = `Nouvel Événement: ${newEvent.titre}`;
      const notifBody = `Un nouvel événement culturel est prévu le ${newEvent.date_evenement} à ${newEvent.lieu}.`;
      const notifs = allProfiles.map(p => ({ user_id: p.id, titre: notifTitle, message: notifBody, status: 'unread' as const }));
      await supabase.from('notifications').insert(notifs);
    }
    setEvents([data as Evenement, ...events]);
    setNewEvent({ titre: '', lieu: '', date_evenement: '2026-08-15', description: '', image_url: '' });
    showToast('Événement planifié ! Notification envoyée à tous les membres.');
    fetchNotifications();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    const { error } = await supabase.from('evenements').delete().eq('id', id);
    if (error) { showToast(`Error: ${error.message}`); return; }
    setEvents(events.filter(e => e.id !== id));
    showToast('Événement retiré.');
  };

  const handleCreateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuth.nom || !newAuth.titre || !newAuth.description) { alert('Please fill all required fields.'); return; }
    const { data, error } = await supabase.from('autorites').insert({
      nom: newAuth.nom, titre: newAuth.titre, type: newAuth.type,
      photo: newAuth.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      description: newAuth.description, ordre_affichage: parseInt(newAuth.ordre_affichage) || 1,
    }).select().single();
    if (error) { showToast(`Error: ${error.message}`); return; }
    setAuthorities([...authorities, data as Autorite]);
    setNewAuth({ nom: '', titre: '', type: 'traditional', ordre_affichage: '1', description: '', photo: '' });
    showToast('Autorité enregistrée au répertoire.');
  };

  const handleDeleteAuthority = async (id: string) => {
    if (!confirm('Voulez-vous vraiment retirer cette autorité ?')) return;
    const { error } = await supabase.from('autorites').delete().eq('id', id);
    if (error) { showToast(`Error: ${error.message}`); return; }
    setAuthorities(authorities.filter(a => a.id !== id));
    showToast('Autorité retirée.');
  };

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
    showToast('Image publiée dans l\'album.');
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette photo ?')) return;
    const { error } = await supabase.from('galerie').delete().eq('id', id);
    if (error) { showToast(`Error: ${error.message}`); return; }
    setGallery(gallery.filter(g => g.id !== id));
    showToast('Photo supprimée.');
  };

  const handleMarkAllRead = async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase.from('notifications').update({ status: 'read' }).eq('user_id', session.user.id).eq('status', 'unread');
    if (error) { showToast(`Error: ${error.message}`); return; }
    setNotifications(notifications.map(n => ({ ...n, status: 'read' as const })));
    showToast('Toutes les notifications marquées comme lues.');
  };

  const handleExportICS = (ev: Evenement) => {
    const cleanDate = ev.date_evenement.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CamHeritage//Cameroon//EN',
      'BEGIN:VEVENT', `UID:event-${ev.id}@culture.cm`, `DTSTAMP:${cleanDate}T090000Z`,
      `DTSTART:${cleanDate}T090000Z`, `DTEND:${cleanDate}T170000Z`,
      `SUMMARY:${ev.titre}`, `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${ev.lieu}`, 'END:VEVENT', 'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${ev.titre.slice(0, 30).toLowerCase().replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast(`Fichier .ics exporté : ${ev.titre}`);
  };

  const handleShareEvent = (ev: Evenement) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?eventId=${ev.id}`;
    navigator.clipboard.writeText(shareUrl);
    setHighlightedEventId(ev.id);
    showToast(`Lien copié : ${ev.titre}`);
  };

  const handleParticipate = (ev: Evenement) => {
    const evDate = new Date(ev.date_evenement);
    const monthIndex = isNaN(evDate.getTime()) ? 5 : evDate.getMonth();
    setRegistrations(prev => prev.map((item, idx) => idx === monthIndex ? { ...item, count: item.count + 1 } : item));
    showToast('Inscription enregistrée (+1 sur le graphique)');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-forest-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-50 flex flex-col">
      <Header
        locale={locale} setLocale={setLocale}
        currentView={currentView} setCurrentView={setCurrentView}
        session={session} profile={profile}
        notifications={notifications} unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead} onLogout={handleLogout}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-clay-900 border border-forest-600/40 text-white rounded-2xl shadow-2xl px-5 py-4 max-w-sm flex items-start gap-3 animate-fade-in-up">
          <CheckCircle2 className="h-5 w-5 text-forest-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{toast}</p>
        </div>
      )}

      <main className="flex-grow">
        {dataLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 text-forest-600 animate-spin" />
          </div>
        )}

        {/* ===== HOME ===== */}
        {!dataLoading && currentView === 'home' && (
          <div className="animate-fade-in">
            {/* Hero */}
            <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
              <img
                src={gallery[0]?.photo || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1920'}
                alt="Cameroun Culture"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clay-950 via-clay-950/70 to-clay-950/20" />
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 w-full">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 bg-forest-600/30 backdrop-blur-md text-forest-200 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-forest-500/30 mb-5 animate-fade-in-up">
                    <Sparkles className="h-3.5 w-3.5" /> {t.hero_tag}
                  </span>
                  <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-[1.1] text-balance animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                    {t.hero_title}
                  </h1>
                  <p className="mt-5 text-base md:text-lg text-clay-200 leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                    {t.hero_desc}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                    <button onClick={() => setCurrentView('gallery')} className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-forest-900/30 hover:scale-105 transition-all">
                      {t.hero_explore} <ChevronRight className="h-4 w-4" />
                    </button>
                    <button onClick={() => setCurrentView('events')} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl border border-white/20 transition-all">
                      {t.nav_events}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: ShieldCheck, title: t.intro_customs_title, desc: t.intro_customs_desc, color: 'forest' },
                  { icon: Users, title: t.intro_directories_title, desc: t.intro_directories_desc, color: 'ember' },
                  { icon: Calendar, title: t.intro_councils_title, desc: t.intro_councils_desc, color: 'clay' },
                ].map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-7 shadow-xl shadow-clay-200/50 border border-clay-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      f.color === 'forest' ? 'bg-forest-100 text-forest-600' :
                      f.color === 'ember' ? 'bg-ember-100 text-ember-600' :
                      'bg-clay-100 text-clay-600'
                    }`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-clay-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-clay-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-clay-900">{t.home_events_title}</h2>
                  <p className="text-sm text-clay-500 mt-2">{t.home_events_desc}</p>
                </div>
                <button onClick={() => { setEventFilter('upcoming'); setCurrentView('events'); }} className="text-sm font-bold text-forest-600 hover:text-forest-700 flex items-center gap-1.5 group">
                  {t.home_view_all} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-clay-100 transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-clay-100 relative overflow-hidden">
                      <img src={event.image_url || `https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800`} alt={event.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-3 right-3 bg-clay-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.lieu}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold text-forest-600 font-mono mb-2">{event.date_evenement}</p>
                      <h4 className="font-serif font-bold text-base text-clay-900 mb-2 group-hover:text-forest-700 transition-colors">{event.titre}</h4>
                      <p className="text-sm text-clay-500 line-clamp-2 leading-relaxed">{event.description}</p>
                      <button onClick={() => setCurrentView('events')} className="mt-4 text-xs font-bold text-forest-600 hover:text-forest-700 flex items-center gap-1">
                        {t.home_details_btn} <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Authorities Preview */}
            <section className="bg-clay-100/60 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-clay-900">{t.home_auth_title}</h2>
                    <p className="text-sm text-clay-500 mt-2">{t.home_auth_desc}</p>
                  </div>
                  <button onClick={() => setCurrentView('authorities')} className="text-sm font-bold text-forest-600 hover:text-forest-700 flex items-center gap-1.5 group">
                    {t.home_view_all} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {authorities.slice(0, 3).map(auth => (
                    <div key={auth.id} className="bg-white rounded-2xl p-7 text-center shadow-md hover:shadow-xl border border-clay-100 transition-all duration-300 hover:-translate-y-1">
                      <div className="relative inline-block mb-4">
                        <img src={auth.photo} alt={auth.nom} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white ${auth.type === 'traditional' ? 'bg-forest-500' : 'bg-clay-500'}`}>
                          {auth.type === 'traditional' ? <Crown className="h-3.5 w-3.5 text-white" /> : <Building2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                      <h4 className="font-serif font-bold text-base text-clay-900">{auth.nom}</h4>
                      <p className="text-xs text-forest-600 font-bold mt-1">{auth.titre}</p>
                      <p className="text-xs text-clay-500 mt-3 line-clamp-3 leading-relaxed">{auth.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===== GALLERY ===== */}
        {!dataLoading && currentView === 'gallery' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="font-serif text-4xl font-bold text-clay-900">{t.gallery_title}</h1>
                <p className="text-sm text-clay-500 mt-2">{t.gallery_desc}</p>
              </div>
              {isAdmin && <button onClick={() => setCurrentView('admin-gallery')} className="bg-forest-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-forest-700 transition-colors shadow-lg"><Plus className="h-4 w-4" /> {t.gallery_manage}</button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map(item => (
                <div key={item.id} onClick={() => setLightboxImage({ src: item.photo, titre: item.titre, date: item.date_evenement })} className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <img src={item.photo} alt={item.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-clay-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-mono text-forest-300">{item.date_evenement}</p>
                    <h4 className="font-serif font-bold text-sm">{item.titre}</h4>
                  </div>
                </div>
              ))}
            </div>
            {lightboxImage && (
              <div className="fixed inset-0 bg-clay-950/95 z-[70] flex items-center justify-center p-6 animate-fade-in" onClick={() => setLightboxImage(null)}>
                <div className="bg-clay-900 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-clay-700 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 bg-clay-800 hover:bg-clay-700 text-white h-9 w-9 rounded-full flex items-center justify-center z-10"><X className="h-4 w-4" /></button>
                  <div className="bg-black flex justify-center items-center">
                    <img src={lightboxImage.src} alt={lightboxImage.titre} className="max-h-[500px] max-w-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-bold text-white">{lightboxImage.titre}</h3>
                      <p className="text-xs text-clay-400 mt-1">{t.gallery_lightbox_linked}: {lightboxImage.date}</p>
                    </div>
                    <span className="bg-forest-600/20 text-forest-300 text-[10px] font-bold px-2.5 py-1 rounded-full">{t.gallery_lightbox_tag}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== AUTHORITIES ===== */}
        {!dataLoading && currentView === 'authorities' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="font-serif text-4xl font-bold text-clay-900">{t.auth_title}</h1>
                <p className="text-sm text-clay-500 mt-2">{t.auth_desc}</p>
              </div>
              {isAdmin && <button onClick={() => setCurrentView('admin-authorities')} className="bg-forest-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-forest-700 transition-colors shadow-lg"><Plus className="h-4 w-4" /> {t.auth_manage}</button>}
            </div>
            <div className="flex gap-2 mb-8">
              {(['all', 'traditional', 'administrative'] as const).map(f => (
                <button key={f} onClick={() => setAuthorityFilter(f)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${authorityFilter === f ? 'bg-forest-600 text-white shadow-lg' : 'bg-white text-clay-600 hover:bg-clay-100 border border-clay-200'}`}>
                  {f === 'all' ? `${t.auth_filter_all} (${authorities.length})` : f === 'traditional' ? `${t.auth_filter_trad} (${authorities.filter(a => a.type === 'traditional').length})` : `${t.auth_filter_admin} (${authorities.filter(a => a.type === 'administrative').length})`}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorities.filter(a => authorityFilter === 'all' || a.type === authorityFilter).map(auth => (
                <div key={auth.id} className="bg-white rounded-2xl p-7 shadow-md hover:shadow-xl border border-clay-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img src={auth.photo} alt={auth.nom} className="h-20 w-20 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                      <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white ${auth.type === 'traditional' ? 'bg-forest-500' : 'bg-clay-500'}`}>
                        {auth.type === 'traditional' ? <Crown className="h-3.5 w-3.5 text-white" /> : <Building2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </div>
                    <div>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-1 ${auth.type === 'traditional' ? 'bg-forest-50 text-forest-700' : 'bg-clay-100 text-clay-600'}`}>
                        {auth.type === 'traditional' ? t.auth_badge_trad : t.auth_badge_admin}
                      </span>
                      <h4 className="font-serif font-bold text-base text-clay-900">{auth.nom}</h4>
                      <p className="text-xs text-forest-600 font-bold">{auth.titre}</p>
                    </div>
                  </div>
                  <p className="text-sm text-clay-500 leading-relaxed">{auth.description}</p>
                  <div className="mt-4 pt-4 border-t border-clay-100 text-xs text-clay-400 font-mono">{t.auth_priority}: {auth.ordre_affichage}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== EVENTS ===== */}
        {!dataLoading && currentView === 'events' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="font-serif text-4xl font-bold text-clay-900">{t.events_title}</h1>
                <p className="text-sm text-clay-500 mt-2">{t.events_desc}</p>
              </div>
              {isAdmin && <button onClick={() => setCurrentView('admin-events')} className="bg-forest-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-forest-700 transition-colors shadow-lg"><Plus className="h-4 w-4" /> {t.events_manage}</button>}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(['all', 'upcoming', 'past'] as const).map(f => (
                <button key={f} onClick={() => setEventFilter(f)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${eventFilter === f ? 'bg-forest-600 text-white shadow-lg' : 'bg-white text-clay-600 hover:bg-clay-100 border border-clay-200'}`}>
                  {f === 'all' ? `${t.events_filter_all} (${events.length})` : f === 'upcoming' ? `${t.events_filter_upcoming} (${events.filter(e => new Date(e.date_evenement) >= new Date(today)).length})` : `${t.events_filter_past} (${events.filter(e => new Date(e.date_evenement) < new Date(today)).length})`}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-clay-200 shadow-md p-5 mb-8 flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-clay-400" />
                <input type="text" value={eventSearchQuery} onChange={e => setEventSearchQuery(e.target.value)} placeholder={t.events_search_placeholder} className="w-full bg-clay-50 text-clay-800 placeholder:text-clay-400 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-clay-200 focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input type="date" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} className="bg-clay-50 text-clay-800 p-2.5 rounded-xl border border-clay-200 text-sm font-mono focus:outline-none focus:border-forest-600" />
                <input type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className="bg-clay-50 text-clay-800 p-2.5 rounded-xl border border-clay-200 text-sm font-mono focus:outline-none focus:border-forest-600" />
                {(eventSearchQuery || eventStartDate || eventEndDate) && <button onClick={() => { setEventSearchQuery(''); setEventStartDate(''); setEventEndDate(''); setHighlightedEventId(null); }} className="bg-clay-800 hover:bg-clay-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5"><X className="h-4 w-4" /> {t.events_filter_clear}</button>}
              </div>
            </div>

            <div className="space-y-6">
              {(() => {
                const filtered = events
                  .filter(e => { if (eventFilter === 'upcoming') return new Date(e.date_evenement) >= new Date(today); if (eventFilter === 'past') return new Date(e.date_evenement) < new Date(today); return true; })
                  .filter(e => !eventSearchQuery.trim() || e.titre.toLowerCase().includes(eventSearchQuery.toLowerCase()) || e.description.toLowerCase().includes(eventSearchQuery.toLowerCase()) || e.lieu.toLowerCase().includes(eventSearchQuery.toLowerCase()))
                  .filter(e => !eventStartDate || e.date_evenement >= eventStartDate)
                  .filter(e => !eventEndDate || e.date_evenement <= eventEndDate);
                if (filtered.length === 0) return (
                  <div className="bg-white rounded-2xl p-16 text-center border border-clay-200 shadow-md">
                    <AlertCircle className="h-12 w-12 text-clay-400 mx-auto mb-4" />
                    <h3 className="font-serif font-bold text-lg text-clay-800 mb-1">{locale === 'fr' ? 'Aucun résultat' : 'No results'}</h3>
                    <p className="text-sm text-clay-500 max-w-md mx-auto">{t.events_no_results}</p>
                  </div>
                );
                return filtered.map(ev => {
                  const upcoming = new Date(ev.date_evenement) >= new Date(today);
                  const isHighlighted = highlightedEventId === ev.id;
                  return (
                    <div key={ev.id} id={`event-card-${ev.id}`} className={`group bg-white rounded-2xl overflow-hidden border shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col md:flex-row ${isHighlighted ? 'ring-4 ring-forest-400 border-forest-400' : 'border-clay-100'}`}>
                      <div className="w-full md:w-2/5 relative min-h-[200px] bg-clay-100 overflow-hidden">
                        <img src={ev.image_url || `https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800`} alt={ev.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${upcoming ? 'bg-forest-600 text-white' : 'bg-clay-700 text-clay-200'}`}>{upcoming ? t.events_badge_upcoming : t.events_badge_past}</span>
                          {isHighlighted && <span className="bg-yellow-400 text-clay-950 text-[10px] font-bold uppercase px-3 py-1 rounded-full">★ Shared</span>}
                        </div>
                      </div>
                      <div className="p-6 md:w-3/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-bold text-forest-600 font-mono">{ev.date_evenement}</span>
                            <span className="text-xs bg-clay-100 text-clay-600 px-2.5 py-1 rounded-full flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {ev.lieu}</span>
                          </div>
                          <h3 className="font-serif font-bold text-xl text-clay-900 mb-2 group-hover:text-forest-700 transition-colors">{ev.titre}</h3>
                          <p className="text-sm text-clay-500 leading-relaxed">{ev.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-clay-100">
                          <button onClick={() => handleShareEvent(ev)} className="flex items-center gap-1.5 text-xs font-bold bg-clay-100 hover:bg-clay-200 text-clay-700 px-3 py-2 rounded-lg transition-colors"><Share2 className="h-3.5 w-3.5" /> {t.events_share_link}</button>
                          <button onClick={() => handleExportICS(ev)} className="flex items-center gap-1.5 text-xs font-bold bg-forest-50 hover:bg-forest-100 text-forest-700 px-3 py-2 rounded-lg transition-colors"><Download className="h-3.5 w-3.5" /> {t.events_export_calendar}</button>
                          {upcoming ? <button onClick={() => handleParticipate(ev)} className="ml-auto bg-forest-600 hover:bg-forest-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">{t.events_participate}</button> : <button onClick={() => setCurrentView('gallery')} className="ml-auto bg-clay-100 hover:bg-clay-200 text-clay-700 text-sm font-bold px-5 py-2 rounded-lg transition-colors">{t.events_photos_album}</button>}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ===== LOGIN ===== */}
        {currentView === 'login' && (
          <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-clay-100 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-forest-600 to-forest-700" />
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-clay-900">Se Connecter</h2>
                  <p className="text-sm text-clay-400 mt-1">Authentification Supabase</p>
                </div>
                {authError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl">{authError}</div>}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-clay-600 mb-1.5">Email</label>
                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="vous@culture.cm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-clay-600 mb-1.5">Mot de passe</label>
                    <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={authSubmitting} className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-forest-900/20 transition-all">
                    {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Connexion
                  </button>
                  <p className="text-center text-sm text-clay-500">Pas de compte ? <button type="button" onClick={() => setCurrentView('register')} className="text-forest-600 font-bold hover:underline">S'inscrire</button></p>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ===== REGISTER ===== */}
        {currentView === 'register' && (
          <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-clay-100 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-ember-500 to-ember-600" />
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ember-500 to-ember-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-clay-900">Créer un compte</h2>
                  <p className="text-sm text-clay-400 mt-1">Inscription Supabase</p>
                </div>
                {authError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl">{authError}</div>}
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-clay-600 mb-1.5">Email</label>
                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-ember-500 focus:bg-white transition-colors" placeholder="vous@culture.cm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-clay-600 mb-1.5">Mot de passe (min. 6 caractères)</label>
                    <input type="password" required minLength={6} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-ember-500 focus:bg-white transition-colors" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={authSubmitting} className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-forest-900/20 transition-all">
                    {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} S'inscrire
                  </button>
                  <p className="text-center text-sm text-clay-500">Déjà membre ? <button type="button" onClick={() => setCurrentView('login')} className="text-forest-600 font-bold hover:underline">Se connecter</button></p>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ===== ADMIN DASHBOARD ===== */}
        {currentView === 'admin-dashboard' && isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="mb-10">
              <h1 className="font-serif text-4xl font-bold text-clay-900 flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-forest-600" /> Tableau de Bord</h1>
              <p className="text-sm text-clay-500 mt-2">Backend Supabase — données en temps réel</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              {[
                { label: locale === 'fr' ? 'Événements' : 'Events', value: events.length, icon: Calendar, color: 'forest' },
                { label: locale === 'fr' ? 'Autorités' : 'Authorities', value: authorities.length, icon: Users, color: 'ember' },
                { label: locale === 'fr' ? 'Galerie' : 'Gallery', value: gallery.length, icon: ImageIcon, color: 'clay' },
                { label: locale === 'fr' ? 'Notifs' : 'Notifs', value: notifications.length, icon: Sparkles, color: 'forest' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-clay-100 shadow-md flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-clay-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-3xl font-serif font-extrabold text-clay-900 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color === 'forest' ? 'bg-forest-100 text-forest-600' : s.color === 'ember' ? 'bg-ember-100 text-ember-600' : 'bg-clay-100 text-clay-600'}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
            <RegistrationsChart data={registrations} locale={locale} />
            <ProjectScopeDocument locale={locale} onShowToast={showToast} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { title: locale === 'fr' ? 'Événements' : 'Events', desc: locale === 'fr' ? 'Créer des événements avec notifications auto.' : 'Create events with auto-notifications.', view: 'admin-events', color: 'forest' },
                { title: locale === 'fr' ? 'Autorités' : 'Authorities', desc: locale === 'fr' ? 'Ajouter Fons et officiels.' : 'Add Fons and officials.', view: 'admin-authorities', color: 'ember' },
                { title: locale === 'fr' ? 'Galerie' : 'Gallery', desc: locale === 'fr' ? 'Téléverser des photos.' : 'Upload photos.', view: 'admin-gallery', color: 'clay' },
              ].map((c, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-clay-100 shadow-md">
                  <h3 className="font-serif font-bold text-base text-clay-900 mb-2">{c.title}</h3>
                  <p className="text-sm text-clay-500 mb-4">{c.desc}</p>
                  <button onClick={() => setCurrentView(c.view)} className={`text-sm font-bold px-5 py-2 rounded-xl transition-colors ${c.color === 'forest' ? 'bg-forest-600 hover:bg-forest-700 text-white' : c.color === 'ember' ? 'bg-ember-500 hover:bg-ember-600 text-white' : 'bg-clay-800 hover:bg-clay-700 text-white'}`}>Gérer</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ADMIN EVENTS ===== */}
        {currentView === 'admin-events' && isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="font-serif text-3xl font-bold text-clay-900">Programmer un Événement</h1>
                <p className="text-sm text-clay-500 mt-1">Créer un événement envoie une notification à tous les membres.</p>
              </div>
              <button onClick={() => setCurrentView('admin-dashboard')} className="text-sm font-bold text-forest-600 hover:underline">← Retour</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleCreateEvent} className="lg:col-span-5 bg-white p-6 border border-clay-100 shadow-md rounded-2xl space-y-4">
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Titre *</label><input type="text" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="ex: Lela Festival" value={newEvent.titre} onChange={e => setNewEvent({ ...newEvent, titre: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Lieu *</label><input type="text" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="ex: Bamenda" value={newEvent.lieu} onChange={e => setNewEvent({ ...newEvent, lieu: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Date *</label><input type="date" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" value={newEvent.date_evenement} onChange={e => setNewEvent({ ...newEvent, date_evenement: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Description *</label><textarea required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" rows={4} placeholder="..." value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Image URL</label><input type="text" className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="https://..." value={newEvent.image_url} onChange={e => setNewEvent({ ...newEvent, image_url: e.target.value })} /></div>
                <button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all">Planifier & Notifier <Plus className="h-4 w-4" /></button>
              </form>
              <div className="lg:col-span-7 bg-white rounded-2xl border border-clay-100 shadow-md overflow-hidden">
                <div className="bg-clay-900 text-white p-4 font-bold text-sm">Événements dans la base</div>
                <div className="divide-y divide-clay-100">
                  {events.map(ev => (
                    <div key={ev.id} className="p-4 flex justify-between items-center hover:bg-clay-50 transition-colors">
                      <div><span className="font-bold text-sm text-clay-900 block">{ev.titre}</span><span className="text-xs text-clay-400 block mt-0.5">{ev.date_evenement} | {ev.lieu}</span></div>
                      <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ADMIN AUTHORITIES ===== */}
        {currentView === 'admin-authorities' && isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="font-serif text-3xl font-bold text-clay-900">Enregistrer une Autorité</h1>
                <p className="text-sm text-clay-500 mt-1">Ajouter au répertoire public.</p>
              </div>
              <button onClick={() => setCurrentView('admin-dashboard')} className="text-sm font-bold text-forest-600 hover:underline">← Retour</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleCreateAuthority} className="lg:col-span-5 bg-white p-6 border border-clay-100 shadow-md rounded-2xl space-y-4">
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Nom *</label><input type="text" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="ex: Fon Angwafo IV" value={newAuth.nom} onChange={e => setNewAuth({ ...newAuth, nom: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Titre / Rôle *</label><input type="text" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="ex: Grand Fon of Mankon" value={newAuth.titre} onChange={e => setNewAuth({ ...newAuth, titre: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Type *</label><select className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600" value={newAuth.type} onChange={e => setNewAuth({ ...newAuth, type: e.target.value as 'traditional' | 'administrative' })}><option value="traditional">Traditionnelle</option><option value="administrative">Administrative</option></select></div>
                  <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Ordre *</label><input type="number" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" value={newAuth.ordre_affichage} onChange={e => setNewAuth({ ...newAuth, ordre_affichage: e.target.value })} /></div>
                </div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Bio *</label><textarea required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" rows={4} placeholder="..." value={newAuth.description} onChange={e => setNewAuth({ ...newAuth, description: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Photo URL</label><input type="text" className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="https://..." value={newAuth.photo} onChange={e => setNewAuth({ ...newAuth, photo: e.target.value })} /></div>
                <button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all">Enregistrer <Plus className="h-4 w-4" /></button>
              </form>
              <div className="lg:col-span-7 bg-white rounded-2xl border border-clay-100 shadow-md overflow-hidden">
                <div className="bg-clay-900 text-white p-4 font-bold text-sm">Autorités répertoriées</div>
                <div className="divide-y divide-clay-100">
                  {authorities.map(au => (
                    <div key={au.id} className="p-4 flex justify-between items-center hover:bg-clay-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={au.photo} alt={au.nom} className="h-12 w-12 rounded-xl object-cover border border-clay-200" referrerPolicy="no-referrer" />
                        <div><span className="font-bold text-sm text-clay-900 block">{au.nom}</span><span className="text-xs text-clay-400 block mt-0.5">{au.titre} | {au.type}</span></div>
                      </div>
                      <button onClick={() => handleDeleteAuthority(au.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ADMIN GALLERY ===== */}
        {currentView === 'admin-gallery' && isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="font-serif text-3xl font-bold text-clay-900">Ajouter des Images</h1>
                <p className="text-sm text-clay-500 mt-1">Enregistrer des photos dans la galerie publique.</p>
              </div>
              <button onClick={() => setCurrentView('admin-dashboard')} className="text-sm font-bold text-forest-600 hover:underline">← Retour</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleUploadGallery} className="lg:col-span-5 bg-white p-6 border border-clay-100 shadow-md rounded-2xl space-y-4">
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Légende *</label><input type="text" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="ex: Traditional Drumming" value={newGal.titre} onChange={e => setNewGal({ ...newGal, titre: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Date *</label><input type="date" required className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" value={newGal.date_evenement} onChange={e => setNewGal({ ...newGal, date_evenement: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-clay-600 mb-1.5">Image URL</label><input type="text" className="w-full bg-clay-50 text-clay-800 border border-clay-200 p-3 rounded-xl text-sm focus:outline-none focus:border-forest-600 focus:bg-white transition-colors" placeholder="https://..." value={newGal.photo} onChange={e => setNewGal({ ...newGal, photo: e.target.value })} /></div>
                <button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all">Téléverser <Plus className="h-4 w-4" /></button>
              </form>
              <div className="lg:col-span-7 bg-white rounded-2xl border border-clay-100 shadow-md overflow-hidden">
                <div className="bg-clay-900 text-white p-4 font-bold text-sm">Photos publiées</div>
                <div className="divide-y divide-clay-100">
                  {gallery.map(gl => (
                    <div key={gl.id} className="p-4 flex justify-between items-center hover:bg-clay-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={gl.photo} alt={gl.titre} className="h-12 w-16 object-cover rounded-lg border border-clay-200" referrerPolicy="no-referrer" />
                        <div><span className="font-bold text-sm text-clay-900 block">{gl.titre}</span><span className="text-xs text-clay-400 block mt-0.5">{gl.date_evenement}</span></div>
                      </div>
                      <button onClick={() => handleDeleteGallery(gl.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer locale={locale} setCurrentView={setCurrentView} />
    </div>
  );
}
