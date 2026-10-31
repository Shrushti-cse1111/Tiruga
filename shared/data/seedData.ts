import {
  Region,
  Interest,
  Place,
  PlaceHours,
  PlaceAlternative,
  Stay,
  FoodSpot,
  TransportLeg,
  RulesConfig
} from '../types';

export const TODAY = '2026-10-25';

export const SEED_REGIONS: Region[] = [
  {
    id: 'reg_hampi',
    slug: 'hampi-badami',
    name_i18n: {
      en: 'Hampi & Badami Heritage Valley',
      kn: 'ಹಂಪಿ ಮತ್ತು ಬದಾಮಿ ಪರಂಪರೆ ಕಣಿವೆ',
      mr: 'हंपी आणि बदामी हेरिटेज व्हॅली'
    },
    center_lat: 15.3350,
    center_lng: 76.4600
  },
  {
    id: 'reg_mysuru',
    slug: 'bengaluru-mysuru',
    name_i18n: {
      en: 'Bengaluru & Mysuru Royal Circuit',
      kn: 'ಬೆಂಗಳೂರು ಮತ್ತು ಮೈಸೂರು ರಾಜಮನೆತನ ಪ್ರವಾಸ',
      mr: 'बंगळुरू आणि म्हैसूर रॉयल सर्किट'
    },
    center_lat: 12.2958,
    center_lng: 76.6394
  },
  {
    id: 'reg_coorg',
    slug: 'coorg-chikkamagaluru',
    name_i18n: {
      en: 'Coorg & Chikkamagaluru Mist Hills',
      kn: 'ಕೂರ್ಗ್ ಮತ್ತು ಚಿಕ್ಕಮಗಳೂರು ಮಂಜಿನ ಗಿರಿಧಾಮ',
      mr: 'कूर्ग आणि चिकमंगळूर हिल्स'
    },
    center_lat: 12.4244,
    center_lng: 75.7382
  },
  {
    id: 'reg_coast',
    slug: 'coast',
    name_i18n: {
      en: 'Karavali Coast (Udupi & Gokarna)',
      kn: 'ಕರಾವಳಿ ತೀರ (ಉಡುಪಿ ಮತ್ತು ಗೋಕರ್ಣ)',
      mr: 'करावेली किनारपट्टी (उडुपी आणि गोकर्ण)'
    },
    center_lat: 13.3409,
    center_lng: 74.7421
  },
  {
    id: 'reg_north',
    slug: 'north-karnataka',
    name_i18n: {
      en: 'North Karnataka Heritage (Vijayapura & Kalaburagi)',
      kn: 'ಉತ್ತರ ಕರ್ನಾಟಕ ಪರಂಪರೆ (ವಿಜಯಪುರ ಮತ್ತು ಕಲಬುರಗಿ)',
      mr: 'उत्तर कर्नाटक वारसा (विजापूर आणि कलबुर्गी)'
    },
    center_lat: 16.8302,
    center_lng: 75.7100
  }
];

export const SEED_INTERESTS: Interest[] = [
  {
    id: 'int_heritage',
    slug: 'heritage',
    name_i18n: { en: 'Heritage', kn: 'ಪರಂಪರೆ', mr: 'वारसा' },
    icon: 'Landmark'
  },
  {
    id: 'int_nature',
    slug: 'nature',
    name_i18n: { en: 'Nature', kn: 'ಪ್ರಕೃತಿ', mr: 'निसर्ग' },
    icon: 'Trees'
  },
  {
    id: 'int_food',
    slug: 'food',
    name_i18n: { en: 'Food', kn: 'ಆಹಾರ', mr: 'खाद्यसंस्कृती' },
    icon: 'Utensils'
  },
  {
    id: 'int_adventure',
    slug: 'adventure',
    name_i18n: { en: 'Adventure', kn: 'ಸಾಹಸ', mr: 'साहस' },
    icon: 'Compass'
  },
  {
    id: 'int_spiritual',
    slug: 'spiritual',
    name_i18n: { en: 'Spiritual', kn: 'ಆಧ್ಯಾತ್ಮಿಕ', mr: 'अध्यात्म' },
    icon: 'Sparkles'
  },
  {
    id: 'int_beach',
    slug: 'beach',
    name_i18n: { en: 'Beach', kn: 'ಕಡಲತೀರ', mr: 'समुद्रकिनारा' },
    icon: 'Waves'
  }
];

export const SEED_RULES_CONFIG: RulesConfig = {
  shakti: {
    eligible_classes: ['non_ac', 'ordinary', 'express'],
    domicile_required: true,
    requires_proof_reminder: true,
    note: 'Confirm current rules on the bus with conductor'
  },
  scoring_weights: {
    interest_match: 0.35,
    budget_fit: 0.20,
    season_weather: 0.15,
    crowd_avoidance: 0.15,
    travel_ease: 0.10,
    local_benefit: 0.05
  },
  style_modifiers: {
    senior: { min_senior_friendly: 3, add_rest_breaks: true, max_stops_per_day: 3 },
    solo_woman: { penalize_after_dusk: true, require_verified_stays: true },
    women_group: { penalize_after_dusk: true, require_verified_stays: true },
    adventure: { crowd_weight_modifier: 0.5, outdoor_boost: 1.3 }
  },
  crowd_threshold: 70,
  stops_per_day: {
    relaxed: 3,
    balanced: 4,
    packed: 5
  },
  regional_climatology: {
    'reg_hampi': {
      monthly: {
        10: { rain_prob: 0.25, temp_min: 21, temp_max: 32, sunset: '18:02', message: { en: 'Pleasant evening breeze with occasional light shower', kn: 'ಸಂಜೆಯ ತಂಗಾಳಿ ಮತ್ತು ಸಾಂದರ್ಭಿಕ ಹಗುರ ಮಳೆ', mr: 'संध्याकाळचा सुखद वारा आणि हलका पाऊस' } },
        11: { rain_prob: 0.10, temp_min: 18, temp_max: 30, sunset: '17:52', message: { en: 'Dry winter season, ideal for boulder walking', kn: 'ಒಣ ಚಳಿಗಾಲದ ವಾತಾವರಣ, ಬಂಡೆಗಳ ನಡಿಗೆಗೆ ಸೂಕ್ತ', mr: 'कोरडा हिवाळा, फिरण्यासाठी उत्तम' } },
        12: { rain_prob: 0.05, temp_min: 16, temp_max: 29, sunset: '17:55', message: { en: 'Cool nights and crisp sunny mornings', kn: 'ತಂಪಾದ ರಾತ್ರಿ ಮತ್ತು ಬಿಸಿಲಿನ ಸುಂದರ ಬೆಳಿಗ್ಗೆ', mr: 'थंड रात्र आणि छान सकाळ' } }
      }
    },
    'reg_mysuru': {
      monthly: {
        10: { rain_prob: 0.30, temp_min: 19, temp_max: 29, sunset: '18:05', message: { en: 'Festive season with moderate afternoon clouds', kn: 'ಉತ್ಸವದ ಸಮಯ, ಮಧ್ಯಾಹ್ನ ಮೋಡ ಕವಿದ ವಾತಾವರಣ', mr: 'उत्सवाचा काळ, दुपारी ढगाळ वातावरण' } },
        11: { rain_prob: 0.15, temp_min: 17, temp_max: 28, sunset: '17:56', message: { en: 'Cool royal garden walks', kn: 'ಅರಮನೆ ಉದ್ಯಾನವನದ ತಂಪಾದ ನಡಿಗೆ', mr: 'थंड आणि आल्हाददायक' } },
        12: { rain_prob: 0.05, temp_min: 15, temp_max: 28, sunset: '18:00', message: { en: 'Crisp winter weather', kn: 'ತಂಪಾದ ಚಳಿಗಾಲದ ಹವಾಮಾನ', mr: 'छान हिवाळा' } }
      }
    },
    'reg_coorg': {
      monthly: {
        10: { rain_prob: 0.40, temp_min: 16, temp_max: 24, sunset: '18:08', message: { en: 'Post-monsoon greenery with misty afternoons', kn: 'ಮಳೆಗಾಲದ ನಂತರದ ಹಸಿರು ಮತ್ತು ಮಂಜಿನ ಮಧ್ಯಾಹ್ನ', mr: 'हिरवेगार आणि धुक्याची दुपार' } },
        11: { rain_prob: 0.20, temp_min: 14, temp_max: 23, sunset: '18:02', message: { en: 'Coffee aroma and cool mountain mornings', kn: 'ಕಾಫಿಯ ಸುವಾಸನೆ ಮತ್ತು ಬೆಟ್ಟದ ತಂಪು ಹವೆ', mr: 'कॉफीचा सुगंध आणि थंड हवा' } },
        12: { rain_prob: 0.10, temp_min: 12, temp_max: 22, sunset: '18:05', message: { en: 'Chilly nights in the Western Ghats', kn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಚಳಿಯ ರಾತ್ರಿಗಳು', mr: 'पश्चिम घाटात गारठा' } }
      }
    },
    'reg_coast': {
      monthly: {
        10: { rain_prob: 0.35, temp_min: 24, temp_max: 31, sunset: '18:14', message: { en: 'Warm sea breeze with clear sunset skies', kn: 'ಸಮುದ್ರದ ಬೆಚ್ಚನೆಯ ಗಾಳಿ ಮತ್ತು ಸ್ವಚ್ಛ ಸೂರ್ಯಾಸ್ತ', mr: 'समुद्राचा वारा आणि सूर्यास्त' } },
        11: { rain_prob: 0.15, temp_min: 22, temp_max: 32, sunset: '18:08', message: { en: 'Prime coastal beach exploration weather', kn: 'ಕಡಲತೀರ ಅನ್ವೇಷಣೆಗೆ ಅತ್ಯುತ್ತಮ ಹವಾಮಾನ', mr: 'समुद्रकिनाऱ्यासाठी उत्तम हवामान' } },
        12: { rain_prob: 0.05, temp_min: 20, temp_max: 32, sunset: '18:12', message: { en: 'Gentle waves and dry coastal days', kn: 'ಸೌಮ್ಯ ಅಲೆಗಳು ಮತ್ತು ಆಹ್ಲಾದಕರ ದಿನಗಳು', mr: 'शांत लाटा आणि सुंदर दिवस' } }
      }
    },
    'reg_north': {
      monthly: {
        10: { rain_prob: 0.20, temp_min: 20, temp_max: 32, sunset: '18:00', message: { en: 'Dry Deccan plateau breeze', kn: 'ಡೆಕ್ಕನ್ ಪ್ರಸ್ಥಭೂಮಿಯ ತಂಗಾಳಿ', mr: 'दख्खनच्या पठाराचा वारा' } },
        11: { rain_prob: 0.05, temp_min: 17, temp_max: 30, sunset: '17:50', message: { en: 'Cool dome exploration weather', kn: 'ಸ್ಮಾರಕಗಳ ವೀಕ್ಷಣೆಗೆ ತಂಪಾದ ವಾತಾವರಣ', mr: 'स्मारके पाहण्यासाठी उत्तम' } },
        12: { rain_prob: 0.02, temp_min: 14, temp_max: 29, sunset: '17:54', message: { en: 'Pleasant winter sun', kn: 'ಹಿತಕರ ಚಳಿಗಾಲದ ಬಿಸಿಲು', mr: 'सुखद हिवाळी ऊन' } }
      }
    }
  },
  emergency_numbers: {
    police: '112',
    ambulance: '108',
    women_helpline: '181',
    tourist_helpline: '1800-425-2425'
  }
};
