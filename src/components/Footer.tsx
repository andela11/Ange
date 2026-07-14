import { Mail, MapPin } from 'lucide-react';
import { translations } from '../translations';

interface FooterProps {
  locale: 'fr' | 'en';
  setCurrentView: (v: string) => void;
}

export default function Footer({ locale, setCurrentView }: FooterProps) {
  const t = translations[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-clay-950 text-clay-400 border-t border-clay-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center shadow-lg">
                <span className="text-yellow-400 font-serif font-extrabold text-xl">C</span>
              </div>
              <div>
                <span className="font-serif font-bold text-white text-xl block leading-none">CamHeritage</span>
                <span className="text-[10px] text-clay-500 font-medium tracking-wider uppercase">Cameroun Culture</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              {locale === 'fr'
                ? "Plateforme dédiée à la préservation et la valorisation du patrimoine culturel des Grassfields du Cameroun. Propulsé par Supabase."
                : "A platform dedicated to preserving and promoting the cultural heritage of the Cameroon Grassfields. Powered by Supabase."}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-4">{locale === 'fr' ? 'Navigation' : 'Navigation'}</h5>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setCurrentView('home')} className="hover:text-forest-400 transition-colors">{t.nav_home}</button></li>
              <li><button onClick={() => setCurrentView('gallery')} className="hover:text-forest-400 transition-colors">{t.nav_gallery}</button></li>
              <li><button onClick={() => setCurrentView('authorities')} className="hover:text-forest-400 transition-colors">{t.nav_authorities}</button></li>
              <li><button onClick={() => setCurrentView('events')} className="hover:text-forest-400 transition-colors">{t.nav_events}</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-4">{locale === 'fr' ? 'Contact' : 'Contact'}</h5>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-forest-500 mt-0.5 shrink-0" /> Bamenda & Buea, Cameroun</li>
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 text-forest-500 mt-0.5 shrink-0" /> contact@culture.cm</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-clay-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-clay-500">&copy; {year} CamHeritage. {locale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          <p className="text-xs text-clay-600 font-mono">Grassfields Guardianship &middot; Supabase</p>
        </div>
      </div>
    </footer>
  );
}
