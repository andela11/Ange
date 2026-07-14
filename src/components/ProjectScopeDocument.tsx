import React, { useState } from 'react';
import { FileText, Briefcase, Target, Layers, CircleCheck as CheckCircle2, Printer, Copy, Check, TriangleAlert as AlertTriangle, FileSpreadsheet } from 'lucide-react';

export interface ScopeResourceItem {
  id: string;
  nameEn: string;
  nameFr: string;
  cost: number;
  qty: number;
  descEn: string;
  descFr: string;
}

interface ProjectScopeDocumentProps {
  locale: 'fr' | 'en';
  onShowToast: (msg: string) => void;
}

const defaultResources: ScopeResourceItem[] = [
  { id: '1', nameEn: 'Frontend Interface & D3 Analytics', nameFr: 'Interface Frontend & Analyse D3', cost: 65000, qty: 1, descEn: 'Responsive React UI and interactive D3 registration charts.', descFr: 'Interface React responsive et graphiques D3 interactifs.' },
  { id: '2', nameEn: 'Database & Auth Integration', nameFr: 'Base de données & Authentification', cost: 45000, qty: 1, descEn: 'Supabase integration with real-time data and user roles.', descFr: 'Intégration Supabase avec données en temps réel et rôles.' },
  { id: '3', nameEn: 'Photo Gallery & Media', nameFr: 'Galerie Photo & Médias', cost: 50000, qty: 1, descEn: 'Lightbox galleries with image validation and management.', descFr: 'Galeries lightbox avec validation et gestion des images.' },
  { id: '4', nameEn: 'Notifications & Calendar Export', nameFr: 'Notifications & Export Calendrier', cost: 55000, qty: 1, descEn: 'Auto-notifications on event creation and .ics calendar exports.', descFr: 'Notifications auto et export de calendrier .ics.' },
  { id: '5', nameEn: 'QA, Deployment & Documentation', nameFr: 'QA, Déploiement & Documentation', cost: 35000, qty: 1, descEn: 'End-to-end testing, deployment config, and bilingual docs.', descFr: 'Tests complets, configuration et documentation bilingue.' },
];

export default function ProjectScopeDocument({ locale, onShowToast }: ProjectScopeDocumentProps) {
  const [copied, setCopied] = useState(false);
  const [resources, setResources] = useState<ScopeResourceItem[]>(defaultResources);

  const currentTotal = resources.reduce((sum, item) => sum + (item.cost * item.qty), 0);
  const targetBudget = 250000;
  const isBudgetPerfect = currentTotal === targetBudget;

  const handleCostChange = (id: string, newCost: number) => {
    if (isNaN(newCost) || newCost < 0) return;
    setResources(prev => prev.map(item => item.id === id ? { ...item, cost: Math.round(newCost) } : item));
  };

  const handleReset = () => {
    setResources(defaultResources);
    onShowToast(locale === 'fr' ? 'Budget réinitialisé à 250 000 FCFA' : 'Budget reset to 250,000 CFA');
  };

  const copyMarkdown = () => {
    const mdText = `# PROJECT SCOPE & BUDGET\n**Total Budget**: ${targetBudget.toLocaleString()} XAF\n\n${resources.map((r, i) => `${i+1}. **${locale === 'fr' ? r.nameFr : r.nameEn}** — ${r.cost.toLocaleString()} XAF`).join('\n')}\n\n**Total**: ${currentTotal.toLocaleString()} XAF`;
    navigator.clipboard.writeText(mdText);
    setCopied(true);
    onShowToast(locale === 'fr' ? 'Document Markdown copié !' : 'Markdown copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-clay-100 shadow-md rounded-2xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-clay-100 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-forest-100 rounded-xl text-forest-600"><Briefcase className="h-5 w-5" /></span>
          <div>
            <h3 className="font-serif font-bold text-clay-900 text-lg">{locale === 'fr' ? 'Cahier des Charges & Budget' : 'Project Scope & Budget'}</h3>
            <p className="text-xs text-clay-500 mt-0.5">{locale === 'fr' ? 'Budget de 250 000 FCFA' : '250,000 CFA budget'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyMarkdown} className="flex items-center gap-1.5 text-xs bg-clay-100 hover:bg-clay-200 text-clay-700 font-bold px-3 py-2 rounded-xl transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-forest-600" /> : <Copy className="h-3.5 w-3.5" />}
            {locale === 'fr' ? (copied ? 'Copié !' : 'Copier') : (copied ? 'Copied!' : 'Copy')}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs bg-clay-100 hover:bg-clay-200 text-clay-700 font-bold px-3 py-2 rounded-xl transition-colors">
            <Printer className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 ${isBudgetPerfect ? 'bg-forest-50 border-forest-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-2.5">
          {isBudgetPerfect ? <CheckCircle2 className="h-5 w-5 text-forest-600 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />}
          <div>
            <h5 className="font-bold text-sm">{locale === 'fr' ? `Solde : ${currentTotal.toLocaleString()} FCFA` : `Budget: ${currentTotal.toLocaleString()} CFA`}</h5>
            <p className="text-xs mt-0.5 opacity-90">{isBudgetPerfect ? (locale === 'fr' ? 'Budget validé — 250 000 FCFA' : 'Budget validated — 250,000 CFA') : (locale === 'fr' ? `Ajustement requis (${currentTotal.toLocaleString()} ≠ 250 000)` : `Adjustment needed (${currentTotal.toLocaleString()} ≠ 250,000)`)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-md ${isBudgetPerfect ? 'bg-forest-200/50 text-forest-800' : 'bg-red-200/60 text-red-800'}`}>Target: 250,000 XAF</span>
          {!isBudgetPerfect && <button onClick={handleReset} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg">{locale === 'fr' ? 'Corriger' : 'Reset'}</button>}
        </div>
      </div>

      <div className="overflow-x-auto border border-clay-100 rounded-xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-clay-50 border-b border-clay-200 text-clay-600 font-bold text-xs">
              <th className="p-3">#</th>
              <th className="p-3">{locale === 'fr' ? 'Ressource' : 'Resource'}</th>
              <th className="p-3 text-right">Qté</th>
              <th className="p-3 text-right">{locale === 'fr' ? 'Coût (CFA)' : 'Cost (CFA)'}</th>
              <th className="p-3 text-right bg-clay-100/60">{locale === 'fr' ? 'Total (XAF)' : 'Total (XAF)'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clay-100">
            {resources.map((r, index) => (
              <tr key={r.id} className="hover:bg-clay-50/50 transition-colors">
                <td className="p-3 font-mono text-clay-400 text-xs">{index + 1}</td>
                <td className="p-3">
                  <span className="font-bold text-clay-900 text-sm block">{locale === 'fr' ? r.nameFr : r.nameEn}</span>
                  <span className="text-xs text-clay-500 mt-1 block">{locale === 'fr' ? r.descFr : r.descEn}</span>
                </td>
                <td className="p-3 text-right font-mono text-clay-600 text-xs">{r.qty}</td>
                <td className="p-3 text-right">
                  <input type="number" value={r.cost} onChange={e => handleCostChange(r.id, parseFloat(e.target.value))} className="w-24 text-right bg-clay-50 border border-clay-200 p-1.5 rounded-lg font-bold text-clay-800 focus:outline-none focus:border-forest-600 focus:bg-white text-xs font-mono transition-colors" min="0" step="100" />
                </td>
                <td className="p-3 text-right bg-clay-50/40 font-mono font-bold text-clay-900 text-sm">{(r.cost * r.qty).toLocaleString()} XAF</td>
              </tr>
            ))}
            <tr className="bg-clay-50 font-bold text-clay-900">
              <td colSpan={4} className="p-3 text-left text-xs uppercase tracking-wider">{locale === 'fr' ? 'Budget Total' : 'Total Budget'}</td>
              <td className="p-3 text-right bg-forest-50 text-forest-700 font-mono text-base border-t-2 border-forest-600">{currentTotal.toLocaleString()} XAF</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="border border-clay-100 rounded-xl p-4 bg-clay-50/40">
          <h5 className="font-serif font-bold text-xs text-clay-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Layers className="h-4 w-4 text-forest-600" /> {locale === 'fr' ? 'Phases' : 'Milestones'}</h5>
          <ul className="space-y-2 text-xs text-clay-600">
            <li className="flex items-start gap-2"><span className="text-forest-600 font-bold shrink-0">P1:</span> {locale === 'fr' ? 'UX + D3.js (Semaine 1)' : 'UX + D3.js (Week 1)'}</li>
            <li className="flex items-start gap-2"><span className="text-forest-600 font-bold shrink-0">P2:</span> {locale === 'fr' ? 'Base de données & Auth (Semaine 2)' : 'Database & Auth (Week 2)'}</li>
            <li className="flex items-start gap-2"><span className="text-forest-600 font-bold shrink-0">P3:</span> {locale === 'fr' ? 'Galerie, Partage & Validation (Semaine 3)' : 'Gallery, Sharing & Validation (Week 3)'}</li>
          </ul>
        </div>
        <div className="border border-clay-100 rounded-xl p-4 bg-clay-50/40">
          <h5 className="font-serif font-bold text-xs text-clay-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-ember-600" /> {locale === 'fr' ? 'Livrables' : 'Deliverables'}</h5>
          <ul className="space-y-2 text-xs text-clay-600">
            <li className="flex items-start gap-2"><span className="text-forest-600 font-bold shrink-0">✓</span> {locale === 'fr' ? 'Portail bilingue avec Supabase' : 'Bilingual portal with Supabase'}</li>
            <li className="flex items-start gap-2"><span className="text-forest-600 font-bold shrink-0">✓</span> {locale === 'fr' ? 'Graphique D3 temps réel' : 'Real-time D3 chart'}</li>
            <li className="flex items-start gap-2"><span className="text-forest-600 font-bold shrink-0">✓</span> {locale === 'fr' ? 'Export .ics & notifications' : '.ics export & notifications'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
