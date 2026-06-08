export interface TranslationSchema {
  dev_testing_title: string;
  dev_testing_desc: string;
  role_admin_btn: string;
  role_member_btn: string;
  role_visitor_btn: string;
  
  // Navigation Bar
  nav_home: string;
  nav_gallery: string;
  nav_authorities: string;
  nav_events: string;
  nav_admin_badge: string;
  nav_notifications: string;
  nav_mark_all_read: string;
  nav_no_notifications: string;
  nav_active: string;
  nav_role_admin: string;
  nav_role_member: string;
  nav_backoffice: string;
  nav_logout: string;
  nav_login: string;
  nav_register: string;

  // Sub-header banner
  banner_promo: string;
  banner_date: string;

  // Home View
  hero_tag: string;
  hero_title: string;
  hero_desc: string;
  hero_explore: string;

  intro_customs_title: string;
  intro_customs_desc: string;
  intro_directories_title: string;
  intro_directories_desc: string;
  intro_councils_title: string;
  intro_councils_desc: string;

  home_events_title: string;
  home_events_desc: string;
  home_view_all: string;
  home_details_btn: string;

  home_auth_title: string;
  home_auth_desc: string;

  // Gallery View
  gallery_title: string;
  gallery_desc: string;
  gallery_manage: string;
  gallery_preview: string;
  gallery_lightbox_close: string;
  gallery_lightbox_linked: string;
  gallery_lightbox_tag: string;

  // Authorities View
  auth_title: string;
  auth_desc: string;
  auth_manage: string;
  auth_filter_all: string;
  auth_filter_trad: string;
  auth_filter_admin: string;
  auth_badge_trad: string;
  auth_badge_admin: string;
  auth_priority: string;

  // Events View
  events_title: string;
  events_desc: string;
  events_manage: string;
  events_filter_all: string;
  events_filter_upcoming: string;
  events_filter_past: string;
  events_badge_upcoming: string;
  events_badge_past: string;
  events_participate: string;
  events_photos_album: string;
  events_created_at: string;
  events_search_placeholder: string;
  events_filter_start_date: string;
  events_filter_end_date: string;
  events_filter_clear: string;
  events_export_calendar: string;
  events_share_link: string;
  events_copied_toast: string;
  events_no_results: string;
  admin_registrations_title: string;
  admin_registrations_desc: string;
  admin_registrations_slots: string;
  admin_chart_month: string;
  admin_chart_count: string;
}

export const translations: Record<'fr' | 'en', TranslationSchema> = {
  fr: {
    dev_testing_title: "Panneau d'Essai du Développeur",
    dev_testing_desc: "Simulez une connexion sous différents rôles. Créer un événement en tant qu'Admin déclenche des alertes en direct !",
    role_admin_btn: "🔐 Chef Admin (admin@culture.cm)",
    role_member_btn: "👑 Membre Royal (member@culture.cm)",
    role_visitor_btn: "👤 Visiteur Public",

    nav_home: "Accueil",
    nav_gallery: "Culture & Galerie",
    nav_authorities: "Autorités",
    nav_events: "Événements",
    nav_admin_badge: "Admin Dashboard",
    nav_notifications: "Notifications",
    nav_mark_all_read: "Tout marquer comme lu",
    nav_no_notifications: "Pas de notifications",
    nav_active: "Active",
    nav_role_admin: "Administrateur",
    nav_role_member: "Membre",
    nav_backoffice: "Back-office",
    nav_logout: "Se déconnecter",
    nav_login: "Connexion",
    nav_register: "Inscription",

    banner_promo: "✨ Valorisation des coutumes des Grassfields et des initiatives de développement locales.",
    banner_date: "Date locale",

    hero_tag: "★ Vitrine Culturelle en Direct",
    hero_title: "Célébrez l'art des vêtements en Toghu de Mankon",
    hero_desc: "Promouvoir les coutumes ancestrales, les chefferies locales et l'intégration du développement dans les régions du Nord-Ouest et du Sud-Ouest du Cameroun.",
    hero_explore: "Explorer la Galerie",

    intro_customs_title: "Coutumes Authentiques",
    intro_customs_desc: "Documentation des dynasties tribales régionales, conseils royaux, danses traditionnelles et objets culturels représentant la grandeur des Grassfields.",
    intro_directories_title: "Répertoires des Dirigeants",
    intro_directories_desc: "Répertoire complet des administrateurs civils aux côtés des chefs traditionnels suprêmes (Fons) préservant l'intégrité communautaire.",
    intro_councils_title: "Conseils Planifiés",
    intro_councils_desc: "Suivez le calendrier des assemblées, des rites royaux et des danses communautaires. Soyez notifié instantanément à la création.",

    home_events_title: "● Événements à Venir (Prochains)",
    home_events_desc: "Restez informé des prochains programmes planifiés à Buea, Bamenda et dans les palais royaux.",
    home_view_all: "Voir tous",
    home_details_btn: "Détails",

    home_auth_title: "★ Autorités Locales Récentes",
    home_auth_desc: "Notre organe de gouvernance régionale composé de Fons traditionnels et du Gouverneur civil.",

    gallery_title: "Galerie Culturelle & Rituels",
    gallery_desc: "Explorez les symboles traditionnels, les motifs de Toghus et les photos de festivals en haute résolution.",
    gallery_manage: "Gérer Galerie",
    gallery_preview: "Aperçu",
    gallery_lightbox_close: "✕",
    gallery_lightbox_linked: "Date de l'événement lié",
    gallery_lightbox_tag: "★ Patrimoine Cameroun",

    auth_title: "Répertoire des Autorités",
    auth_desc: "Conseils des chefs traditionnels des Grassfields et responsables administratifs régionaux du Nord-Ouest et du Sud-Ouest.",
    auth_manage: "Gérer Autorités",
    auth_filter_all: "Toutes",
    auth_filter_trad: "👑 Traditions",
    auth_filter_admin: "🏢 Administrations",
    auth_badge_trad: "👑 Règne Traditionnel",
    auth_badge_admin: "🏢 Officiel de l'État",
    auth_priority: "Priorité d'affichage",

    events_title: "Conseil des Événements",
    events_desc: "Restez informé des assemblées culturelles et des plateformes de développement civique dans les départements anglophones.",
    events_manage: "Gérer Événements",
    events_filter_all: "Tous",
    events_filter_upcoming: "⌛ À venir",
    events_filter_past: "📦 Archives / Passés",
    events_badge_upcoming: "À Venir",
    events_badge_past: "Archives",
    events_participate: "Participer",
    events_photos_album: "Album Photos",
    events_created_at: "Créé le",
    events_search_placeholder: "Rechercher par nom, description ou lieu...",
    events_filter_start_date: "Date de début :",
    events_filter_end_date: "Date de fin :",
    events_filter_clear: "Réinitialiser les filtres",
    events_export_calendar: "Exporter (.ics)",
    events_share_link: "Partager l'événement",
    events_copied_toast: "Lien de l'événement copié dans le presse-papiers !",
    events_no_results: "Aucun événement ne correspond à vos critères de recherche.",
    admin_registrations_title: "Inscriptions aux Événements par Mois (D3.js)",
    admin_registrations_desc: "Visualisation analytique en direct pour aider à identifier les créneaux et périodes de forte affluence.",
    admin_registrations_slots: "Analyse des Créneaux Mensuels",
    admin_chart_month: "Mois",
    admin_chart_count: "Inscriptions",
  },
  en: {
    dev_testing_title: "Developer Testing Panel",
    dev_testing_desc: "Simulate logins as different roles. Creating events as **Admin** generates live alerts for members!",
    role_admin_btn: "🔐 Chef Admin (admin@culture.cm)",
    role_member_btn: "👑 Membre Royal (member@culture.cm)",
    role_visitor_btn: "👤 Public Visitor",

    nav_home: "Home",
    nav_gallery: "Culture & Gallery",
    nav_authorities: "Authorities",
    nav_events: "Events",
    nav_admin_badge: "Admin Dashboard",
    nav_notifications: "Notifications",
    nav_mark_all_read: "Mark all as read",
    nav_no_notifications: "No notifications",
    nav_active: "Active",
    nav_role_admin: "Administrator",
    nav_role_member: "Member",
    nav_backoffice: "Back-office",
    nav_logout: "Log Out",
    nav_login: "Login",
    nav_register: "Register",

    banner_promo: "✨ Promoting Grassfields customs and local developmental agendas.",
    banner_date: "Local Date",

    hero_tag: "★ Live Cultural Showcase",
    hero_title: "Celebrate Mankon Traditional Toghu Attire",
    hero_desc: "Promoting ancestral customs, local kingdoms, and developmental integration across North-West and South-West Cameroon.",
    hero_explore: "Explore Gallery",

    intro_customs_title: "Authentic Customs",
    intro_customs_desc: "Documenting regional tribal dynasties, royal councils, traditional dances, and cultural artifacts representing Grassfields grandeur.",
    intro_directories_title: "Rulers Directories",
    intro_directories_desc: "Comprehensive listing of administrative directors alongside traditional paramount chiefs (Fons) preserving regional boundaries.",
    intro_councils_title: "Scheduled Councils",
    intro_councils_desc: "Get calendar events about developmental panels, assemblies, royal rites, and community dances. Instantly notified upon creation.",

    home_events_title: "● Upcoming Events",
    home_events_desc: "Stay informed of active programs scheduled in Buea, Bamenda, and palaces.",
    home_view_all: "View all",
    home_details_btn: "Details",

    home_auth_title: "★ Recent Local Authorities",
    home_auth_desc: "Our regional governance board of traditional Fons and civilian Governor leaderships.",

    gallery_title: "Cultural Gallery & Rites",
    gallery_desc: "Explore traditional symbols, Toghus patterns and festival photographs in high resolution.",
    gallery_manage: "Manage Gallery",
    gallery_preview: "Preview",
    gallery_lightbox_close: "✕",
    gallery_lightbox_linked: "Linked event date",
    gallery_lightbox_tag: "★ Heritage Cameroon",

    auth_title: "Directory of Authorities",
    auth_desc: "Traditional chief councils of the Grassfields along with regional administrative officials of North West & South West.",
    auth_manage: "Manage Authorities",
    auth_filter_all: "All",
    auth_filter_trad: "👑 Traditions",
    auth_filter_admin: "🏢 Administrations",
    auth_badge_trad: "👑 Traditional Reign",
    auth_badge_admin: "🏢 State Official",
    auth_priority: "Display Priority",

    events_title: "Council of Events",
    events_desc: "Stay informed about cultural assemblies and civic development platforms in Anglophone departments.",
    events_manage: "Manage Events",
    events_filter_all: "All",
    events_filter_upcoming: "⌛ Upcoming",
    events_filter_past: "📦 Archive / Past",
    events_badge_upcoming: "Upcoming",
    events_badge_past: "Archive",
    events_participate: "Participate",
    events_photos_album: "Album Photos",
    events_created_at: "Created at",
    events_search_placeholder: "Search by title, description, or location...",
    events_filter_start_date: "Start date:",
    events_filter_end_date: "End date:",
    events_filter_clear: "Reset filters",
    events_export_calendar: "Export (.ics)",
    events_share_link: "Share event",
    events_copied_toast: "Event share link copied to clipboard!",
    events_no_results: "No events match your search criteria.",
    admin_registrations_title: "Event Registrations per Month (D3.js)",
    admin_registrations_desc: "Helper visualization identifying the most popular and highly-attended slots of the season.",
    admin_registrations_slots: "Popular Time Slots Analysis",
    admin_chart_month: "Month",
    admin_chart_count: "Registrations",
  }
};
