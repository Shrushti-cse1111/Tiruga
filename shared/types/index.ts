export type I18nText = {
  en: string;
  kn: string;
  mr: string;
};

export type Region = {
  id: string;
  slug: string;
  name_i18n: I18nText;
  center_lat: number;
  center_lng: number;
};

export type Interest = {
  id: string;
  slug: string;
  name_i18n: I18nText;
  icon: string;
};

export type PlaceCategory = 'heritage' | 'nature' | 'spiritual' | 'beach' | 'food' | 'viewpoint' | 'museum' | 'adventure';

export type Place = {
  id: string;
  region_id: string;
  category: PlaceCategory;
  name_i18n: I18nText;
  summary_i18n: I18nText;
  why_visit_i18n: I18nText;
  lat: number;
  lng: number;
  entry_fee_inr: number | null; // null = check locally
  avg_visit_min: number;
  best_months: number[]; // 1-12
  is_outdoor: boolean;
  is_indoor_alt: boolean;
  senior_friendly: number; // 0-5
  dress_code_i18n: I18nText;
  rules_i18n: I18nText;
  has_toilet: boolean;
  has_water: boolean;
  has_shade: boolean;
  local_benefit: number; // 0-5
  rating: number; // e.g. 4.7
  image_hint: string;
  source: string;
  last_checked: string;
  verified: number; // 0 or 1
};

export type PlaceInterest = {
  place_id: string;
  interest_id: string;
  weight: number;
};

export type PlaceHours = {
  place_id: string;
  weekday: number; // 0=Sunday..6=Saturday
  opens: string; // "06:00"
  closes: string; // "18:00"
  closed: boolean;
};

export type CrowdPattern = {
  place_id: string;
  month: number;
  weekday: number;
  hour: number;
  score: number; // 0-100
};

export type PlaceAlternative = {
  place_id: string;
  alt_place_id: string;
  similarity: number;
  trade_off_i18n: I18nText;
};

export type EventClosure = {
  id: string;
  place_id: string | null;
  region_id: string;
  kind: 'festival' | 'maintenance' | 'weather' | 'closure';
  title_i18n: I18nText;
  starts_on: string;
  ends_on: string;
  crowd_multiplier: number;
  closed: boolean;
};

export type StayRegistration = 'registered' | 'unverified' | 'unknown';

export type Stay = {
  id: string;
  region_id: string;
  name_i18n: I18nText;
  lat: number;
  lng: number;
  price_per_night_inr: number;
  registration_status: StayRegistration;
  source: string;
  last_checked: string;
};

export type FoodSpot = {
  id: string;
  region_id: string;
  place_id?: string;
  name_i18n: I18nText;
  dish_i18n: I18nText;
  veg: boolean;
  avg_cost_inr: number;
  lat: number;
  lng: number;
};

export type TransportMode = 'bus' | 'train' | 'cab' | 'auto' | 'walk';
export type ServiceClass = 'non_ac' | 'ordinary' | 'express' | 'ac' | 'ac_sleeper';

export type TransportLeg = {
  id: string;
  from_name: string;
  to_name: string;
  mode: TransportMode;
  operator: string;
  service_class: ServiceClass;
  depart: string;
  arrive: string;
  duration_min: number;
  stops: number;
  runs_on: string; // e.g. "Daily"
  fare_inr: number;
  shakti_eligible: boolean;
  last_bus: boolean;
  booking_url: string;
  source: string;
  last_checked: string;
  verified: number;
  effective_fare_inr?: number;
  is_free_shakti?: boolean;
};

export type User = {
  id: string;
  name: string;
  phone_hash: string | null;
  pin_hash: string | null;
  lang: 'en' | 'kn' | 'mr';
  created_at: string;
};

export type TravellerProfile = {
  user_id: string;
  is_woman: boolean;
  karnataka_domicile: boolean;
  senior_mode: boolean;
  large_text: boolean;
  travel_style: string;
  default_budget_inr: number;
  interests: string[];
};

export type TripStatus = 'draft' | 'saved' | 'active' | 'done';

export type Trip = {
  id: string;
  user_id: string;
  region_id: string;
  title: string;
  start_date: string;
  days: number;
  budget_inr: number;
  style: string;
  group_type: string;
  answers: {
    interests: string[];
    days: number;
    budget: number;
    style: string;
    start_city: string;
    start_date: string;
    is_woman: boolean;
    karnataka_domicile: boolean;
    shakti_active?: boolean;
    simulate_trigger?: 'rain' | 'heat' | 'bus_missed' | 'gate_closed';
  };
  est_total_inr: number;
  status: TripStatus;
  responsible_score: number;
  version: number;
  created_at: string;
  updated_at: string;
  days_data?: TripDay[];
  shakti_active?: boolean;
  plan_b_applied?: boolean;
  destination?: string;
  budget?: number;
  start_city?: string;
  is_woman?: boolean;
  karnataka_domicile?: boolean;
  last_checked?: string;
};

export type PlanVariant = 'A' | 'B';

export type TripDay = {
  id: string;
  trip_id: string;
  day_no: number;
  title_i18n: I18nText;
  plan_variant: PlanVariant;
  stops: TripStop[];
};

export type StopKind = 'transport' | 'stay' | 'place' | 'food';
export type CostNote = 'free_shakti' | 'check_locally' | 'estimate';

export type TripStop = {
  id: string;
  trip_day_id: string;
  position: number;
  kind: StopKind;
  place_id?: string;
  stay_id?: string;
  leg_id?: string;
  start_time: string;
  end_time: string;
  travel_min: number;
  cost_inr: number;
  cost_note?: CostNote;
  crowd_score: number;
  reason_i18n: I18nText;
  locked: boolean;
  // Hydrated details
  place?: Place;
  food?: FoodSpot;
  stay?: Stay;
  leg?: TransportLeg;
  quiet_alternative?: {
    place: Place;
    trade_off_i18n: I18nText;
    similarity: number;
  };
};

export type AgentRun = {
  id: string;
  trip_id: string;
  agent: string;
  input_summary: string;
  output_summary: string;
  duration_ms: number;
  created_at: string;
};

export type SavedPlace = {
  user_id: string;
  place_id: string;
  created_at: string;
  place?: Place;
};

export type EmergencyContact = {
  id?: string;
  user_id: string;
  name: string;
  phone: string;
};

export type OfflinePack = {
  id: string;
  trip_id: string;
  version: number;
  size_bytes: number;
  built_at: string;
  bundle: {
    trip: Trip;
    places: Place[];
    stays: Stay[];
    transport_legs: TransportLeg[];
    rules_config: Record<string, any>;
    climatology: any;
    emergency_numbers: Record<string, string>;
  };
};

export type RulesConfig = {
  shakti: {
    eligible_classes: string[];
    domicile_required: boolean;
    requires_proof_reminder: boolean;
    note: string;
  };
  scoring_weights: {
    interest_match: number;
    budget_fit: number;
    season_weather: number;
    crowd_avoidance: number;
    travel_ease: number;
    local_benefit: number;
  };
  style_modifiers: Record<string, any>;
  crowd_threshold: number;
  stops_per_day: {
    relaxed: number;
    balanced: number;
    packed: number;
  };
  regional_climatology: Record<string, {
    monthly: Record<number, {
      rain_prob: number;
      temp_min: number;
      temp_max: number;
      sunset: string;
      message: I18nText;
    }>;
  }>;
  emergency_numbers: {
    police: string;
    ambulance: string;
    women_helpline: string;
    tourist_helpline: string;
  };
};
