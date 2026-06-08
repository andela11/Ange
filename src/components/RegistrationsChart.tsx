import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RegistrationCount } from '../App';
import { translations } from '../translations';
import { AlertCircle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

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

  // Handle responsive resizing using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      
      const { width } = entries[0].contentRect;
      // Guarantee a positive and functional width
      if (width > 0) {
        setDimensions({
          width: width,
          height: 320
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Render the D3 Chart whenever details change
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    // Standard D3 clean-up of previous renders
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X-Scale: Ordinal band of months
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => locale === 'fr' ? d.monthFullFr : d.monthFullEn))
      .range([0, width])
      .padding(0.35);

    // Y-Scale: Linear registrations count
    const maxVal = d3.max(data, d => d.count) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1]) // Add 10% breathing room at the top
      .range([height, 0]);

    // Gridlines (Y-axis gridlines for pristine readable layout)
    chartGroup
      .append('g')
      .attr('class', 'grid-lines')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('.tick line')
      .attr('stroke', '#64748b')
      .attr('stroke-dasharray', '3,3');

    // Subtle background tracks for each bar (looks highly professional and finished)
    chartGroup
      .selectAll('.bar-track')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-track')
      .attr('x', d => xScale(locale === 'fr' ? d.monthFullFr : d.monthFullEn) || 0)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', height)
      .attr('fill', '#f1f5f9')
      .attr('rx', 4)
      .attr('opacity', 0.45);

    // X Axis
    chartGroup
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x-axis')
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('class', 'font-sans text-[10px] font-semibold text-slate-500')
      .attr('transform', width < 480 ? 'rotate(-20)' : 'rotate(0)')
      .attr('text-anchor', width < 480 ? 'end' : 'middle');

    chartGroup.select('.x-axis').select('.domain').attr('stroke', '#cbd5e1');
    chartGroup.select('.x-axis').selectAll('.tick line').attr('stroke', '#cbd5e1');

    // Y Axis
    chartGroup
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format('d')))
      .selectAll('text')
      .attr('class', 'font-mono text-[10px] text-slate-500');

    chartGroup.select('.y-axis').select('.domain').remove(); // Hide standard vertical line for clean look
    chartGroup.select('.y-axis').selectAll('.tick line').attr('stroke', '#cbd5e1');

    // Draw the actual data bars
    const bars = chartGroup
      .selectAll('.data-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'data-bar cursor-pointer transition-all duration-200')
      .attr('x', d => xScale(locale === 'fr' ? d.monthFullFr : d.monthFullEn) || 0)
      .attr('width', xScale.bandwidth())
      .attr('rx', 4) // Rounded top corners
      // D3 transitions for delightful page load animations
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => {
        // Highlighting peak slots (Dec & July) to help admins find popular slots
        if (d.month === 'Dec') {
          return '#e11d48'; // Rose red for ultimate peak
        }
        if (d.month === 'Jul') {
          return '#d97706'; // Amber gold for summer peak
        }
        return '#007A5E'; // Cameroon traditional forest green
      });

    bars
      .transition()
      .duration(800)
      .delay((_d, i) => i * 40)
      .attr('y', d => yScale(d.count))
      .attr('height', d => height - yScale(d.count));

    // Interactive event listeners for tooltips and hover animations
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('opacity', 0.85)
          .attr('stroke', '#000')
          .attr('stroke-width', 1.5);
        setHoveredBar(d);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('opacity', 1.0)
          .attr('stroke', 'none');
        setHoveredBar(null);
      });

    // Static text labels on top of the bars (shows actual numbers directly)
    const labels = chartGroup
      .selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label font-mono text-[10.5px] font-bold fill-slate-700 text-center')
      .attr('x', d => (xScale(locale === 'fr' ? d.monthFullFr : d.monthFullEn) || 0) + xScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      // Dynamic transition alignment
      .attr('y', height)
      .attr('opacity', 0);

    labels
      .transition()
      .duration(850)
      .delay((_d, i) => i * 40)
      .attr('y', d => yScale(d.count) - 6)
      .attr('opacity', 1)
      .text(d => d.count);

  }, [data, dimensions, locale]);

  // Highlight message for popular slot identification
  const getInsights = () => {
    const highest = [...data].sort((a, b) => b.count - a.count)[0];
    if (locale === 'fr') {
      return `📊 Forte Affluence : Le mois le plus populaire est ${highest.monthFullFr} avec un pic de ${highest.count} inscriptions. Privilégiez ces créneaux pour organiser vos grands événements culturels.`;
    }
    return `📊 Popular Peak Slot: The busiest month is ${highest.monthFullEn} with a high frequency of ${highest.count} total registrations. Highlighted for your administrative focus.`;
  };

  return (
    <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 md:p-6 mb-8 relative overflow-hidden" id="d3-registrations-container">
      
      {/* Container Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div>
          <h4 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            {t.admin_registrations_title}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">{t.admin_registrations_desc}</p>
        </div>
        
        {/* Dynamic color key badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#007A5E]" /> Standard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#d97706]" /> {locale === 'fr' ? 'Été (Juillet)' : 'Summer Peak'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#e11d48]" /> {locale === 'fr' ? 'Fête de la Lela' : 'Lela Festival'}
          </span>
        </div>
      </div>

      {/* Responsive Graph Canvas wrapper */}
      <div ref={containerRef} className="w-full relative min-h-[320px] bg-slate-50/40 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-2">
        {dimensions.width === 0 ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {locale === 'fr' ? 'Calcul de l\'espace...' : 'Analyzing responsive layout...'}
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            width={dimensions.width} 
            height={dimensions.height}
            className="overflow-visible"
          />
        )}

        {/* Floating tooltip/banner when hovered */}
        {hoveredBar && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white rounded-lg px-3 py-1.5 shadow-md border border-slate-700 pointer-events-none flex flex-col gap-0.5 transition-all text-[11px] animate-fade-in leading-snug">
            <span className="font-bold flex items-center gap-1 text-yellow-400">
              <Calendar className="h-3.5 w-3.5 text-yellow-400" />
              {locale === 'fr' ? hoveredBar.monthFullFr : hoveredBar.monthFullEn}
            </span>
            <span className="font-mono font-medium text-slate-200">
              {hoveredBar.count} {locale === 'fr' ? 'Inscriptions' : 'Registrations'}
            </span>
          </div>
        )}
      </div>

      {/* Automated insights banner under the chart */}
      <div className="bg-slate-50 rounded-xl p-3.5 mt-4 border border-slate-200/60 flex items-start gap-2.5">
        <AlertCircle className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-slate-750 font-medium leading-relaxed">
          {getInsights()}
        </p>
      </div>

    </div>
  );
}
