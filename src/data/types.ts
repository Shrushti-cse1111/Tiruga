export interface TripItem {
  time: string; // e.g. "09:00"
  attractionId: string;
  title: string;
  category: 'temple' | 'heritage' | 'nature' | 'food' | 'stay' | 'transit' | 'viewpoint';
  estimatedCost: number; // in INR (0 for free)
  durationMinutes: number;
  reason: string;
  tags: string[];
  travelToNextMinutes?: number;
}

export interface Day {
  dayNumber: number;
  summary: string;
  items: TripItem[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  destinationId: string;
  totalDays: number;
  estimatedBudget: number;
  travelStyle: string;
  heroImage: string;
  days: Day[];
  tags?: string[];
}

export interface TransportOption {
  id: string;
  operator: string;
  mode: 'bus' | 'train' | 'cab';
  typeTag: string; // "Non-AC Express", "AC Sleeper", "Superfast Express", "Sedan"
  departureTime: string; // e.g. "22:00"
  arrivalTime: string; // e.g. "06:30"
  duration: string; // e.g. "8h 30m"
  stopsText: string; // "Direct" or "1 stop"
  estimatedPrice: number;
  isShaktiEligible?: boolean;
  isDemo: true;
}

export interface Attraction {
  id: string;
  name: string;
  kannadaName?: string;
  category: 'Temples' | 'Nature' | 'Food' | 'Stays' | 'Heritage';
  coordinates: { x: number; y: number }; // Percentage 0-100 on SVG map
  distanceKm: number;
  approxMinutes: number;
  estimatedEntryFee: number; // 0 for Free
  sampleRating?: number;
  image: string;
  description: string;
  isIndoor?: boolean;
  lat?: number;
  lng?: number;
}
