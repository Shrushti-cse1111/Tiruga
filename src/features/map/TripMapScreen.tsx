import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Car,
  Bus,
  Bike,
  Footprints,
  Compass,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Navigation,
  AlertCircle,
  WifiOff,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { TILE_URL, TILE_ATTRIBUTION, KARNATAKA_BOUNDS, DEFAULT_CENTER } from '../../lib/mapConfig';
import {
  buildRoute,
  haversineKm,
  bearingDeg,
  interpolateAlong,
  estimateMinutes,
  RouteStop,
  RouteDay,
  LatLngPoint,
  TripRoute
} from '../../lib/route';
import { getRoadRoute } from '../../lib/api';
import { RouteSketch } from '../../components/map/RouteSketch';
import { getTrip } from '../../lib/db';
import { getOfflineTrip } from '../../lib/offlineStore';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../lib/languageContext';
import { getMapString } from '../../i18n';
import demoTripData from '../../../data/demoTrip.json';
import attractionsCatalog from '../../../data/attractions.json';

const DAY_COLORS = ['#146B5B', '#D86D2D', '#D49B28', '#103F38', '#0E5A52'];

// Vehicle configuration
type VehicleType = 'car' | 'bus' | 'bike' | 'walk';

const VEHICLES: Array<{ type: VehicleType; label: string; icon: React.FC<{ size?: number; className?: string }> }> = [
  { type: 'car', label: 'Car', icon: Car },
  { type: 'bus', label: 'Bus', icon: Bus },
  { type: 'bike', label: 'Bike', icon: Bike },
  { type: 'walk', label: 'Walk', icon: Footprints }
];

export const TripMapScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key: any) => getMapString(key, language as any);

  // Core trip & route state
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [route, setRoute] = useState<TripRoute>({ days: [], skipped: [] });
  const [activeDay, setActiveDay] = useState<number | 'all'>('all');
  const [roadRouteEnabled, setRoadRouteEnabled] = useState<boolean>(true);
  const [roadLoading, setRoadLoading] = useState<boolean>(false);
  const [isStraightLine, setIsStraightLine] = useState<boolean>(false);

  // Vehicle & animation state
  const [vehicle, setVehicle] = useState<VehicleType>(() => {
    return (localStorage.getItem('tiruga_vehicle') as VehicleType) || 'car';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [animProgress, setAnimProgress] = useState<number>(0); // 0 to 1
  const [caption, setCaption] = useState<string>('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [highlightedStopId, setHighlightedStopId] = useState<string | null>(null);

  // Fallback & Offline states
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [useFallbackSketch, setUseFallbackSketch] = useState<boolean>(false);

  // Live Location states
  const [showLocationSheet, setShowLocationSheet] = useState<boolean>(false);
  const [isWatchingLocation, setIsWatchingLocation] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<LatLngPoint | null>(null);
  const [locationStatusMsg, setLocationStatusMsg] = useState<string | null>(null);

  // Refs for Leaflet Map & Layers
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const linesLayerRef = useRef<L.LayerGroup | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  // Road geometry cache keyed by dayNumber
  const roadGeomCache = useRef<Record<number, [number, number][]>>({});
  const animationFrameRef = useRef<number | null>(null);
  const animStartTimeRef = useRef<number | null>(null);
  const animPausedProgressRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const tileErrorCountRef = useRef<number>(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Listen to network changes
  useEffect(() => {
    const onOnline = () => {
      setIsOffline(false);
      setUseFallbackSketch(false);
      tileErrorCountRef.current = 0;
    };
    const onOffline = () => {
      setIsOffline(true);
      setUseFallbackSketch(true);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Save vehicle preference
  const handleVehicleChange = (newV: VehicleType) => {
    setVehicle(newV);
    localStorage.setItem('tiruga_vehicle', newV);
  };

  // 1. Load Trip Data
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        let loadedTrip: any = null;
        if (id) {
          loadedTrip = await getTrip(id, user?.uid);
          if (!loadedTrip) {
            loadedTrip = await getOfflineTrip(id);
          }
        }
        if (!loadedTrip) {
          loadedTrip = demoTripData;
        }

        if (isMounted) {
          setTrip(loadedTrip);

          // Build index of attractions
          const catalogMap: Record<string, any> = {};
          (attractionsCatalog as any[]).forEach((att) => {
            catalogMap[att.id] = att;
          });

          // Pure route builder
          const built = buildRoute(loadedTrip, catalogMap);
          setRoute(built);
        }
      } catch (err) {
        console.error('Failed to load trip for map:', err);
        if (isMounted) {
          setTrip(demoTripData);
          const catalogMap: Record<string, any> = {};
          (attractionsCatalog as any[]).forEach((att) => {
            catalogMap[att.id] = att;
          });
          setRoute(buildRoute(demoTripData, catalogMap));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id, user?.uid]);

  // Active stops for currently selected day or all
  const visibleDays = useMemo(() => {
    return route.days.filter((d) => activeDay === 'all' || d.dayNumber === activeDay);
  }, [route.days, activeDay]);

  const visibleStops = useMemo(() => {
    const stops: Array<RouteStop & { dayColor: string; dayNumber: number }> = [];
    visibleDays.forEach((day) => {
      const dayColor = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
      day.stops.forEach((st) => {
        stops.push({ ...st, dayColor, dayNumber: day.dayNumber });
      });
    });
    return stops;
  }, [visibleDays]);

  // Concatenated polyline points for animation across visible stops
  const routePolyline = useMemo<LatLngPoint[]>(() => {
    return visibleStops.map((s) => ({ lat: s.lat, lng: s.lng }));
  }, [visibleStops]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (loading || useFallbackSketch || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          maxBounds: KARNATAKA_BOUNDS.asLatLngBounds,
          minZoom: 6
        }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);

        // Add attribution control explicitly at bottom-right
        L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

        // Add Tile Layer with tile error listener
        const tileLayer = L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
          maxZoom: 19
        });

        tileLayer.on('tileerror', () => {
          tileErrorCountRef.current += 1;
          if (tileErrorCountRef.current > 4) {
            setUseFallbackSketch(true);
          }
        });

        tileLayer.addTo(map);

        // Layer groups for markers and polylines
        markersLayerRef.current = L.layerGroup().addTo(map);
        linesLayerRef.current = L.layerGroup().addTo(map);
        userLocationLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;

        // Invalidate size on container layout
        setTimeout(() => map.invalidateSize(), 200);
      } catch (err) {
        console.warn('Leaflet init error, switching to sketch fallback:', err);
        setUseFallbackSketch(true);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        linesLayerRef.current = null;
        userLocationLayerRef.current = null;
        vehicleMarkerRef.current = null;
      }
    };
  }, [loading, useFallbackSketch]);

  // 3. Render Markers & Polylines onto Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !linesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    linesLayerRef.current.clearLayers();

    if (visibleStops.length === 0) return;

    // A. Add Stop Markers
    visibleStops.forEach((stop) => {
      const markerHtml = `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 3.5px solid ${stop.dayColor};
          box-shadow: 0 4px 10px rgba(16, 63, 56, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          color: ${stop.dayColor};
          cursor: pointer;
        ">${stop.order}</div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'tiruga-stop-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon });

      const costLabel = stop.estimatedCost > 0 ? `₹${stop.estimatedCost} ${t('est')}` : t('free');
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`;

      const popupContent = `
        <div style="font-family: inherit; min-width: 190px; padding: 4px;">
          <div style="font-size: 14px; font-weight: 800; color: #103F38; margin-bottom: 2px;">${stop.name}</div>
          <div style="font-size: 11px; font-weight: 600; color: #D86D2D; margin-bottom: 6px;">${t('day')} ${stop.dayNumber} · ${stop.time || ''}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 10px; background: #DCEFE5; color: #103F38; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">${stop.category}</span>
            <span style="font-size: 11px; font-weight: 700; color: #146B5B;">${costLabel}</span>
          </div>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
            display: block;
            text-align: center;
            background: #146B5B;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 8px;
            text-decoration: none;
          ">${t('open_in_maps')} ↗</a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'tiruga-leaflet-popup',
        offset: [0, -10]
      });

      markersLayerRef.current!.addLayer(marker);
    });

    // B. Fit map bounds to visible stops
    const latLngBounds = L.latLngBounds(visibleStops.map((s) => [s.lat, s.lng]));
    map.fitBounds(latLngBounds, { padding: [45, 45], maxZoom: 15 });

    // C. Fetch & Draw Polylines (Road or Straight)
    let isSubscribed = true;

    async function drawPolylines() {
      if (!linesLayerRef.current) return;
      linesLayerRef.current.clearLayers();

      let usedStraightLine = false;

      for (let i = 0; i < visibleDays.length; i++) {
        const day = visibleDays[i];
        if (day.stops.length < 2) continue;

        const color = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
        const points = day.stops.map((s) => ({ lat: s.lat, lng: s.lng }));

        let coords: [number, number][] | null = null;

        if (roadRouteEnabled) {
          // Check cache first
          if (roadGeomCache.current[day.dayNumber]) {
            coords = roadGeomCache.current[day.dayNumber];
          } else {
            setRoadLoading(true);
            const roadRes = await getRoadRoute(points);
            setRoadLoading(false);
            if (roadRes && roadRes.coordinates && roadRes.coordinates.length > 0) {
              coords = roadRes.coordinates;
              roadGeomCache.current[day.dayNumber] = coords;
            }
          }
        }

        if (!isSubscribed || !linesLayerRef.current) return;

        if (coords && coords.length > 0) {
          // OSRM returns [lng, lat], Leaflet polyline takes [lat, lng]
          const latLngs = coords.map((c) => [c[1], c[0]] as [number, number]);
          L.polyline(latLngs, {
            color,
            weight: 4,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(linesLayerRef.current);
        } else {
          // Fallback straight dashed line
          usedStraightLine = true;
          const straightPoints = points.map((p) => [p.lat, p.lng] as [number, number]);
          L.polyline(straightPoints, {
            color,
            weight: 3.5,
            opacity: 0.85,
            dashArray: '6, 6'
          }).addTo(linesLayerRef.current);
        }
      }

      // Draw thin dashed link between last stop of day N and first stop of day N+1 when All selected
      if (activeDay === 'all' && visibleDays.length > 1) {
        for (let i = 0; i < visibleDays.length - 1; i++) {
          const currStops = visibleDays[i].stops;
          const nextStops = visibleDays[i + 1].stops;
          if (currStops.length > 0 && nextStops.length > 0) {
            const p1 = currStops[currStops.length - 1];
            const p2 = nextStops[0];
            L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
              color: '#9BB0AA',
              weight: 2,
              opacity: 0.75,
              dashArray: '4, 6'
            }).addTo(linesLayerRef.current);
          }
        }
      }

      setIsStraightLine(usedStraightLine || !roadRouteEnabled);
    }

    drawPolylines();

    return () => {
      isSubscribed = false;
    };
  }, [visibleStops, visibleDays, roadRouteEnabled, activeDay]);

  // 4. Vehicle Icon Marker on Map
  const getVehicleIconHtml = useCallback(
    (rotDeg: number = 0) => {
      let iconSvg = '';
      if (vehicle === 'car') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
      } else if (vehicle === 'bus') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.1 6H4.9c-1.1 0-2 .8-2.3 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`;
      } else if (vehicle === 'bike') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`;
      } else {
        // Walk keeps upright
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.5V16a2 2 0 0 1-2 2 2 2 0 0 1-2-2Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.5V20a2 2 0 0 0 2 2 2 2 0 0 0 2-2Z"/></svg>`;
      }

      const glyphRotation = vehicle === 'walk' ? 0 : rotDeg;

      return `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #146B5B;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(16, 63, 56, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(${glyphRotation}deg); transition: transform 0.2s ease;">
            ${iconSvg}
          </div>
        </div>
      `;
    },
    [vehicle]
  );

  // Position vehicle initially at first stop
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || visibleStops.length === 0) return;

    const firstStop = visibleStops[0];
    const initialBearing = visibleStops.length > 1 ? bearingDeg(visibleStops[0], visibleStops[1]) : 0;

    const icon = L.divIcon({
      html: getVehicleIconHtml(initialBearing),
      className: 'tiruga-vehicle-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker([firstStop.lat, firstStop.lng], { icon, zIndexOffset: 1000 }).addTo(map);
    } else {
      vehicleMarkerRef.current.setLatLng([firstStop.lat, firstStop.lng]);
      vehicleMarkerRef.current.setIcon(icon);
    }

    if (visibleStops.length > 1) {
      setCaption(`${t('heading_to')}: ${visibleStops[1].name} · ${t('day')} ${visibleStops[1].dayNumber}, ${visibleStops[1].time}`);
    } else {
      setCaption(`${visibleStops[0].name}`);
    }
  }, [visibleStops, vehicle, getVehicleIconHtml]);

  // 5. Animation Engine (requestAnimationFrame + interpolateAlong)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (routePolyline.length < 2) {
      setIsPlaying(false);
      return;
    }

    const baseDuration = 24000; // 24 seconds at 1x
    const duration = baseDuration / playbackSpeed;
    const startProgress = animPausedProgressRef.current;
    const startTime = performance.now() - startProgress * duration;
    animStartTimeRef.current = startTime;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);
      animPausedProgressRef.current = progress;

      // Interpolate coordinates and bearing
      const interpolated = interpolateAlong(routePolyline, null, progress);

      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng([interpolated.lat, interpolated.lng]);
        vehicleMarkerRef.current.setIcon(
          L.divIcon({
            html: getVehicleIconHtml(interpolated.bearing),
            className: 'tiruga-vehicle-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        );
      }

      // Check current progress segment to highlight stop and update caption
      const segIndex = Math.min(
        routePolyline.length - 1,
        Math.floor(progress * (routePolyline.length - 1))
      );
      const nextStop = visibleStops[Math.min(visibleStops.length - 1, segIndex + 1)];
      const currentStop = visibleStops[segIndex];

      if (currentStop) {
        setHighlightedStopId(currentStop.attractionId);
      }

      if (progress >= 1) {
        const lastStop = visibleStops[visibleStops.length - 1];
        setCaption(`${t('reached_destination')} ${lastStop?.name || ''}`);
        setIsPlaying(false);
        animPausedProgressRef.current = 0;
        return;
      } else if (nextStop) {
        setCaption(`${t('heading_to')}: ${nextStop.name} · ${t('day')} ${nextStop.dayNumber}, ${nextStop.time}`);
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, routePolyline, visibleStops, getVehicleIconHtml]);

  // Pause automatically on tab switch
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isPlaying) {
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying]);

  // Restart handler
  const handleRestart = () => {
    setIsPlaying(false);
    animPausedProgressRef.current = 0;
    setAnimProgress(0);
    if (visibleStops.length > 0 && vehicleMarkerRef.current) {
      const first = visibleStops[0];
      const bearing = visibleStops.length > 1 ? bearingDeg(visibleStops[0], visibleStops[1]) : 0;
      vehicleMarkerRef.current.setLatLng([first.lat, first.lng]);
      vehicleMarkerRef.current.setIcon(
        L.divIcon({
          html: getVehicleIconHtml(bearing),
          className: 'tiruga-vehicle-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      );
      if (visibleStops.length > 1) {
        setCaption(`${t('heading_to')}: ${visibleStops[1].name} · ${t('day')} ${visibleStops[1].dayNumber}, ${visibleStops[1].time}`);
      }
    }
  };

  // Step controls for reduced-motion users
  const handleStepPrev = () => {
    if (visibleStops.length < 2) return;
    const currIdx = Math.round(animProgress * (visibleStops.length - 1));
    const prevIdx = Math.max(0, currIdx - 1);
    jumpToStop(prevIdx);
  };

  const handleStepNext = () => {
    if (visibleStops.length < 2) return;
    const currIdx = Math.round(animProgress * (visibleStops.length - 1));
    const nextIdx = Math.min(visibleStops.length - 1, currIdx + 1);
    jumpToStop(nextIdx);
  };

  const jumpToStop = (index: number) => {
    if (visibleStops.length === 0) return;
    const progress = index / Math.max(1, visibleStops.length - 1);
    setAnimProgress(progress);
    animPausedProgressRef.current = progress;

    const stop = visibleStops[index];
    setHighlightedStopId(stop.attractionId);

    const bearing = index < visibleStops.length - 1 ? bearingDeg(visibleStops[index], visibleStops[index + 1]) : 0;

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([stop.lat, stop.lng]);
      vehicleMarkerRef.current.setIcon(
        L.divIcon({
          html: getVehicleIconHtml(bearing),
          className: 'tiruga-vehicle-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      );
    }

    if (index >= visibleStops.length - 1) {
      setCaption(`${t('reached_destination')} ${stop.name}`);
    } else {
      const next = visibleStops[index + 1];
      setCaption(`${t('heading_to')}: ${next.name} · ${t('day')} ${next.dayNumber}, ${next.time}`);
    }
  };

  // Focus a specific stop when tapped in list
  const handleStopCardClick = (stop: RouteStop) => {
    setHighlightedStopId(stop.attractionId);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([stop.lat, stop.lng], Math.max(14, map.getZoom()), { animate: true });
    }
  };

  // 6. Live Location Tracker (Opt-In with Explainer Sheet)
  const startLocationWatching = () => {
    setShowLocationSheet(false);
    if (!navigator.geolocation) {
      setLocationStatusMsg(t('location_unavailable'));
      return;
    }

    setIsWatchingLocation(true);
    setLocationStatusMsg(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(pt);

        // Update live marker on map
        const map = mapInstanceRef.current;
        if (map && userLocationLayerRef.current) {
          userLocationLayerRef.current.clearLayers();

          const pulseIcon = L.divIcon({
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="
                  position: absolute;
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: #0284C7;
                  opacity: 0.35;
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: absolute;
                  top: 3px;
                  left: 3px;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #0284C7;
                  border: 2.5px solid #FFFFFF;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              </div>
            `,
            className: 'tiruga-location-pulse',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          L.marker([pt.lat, pt.lng], { icon: pulseIcon }).addTo(userLocationLayerRef.current);

          if (pos.coords.accuracy && pos.coords.accuracy < 1000) {
            L.circle([pt.lat, pt.lng], {
              radius: pos.coords.accuracy,
              color: '#0284C7',
              weight: 1,
              fillColor: '#0284C7',
              fillOpacity: 0.1
            }).addTo(userLocationLayerRef.current);
          }
        }
      },
      (err) => {
        if (err.code === 1) {
          setLocationStatusMsg(t('location_permission_denied'));
        } else if (err.code === 3) {
          setLocationStatusMsg(t('location_timeout'));
        } else {
          setLocationStatusMsg(t('location_unavailable'));
        }
        setIsWatchingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 15000
      }
    );
  };

  const stopLocationWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatchingLocation(false);
    setUserCoords(null);
    setLocationStatusMsg(null);
    if (userLocationLayerRef.current) {
      userLocationLayerRef.current.clearLayers();
    }
  };

  // Clean up location watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Distance to next stop from live location
  const liveNextStopInfo = useMemo(() => {
    if (!userCoords || visibleStops.length === 0) return null;
    let closestIdx = 0;
    let minDist = Infinity;
    visibleStops.forEach((s, idx) => {
      const d = haversineKm(userCoords, s);
      if (d < minDist) {
        minDist = d;
        closestIdx = idx;
      }
    });

    const targetStop = visibleStops[Math.min(visibleStops.length - 1, closestIdx + 1)] || visibleStops[closestIdx];
    const distanceKm = haversineKm(userCoords, targetStop);
    return {
      name: targetStop.name,
      km: distanceKm.toFixed(1)
    };
  }, [userCoords, visibleStops]);

  // Scroll highlighted stop into view in list
  useEffect(() => {
    if (!highlightedStopId) return;
    const el = document.getElementById(`stop-card-${highlightedStopId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedStopId]);

  return (
    <div className="min-h-screen bg-[#F8F6EF] flex flex-col max-w-[430px] mx-auto select-none overflow-x-hidden text-[#18312D]">
      {/* 1. Header Row */}
      <header className="px-4 py-3 bg-[#F8F6EF] border-b border-[#E2DFD3] flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => navigate(id ? `/trip/${id}` : '/home')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#146B5B]"
          aria-label="Back to trip plan"
        >
          <ArrowLeft size={20} className="text-[#103F38]" />
        </button>

        <div className="text-center flex-1 mx-2 truncate">
          <h1 className="text-base font-bold text-[#103F38] truncate font-heading">
            {trip?.title || 'Trip Route Map'}
          </h1>
          <p className="text-[11px] text-[#60736E] font-medium">
            {trip?.destination || 'Karnataka'} · {route.days.length} {t('day')}s
          </p>
        </div>

        {/* Live location toggle button */}
        <button
          type="button"
          onClick={isWatchingLocation ? stopLocationWatching : () => setShowLocationSheet(true)}
          className={`min-h-[44px] min-w-[44px] px-2.5 rounded-full flex items-center justify-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#146B5B] ${
            isWatchingLocation
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'bg-white border border-[#E2DFD3] text-[#103F38] hover:bg-[#DCEFE5]'
          }`}
          aria-label={isWatchingLocation ? t('stop_sharing_location') : t('show_my_location')}
        >
          <Compass size={17} className={isWatchingLocation ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Offline / Notice Banner */}
      {isOffline && (
        <div className="bg-[#D86D2D] text-white text-xs font-semibold px-4 py-2 flex items-center space-x-2 shrink-0">
          <WifiOff size={14} className="text-[#F4B63E]" />
          <span>{t('route_sketch_note')}</span>
        </div>
      )}

      {/* 2. Map Container (55% viewport height, radius 20px at top, attribution visible) */}
      <section
        className="relative w-full h-[55vh] min-h-[300px] max-h-[480px] bg-[#DCEFE5] overflow-hidden rounded-t-[20px] shadow-inner z-10"
        aria-label="Trip route map"
      >
        {useFallbackSketch || isOffline ? (
          <div className="w-full h-full p-2 bg-[#F8F6EF]">
            <RouteSketch
              days={route.days}
              activeDay={activeDay}
              vehicle={vehicle}
              className="w-full h-full shadow-xs"
              onStopClick={handleStopCardClick}
              disclaimerText={t('route_sketch_disclaimer')}
            />
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" id="tiruga-leaflet-map-container" />
        )}

        {/* Top Badges overlay on Map */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          {/* Straight line preview chip */}
          {isStraightLine && (
            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E2DFD3] text-[10px] font-bold text-[#D86D2D] shadow-sm flex items-center space-x-1.5 pointer-events-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D86D2D]"></span>
              <span>{t('straight_line_preview')}</span>
            </div>
          )}

          {/* Road loading indicator */}
          {roadLoading && (
            <div className="bg-[#103F38]/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center space-x-1 ml-auto">
              <Sparkles size={11} className="animate-spin text-[#F4B63E]" />
              <span>Calculating road route…</span>
            </div>
          )}
        </div>

        {/* Live location proximity chip */}
        {isWatchingLocation && liveNextStopInfo && (
          <div className="absolute bottom-6 left-3 right-3 z-20 pointer-events-none">
            <div className="bg-[#103F38]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center space-x-2 border border-white/20">
              <Navigation size={13} className="text-[#F4B63E] shrink-0" />
              <span className="truncate">
                Next stop: <strong>{liveNextStopInfo.name}</strong> · ~{liveNextStopInfo.km} km away
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 3. Controls Row under the map: Day pills, Vehicle chips, Road route toggle */}
      <section className="bg-white px-4 py-3 border-b border-[#E2DFD3] space-y-3 z-20 shadow-xs">
        {/* Day selection pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveDay('all')}
            className={`min-h-[44px] px-4 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146B5B] ${
              activeDay === 'all'
                ? 'bg-[#103F38] text-white shadow-xs'
                : 'bg-[#F8F6EF] text-[#60736E] hover:bg-[#E2DFD3]'
            }`}
          >
            {t('all_days')} ({route.days.reduce((acc, d) => acc + d.stops.length, 0)})
          </button>

          {route.days.map((day) => {
            const isSelected = activeDay === day.dayNumber;
            const dayColor = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
            return (
              <button
                key={`pill-${day.dayNumber}`}
                type="button"
                onClick={() => setActiveDay(day.dayNumber)}
                className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146B5B] ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-[#F8F6EF] text-[#18312D] hover:bg-[#E2DFD3]'
                }`}
                style={{ backgroundColor: isSelected ? dayColor : undefined }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : dayColor }}
                />
                <span>
                  {t('day')} {day.dayNumber}
                </span>
                <span className="text-[10px] opacity-80">({day.stops.length})</span>
              </button>
            );
          })}
        </div>

        {/* Vehicle chips & Road route toggle */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Vehicle chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {VEHICLES.map(({ type, label, icon: Icon }) => {
              const isSelected = vehicle === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleVehicleChange(type)}
                  className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146B5B] ${
                    isSelected
                      ? 'bg-[#146B5B] text-white shadow-xs'
                      : 'bg-[#F8F6EF] text-[#60736E] hover:bg-[#E2DFD3]'
                  }`}
                  aria-label={`Select ${label} vehicle`}
                >
                  <Icon size={14} />
                  <span className="text-[11px]">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Road route toggle */}
          <label className="flex items-center space-x-2 text-xs font-bold text-[#103F38] cursor-pointer shrink-0 select-none min-h-[44px] pl-2">
            <span className="text-[11px]">{t('road_route')}</span>
            <input
              type="checkbox"
              checked={roadRouteEnabled}
              onChange={(e) => setRoadRouteEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#E2DFD3] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#146B5B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#146B5B] relative"></div>
          </label>
        </div>
      </section>

      {/* 4. Player Bar: Play/Pause, Restart, Speed, Progress, Caption */}
      <section className="bg-white px-4 py-3 border-b border-[#E2DFD3] space-y-2 z-20">
        <div className="flex items-center justify-between gap-3">
          {/* Controls: Play/Pause and Restart */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-[#103F38] text-white flex items-center justify-center hover:bg-[#146B5B] active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F4B63E]"
              aria-label={isPlaying ? t('pause') : t('play')}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-[#F8F6EF] text-[#103F38] border border-[#E2DFD3] flex items-center justify-center hover:bg-[#E2DFD3] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#146B5B]"
              aria-label={t('restart')}
            >
              <RotateCcw size={16} />
            </button>

            {/* Reduced motion step buttons */}
            {prefersReducedMotion && (
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleStepPrev}
                  className="min-h-[44px] px-2.5 rounded-lg bg-[#F8F6EF] text-xs font-bold border border-[#E2DFD3] flex items-center space-x-1"
                  aria-label={t('previous_stop')}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={handleStepNext}
                  className="min-h-[44px] px-2.5 rounded-lg bg-[#F8F6EF] text-xs font-bold border border-[#E2DFD3] flex items-center space-x-1"
                  aria-label={t('next_stop')}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Speed Selector (1x, 2x, 4x) */}
          <div className="flex items-center bg-[#F8F6EF] p-1 rounded-xl border border-[#E2DFD3]">
            {[1, 2, 4].map((spd) => (
              <button
                key={`spd-${spd}`}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                  playbackSpeed === spd
                    ? 'bg-[#103F38] text-white shadow-xs'
                    : 'text-[#60736E] hover:text-[#18312D]'
                }`}
                aria-label={`Speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E2DFD3] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#146B5B] h-full transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${Math.round(animProgress * 100)}%` }}
          />
        </div>

        {/* Dynamic Caption */}
        <div
          className="text-xs font-semibold text-[#103F38] truncate flex items-center space-x-1.5 pt-0.5"
          aria-live="polite"
        >
          <Compass size={13} className="text-[#D86D2D] shrink-0" />
          <span className="truncate">{caption || 'Ready to preview route.'}</span>
        </div>
      </section>

      {/* 5. Stop List (Scrolls under controls) */}
      <section className="flex-1 p-4 space-y-3 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#60736E]">
            Stops ({visibleStops.length})
          </h2>
          <span className="text-[11px] font-bold text-[#146B5B]">
            {activeDay === 'all' ? 'Full Itinerary' : `Day ${activeDay}`}
          </span>
        </div>

        {visibleStops.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-[#E2DFD3] text-center space-y-2">
            <p className="text-sm font-bold text-[#103F38]">{t('not_enough_locations')}</p>
            <p className="text-xs text-[#60736E]">No mapped waypoints available for this selection.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visibleStops.map((stop, idx) => {
              const isFirst = idx === 0;
              const prevStop = isFirst ? null : visibleStops[idx - 1];
              const distFromPrev = prevStop ? haversineKm(prevStop, stop) : 0;
              const timeFromPrev = prevStop ? estimateMinutes(distFromPrev, vehicle) : 0;
              const isHighlighted = highlightedStopId === stop.attractionId;

              return (
                <div
                  key={`stop-card-${stop.attractionId || idx}`}
                  id={`stop-card-${stop.attractionId}`}
                  onClick={() => handleStopCardClick(stop)}
                  className={`min-h-[44px] p-3 rounded-2xl bg-white border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isHighlighted
                      ? 'border-[#146B5B] ring-2 ring-[#146B5B]/20 shadow-md bg-[#DCEFE5]/20'
                      : 'border-[#E2DFD3] hover:border-[#146B5B]/50 shadow-xs'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleStopCardClick(stop);
                  }}
                  aria-label={`Stop ${stop.order}: ${stop.name}`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    {/* Number Badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: stop.dayColor }}
                    >
                      {stop.order}
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-bold text-[#103F38] truncate">{stop.name}</div>
                      <div className="text-[11px] text-[#60736E] flex items-center space-x-2 mt-0.5">
                        <span>Day {stop.dayNumber} · {stop.time || '—'}</span>
                        {!isFirst && (
                          <span className="text-[10px] text-[#D86D2D] font-semibold">
                            ~{distFromPrev.toFixed(1)} km · ~{timeFromPrev}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#146B5B]">
                      {stop.estimatedCost > 0 ? `₹${stop.estimatedCost}` : t('free')}
                    </div>
                    <span className="text-[10px] text-[#60736E] font-medium">{stop.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Skipped stops group ("Not shown on map") */}
        {route.skipped.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E2DFD3] space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#D86D2D]">
              <AlertCircle size={14} />
              <span>{t('not_shown_on_map')} ({route.skipped.length})</span>
            </div>
            <p className="text-[11px] text-[#60736E] leading-relaxed">
              These items lack geographical coordinates in our catalog and are omitted from the map.
            </p>
            <div className="space-y-1.5 pt-1">
              {route.skipped.map((sk, sIdx) => (
                <div
                  key={`skipped-${sIdx}`}
                  className="p-2.5 rounded-xl bg-white/70 border border-dashed border-[#E2DFD3] flex items-center justify-between text-xs text-[#60736E]"
                >
                  <span className="font-semibold text-[#18312D] truncate">{sk.name}</span>
                  <span className="text-[10px] bg-[#E2DFD3]/60 px-2 py-0.5 rounded-full shrink-0">
                    Day {sk.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Muted Disclaimer line */}
        <div className="pt-4 pb-8 text-center">
          <p className="text-[11px] text-[#60736E] leading-relaxed max-w-xs mx-auto">
            {t('route_preview_disclaimer')}
          </p>
        </div>
      </section>

      {/* 7. Explainer Sheet for Live Location Permission (Privacy First) */}
      {showLocationSheet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#E2DFD3] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEFE5] text-[#146B5B] flex items-center justify-center mx-auto text-xl">
              <Compass size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-[#103F38] font-heading">
                {t('location_dialog_title')}
              </h3>
              <p className="text-xs text-[#60736E] leading-relaxed">
                {t('location_dialog_desc')}
              </p>
            </div>

            <div className="bg-[#F8F6EF] p-3 rounded-xl border border-[#E2DFD3] flex items-start space-x-2 text-[11px] text-[#60736E]">
              <Info size={14} className="text-[#146B5B] shrink-0 mt-0.5" />
              <span>
                Coordinates stay local in your browser session. They are NEVER logged, sent to servers, or persisted.
              </span>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLocationSheet(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-[#E2DFD3] text-xs font-bold text-[#60736E] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#146B5B]"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={startLocationWatching}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#146B5B] text-white text-xs font-bold hover:bg-[#103F38] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#103F38]"
              >
                {t('allow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Status Alert Toast if denied */}
      {locationStatusMsg && (
        <div className="fixed bottom-20 left-4 right-4 max-w-[400px] mx-auto z-40 bg-[#103F38] text-white p-3 rounded-2xl shadow-lg border border-white/20 text-xs flex items-center justify-between space-x-2">
          <span>{locationStatusMsg}</span>
          <button
            type="button"
            onClick={() => setLocationStatusMsg(null)}
            className="text-white/70 hover:text-white font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default TripMapScreen;
