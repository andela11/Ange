import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Sparkles, 
  Bell, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  User, 
  FileCode, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  LogOut, 
  Users, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2,
  FolderOpen,
  Copy,
  Check,
  House,
  Filter,
  ArrowRight,
  ShieldCheck,
  Layers,
  Info,
  Search,
  Share2,
  Download,
  X
} from 'lucide-react';
import { 
  INITIAL_AUTORITES, 
  INITIAL_EVENEMENTS, 
  INITIAL_GALERIE, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USERS, 
  PHP_CODEBASE, 
  User as UserType, 
  Evenement, 
  Autorite, 
  GalerieItem, 
  Notification 
} from './mockData';
import { translations } from './translations';
import RegistrationsChart from './components/RegistrationsChart';
import ProjectScopeDocument from './components/ProjectScopeDocument';

export interface RegistrationCount {
  month: string;
  monthFullEn: string;
  monthFullFr: string;
  count: number;
}

export default function App() {
  // Localization State
  const [locale, setLocale] = useState<'fr' | 'en'>('en');
  const t = translations[locale];

  // Navigation Modes: 'preview' (Interactive Live App) or 'codebase' (PHP Source Viewer)
  const [activeTab, setActiveTab] = useState<'preview' | 'codebase'>('preview');

  // Simulation Session State
  const [currentUser, setCurrentUser] = useState<UserType | null>(INITIAL_USERS[0]); // Starts as Admin for instant testability
  const [currentView, setCurrentView] = useState<string>('home');
  
  // Simulation Database Store
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [events, setEvents] = useState<Evenement[]>(INITIAL_EVENEMENTS);
  const [authorities, setAuthorities] = useState<Autorite[]>(INITIAL_AUTORITES);
  const [gallery, setGallery] = useState<GalerieItem[]>(INITIAL_GALERIE);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
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
    { month: 'Dec', monthFullEn: 'December', monthFullFr: 'Décembre', count: 195 }
  ]);

  // Filter States
  const [authorityFilter, setAuthorityFilter] = useState<'all' | 'traditional' | 'administrative'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');
  const [eventStartDate, setEventStartDate] = useState<string>('');
  const [eventEndDate, setEventEndDate] = useState<string>('');
  const [highlightedEventId, setHighlightedEventId] = useState<number | null>(null);

  // Monitor URL params for shared events
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');
    if (eventIdParam) {
      const id = parseInt(eventIdParam, 10);
      if (!isNaN(id)) {
        setHighlightedEventId(id);
        setCurrentView('events');
        setEventFilter('all');
        setTimeout(() => {
          const el = document.getElementById(`event-card-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 600);
      }
    }
  }, []);

  // Active Lightbox Image State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; titre: string; date: string } | null>(null);

  // New Event Form State (Simulated Admin)
  const [newEvent, setNewEvent] = useState({
    titre: '',
    lieu: '',
    date_evenement: '2026-08-15',
    description: '',
    image_url: ''
  });

  // New Authority Form State (Simulated Admin)
  const [newAuth, setNewAuth] = useState({
    nom: '',
    titre: '',
    type: 'traditional' as 'traditional' | 'administrative',
    ordre_affichage: '1',
    description: '',
    photo: ''
  });

  // New Gallery Photo (Simulated Admin)
  const [newGal, setNewGal] = useState({
    titre: '',
    date_evenement: '2026-03-12',
    photo: ''
  });

  // Codebase File Selector
  const [selectedFileKey, setSelectedFileKey] = useState<keyof typeof PHP_CODEBASE>('schema.sql');
  const [copied, setCopied] = useState<boolean>(false);

  // Success Alarm State
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger: Insert a mock program and broadcast notifications
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.titre || !newEvent.description || !newEvent.lieu) {
      alert("S'il vous plaît, remplissez tous les champs obligatoires.");
      return;
    }

    const createdEvent: Evenement = {
      id: events.length + 1,
      titre: newEvent.titre,
      description: newEvent.description,
      date_evenement: newEvent.date_evenement,
      lieu: newEvent.lieu,
      image_url: newEvent.image_url || `https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800`,
      created_at: new Date().toISOString()
    };

    setEvents([createdEvent, ...events]);

    // Broadcast global virtual notification for other members
    const notifTitle = `Nouvel Événement: ${newEvent.titre}`;
    const notifBody = `Un nouvel événement culturel est planifié le ${newEvent.date_evenement} à ${newEvent.lieu}.`;
    
    const newNotifications: Notification[] = users.map((u, i) => ({
      id: notifications.length + 1 + i,
      user_id: u.id,
      titre: notifTitle,
      message: notifBody,
      status: 'unread',
      created_at: new Date().toISOString()
    }));

    setNotifications([...newNotifications, ...notifications]);

    // Reset Form
    setNewEvent({
      titre: '',
      lieu: '',
      date_evenement: '2026-08-15',
      description: '',
      image_url: ''
    });

    showToast("✓ Événement planifié ! Notification envoyée à tous les membres connectés.");
  };

  // Trigger: Insert mock Authority
  const handleCreateAuthority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuth.nom || !newAuth.titre || !newAuth.description) {
      alert("Indiquez le nom, titre et descriptif.");
      return;
    }

    const createdAuth: Autorite = {
      id: authorities.length + 1,
      nom: newAuth.nom,
      titre: newAuth.titre,
      type: newAuth.type,
      photo: newAuth.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      description: newAuth.description,
      ordre_affichage: parseInt(newAuth.ordre_affichage) || 1
    };

    setAuthorities([...authorities, createdAuth]);
    setNewAuth({
      nom: '',
      titre: '',
      type: 'traditional',
      ordre_affichage: '1',
      description: '',
      photo: ''
    });

    showToast("✓ Autorité enregistrée au répertoire.");
  };

  // Trigger: Insert mock photo in Galerie
  const handleUploadGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGal.titre) {
      alert("Entrez la légende de la photo.");
      return;
    }

    const createdGal: GalerieItem = {
      id: gallery.length + 1,
      titre: newGal.titre,
      photo: newGal.photo || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
      date_evenement: newGal.date_evenement
    };

    setGallery([createdGal, ...gallery]);
    setNewGal({
      titre: '',
      date_evenement: '2026-03-12',
      photo: ''
    });

    showToast("✓ Image téléversée et publiée dans l'album.");
  };

  // Export event to industry standard .ics format for calendar utilities
  const handleExportICS = (ev: Evenement) => {
    const cleanDate = ev.date_evenement.replace(/-/g, '');
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Grassfields Culture Hub//Cameroon//EN",
      "BEGIN:VEVENT",
      `UID:event-${ev.id}@culture.cm`,
      `DTSTAMP:${cleanDate}T090000Z`,
      `DTSTART:${cleanDate}T090000Z`,
      `DTEND:${cleanDate}T170000Z`,
      `SUMMARY:${ev.titre}`,
      `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${ev.lieu}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${ev.titre.slice(0, 30).toLowerCase().replace(/\s+/g, '_')}_calendar.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(locale === 'fr' ? `✓ Fichier .ics exporté : ${ev.titre}` : `✓ .ics file exported for: ${ev.titre}`);
  };

  // Copy shareable event link to clipboard
  const handleShareEvent = (ev: Evenement) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?eventId=${ev.id}`;
    navigator.clipboard.writeText(shareUrl);
    setHighlightedEventId(ev.id);
    showToast(locale === 'fr' ? `✓ Lien copié : ${ev.titre}` : `✓ Share link copied: ${ev.titre}`);
  };

  // Add Dynamic registration to simulator and show feedback
  const handleParticipate = (ev: Evenement) => {
    const evDate = new Date(ev.date_evenement);
    const monthIndex = isNaN(evDate.getTime()) ? 5 : evDate.getMonth(); // Default to June if invalid
    
    setRegistrations(prev => prev.map((item, idx) => {
      if (idx === monthIndex) {
        return { ...item, count: item.count + 1 };
      }
      return item;
    }));

    const alertMsg = locale === 'fr' 
      ? `Inscription confirmée à l'événement: ${ev.titre}! Vous recevrez un courriel automatique. Le graphique analytique D3 en temps réel de votre tableau de contrôle a été incrémenté.` 
      : `Registration confirmed for event: ${ev.titre}! You will receive an automated email notification. The real-time D3 bar chart in your Admin Control Panel has been incremented.`;
    
    alert(alertMsg);
    showToast(locale === 'fr' ? "✓ Inscription enregistrée (+1 sur le graphique D3)" : "✓ Registration recorded (+1 on D3 chart)");
  };

  // Trigger: Clear individual items
  const handleDeleteEvent = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
      setEvents(events.filter(e => e.id !== id));
      showToast("Événement retiré.");
    }
  };

  const handleDeleteAuthority = (id: number) => {
    if (confirm("Voulez-vous vraiment retirer cette autorité ?")) {
      setAuthorities(authorities.filter(a => a.id !== id));
      showToast("Autorité administrative retirée.");
    }
  };

  const handleDeleteGallery = (id: number) => {
    if (confirm("Voulez-vous supprimer cette photo de l'album ?")) {
      setGallery(gallery.filter(g => g.id !== id));
      showToast("Photo supprimée.");
    }
  };

  // Marking unread notification as read
  const handleMarkAllRead = () => {
    if (!currentUser) return;
    setNotifications(notifications.map(n => n.user_id === currentUser.id ? { ...n, status: 'read' as const } : n));
    showToast("✓ Toutes les notifications ont été marquées lues.");
  };

  const unreadCount = currentUser 
    ? notifications.filter(n => n.user_id === currentUser.id && n.status === 'unread').length 
    : 0;

  const currentUnreads = currentUser
    ? notifications.filter(n => n.user_id === currentUser.id)
    : [];

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
                Cameroun Cultural Portal <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Dev Environment</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Dual-Mode: Interactive Shell Simulator & Complete Procedural PHP / MySQL Source Code</p>
            </div>
          </div>
          
          {/* TAB MODE SWITCHER */}
          <div className="bg-slate-950 p-1 rounded-full border border-slate-800 flex items-center">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'preview' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              ⚡ Simulation Live (Portail Web)
            </button>
            <button 
              onClick={() => setActiveTab('codebase')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'codebase' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              📁 Code Source PHP / SQL
            </button>
          </div>
        </div>
      </div>

      {/* TOAST PANEL */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 border-2 border-emerald-400 text-white rounded-xl shadow-2xl p-4 max-w-sm flex items-start gap-2.5 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-200 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold leading-relaxed">{toast}</p>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODE A: INTERACTIVE WEB PORTAL SIMULATION (1:1 EMULATION OF PHP/BOOTSTRAP)
          ====================================================================== */}
      {activeTab === 'preview' && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          
          {/* USER ROLES CONSOLE (DEVELOPER PLAYGROUND CONTROLS) */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase block mb-1">{t.dev_testing_title}</span>
              <p className="text-xs text-slate-300">{t.dev_testing_desc}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button 
                onClick={() => {
                  setCurrentUser(users[0]);
                  showToast(locale === 'fr' ? "Mode démo : Connecté en tant qu'Administrateur" : "Simulating: Signed in as Administrator");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentUser?.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'}`}
              >
                {t.role_admin_btn}
              </button>
              <button 
                onClick={() => {
                  setCurrentUser(users[1]);
                  showToast(locale === 'fr' ? "Mode démo : Connecté en tant que Membre Royal" : "Simulating: Signed in as Traditional Ruler");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentUser?.role === 'user' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'}`}
              >
                {t.role_member_btn}
              </button>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  showToast(locale === 'fr' ? "Mode démo : Visiteur public anonyme" : "Simulating: Public Unauthenticated Visitor");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentUser === null ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-350'}`}
              >
                {t.role_visitor_btn}
              </button>
            </div>
          </div>

          {/* SIMULATED WEB SITE CONTAINER - THE EMULATION BEHAVIOR */}
          <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-300/40 min-h-[600px] flex flex-col">
            
            {/* Top Ribbon Cameroon colors */}
            <div className="h-2 w-full bg-gradient-to-r from-[#007A5E] via-[#CE1126] to-[#FCD116]" />

            {/* Bootstrap emulated Sticky Top Header */}
            <header className="bg-slate-950 text-white border-b border-yellow-500/20">
              <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Brand Logo/Identity */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
                  <div className="text-yellow-400 text-2xl font-serif font-extrabold italic flex items-center gap-1.5">
                    <span className="text-emerald-500">★</span>Cam<span className="text-yellow-400">Heritage</span>
                  </div>
                  <span className="text-[10px] bg-emerald-800 text-emerald-100 font-bold px-2 py-0.5 rounded uppercase">Cameroun</span>
                </div>

                {/* Navbar links */}
                <nav className="flex flex-wrap items-center gap-1.5 font-medium text-sm">
                  <button 
                    onClick={() => setCurrentView('home')} 
                    className={`px-3 py-1 rounded transition-colors ${currentView === 'home' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}
                  >
                    {t.nav_home}
                  </button>
                  <button 
                    onClick={() => setCurrentView('gallery')} 
                    className={`px-3 py-1 rounded transition-colors ${currentView === 'gallery' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}
                  >
                    {t.nav_gallery}
                  </button>
                  <button 
                    onClick={() => setCurrentView('authorities')} 
                    className={`px-3 py-1 rounded transition-colors ${currentView === 'authorities' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}
                  >
                    {t.nav_authorities}
                  </button>
                  <button 
                    onClick={() => setCurrentView('events')} 
                    className={`px-3 py-1 rounded transition-colors ${currentView === 'events' ? 'text-yellow-400 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}
                  >
                    {t.nav_events}
                  </button>
                </nav>

                {/* User Info / Notifications Bell / Login */}
                <div className="flex items-center gap-3">

                  {/* Language Switcher */}
                  <div className="flex items-center bg-slate-900 border border-slate-850 rounded-lg p-0.5 shadow-inner">
                    <button 
                      onClick={() => {
                        setLocale('fr');
                        showToast("Langue modifiée: Français 🇨🇲");
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${locale === 'fr' ? 'bg-[#007A5E] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                      id="locale-fr-btn"
                    >
                      FR
                    </button>
                    <button 
                      onClick={() => {
                        setLocale('en');
                        showToast("Language set to: English 🇬🇧");
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${locale === 'en' ? 'bg-[#CE1126] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                      id="locale-en-btn"
                    >
                      EN
                    </button>
                  </div>
                  
                  {currentUser ? (
                    <div className="flex items-center gap-3">
                      
                      {/* Bell Indicator */}
                      <div className="relative group">
                        <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors relative">
                          <Bell className="h-4 w-4 text-yellow-400" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-bold text-white rounded-full px-1.5 py-0.2 animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        
                        {/* Interactive Dropdown */}
                        <div className="absolute right-0 mt-2 w-80 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 p-0 hidden group-hover:block z-40">
                          <div className="bg-slate-950 p-3 rounded-t-xl border-b border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold">{t.nav_notifications}</span>
                            {unreadCount > 0 && (
                              <button 
                                onClick={handleMarkAllRead}
                                className="text-[10px] text-yellow-400 hover:underline"
                              >
                                {t.nav_mark_all_read}
                              </button>
                            )}
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {currentUnreads.length === 0 ? (
                              <div className="p-4 text-center text-slate-400 text-xs">
                                {t.nav_no_notifications}
                              </div>
                            ) : (
                              currentUnreads.map(n => (
                                <div key={n.id} className={`p-3 border-b border-slate-800 text-xs hover:bg-slate-800 transition-all ${n.status === 'unread' ? 'bg-slate-800/40 border-l-4 border-l-yellow-400' : 'text-slate-400'}`}>
                                  <div className="flex justify-between items-start mb-1 gap-1">
                                    <span className="font-bold text-slate-200">{n.titre}</span>
                                    <span className="text-[9px] text-slate-400 whitespace-nowrap">{t.nav_active}</span>
                                  </div>
                                  <p className="text-[11px] leading-relaxed">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Profile info */}
                      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg px-3 py-1 flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-yellow-500" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-yellow-400">{currentUser.name}</p>
                          <p className="text-[9px] text-slate-350">{currentUser.role === 'admin' ? t.nav_role_admin : t.nav_role_member}</p>
                        </div>
                        {currentUser.role === 'admin' && (
                          <button 
                            onClick={() => setCurrentView('admin-dashboard')}
                            className="bg-red-500/20 text-red-300 hover:bg-red-500/40 text-[9px] font-extrabold border border-red-500/40 rounded px-1.5 py-0.5 ml-2 transition-all"
                          >
                            {t.nav_backoffice}
                          </button>
                        )}
                      </div>

                      {/* Decouplement Logout */}
                      <button 
                        onClick={() => {
                          setCurrentUser(null);
                          setCurrentView('home');
                          showToast(locale === 'fr' ? "Déconnexion réussie." : "Logged out successfully.");
                        }}
                        className="p-1.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors"
                        title={t.nav_logout}
                      >
                        <LogOut className="h-4 w-4" />
                      </button>

                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentView('login')} 
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-3.5 py-1.5 rounded"
                      >
                        {t.nav_login}
                      </button>
                      <button 
                        onClick={() => setCurrentView('register')} 
                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded"
                      >
                        {t.nav_register}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </header>

            {/* Sub-Header banner */}
            <div className="bg-[#005a45] text-white py-2 px-8 text-xs flex justify-between items-center flex-wrap gap-2 shadow-inner">
              <span className="text-slate-100 font-medium">{t.banner_promo}</span>
              <span className="bg-slate-900/40 px-3 py-1 rounded text-yellow-400 font-mono">{t.banner_date}: 2026-06-08</span>
            </div>

            {/* SIMULATED DYNAMIC VIEW SCREEN CONTENT */}
            <div className="flex-grow p-4 md:p-8 bg-slate-50">
              
              {/* ==============================================
                  VIEW: HOME PAGE
                  ============================================== */}
              {currentView === 'home' && (
                <div className="space-y-8 max-w-6xl mx-auto">
                  
                  {/* Hero Slider/Carousel Emulation */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[16/7] md:aspect-[16/6] bg-slate-950 flex items-end">
                    <img 
                      src={gallery[0]?.photo || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1200'} 
                      alt="Cameroun Culture" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
                    <div className="relative z-20 p-6 md:p-12 text-left max-w-2xl text-white">
                      <span className="inline-block bg-[#007A5E] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md mb-3 tracking-wide">
                        {t.hero_tag}
                      </span>
                      <h2 className="text-2xl md:text-4xl font-serif font-bold text-yellow-400 leading-tight">
                        {locale === 'en' ? 'Celebrate Mankon Traditional Toghu Attire' : 'Célébrez l’Art du Toghu de Mankon'}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-200 mt-2 line-clamp-2 md:line-clamp-none">
                        {t.hero_desc}
                      </p>
                      <button 
                        onClick={() => setCurrentView('gallery')}
                        className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-lg"
                      >
                        Explore Galerie <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Intro Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 text-left">
                      <div className="bg-[#007A5E]/10 w-fit p-3 rounded-lg text-[#007A5E] mb-3">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">{t.intro_customs_title}</h4>
                      <p className="text-xs text-slate-500 mt-1 pb-2">
                        {t.intro_customs_desc}
                      </p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 text-left">
                      <div className="bg-amber-100 w-fit p-3 rounded-lg text-amber-600 mb-3">
                        <Users className="h-6 w-6" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">{t.intro_directories_title}</h4>
                      <p className="text-xs text-slate-500 mt-1 pb-2">
                        {t.intro_directories_desc}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 text-left">
                      <div className="bg-red-50 w-fit p-3 rounded-lg text-red-600 mb-3">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">{t.intro_councils_title}</h4>
                      <p className="text-xs text-slate-500 mt-1 pb-2">
                        {t.intro_councils_desc}
                      </p>
                    </div>
                  </div>

                  {/* 3 Upcoming Events Section */}
                  <div>
                    <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6 text-left">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-[#CE1126]">●</span> {t.home_events_title}
                        </h3>
                        <p className="text-xs text-slate-500">{t.home_events_desc}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEventFilter('upcoming');
                          setCurrentView('events');
                        }}
                        className="text-xs font-semibold text-[#007A5E] hover:underline"
                      >
                        {t.home_view_all} <ArrowRight className="h-3 w-3 inline ml-0.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="bg-white rounded-xl overflow-hidden border border-slate-200/75 shadow-sm hover:shadow-md transition-shadow">
                          <div className="h-40 bg-slate-100 relative">
                            <img 
                              src={event.image_url} 
                              alt={event.titre} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-2.5 right-2.5 bg-red-600 text-[9px] font-extrabold text-white px-2 py-1 roundedUppercase flex items-center gap-1 uppercase">
                              <MapPin className="h-2.5 w-2.5" /> {event.lieu}
                            </span>
                          </div>
                          <div className="p-4 text-left">
                            <p className="text-[10px] font-mono font-bold text-[#007A5E]">{event.date_evenement}</p>
                            <h5 className="font-serif font-bold text-slate-900 text-sm mt-1">{event.titre}</h5>
                            <p className="text-xs text-slate-500 mt-1.5 line-clamp-3">{event.description}</p>
                            <button 
                              onClick={() => setCurrentView('events')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1.5 px-3 rounded w-full mt-3 border border-slate-200/60"
                            >
                              {t.home_details_btn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Authorities Preview */}
                  <div>
                    <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6 text-left">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-[#007A5E]">★</span> {t.home_auth_title}
                        </h3>
                        <p className="text-xs text-slate-500">{t.home_auth_desc}</p>
                      </div>
                      <button 
                        onClick={() => setCurrentView('authorities')}
                        className="text-xs font-semibold text-[#007A5E] hover:underline"
                      >
                        {t.home_view_all} <ArrowRight className="h-3 w-3 inline ml-0.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {authorities.slice(0, 3).map((auth) => (
                        <div key={auth.id} className="bg-white rounded-xl border border-slate-200/75 p-5 text-center shadow-sm">
                          <img 
                            src={auth.photo} 
                            alt={auth.nom} 
                            className="h-24 w-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-3"
                            referrerPolicy="no-referrer"
                          />
                          <span className={`inline-block text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1 border ${auth.type === 'traditional' ? 'bg-[#007A5E]/10 text-[#007A5E] border-[#007A5E]/20' : 'bg-slate-100 text-slate-600'}`}>
                            {auth.type === 'traditional' ? (locale === 'fr' ? 'Règne Traditionnel' : 'Traditional Reign') : (locale === 'fr' ? 'Administratif' : 'State Official')}
                          </span>
                          <h5 className="font-serif font-bold text-slate-900 text-sm">{auth.nom}</h5>
                          <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{auth.titre}</p>
                          <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 text-justify">{auth.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ==============================================
                  VIEW: GALLERY / CULTURE PAGE
                  ============================================== */}
              {currentView === 'gallery' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-250 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-yellow-500" /> {t.gallery_title}
                      </h2>
                      <p className="text-xs text-slate-500">{t.gallery_desc}</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => setCurrentView('admin-gallery')}
                        className="bg-yellow-400 text-slate-905 text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-yellow-500/30"
                      >
                        <Plus className="h-4 w-4" /> {t.gallery_manage}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {gallery.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setLightboxImage({ src: item.photo, titre: item.titre, date: item.date_evenement })}
                        className="group relative bg-[#000] rounded-xl overflow-hidden cursor-pointer aspect-square shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1"
                      >
                        <img 
                          src={item.photo} 
                          alt={item.titre} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[9px] font-mono text-yellow-400">{item.date_evenement}</p>
                          <h6 className="font-serif font-bold text-xs mt-0.5">{item.titre}</h6>
                          <span className="text-[9px] bg-emerald-600 text-white font-serif tracking-wider px-1.5 rounded inline-block mt-1">Aperçu <Eye className="h-2.5 w-2.5 inline" /></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LIGHTBOX COMPLEMENTARY PANEL */}
                  {lightboxImage && (
                    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl relative border border-slate-700">
                        <button 
                          onClick={() => setLightboxImage(null)}
                          className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white text-xs font-bold h-8 w-8 rounded-full flex items-center justify-center transition-all border border-slate-600"
                        >
                          ✕
                        </button>
                        <div className="p-1 bg-black flex justify-center items-center min-h-[300px] max-h-[480px]">
                          <img 
                            src={lightboxImage.src} 
                            alt={lightboxImage.titre} 
                            className="max-h-[450px] max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="bg-slate-950 p-4 flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-serif font-bold text-sm text-yellow-400">{lightboxImage.titre}</h4>
                            <p className="text-slate-400 text-[11px] mt-0.5">{t.gallery_lightbox_linked}: {lightboxImage.date}</p>
                          </div>
                          <span className="bg-emerald-800 text-emerald-100 text-[9px] font-bold px-2 py-1 rounded">
                            {t.gallery_lightbox_tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ==============================================
                  VIEW: AUTHORITIES PAGE
                  ============================================== */}
              {currentView === 'authorities' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-250 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-emerald-600" /> {t.auth_title}
                      </h2>
                      <p className="text-xs text-slate-500">{t.auth_desc}</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => setCurrentView('admin-authorities')}
                        className="bg-yellow-400 text-slate-905 text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-yellow-500/30"
                      >
                        <Plus className="h-4 w-4" /> {t.auth_manage}
                      </button>
                    )}
                  </div>

                  {/* Horizontal Filters */}
                  <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-xl max-w-md mb-8 flex gap-1">
                    <button 
                      onClick={() => setAuthorityFilter('all')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${authorityFilter === 'all' ? 'bg-[#007A5E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {t.auth_filter_all} ({authorities.length})
                    </button>
                    <button 
                      onClick={() => setAuthorityFilter('traditional')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${authorityFilter === 'traditional' ? 'bg-[#007A5E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {t.auth_filter_trad} ({authorities.filter(a => a.type === 'traditional').length})
                    </button>
                    <button 
                      onClick={() => setAuthorityFilter('administrative')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${authorityFilter === 'administrative' ? 'bg-[#007A5E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {t.auth_filter_admin} ({authorities.filter(a => a.type === 'administrative').length})
                    </button>
                  </div>

                  {/* List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {authorities
                      .filter(a => authorityFilter === 'all' || a.type === authorityFilter)
                      .map((auth) => (
                        <div key={auth.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between items-center text-center">
                          <div className="w-full">
                            <img 
                              src={auth.photo} 
                              alt={auth.nom} 
                              className="h-28 w-28 rounded-full mx-auto object-cover border-4 border-slate-50 shadow-md mb-4"
                              referrerPolicy="no-referrer"
                            />
                            <span className={`inline-block text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1.5 border ${auth.type === 'traditional' ? 'bg-emerald-55 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {auth.type === 'traditional' ? t.auth_badge_trad : t.auth_badge_admin}
                            </span>
                            <h5 className="font-serif font-bold text-slate-900 text-base mb-1">{auth.nom}</h5>
                            <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{auth.titre}</p>
                            <p className="text-[11px] text-slate-500 mt-3 text-justify leading-relaxed">{auth.description}</p>
                          </div>
                          
                          <div className="w-full mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono tracking-wider">
                            {t.auth_priority}: {auth.ordre_affichage}
                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              )}

              {/* ==============================================
                  VIEW: EVENTS PAGE WITH PAST/UPCOMING FILTERS
                  ============================================== */}
              {currentView === 'events' && (
                <div className="max-w-5xl mx-auto text-left">
                  <div className="border-b border-slate-250 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-rose-600" /> {t.events_title}
                      </h2>
                      <p className="text-xs text-slate-500">{t.events_desc}</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => setCurrentView('admin-events')}
                        className="bg-yellow-400 text-slate-905 text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-yellow-500/30"
                      >
                        <Plus className="h-4 w-4" /> {t.events_manage}
                      </button>
                    )}
                  </div>

                  {/* Horizonal Filters of urgency */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-xl max-w-sm flex gap-1">
                      <button 
                        onClick={() => setEventFilter('all')}
                        className={`flex-1 text-center py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${eventFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {t.events_filter_all} ({events.length})
                      </button>
                      <button 
                        onClick={() => setEventFilter('upcoming')}
                        className={`flex-1 text-center py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${eventFilter === 'upcoming' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {t.events_filter_upcoming} ({events.filter(e => new Date(e.date_evenement) >= new Date('2026-06-08')).length})
                      </button>
                      <button 
                        onClick={() => setEventFilter('past')}
                        className={`flex-1 text-center py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${eventFilter === 'past' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {t.events_filter_past} ({events.filter(e => new Date(e.date_evenement) < new Date('2026-06-08')).length})
                      </button>
                    </div>

                    {/* Simple clear filters indicators */}
                    {(eventSearchQuery || eventStartDate || eventEndDate) && (
                      <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-1.5 font-semibold">
                        ⚠️ Filters active
                      </span>
                    )}
                  </div>

                  {/* Interactive Controls Panel (Search/Dates) */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 animate-fade-in">
                    
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        placeholder={t.events_search_placeholder}
                        className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-450 text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 focus:bg-white transition-all shadow-inner"
                        id="event-search-input"
                      />
                      {eventSearchQuery && (
                        <button
                          onClick={() => setEventSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          title="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Date range filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-500 whitespace-nowrap">{t.events_filter_start_date}</span>
                        <input
                          type="date"
                          value={eventStartDate}
                          onChange={(e) => setEventStartDate(e.target.value)}
                          className="bg-slate-50 text-slate-800 hover:bg-slate-100/60 p-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-rose-600 transition-all font-mono"
                          id="event-start-date-picker"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-500 whitespace-nowrap">{t.events_filter_end_date}</span>
                        <input
                          type="date"
                          value={eventEndDate}
                          onChange={(e) => setEventEndDate(e.target.value)}
                          className="bg-slate-50 text-slate-800 hover:bg-slate-100/60 p-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-rose-600 transition-all font-mono"
                          id="event-end-date-picker"
                        />
                      </div>

                      {/* Clear Filters Button */}
                      {(eventSearchQuery || eventStartDate || eventEndDate) && (
                        <button
                          onClick={() => {
                            setEventSearchQuery('');
                            setEventStartDate('');
                            setEventEndDate('');
                            setHighlightedEventId(null);
                            showToast(locale === 'fr' ? "Filtres réinitialisés." : "Filters reset successfully.");
                          }}
                          className="text-white bg-rose-600 hover:bg-rose-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm border-0 flex items-center gap-1"
                          id="clear-filters-btn"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t.events_filter_clear}
                        </button>
                      )}

                    </div>

                  </div>

                  {/* List Table */}
                  <div className="space-y-6">
                    {(() => {
                      const filtered = events
                        .filter(e => {
                          if (eventFilter === 'upcoming') return new Date(e.date_evenement) >= new Date('2026-06-08');
                          if (eventFilter === 'past') return new Date(e.date_evenement) < new Date('2026-06-08');
                          return true;
                        })
                        .filter(e => {
                          if (!eventSearchQuery.trim()) return true;
                          const q = eventSearchQuery.toLowerCase();
                          return (
                            e.titre.toLowerCase().includes(q) ||
                            e.description.toLowerCase().includes(q) ||
                            e.lieu.toLowerCase().includes(q)
                          );
                        })
                        .filter(e => {
                          if (!eventStartDate) return true;
                          return e.date_evenement >= eventStartDate;
                        })
                        .filter(e => {
                          if (!eventEndDate) return true;
                          return e.date_evenement <= eventEndDate;
                        });

                      if (filtered.length === 0) {
                        return (
                          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm" id="empty-search-results">
                            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                            <h4 className="font-serif font-bold text-slate-800 text-lg mb-1">{locale === 'fr' ? 'Aucun résultat' : 'No results found'}</h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">{t.events_no_results}</p>
                            {(eventSearchQuery || eventStartDate || eventEndDate) && (
                              <button
                                onClick={() => {
                                  setEventSearchQuery('');
                                  setEventStartDate('');
                                  setEventEndDate('');
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-bold py-1.5 px-4 rounded-lg mt-4 transition-colors"
                                id="reset-results-btn"
                              >
                                {t.events_filter_clear}
                              </button>
                            )}
                          </div>
                        );
                      }

                      return filtered.map((ev) => {
                        const upcoming = new Date(ev.date_evenement) >= new Date('2026-06-08');
                        const isHighlighted = highlightedEventId === ev.id;
                        return (
                          <div 
                            key={ev.id} 
                            id={`event-card-${ev.id}`}
                            className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col md:flex-row transform hover:-translate-y-1 hover:shadow-lg ${
                              isHighlighted 
                                ? 'ring-4 ring-yellow-405 border-yellow-450 shadow-xl scale-[1.01] bg-yellow-50/5' 
                                : 'border-slate-200/80 shadow-sm'
                            }`}
                          >
                            
                            {/* Photo Left thumbnail with Zoom hover effects */}
                            <div className="w-full md:w-1/3 relative min-h-[160px] md:min-h-auto bg-slate-100 overflow-hidden">
                              <img 
                                src={ev.image_url} 
                                alt={ev.titre} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow-sm ${upcoming ? 'bg-[#CE1126] text-white bg-rose-600' : 'bg-slate-700 text-slate-100'}`}>
                                  {upcoming ? t.events_badge_upcoming : t.events_badge_past}
                                </span>
                                {isHighlighted && (
                                  <span className="bg-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse">
                                    ★ Link Shared
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Information Right body */}
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
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{t.events_created_at} {ev.created_at.split('T')[0]}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {/* Share button */}
                                  <button
                                    onClick={() => handleShareEvent(ev)}
                                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-[10px] font-bold border border-slate-200"
                                    title={t.events_share_link}
                                    id={`share-btn-${ev.id}`}
                                  >
                                    <Share2 className="h-3 w-3" />
                                    {t.events_share_link}
                                  </button>

                                  {/* Export ICS button */}
                                  <button
                                    onClick={() => handleExportICS(ev)}
                                    className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1 text-[10px] font-bold border border-emerald-100"
                                    title={t.events_export_calendar}
                                    id={`export-btn-${ev.id}`}
                                  >
                                    <Download className="h-3 w-3" />
                                    {t.events_export_calendar}
                                  </button>

                                  {upcoming ? (
                                    <button 
                                      onClick={() => handleParticipate(ev)}
                                      className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5"
                                      id={`participate-btn-${ev.id}`}
                                    >
                                      {t.events_participate}
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => setCurrentView('gallery')}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1.5 px-3 rounded border border-slate-200/60"
                                      id={`album-btn-${ev.id}`}
                                    >
                                      {t.events_photos_album}
                                    </button>
                                  )}
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

              {/* ==============================================
                  VIEW: LOGIN PAGE
                  ============================================== */}
              {currentView === 'login' && (
                <div className="max-w-md mx-auto my-8">
                  <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
                    <div className="h-2 w-full bg-[#007A5E]" />
                    <div className="p-8 text-left">
                      <h3 className="text-xl font-serif font-bold text-slate-900 text-center">Se Connecter</h3>
                      <p className="text-xs text-slate-400 text-center mt-1">Simulé avec PHP sessions</p>

                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Email address</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                            placeholder="ex: admin@culture.cm"
                            defaultValue="admin@culture.cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                          <input 
                            type="password" 
                            className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                            placeholder="••••••••••••"
                            defaultValue="Admin@Cam2026"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            setCurrentUser(users[0]);
                            setCurrentView('home');
                            showToast("Bienvenue d'administration ! Le menu Back-office est maintenant consultable.");
                          }}
                          className="bg-[#007A5E] hover:bg-[#005a45] w-full text-white text-xs font-bold py-2.5 rounded-lg border-0 shadow-sm mt-2 transition-all"
                        >
                          Connexion (Admin)
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentUser(users[1]);
                            setCurrentView('home');
                            showToast(`Bienvenue ${users[1].name} !`);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 w-full text-slate-950 text-xs font-bold py-2.5 rounded-lg border-0 shadow-sm mt-1 transition-all"
                        >
                          Connexion (Membre user)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================
                  VIEW: REGISTER PAGE
                  ============================================== */}
              {currentView === 'register' && (
                <div className="max-w-md mx-auto my-8">
                  <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
                    <div className="h-2 w-full bg-yellow-400" />
                    <div className="p-8 text-left">
                      <h3 className="text-xl font-serif font-bold text-slate-900 text-center">Créer un compte</h3>
                      <p className="text-xs text-slate-400 text-center mt-1">Access instant community updates and reminders</p>

                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Full name</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                            placeholder="ex: Pa Peter"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Email address</label>
                          <input 
                            type="email" 
                            className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                            placeholder="ex: peter@member.cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                          <input 
                            type="password" 
                            className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                            placeholder="At least 6 characters"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            alert("Félicitations, inscription simulée réussie ! Connexion automatique.");
                            const newu: UserType = {
                              id: users.length + 1,
                              name: 'Pa Peter',
                              email: 'peter@member.cm',
                              role: 'user'
                            };
                            setUsers([...users, newu]);
                            setCurrentUser(newu);
                            setCurrentView('home');
                          }}
                          className="bg-yellow-400 hover:bg-yellow-500 w-full text-slate-900 text-xs font-bold py-2.5 rounded-lg border-0 shadow-md mt-2"
                        >
                          S'enregistrer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================
                  VIEW: ADMIN INDEX DASHBOARD (role='admin')
                  ============================================== */}
              {currentView === 'admin-dashboard' && currentUser?.role === 'admin' && (
                <div className="max-w-6xl mx-auto text-left">
                  
                  {/* Dashboard Header */}
                  <div className="border-b border-slate-200 pb-3 mb-6">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-red-650 text-red-650" /> Table de Contrôle Administrateur
                    </h2>
                    <p className="text-xs text-slate-500">Secure backend panel representing procedural PHP controllers with active stat trackers.</p>
                  </div>

                  {/* Micro-Metrics Adaptable panels */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisateurs</span>
                        <h4 className="text-3xl font-serif font-extrabold text-emerald-800">{users.length}</h4>
                      </div>
                      <Users className="h-8 w-8 text-emerald-600 opacity-20" />
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Événements</span>
                        <h4 className="text-3xl font-serif font-extrabold text-rose-800">{events.length}</h4>
                      </div>
                      <Calendar className="h-8 w-8 text-rose-600 opacity-20" />
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autorités</span>
                        <h4 className="text-3xl font-serif font-extrabold text-amber-805 text-amber-800">{authorities.length}</h4>
                      </div>
                      <Users className="h-8 w-8 text-amber-600 opacity-20" />
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Galerie</span>
                        <h4 className="text-3xl font-serif font-extrabold text-[#005a45]">{gallery.length}</h4>
                      </div>
                      <ImageIcon className="h-8 w-8 text-[#005a45] opacity-20" />
                    </div>
                  </div>

                  {/* Dynamic event registrations analytics powered by D3.js */}
                  <RegistrationsChart data={registrations} locale={locale} />

                  {/* Project Scope & Interactive Budget Planner matching target budget */}
                  <ProjectScopeDocument locale={locale} onShowToast={showToast} />

                  {/* Dashboard Sections Shortcuts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-600" /> Événements & Alerte unitaire
                        </h4>
                        <p className="text-xs text-slate-500 mt-2">
                          Manage community events. When you create an item here, a unread notification is appended instantly representing the SQL broadcast script.
                        </p>
                      </div>
                      <button 
                        onClick={() => setCurrentView('admin-events')}
                        className="mt-4 bg-[#007A5E] hover:bg-[#005a45] text-white text-xs font-bold py-2 px-4 rounded-lg w-fit transition-all"
                      >
                        Program Events
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-600" /> Répertoire des Autorités
                        </h4>
                        <p className="text-xs text-slate-500 mt-2">
                          Add or update traditional sovereign Fons and administrative Governor details coupled with order ranking.
                        </p>
                      </div>
                      <button 
                        onClick={() => setCurrentView('admin-authorities')}
                        className="mt-4 bg-[#007A5E] hover:bg-[#005a45] text-white text-xs font-bold py-2 px-4 rounded-lg w-fit transition-all"
                      >
                        Manage Authorities
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-400" /> Art Album (Galerie)
                        </h4>
                        <p className="text-xs text-slate-500 mt-2">
                          Simulate image file uploads, extension mime type security validation checks, and public photo releases.
                        </p>
                      </div>
                      <button 
                        onClick={() => setCurrentView('admin-gallery')}
                        className="mt-4 bg-[#007A5E] hover:bg-[#005a45] text-white text-xs font-bold py-2 px-4 rounded-lg w-fit transition-all"
                      >
                        Publish Pictures
                      </button>
                    </div>
                  </div>

                  {/* Info Banner on design */}
                  <div className="bg-[#fcf7e6] border-l-4 border-l-yellow-500 rounded-lg p-4 flex gap-3 text-slate-850">
                    <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <h6 className="font-serif font-bold text-xs text-yellow-905">Cameroun Cultural DB Integrity</h6>
                      <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                        This test panel behaves identically to the procedural core code. When you add a record in these menus, the numbers on the front-end directory recalculate automatically, verifying transaction boundaries correctly.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* ==============================================
                  VIEW: ADMIN CRUD EVENTS (role='admin')
                  ============================================== */}
              {currentView === 'admin-events' && currentUser?.role === 'admin' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900">Programmer un Événement</h2>
                      <p className="text-xs text-slate-500">Creating a row registers a background notification triggered to all members.</p>
                    </div>
                    <button onClick={() => setCurrentView('admin-dashboard')} className="text-xs text-[#007A5E] hover:underline font-bold">← Back to admin</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Add Form Left Side */}
                    <form onSubmit={handleCreateEvent} className="md:col-span-5 bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Titre de l'événement *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="ex: Lela Festival Shield Rites"
                          value={newEvent.titre}
                          onChange={(e) => setNewEvent({ ...newEvent, titre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-655 mb-1">Lieu *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="ex: Mankon Palace grounds, Bamenda"
                          value={newEvent.lieu}
                          onChange={(e) => setNewEvent({ ...newEvent, lieu: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Date *</label>
                        <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          value={newEvent.date_evenement}
                          onChange={(e) => setNewEvent({ ...newEvent, date_evenement: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Description *</label>
                        <textarea 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          rows={4}
                          placeholder="..."
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Photo d'illustration (URL optionnelle de test)</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="https://images.unsplash.com/..."
                          value={newEvent.image_url}
                          onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded w-full transition-colors flex items-center justify-center gap-1"
                      >
                        Planifier & Émettre notification <Plus className="h-4 w-4" />
                      </button>
                    </form>

                    {/* Listings Right Side */}
                    <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-950 text-white p-3 font-bold text-xs">
                        Événements planifiés dans la base
                      </div>
                      <div className="divide-y text-xs">
                        {events.map(ev => (
                          <div key={ev.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 block">{ev.titre}</span>
                              <span className="text-slate-400 block text-[10px]">{ev.date_evenement} | Lieu: {ev.lieu}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1 px-2 hover:bg-red-50 text-red-650 text-xs rounded border border-red-200"
                              title="Delete event"
                            >
                              <Trash2 className="h-3.5 w-3.5 inline" /> Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================
                  VIEW: ADMIN CRUD AUTHORITIES (role='admin')
                  ============================================== */}
              {currentView === 'admin-authorities' && currentUser?.role === 'admin' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900">Enregistrer une Autorité</h2>
                      <p className="text-xs text-slate-500">Provide official details to sync into our public directory board.</p>
                    </div>
                    <button onClick={() => setCurrentView('admin-dashboard')} className="text-xs text-[#007A5E] hover:underline font-bold">← Back to admin</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Add Form */}
                    <form onSubmit={handleCreateAuthority} className="md:col-span-5 bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Nom complet *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="ex: HRH Fon Sehm Mbinglo I"
                          value={newAuth.nom}
                          onChange={(e) => setNewAuth({ ...newAuth, nom: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Titre / Rôle *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="ex: Paramount Ruler of Nso Clan"
                          value={newAuth.titre}
                          onChange={(e) => setNewAuth({ ...newAuth, titre: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1">Type *</label>
                          <select 
                            className="w-full bg-slate-50 text-slate-800 border p-2 rounded text-xs"
                            value={newAuth.type}
                            onChange={(e) => setNewAuth({ ...newAuth, type: e.target.value as 'traditional' | 'administrative' })}
                          >
                            <option value="traditional">Traditionnelle</option>
                            <option value="administrative">Administrative</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1">Ordre Tri *</label>
                          <input 
                            type="number" 
                            required
                            className="w-full bg-slate-50 text-slate-800 border p-2 rounded text-xs" 
                            value={newAuth.ordre_affichage}
                            onChange={(e) => setNewAuth({ ...newAuth, ordre_affichage: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Aperçu & Bio *</label>
                        <textarea 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          rows={4}
                          placeholder="..."
                          value={newAuth.description}
                          onChange={(e) => setNewAuth({ ...newAuth, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Photo officielle URL (test)</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="https://images.unsplash.com/..."
                          value={newAuth.photo}
                          onChange={(e) => setNewAuth({ ...newAuth, photo: e.target.value })}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded w-full transition-colors flex items-center justify-center gap-1"
                      >
                        Enregistrer Autorité <Plus className="h-4 w-4" />
                      </button>
                    </form>

                    {/* Listings */}
                    <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-950 text-white p-3 font-bold text-xs">
                        Autorités répertoriées dans la base
                      </div>
                      <div className="divide-y text-xs">
                        {authorities.map(au => (
                          <div key={au.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <img src={au.photo} alt={au.nom} className="h-10 w-10 rounded-full object-cover border" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 block">{au.nom}</span>
                                <span className="text-slate-400 block text-[10px]">{au.titre} | {au.type === 'traditional' ? 'Tradition' : 'Administration'}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteAuthority(au.id)}
                              className="p-1 px-2 hover:bg-red-50 text-red-650 text-xs rounded border border-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================
                  VIEW: ADMIN CRUD GALLERY (role='admin')
                  ============================================== */}
              {currentView === 'admin-gallery' && currentUser?.role === 'admin' && (
                <div className="max-w-6xl mx-auto text-left">
                  <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900">Ajouter des Images à l'Album</h2>
                      <p className="text-xs text-slate-500">Register photographic records with associated dates.</p>
                    </div>
                    <button onClick={() => setCurrentView('admin-dashboard')} className="text-xs text-[#007A5E] hover:underline font-bold">← Back to admin</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Add Form */}
                    <form onSubmit={handleUploadGallery} className="md:col-span-5 bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Légende / Titre de la photo *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="ex: Traditional Drumming Assembly"
                          value={newGal.titre}
                          onChange={(e) => setNewGal({ ...newGal, titre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1">Date d'événement lié *</label>
                        <input 
                          type="date" 
                          required
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          value={newGal.date_evenement}
                          onChange={(e) => setNewGal({ ...newGal, date_evenement: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Image URL (simulation upload)</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 text-slate-800 border p-2.5 rounded text-xs" 
                          placeholder="https://images.unsplash.com/..."
                          value={newGal.photo}
                          onChange={(e) => setNewGal({ ...newGal, photo: e.target.value })}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded w-full transition-colors flex items-center justify-center gap-1"
                      >
                        Téléverser & Publier <Plus className="h-4 w-4" />
                      </button>
                    </form>

                    {/* Listings */}
                    <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-950 text-white p-3 font-bold text-xs">
                        Photos de l'album public
                      </div>
                      <div className="divide-y text-xs">
                        {gallery.map(gl => (
                          <div key={gl.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <img src={gl.photo} alt={gl.titre} className="h-10 w-16 object-cover border rounded" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 block">{gl.titre}</span>
                                <span className="text-slate-400 block text-[10px]">{gl.date_evenement}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteGallery(gl.id)}
                              className="p-1 px-2 hover:bg-red-50 text-red-650 text-xs rounded border border-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Simulated Public Portal Footer */}
            <footer className="bg-slate-950 text-slate-350 py-10 px-8 border-t border-yellow-500/20 text-xs text-left">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-serif font-bold text-sm text-yellow-405 mb-3">Cameroon Anglophone Heritage</h4>
                  <p className="leading-relaxed text-slate-400 text-[11px] text-justify">
                    A multi-layered communal environment representing Cameroon fons dynasty customs, geographical council hubs, and public announcements securely.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-white uppercase text-[10px] tracking-widest mb-3">Public map Shortcuts</h5>
                  <ul className="space-y-2 text-[11px]">
                    <li><button onClick={() => setCurrentView('home')} className="hover:text-yellow-450 text-slate-400 hover:text-white transition-colors">› Accueil public</button></li>
                    <li><button onClick={() => setCurrentView('gallery')} className="hover:text-yellow-450 text-slate-400 hover:text-white transition-colors">› Galerie Culturelle</button></li>
                    <li><button onClick={() => setCurrentView('authorities')} className="hover:text-yellow-450 text-slate-400 hover:text-white transition-colors">› Nos Autorités</button></li>
                    <li><button onClick={() => setCurrentView('events')} className="hover:text-yellow-450 text-slate-400 hover:text-white transition-colors">› Conseil des Événements</button></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-white uppercase text-[10px] tracking-widest mb-3">Contact Regional Center</h5>
                  <p className="text-[11px] text-slate-405 text-slate-400 leading-relaxed">
                    📍 Bamenda Highlands & Buea Coastline, Cameroon<br />
                    ✉ contact@culture.cm<br />
                    🔒 Protected under Customary Law
                  </p>
                </div>
              </div>
              <hr className="my-6 border-slate-800" />
              <div className="text-center text-[10px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
                <span>&copy; 2026 CamHeritage. Purely procedural PHP mock system.</span>
                <span className="text-yellow-500/80 font-mono">Developed under Grassfields Guardianship</span>
              </div>
            </footer>

          </div>
        </div>
      )}

      {/* ======================================================================
          MODE B: COMPLETE ENCAPSULATED PHP CODEBASE BROWSER (THE REQUIRED DELIVERABLES)
          ====================================================================== */}
      {activeTab === 'codebase' && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Folder / File Tree Navigation Left */}
            <div className="space-y-4">
              <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#007A5E] mb-3 flex items-center gap-1.5">
                  <FolderOpen className="h-4 w-4" /> File Explorer (PHP App)
                </h3>
                
                <div className="space-y-2 text-xs text-left">
                  
                  {/* Category: SQL */}
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 tracking-wider block mb-1">Database Script</span>
                    <button 
                      onClick={() => setSelectedFileKey('schema.sql')}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${selectedFileKey === 'schema.sql' ? 'bg-[#007A5E] text-white font-bold' : 'bg-slate-800 hover:bg-slate-750'}`}
                    >
                      <Database className="h-3.5 w-3.5 shrink-0" />
                      <div>
                        <p className="font-mono text-[11px]">schema.sql</p>
                        <p className="text-[9px] text-slate-350 opacity-90">Tables & Sample Seeds</p>
                      </div>
                    </button>
                  </div>

                  {/* Category: Config & Includes */}
                  <div className="pt-2">
                    <span className="text-[9px] font-extrabold text-slate-400 tracking-wider block mb-1">Config & helpers</span>
                    <div className="space-y-1">
                      <button 
                        onClick={() => setSelectedFileKey('database.php')}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${selectedFileKey === 'database.php' ? 'bg-[#007A5E] text-white font-bold' : 'bg-slate-800 hover:bg-slate-750'}`}
                      >
                        <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-mono text-[11px]">database.php</p>
                          <p className="text-[9px] text-slate-350 opacity-90">/config/ - PDO Setup</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setSelectedFileKey('functions.php')}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${selectedFileKey === 'functions.php' ? 'bg-[#007A5E] text-white font-bold' : 'bg-slate-800 hover:bg-slate-750'}`}
                      >
                        <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-mono text-[11px]">functions.php</p>
                          <p className="text-[9px] text-slate-350 opacity-90">/includes/ - Sec Helpers</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Category: Public pages */}
                  <div className="pt-2">
                    <span className="text-[9px] font-extrabold text-slate-400 tracking-wider block mb-1">Public Pages</span>
                    <div className="space-y-1">
                      <button 
                        onClick={() => setSelectedFileKey('index.php')}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${selectedFileKey === 'index.php' ? 'bg-[#007A5E] text-white font-bold' : 'bg-slate-800 hover:bg-slate-750'}`}
                      >
                        <House className="h-3.5 w-3.5 text-[#007A5E] shrink-0" />
                        <div>
                          <p className="font-mono text-[11px]">index.php</p>
                          <p className="text-[9px] text-slate-350 opacity-90">Public Homepage Portal</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => setSelectedFileKey('culture.php')}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${selectedFileKey === 'culture.php' ? 'bg-[#007A5E] text-white font-bold' : 'bg-slate-800 hover:bg-slate-750'}`}
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        <div>
                          <p className="font-mono text-[11px]">culture.php</p>
                          <p className="text-[9px] text-slate-350 opacity-90">Gallery with Lightbox</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Category: Admin back-office */}
                  <div className="pt-2">
                    <span className="text-[9px] font-extrabold text-slate-400 tracking-wider block mb-1">Back-Office Management</span>
                    <div>
                      <button 
                        onClick={() => setSelectedFileKey('admin_evenements.php')}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${selectedFileKey === 'admin_evenements.php' ? 'bg-[#007A5E] text-white font-bold' : 'bg-slate-800 hover:bg-slate-750'}`}
                      >
                        <FileCode className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-mono text-[11px]">evenements.php</p>
                          <p className="text-[9px] text-slate-350 opacity-90">/admin/ - Event CRUD & Notif</p>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Deployment Quick steps block */}
              <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-left">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-yellow-400" /> Deployment Guides
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300">
                  <li>Install a local server such as <strong>XAMPP</strong>, <strong>WAMP</strong>, or <strong>Laragon</strong>.</li>
                  <li>Import the complete tables script in <strong>phpMyAdmin</strong> using the <code>schema.sql</code> file.</li>
                  <li>Copy all PHP procedural files into the <code>/htdocs/</code> or <code>/www/</code> directory.</li>
                  <li>Open <code>config/database.php</code> and tune the database credentials as required.</li>
                </ol>
              </div>
            </div>

            {/* Code Highlighter View Right */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[650px]">
                
                {/* Code Header bar */}
                <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-[#007A5E]" /> {PHP_CODEBASE[selectedFileKey].title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono italic">Location path: {PHP_CODEBASE[selectedFileKey].path}</span>
                  </div>
                  
                  <button 
                    onClick={() => copyToClipboard(PHP_CODEBASE[selectedFileKey].code)}
                    className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-4 py-1.5 rounded-lg text-slate-250 border border-slate-750 flex items-center gap-1.5 transition-all text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Code Output panel */}
                <div className="flex-grow overflow-auto p-5 text-left bg-[#14181a] font-mono text-xs text-slate-200">
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {PHP_CODEBASE[selectedFileKey].code}
                  </pre>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
