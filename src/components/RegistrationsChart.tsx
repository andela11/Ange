import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RegistrationCount } from '../App';
import { translations } from '../translations';
import { CircleAlert as AlertCircle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

interface RegistrationsChartProps {
  data: RegistrationCount[];
  locale: 'fr' | 'en';
}

export default function RegistrationsChart({ data, locale }: RegistrationsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 });
  const [hoveredBar, setHoveredBar] = useState<RegistrationCount | null>(null);
  const t = translations[locale];

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) setDimensions({ width, height: 320 });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand().domain(data.map(d => locale === 'fr' ? d.monthFullFr : d.monthFullEn)).range([0, width]).padding(0.35);
    const maxVal = d3.max(data, d => d.count) || 100;
    const yScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([height, 0]);

    chartGroup.append('g').attr('class', 'grid-lines').attr('opacity', 0.08).call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => '')).selectAll('.tick line').attr('stroke', '#78716c').attr('stroke-dasharray', '3,3');

    chartGroup.selectAll('.bar-track').data(data).enter().append('rect').attr('class', 'bar-track').attr('x', d => xScale(locale === 'fr' ? d.monthFullFr : d.monthFullEn) || 0).attr('y', 0).attr('width', xScale.bandwidth()).attr('height', height).attr('fill', '#f5f5f4').attr('rx', 6).attr('opacity', 0.5);

    chartGroup.append('g').attr('transform', `translate(0, ${height})`).attr('class', 'x-axis').call(d3.axisBottom(xScale)).selectAll('text').attr('class', 'font-sans text-[10px] font-semibold').attr('fill', '#78716c').attr('transform', width < 480 ? 'rotate(-20)' : 'rotate(0)').attr('text-anchor', width < 480 ? 'end' : 'middle');
    chartGroup.select('.x-axis').select('.domain').attr('stroke', '#d6d3d1');
    chartGroup.select('.x-axis').selectAll('.tick line').attr('stroke', '#d6d3d1');

    chartGroup.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format('d'))).selectAll('text').attr('class', 'font-mono text-[10px]').attr('fill', '#78716c');
    chartGroup.select('.y-axis').select('.domain').remove();
    chartGroup.select('.y-axis').selectAll('.tick line').attr('stroke', '#d6d3d1');

    const bars = chartGroup.selectAll('.data-bar').data(data).enter().append('rect').attr('class', 'data-bar cursor-pointer transition-all duration-200').attr('x', d => xScale(locale === 'fr' ? d.monthFullFr : d.monthFullEn) || 0).attr('width', xScale.bandwidth()).attr('rx', 6).attr('y', height).attr('height', 0).attr('fill', d => d.month === 'Dec' ? '#ea580c' : d.month === 'Jul' ? '#f97316' : '#007a5e');

    bars.transition().duration(800).delay((_d, i) => i * 40).attr('y', d => yScale(d.count)).attr('height', d => height - yScale(d.count));

    bars.on('mouseenter', function (_event, d) { d3.select(this).attr('opacity', 0.85).attr('stroke', '#1c1917').attr('stroke-width', 1.5); setHoveredBar(d); }).on('mouseleave', function () { d3.select(this).attr('opacity', 1.0).attr('stroke', 'none'); setHoveredBar(null); });

    const labels = chartGroup.selectAll('.bar-label').data(data).enter().append('text').attr('class', 'bar-label font-mono text-[10.5px] font-bold text-center').attr('fill', '#44403c').attr('x', d => (xScale(locale === 'fr' ? d.monthFullFr : d.monthFullEn) || 0) + xScale.bandwidth() / 2).attr('text-anchor', 'middle').attr('y', height).attr('opacity', 0);
    labels.transition().duration(850).delay((_d, i) => i * 40).attr('y', d => yScale(d.count) - 6).attr('opacity', 1).text(d => d.count);
  }, [data, dimensions, locale]);

  const getInsights = () => {
    const highest = [...data].sort((a, b) => b.count - a.count)[0];
    return locale === 'fr'
      ? `Forte affluence : ${highest.monthFullFr} avec ${highest.count} inscriptions. Privilégiez ces créneaux pour vos grands événements.`
      : `Peak slot: ${highest.monthFullEn} with ${highest.count} registrations. Prioritize these slots for major events.`;
  };

  return (
    <div className="bg-white border border-clay-100 shadow-md rounded-2xl p-6 mb-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-clay-100 pb-4">
        <div>
          <h4 className="font-serif font-bold text-clay-900 text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-forest-600" />
            {t.admin_registrations_title}
          </h4>
          <p className="text-xs text-clay-500 mt-1">{t.admin_registrations_desc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-clay-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-forest-600" /> Standard</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-ember-500" /> {locale === 'fr' ? 'Été' : 'Summer'}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-ember-600" /> {locale === 'fr' ? 'Lela' : 'Lela'}</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full relative min-h-[320px] bg-clay-50/40 rounded-xl flex items-center justify-center p-2">
        {dimensions.width === 0 ? (
          <div className="flex items-center gap-2 text-xs text-clay-400"><RefreshCw className="h-4 w-4 animate-spin" /> {locale === 'fr' ? 'Calcul...' : 'Loading...'}</div>
        ) : (
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
        )}
        {hoveredBar && (
          <div className="absolute top-2 right-2 bg-clay-900 text-white rounded-xl px-3.5 py-2 shadow-lg border border-clay-700 pointer-events-none text-xs animate-fade-in">
            <span className="font-bold flex items-center gap-1.5 text-forest-400"><Calendar className="h-3.5 w-3.5" /> {locale === 'fr' ? hoveredBar.monthFullFr : hoveredBar.monthFullEn}</span>
            <span className="font-mono font-medium text-clay-200 mt-0.5 block">{hoveredBar.count} {locale === 'fr' ? 'Inscriptions' : 'Registrations'}</span>
          </div>
        )}
      </div>
      <div className="bg-clay-50 rounded-xl p-4 mt-4 border border-clay-100 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-forest-600 shrink-0 mt-0.5" />
        <p className="text-xs text-clay-600 font-medium leading-relaxed">{getInsights()}</p>
      </div>
    </div>
  );
}
