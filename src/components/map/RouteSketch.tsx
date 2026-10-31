import React from 'react';
import { LatLngPoint, RouteStop, RouteDay, haversineKm, estimateMinutes } from '../../lib/route';
import { Car, Bus, Bike, Footprints } from 'lucide-react';

export interface RouteSketchProps {
  days: RouteDay[];
  activeDay?: number | 'all';
  vehicle?: 'car' | 'bus' | 'bike' | 'walk';
  interactive?: boolean;
  className?: string;
  onStopClick?: (stop: RouteStop) => void;
  disclaimerText?: string;
}

const DAY_COLORS = ['#146B5B', '#D86D2D', '#D49B28', '#103F38', '#0E5A52'];

export const RouteSketch: React.FC<RouteSketchProps> = ({
  days,
  activeDay = 'all',
  vehicle = 'car',
  className = '',
  onStopClick,
  disclaimerText = 'Route sketch, not to scale. Distances are approximate.'
}) => {
  // Filter days based on activeDay
  const filteredDays = days.filter((d) => activeDay === 'all' || d.dayNumber === activeDay);

  const allStops: Array<RouteStop & { dayColor: string; dayIndex: number }> = [];
  filteredDays.forEach((day) => {
    const dayColor = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
    day.stops.forEach((stop) => {
      allStops.push({ ...stop, dayColor, dayIndex: day.dayNumber });
    });
  });

  if (allStops.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-[#F8F6EF] rounded-2xl border border-[#E2DFD3] text-center ${className}`}>
        <p className="text-xs text-[#60736E] font-medium">Not enough locations to draw a route</p>
      </div>
    );
  }

  // Calculate bounding box with padding
  const lats = allStops.map((s) => s.lat);
  const lngs = allStops.map((s) => s.lng);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  // If points are identical or very close, add dummy buffer
  if (maxLat - minLat < 0.005) {
    minLat -= 0.01;
    maxLat += 0.01;
  }
  if (maxLng - minLng < 0.005) {
    minLng -= 0.01;
    maxLng += 0.01;
  }

  const svgWidth = 500;
  const svgHeight = 320;
  const padding = 45;

  const project = (pt: LatLngPoint) => {
    // Normalise to 0-1
    const xFrac = (pt.lng - minLng) / (maxLng - minLng);
    // Invert Y because latitude increases upwards but SVG Y increases downwards
    const yFrac = (maxLat - pt.lat) / (maxLat - minLat);

    const x = padding + xFrac * (svgWidth - padding * 2);
    const y = padding + yFrac * (svgHeight - padding * 2);
    return { x, y };
  };

  // Group paths per day
  const dayPaths: Array<{ dayNumber: number; color: string; pathD: string }> = [];
  filteredDays.forEach((day) => {
    if (day.stops.length < 2) return;
    const color = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
    const points = day.stops.map(project);
    const d = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');
    dayPaths.push({ dayNumber: day.dayNumber, color, pathD: d });
  });

  // Cross-day dashed links if "all"
  const crossDayLinks: string[] = [];
  if (activeDay === 'all' && filteredDays.length > 1) {
    for (let i = 0; i < filteredDays.length - 1; i++) {
      const currStops = filteredDays[i].stops;
      const nextStops = filteredDays[i + 1].stops;
      if (currStops.length > 0 && nextStops.length > 0) {
        const p1 = project(currStops[currStops.length - 1]);
        const p2 = project(nextStops[0]);
        crossDayLinks.push(`M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} L ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
      }
    }
  }

  const firstPoint = allStops.length > 0 ? project(allStops[0]) : null;

  return (
    <div className={`relative bg-[#F8F6EF] rounded-2xl overflow-hidden border border-[#E2DFD3] select-none ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto block"
        aria-label="Route sketch preview"
      >
        <defs>
          <filter id="sketch-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#103F38" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Subtle grid pattern */}
        <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#E2DFD3" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={svgWidth / 2} y1={padding} x2={svgWidth / 2} y2={svgHeight - padding} stroke="#E2DFD3" strokeWidth="1" strokeDasharray="3 3" />

        {/* Cross-day connecting links */}
        {crossDayLinks.map((d, idx) => (
          <path key={`cross-${idx}`} d={d} fill="none" stroke="#9BB0AA" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.8" />
        ))}

        {/* Day road paths */}
        {dayPaths.map((dp) => (
          <path
            key={`day-${dp.dayNumber}`}
            d={dp.pathD}
            fill="none"
            stroke={dp.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.9"
          />
        ))}

        {/* Stop markers */}
        {allStops.map((stop) => {
          const pt = project(stop);
          return (
            <g
              key={stop.attractionId || `stop-${stop.order}`}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onStopClick && onStopClick(stop)}
            >
              <circle cx={pt.x} cy={pt.y} r="14" fill="#FFFFFF" filter="url(#sketch-shadow)" stroke={stop.dayColor} strokeWidth="3" />
              <text
                x={pt.x}
                y={pt.y + 4}
                textAnchor="middle"
                fill={stop.dayColor}
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {stop.order}
              </text>
              <text
                x={pt.x}
                y={pt.y + 26}
                textAnchor="middle"
                fill="#18312D"
                fontSize="9.5"
                fontWeight="600"
                fontFamily="sans-serif"
                className="drop-shadow-xs"
              >
                {stop.name.length > 16 ? `${stop.name.slice(0, 14)}…` : stop.name}
              </text>
            </g>
          );
        })}

        {/* Starting Vehicle Marker */}
        {firstPoint && (
          <g transform={`translate(${firstPoint.x - 14}, ${firstPoint.y - 14})`}>
            <circle cx="14" cy="14" r="16" fill="#146B5B" stroke="#FFFFFF" strokeWidth="2.5" filter="url(#sketch-shadow)" />
            {vehicle === 'car' && (
              <path
                d="M10 8h8l2 4h2a2 2 0 0 1 2 2v4h-2a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H8v-4a2 2 0 0 1 2-2h2l2-4z"
                fill="#FFFFFF"
                transform="scale(0.65) translate(4, 5)"
              />
            )}
            {vehicle === 'bus' && (
              <rect x="7" y="7" width="14" height="14" rx="2" fill="#FFFFFF" transform="scale(0.85) translate(2, 2)" />
            )}
            {vehicle === 'bike' && (
              <circle cx="14" cy="14" r="5" fill="#FFFFFF" />
            )}
            {vehicle === 'walk' && (
              <circle cx="14" cy="14" r="4.5" fill="#FFFFFF" />
            )}
          </g>
        )}
      </svg>

      <div className="p-2.5 bg-[#F8F6EF]/90 border-t border-[#E2DFD3] text-center">
        <p className="text-[10px] text-[#60736E] font-medium leading-tight">
          {disclaimerText}
        </p>
      </div>
    </div>
  );
};
