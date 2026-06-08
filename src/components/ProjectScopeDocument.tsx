import React, { useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  Briefcase, 
  Target, 
  Layers, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  AlertTriangle,
  TrendingUp,
  X,
  FileSpreadsheet
} from 'lucide-react';

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

export default function ProjectScopeDocument({ locale, onShowToast }: ProjectScopeDocumentProps) {
  const [copied, setCopied] = useState(false);
  const [showFullDoc, setShowFullDoc] = useState(true);

  // Default values that sum up exactly to 250,000 CFA francs (XAF)
  const [resources, setResources] = useState<ScopeResourceItem[]>([
    {
      id: '1',
      nameEn: 'Frontend Interface Customization & D3 Analytics (D3.js)',
      nameFr: 'Personnalisation de l\'interface Frontend et Analyse D3 (D3.js)',
      cost: 65000,
      qty: 1,
      descEn: 'Design and implementation of responsive React UI and high-end interactive D3 registration maps & charts.',
      descFr: 'Conception et implémentation de l\'interface React et de graphiques d\'inscriptions D3 interactifs haut de gamme.'
    },
    {
      id: '2',
      nameEn: 'Local DBMS State Synchronization & Auth Simulation',
      nameFr: 'Synchronisation de l\'état DBMS local et simulation d\'authentification',
      cost: 45000,
      qty: 1,
      descEn: 'Integration of local state controller tracking across traditional authorities and simulated user roles.',
      descFr: 'Intégration d\'un gestionnaire d\'état local synchrone pour les autorités traditionnelles et rôles d\'utilisateurs.'
    },
    {
      id: '3',
      nameEn: 'Traditional Authorities Photo Album & Media Optimization',
      nameFr: 'Album photo des autorités traditionnelles et optimisation des médias',
      cost: 50000,
      qty: 1,
      descEn: 'Pristine lightbox media galleries with mock CDN link processing, image scaling, and upload validations.',
      descFr: 'Galerie média avec visionneuse lightbox fluide, traitement d\'images et validations à l\'importation.'
    },
    {
      id: '4',
      nameEn: 'Community Notification Service & Calendar Utility (.ics)',
      nameFr: 'Service de notifications communautaires et utilitaire de calendrier (.ics)',
      cost: 55000,
      qty: 1,
      descEn: 'Bilingual email-alerts mock triggers, event share link copy engines, and standard calendar exports.',
      descFr: 'Déclencheurs d\'alertes bilingues par courriel, partage de liens d\'événements et export de fichiers .ics standards.'
    },
    {
      id: '5',
      nameEn: 'QA, Deployment Configuration, and Bilingual Documentation',
      nameFr: 'Assurance qualité, configuration du déploiement et documentation bilingue',
      cost: 35000,
      qty: 1,
      descEn: 'End-to-end user flow testing, responsive checks, and investor-ready technical documentation in EN/FR.',
      descFr: 'Tests complets des flux utilisateurs, vérifications de réactivité et documentation technique bilingue.'
    }
  ]);

  const calculateTotal = () => {
    return resources.reduce((sum, item) => sum + (item.cost * item.qty), 0);
  };

  const currentTotal = calculateTotal();
  const targetBudget = 250000;
  const isBudgetPerfect = currentTotal === targetBudget;

  const handleCostChange = (id: string, newCost: number) => {
    if (isNaN(newCost) || newCost < 0) return;
    setResources(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, cost: Math.round(newCost) };
      }
      return item;
    }));
  };

  const handleReset = () => {
    setResources([
      {
        id: '1',
        nameEn: 'Frontend Interface Customization & D3 Analytics (D3.js)',
        nameFr: 'Personnalisation de l\'interface Frontend et Analyse D3 (D3.js)',
        cost: 65000,
        qty: 1,
        descEn: 'Design and implementation of responsive React UI and high-end interactive D3 registration maps & charts.',
        descFr: 'Conception et implémentation de l\'interface React et de graphiques d\'inscriptions D3 interactifs haut de gamme.'
      },
      {
        id: '2',
        nameEn: 'Local DBMS State Synchronization & Auth Simulation',
        nameFr: 'Synchronisation de l\'état DBMS local et simulation d\'authentification',
        cost: 45000,
        qty: 1,
        descEn: 'Integration of local state controller tracking across traditional authorities and simulated user roles.',
        descFr: 'Intégration d\'un gestionnaire d\'état local synchrone pour les autorités traditionnelles et rôles d\'utilisateurs.'
      },
      {
        id: '3',
        nameEn: 'Traditional Authorities Photo Album & Media Optimization',
        nameFr: 'Album photo des autorités traditionnelles et optimisation des médias',
        cost: 50000,
        qty: 1,
        descEn: 'Pristine lightbox media galleries with mock CDN link processing, image scaling, and upload validations.',
        descFr: 'Galerie média avec visionneuse lightbox fluide, traitement d\'images et validations à l\'importation.'
      },
      {
        id: '4',
        nameEn: 'Community Notification Service & Calendar Utility (.ics)',
        nameFr: 'Service de notifications communautaires et utilitaire de calendrier (.ics)',
        cost: 55000,
        qty: 1,
        descEn: 'Bilingual email-alerts mock triggers, event share link copy engines, and standard calendar exports.',
        descFr: 'Déclencheurs d\'alertes bilingues par courriel, partage de liens d\'événements et export de fichiers .ics standards.'
      },
      {
        id: '5',
        nameEn: 'QA, Deployment Configuration, and Bilingual Documentation',
        nameFr: 'Assurance qualité, configuration du déploiement et documentation bilingue',
        cost: 35000,
        qty: 1,
        descEn: 'End-to-end user flow testing, responsive checks, and investor-ready technical documentation in EN/FR.',
        descFr: 'Tests complets des flux utilisateurs, vérifications de réactivité et documentation technique bilingue.'
      }
    ]);
    onShowToast(locale === 'fr' ? "✓ Budget réinitialisé à 250 000 FCFA" : "✓ Budget reset to 250,000 CFA");
  };

  const copyMarkdown = () => {
    const mdText = `
# PROJECT SCOPE & BUDGET DOCUMENT
**Project Title**: Grassfields Cameroon Culture Hub & Directory Interface
**Target Audience**: Client / Investors / Community Stakeholders
**Prepared By**: Project Manager
**Total Project Budget**: ${targetBudget.toLocaleString()} XAF (CFA Francs)

---

## 1. Project Background
The **Grassfields Cameroon Culture Hub & Directory** is an interactive, double-vetted bilingual web portal created to preserve and expose traditional and administrative governance structures (Fons, traditional groups, regional administrators) of the Northwest & West Cameroon Grassfields. It leverages modern web standard protocols (React, Tailwind CSS, and D3.js) to deliver clean data visualizers without resource bloating.

## 2. Key Modules & Scope
- **Interactive Directory**: Directory of Sovereign Leaders & Governors with real-time state synchronization.
- **D3.js Registrations Map & Analytics**: Instant interactive monthly visualization helping administrators align calendar allocations.
- **Event Scheduling Hub**: Community announcement portal featuring industry-standard .ics calendar exporting and unique link triggers.
- **Media Archives**: Fully validated media gallery including lightboxes and mock CDN asset managers.

---

## 3. Resource Cost Breakdown (Sum: 250,000 CFA Francs)

${resources.map((r, i) => `${i+1}. **${locale === 'fr' ? r.nameFr : r.nameEn}**
   - Cost per resource: ${r.cost.toLocaleString()} XAF
   - Description: ${locale === 'fr' ? r.descFr : r.descEn}`).join('\n')}

**Total Budget Sum**: ${currentTotal.toLocaleString()} CFA francs (XAF)
**Status**: ${isBudgetPerfect ? 'VALIDATED (Matches target budget perfectly)' : 'ADJUSTING'}

---
*Created in Cloud Native Workspace - Document Ready for Export and Client Presentation.*
    `.trim();

    navigator.clipboard.writeText(mdText);
    setCopied(true);
    onShowToast(locale === 'fr' ? "✓ Document Markdown copié dans le presse-papiers !" : "✓ Markdown document copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 md:p-6 mb-8 relative" id="project-scope-section">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#007A5E]/10 rounded text-[#007A5E]">
              <Briefcase className="h-5 w-5" />
            </span>
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              {locale === 'fr' ? 'Cahier des Charges & Budget du Projet' : 'Project Scope & Budget Document'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {locale === 'fr' 
              ? 'Document officiel pour la présentation aux investisseurs et clients, structurant la répartition exacte du budget de 250 000 FCFA.' 
              : 'Investor-ready deliverables overview outlining structural components, and precise allocation of the 250,000 CFA budget.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
            title="Copy Raw Markdown Document"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {locale === 'fr' ? (copied ? 'Copié !' : 'Copier Markdown') : (copied ? 'Copied!' : 'Copy Markdown')}
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-150 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-250 hidden sm:inline-flex"
            title="Print Scope Document"
          >
            <Printer className="h-3.5 w-3.5" />
            {locale === 'fr' ? 'Imprimer / PDF' : 'Print / PDF'}
          </button>
        </div>
      </div>

      {/* Real-time Budget Status Checker Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 transition-all duration-300 ${
        isBudgetPerfect 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-805' 
          : 'bg-rose-50 border-rose-220 text-rose-805'
      }`}>
        <div className="flex items-start gap-2.5">
          {isBudgetPerfect ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
          )}
          <div>
            <h5 className="font-bold text-xs">
              {locale === 'fr' 
                ? `Vérification du Solde : ${currentTotal.toLocaleString()} FCFA` 
                : `Budget Reconciliation Status: ${currentTotal.toLocaleString()} CFA`}
            </h5>
            <p className="text-[11px] mt-0.5 opacity-90">
              {isBudgetPerfect 
                ? (locale === 'fr' 
                    ? '✓ Parfait ! La somme de chaque ressource équivaut exactement au budget de 250 000 FCFA demandé par le client.' 
                    : '✓ Perfect Alignment! The sum of all allocated resource packages equals the requested 250,000 CFA budget.') 
                : (locale === 'fr' 
                    ? `⚠️ Ajustement Requis : Le total est de ${currentTotal.toLocaleString()} FCFA. Il doit faire exactement 250 000 FCFA.` 
                    : `⚠️ Budget Imbalance: Total equals ${currentTotal.toLocaleString()} CFA instead of 250,000 CFA. Please correct cost inputs.`)}
            </p>
          </div>
        </div>

        {/* Dynamic badge & reset */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-md shadow-inner ${
            isBudgetPerfect ? 'bg-emerald-200/50 text-emerald-800' : 'bg-rose-200/60 text-rose-800'
          }`}>
            Target: 250,000 XAF
          </span>
          {!isBudgetPerfect && (
            <button
              onClick={handleReset}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded shadow-sm border-0"
            >
              {locale === 'fr' ? 'Corriger d\'office' : 'Enforce Target Budget'}
            </button>
          )}
        </div>
      </div>

      {showFullDoc && (
        <div className="space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{locale === 'fr' ? 'Nom du Projet' : 'Project Title'}</span>
              <p className="text-xs font-bold text-slate-800">Grassfields Cultural Hub Preservator</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{locale === 'fr' ? 'Devises & Budget Target' : 'Currency & Target'}</span>
              <p className="text-xs font-bold text-slate-800">250,000 XAF (CFA Francs)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{locale === 'fr' ? 'Audience de Présentation' : 'Target Audience'}</span>
              <p className="text-xs font-bold text-slate-800">{locale === 'fr' ? 'Investisseurs / Chefs Traditionnels' : 'Investors & Sovereign Directors'}</p>
            </div>
          </div>

          {/* Section: Project Scope Description */}
          <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/20">
            <h4 className="font-serif font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-[#007A5E]" />
              {locale === 'fr' ? '1. Contexte du Projet & Objectifs d\'Affaires' : '1. Business Case & Core Deliverables'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              {locale === 'fr' 
                ? "Ce système informatique interactif est conçu pour combler le manque de communication numérique dans les Grassfields du Cameroun. Il centralise le contrôle administratif (Gouverneurs) et la souveraineté traditionnelle ancestrale (Fons des clans Bamileke et Fondoms du Nord-Ouest). Le projet intègre de l'analyse décisionnelle D3.js pour identifier les mois à haute saison d'inscriptions, et un module d'archivage des traditions locales pour promouvoir l'éco-tourisme local."
                : "This specialized administrative system bridges digital gaps across the historic Cameroon Grassfields. It maps sovereign rulers (Traditional Fons and Chiefs) and State Governors into a centralized localized directory. It equips directors with rich modern analytical maps to optimize event hosting slots, local photogrammetry galleries, and immediate community notification relays."}
            </p>
          </div>

          {/* Section: Resource Cost Solver Table */}
          <div>
            <h4 className="font-serif font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-amber-600" />
              {locale === 'fr' ? '2. Répartition Budgétaire Interactive (Saisie Modifiable)' : '2. Resource Cost Solver Matrix (Editable Inputs)'}
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3 w-1/2">{locale === 'fr' ? 'Ressource / Livrable' : 'Resource Deliverable'}</th>
                    <th className="p-3 text-right">{locale === 'fr' ? 'Quantité' : 'Qty'}</th>
                    <th className="p-3 text-right">{locale === 'fr' ? 'Coût Unitaire (CFA)' : 'Unit Cost (CFA)'}</th>
                    <th className="p-3 text-right bg-slate-100/60 font-bold">{locale === 'fr' ? 'Total Ressource (XAF)' : 'Resource Total (XAF)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-705">
                  {resources.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{index + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{locale === 'fr' ? r.nameFr : r.nameEn}</span>
                        <span className="text-[10.5px] text-slate-500 mt-1 block leading-relaxed">{locale === 'fr' ? r.descFr : r.descEn}</span>
                      </td>
                      <td className="p-3 text-right font-semibold font-mono text-slate-700">
                        {r.qty}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 font-mono">
                          <input
                            type="number"
                            value={r.cost}
                            onChange={(e) => handleCostChange(r.id, parseFloat(e.target.value))}
                            className="w-24 text-right bg-slate-50 border border-slate-200 hover:border-slate-350 p-1 rounded font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#007A5E] text-xs font-mono transition-all"
                            min="0"
                            step="100"
                            id={`resource-cost-input-${r.id}`}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-right bg-slate-50/40 font-mono font-bold text-slate-900 text-xs">
                        {(r.cost * r.qty).toLocaleString()} XAF
                      </td>
                    </tr>
                  ))}
                  
                  {/* Footer Row */}
                  <tr className="bg-slate-100/50 font-bold text-slate-900">
                    <td colSpan={3} className="p-3 text-left">
                      {locale === 'fr' ? 'BUDGET DÉFINITIF TOTAL ASSIGNÉ' : 'FINAL TOTAL ALLOCATED PROJECT BUDGET'}
                    </td>
                    <td className="p-3 text-right">
                      {locale === 'fr' ? 'TOTAL :' : 'SUM :'}
                    </td>
                    <td className="p-3 text-right bg-slate-100 text-[#007A5E] font-mono text-sm border-t-2 border-[#007A5E]">
                      {currentTotal.toLocaleString()} XAF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Note on sum stability */}
            <p className="text-[10px] text-slate-400 italic mt-2 text-right">
              * {locale === 'fr' 
                  ? "Assurez-vous que la somme finale est exactement de 250 000 FCFA pour valider et imprimer le document légal." 
                  : "Keep inputs adjusted to maintain a rigorous sum of 250,000 CFA for formal contracts & PDF exports."}
            </p>
          </div>

          {/* Section: Key Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
              <h5 className="font-serif font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                {locale === 'fr' ? '3. Milestones & Phases Clés' : '3. Core Project Milestones'}
              </h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold shrink-0">Phase 1:</span>
                  <span>{locale === 'fr' ? 'Maquettage UX + Visualisation D3.js (Semaine 1)' : 'UX Fine-Tuning & D3.js Integration Layouts (Week 1)'}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold shrink-0">Phase 2:</span>
                  <span>{locale === 'fr' ? 'Synchronisation de l\'état bilingue & simulateur de rôles (Semaine 2)' : 'State controller integration & Simulated Role management (Week 2)'}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold shrink-0">Phase 3:</span>
                  <span>{locale === 'fr' ? 'Album Photos Lightbox, Partage ICS & validation finale (Semaine 3)' : 'Lightbox Album photo uploads, Event sharing links & Final Validation (Week 3)'}</span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
              <h5 className="font-serif font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                {locale === 'fr' ? '4. Livrables finaux livrés au client' : '4. Final Outgoing Deliverables'}
              </h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-505 font-bold text-slate-700">✓</span>
                  <span>{locale === 'fr' ? 'Directory bilingue avec persistance robuste de l\'état' : 'Bilingual Local-state Directory with flawless persistence'}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-505 font-bold text-slate-700">✓</span>
                  <span>{locale === 'fr' ? 'Graphique décisionnel en temps réel (D3.js)' : 'Real-time responsive bar chart (D3.js)'}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-505 font-bold text-slate-700">✓</span>
                  <span>{locale === 'fr' ? 'Fichiers d\'exportation de calendrier .ics & système d\'onglets' : '.ics industry standard event exporters & role tester'}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
