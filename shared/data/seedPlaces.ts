import { Place, PlaceHours, PlaceAlternative, Stay, FoodSpot, TransportLeg } from '../types';
import { TODAY } from './seedData';

export const SEED_PLACES: Place[] = [
  // --- HAMPI REGION (reg_hampi) - 16 places ---
  {
    id: 'plc_virupaksha',
    region_id: 'reg_hampi',
    category: 'spiritual',
    name_i18n: { en: 'Virupaksha Temple', kn: 'ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ', mr: 'विरुपाक्ष मंदिर' },
    summary_i18n: {
      en: '7th-century active sanctuary consecrated to Lord Shiva with an iconic 50-metre eastern gopuram on the Tungabhadra river bank.',
      kn: 'ತುಂಗಭದ್ರಾ ನದಿಯ ದಂಡೆಯಲ್ಲಿರುವ 7ನೇ ಶತಮಾನದ ಐತಿಹಾಸಿಕ ಶಿವ ದೇವಾಲಯ ಮತ್ತು 50 ಮೀಟರ್ ಎತ್ತರದ ರಾಜಗೋಪುರ.',
      mr: 'तुंगभद्रा नदीकाठचे ७ व्या शतकातील प्रसिद्ध शिवमंदिर आणि ५० मीटर उंच गोपुरम.'
    },
    why_visit_i18n: {
      en: 'The uninterrupted living heart of Vijayanagara architecture since the 7th century.',
      kn: '7ನೇ ಶತಮಾನದಿಂದ ಇಂದಿಗೂ ಪೂಜೆ ನಡೆಯುತ್ತಿರುವ ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಜೀವಂತ ಕೇಂದ್ರ.',
      mr: 'विजयनगर साम्राज्याचे ७ व्या शतकापासूनचे जिवंत धार्मिक केंद्र.'
    },
    lat: 15.3353, lng: 76.4600, entry_fee_inr: 25, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: {
      en: 'Traditional modest attire required; shoulders and knees covered; footwear removed at entrance.',
      kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು ಕಡ್ಡಾಯ; ಹೆಗಲು ಮತ್ತು ಮೊಣಕಾಲು ಮುಚ್ಚಿರಬೇಕು; ಪ್ರವೇಶದ್ವಾರದಲ್ಲಿ ಪಾದರಕ್ಷೆ ತೆಗೆಯಿರಿ.',
      mr: 'पारंपरिक पोशाख आवश्यक; खांदे व गुडघे झाकलेले असावेत; बाहेर पादत्राणे काढावीत.'
    },
    rules_i18n: {
      en: 'Sanctum photography restricted. Temple elephant Lakshmi gives morning blessings at 8:30 AM.',
      kn: 'ಗರ್ಭಗುಡಿಯಲ್ಲಿ ಫೋಟೋಗ್ರಫಿ ನಿಷೇಧಿಸಲಾಗಿದೆ. ಬೆಳಿಗ್ಗೆ 8:30 ಕ್ಕೆ ಆನೆ ಲಕ್ಷ್ಮಿಯ ಆಶೀರ್ವಾದ ಲಭ್ಯ.',
      mr: 'गर्भगृहात फोटो काढण्यास बंदी. सकाळी ८:३० वाजता हत्तीचे आशीर्वाद मिळतात.'
    },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'virupaksha_gopuram',
    source: 'Sample data: ASI Hampi Circle & Karnataka Tourism', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_vittala',
    region_id: 'reg_hampi',
    category: 'heritage',
    name_i18n: { en: 'Vittala Temple & Stone Chariot', kn: 'ವಿಜಯ ವಿಠ್ಠಲ ದೇವಾಲಯ ಮತ್ತು ಕಲ್ಲಿನ ರಥ', mr: 'विठ्ठल मंदिर आणि दगडी रथ' },
    summary_i18n: {
      en: 'World-renowned 16th-century temple complex famous for the iconic Stone Chariot and musical granite pillars.',
      kn: 'ವಿಶ್ವಪ್ರಸಿದ್ಧ ಕಲ್ಲಿನ ರಥ ಮತ್ತು ಸಂಗೀತ ಹೊರಹೊಮ್ಮಿಸುವ ಕಲ್ಲಿನ ಕಂಬಗಳನ್ನು ಹೊಂದಿರುವ ಭವ್ಯ ದೇವಾಲಯ ಸಂಕೀರ್ಣ.',
      mr: 'प्रसिद्ध दगडी रथ आणि संगीतमय खांब असलेले १६ व्या शतकातील जागतिक वारसा मंदिर.'
    },
    why_visit_i18n: {
      en: 'Pinnacle of Vijayanagara artisan craft, featured on India\'s 50-rupee currency note.',
      kn: 'ಭಾರತೀಯ ₹50 ನೋಟಿನಲ್ಲಿ ಮುದ್ರಿತವಾಗಿರುವ ವಿಜಯನಗರ ವಾಸ್ತುಶಿಲ್ಪದ ಪರಮೋಚ್ಛ ಕೃತಿ.',
      mr: 'भारतीय ५० रुपयांच्या नोटेवर दर्शविलेले शिल्पकलेचे अप्रतिम उदाहरण.'
    },
    lat: 15.3436, lng: 76.4754, entry_fee_inr: 40, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest walking clothes and comfortable footwear.', kn: 'ಆರಾಮದಾಯಕ ನಡಿಗೆಯ ಉಡುಪು.', mr: 'सोयीचे कपडे आणि शूज.' },
    rules_i18n: {
      en: 'Do not touch or tap musical pillars. Electric buggies operate from parking (₹20).',
      kn: 'ಸಂಗೀತದ ಕಂಬಗಳನ್ನು ಮುಟ್ಟಬೇಡಿ. ಬ್ಯಾಟರಿ ವಾಹನ ಲಭ್ಯ (₹20).',
      mr: 'खांबांना हात लावू नका. बॅटरी कार उपलब्ध.'
    },
    has_toilet: true, has_water: true, has_shade: false, local_benefit: 4, rating: 4.9, image_hint: 'stone_chariot',
    source: 'Sample data: ASI Hampi Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_achyutaraya',
    region_id: 'reg_hampi',
    category: 'heritage',
    name_i18n: { en: 'Achyutaraya Temple (Tiruvengalanatha)', kn: 'ಅಚ್ಯುತರಾಯ ದೇವಾಲಯ', mr: 'अच्युतराय मंदिर' },
    summary_i18n: {
      en: 'Secluded temple valley nestled between Matanga and Gandhamadana hills with peaceful courtyards.',
      kn: 'ಮಾತಂಗ ಬೆಟ್ಟದ ಹಿಂಬದಿಯ ಕಣಿವೆಯಲ್ಲಿರುವ ಪ್ರಶಾಂತ ಮತ್ತು ಅದ್ಭುತ ವಾಸ್ತುಶಿಲ್ಪದ ಪ್ರಾಚೀನ ದೇವಾಲಯ.',
      mr: 'मातंग टेकडीच्या पायथ्याशी असलेले शांत व सुंदर विजयनगर मंदिर.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Vittala: extraordinary stone reliefs with 60% fewer tourists.',
      kn: 'ವಿಠ್ಠಲ ದೇವಾಲಯಕ್ಕೆ ಅತ್ಯುತ್ತಮ ಶಾಂತ ಪರ್ಯಾಯ: 60% ಕಡಿಮೆ ಜನದಟ್ಟಣೆ ಮತ್ತು ನಿಸರ್ಗದ ಸೌಂದರ್ಯ.',
      mr: 'विठ्ठल मंदिरासाठी शांत पर्याय: ६०% कमी गर्दी.'
    },
    lat: 15.3378, lng: 76.4695, entry_fee_inr: 0, avg_visit_min: 50,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 2,
    dress_code_i18n: { en: 'Walking attire for rocky trail.', kn: 'ಕಲ್ಲಿನ ಹಾದಿಗೆ ಯೋಗ್ಯ ಉಡುಪು.', mr: 'चालण्यासाठी सोयीचे कपडे.' },
    rules_i18n: { en: 'Carry water bottle; no plastic litter.', kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಮುಕ್ತ ವಲಯ.', mr: 'पाणी सोबत ठेवा.' },
    has_toilet: false, has_water: false, has_shade: true, local_benefit: 3, rating: 4.7, image_hint: 'achyutaraya_valley',
    source: 'Sample data: Hampi Heritage Conservation Authority', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_museum_kamalapura',
    region_id: 'reg_hampi',
    category: 'museum',
    name_i18n: { en: 'Archaeological Museum Kamalapura', kn: 'ಕಮಲಾಪುರ ಪುರಾತತ್ವ ವಸ್ತುಸಂಗ್ರಹಾಲಯ', mr: 'कमलापूर पुरातत्व संग्रहालय' },
    summary_i18n: {
      en: 'Four air-cooled galleries housing Vijayanagara sculptures, weapons, gold coins, and scaled topographic model of Hampi.',
      kn: 'ವಿಜಯನಗರ ಕಾಲದ ಶಿಲ್ಪಗಳು, ನಾಣ್ಯಗಳು ಮತ್ತು ಹಂಪಿಯ ಸಂಪೂರ್ಣ ಭೌಗೋಳಿಕ ಮಾದರಿಯನ್ನು ಹೊಂದಿರುವ ಸುಸಜ್ಜಿತ ಒಳಾಂಗಣ ಮ್ಯೂಸಿಯಂ.',
      mr: 'विजयनगर काळातील शिल्पे व हंपीची स्थलरचना दर्शवणारे इनडोअर संग्रहालय.'
    },
    why_visit_i18n: {
      en: 'Prime indoor alternative during rain or noon heat with rich contextual history.',
      kn: 'ಮಳೆ ಅಥವಾ ಮಧ್ಯಾಹ್ನದ ಬಿರುಬಿಸಿಲಿಗೆ ಸೂಕ್ತ ಒಳಾಂಗಣ ಸ್ಥಳ; ಹಂಪಿಯ ಇತಿಹಾಸ ತಿಳಿಯಲು ಸೂಕ್ತ.',
      mr: 'दुपारच्या उन्हात किंवा पावसात पाहण्यासाठी सर्वोत्तम इनडोअर जागा.'
    },
    lat: 15.3120, lng: 76.4815, entry_fee_inr: 20, avg_visit_min: 60,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Comfortable casual wear.', kn: 'ಸಾಮಾನ್ಯ ಆರಾಮದಾಯಕ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Closed on Fridays. Wheelchair accessible.', kn: 'ಶುಕ್ರವಾರ ರಜೆ. ವ್ಹೀಲ್‌ಚೇರ್ ಸೌಲಭ್ಯವಿದೆ.', mr: 'शुक्रवारी बंद. व्हीलचेअर उपलब्ध.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'museum_sculpture',
    source: 'Sample data: ASI Museums Division', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_lotus_mahal',
    region_id: 'reg_hampi',
    category: 'heritage',
    name_i18n: { en: 'Lotus Mahal & Zenana Enclosure', kn: 'ಕಮಲ ಮಹಲ್ ಮತ್ತು ಜನಾನಾ ಆವರಣ', mr: 'कमल महाल' },
    summary_i18n: {
      en: 'Two-storey Indo-Islamic pleasure pavilion surrounded by manicured lawns and watchtowers.',
      kn: 'ಸುಂದರ ಹಸಿರು ಹುಲ್ಲುಹಾಸಿನ ಮಧ್ಯೆ ಇರುವ ಭಾರತೀಯ-ಇಸ್ಲಾಮಿಕ್ ವಾಸ್ತುಶಿಲ್ಪದ ಎರಡು ಅಂತಸ್ತಿನ ಸುಂದರ ಅರಮನೆ.',
      mr: 'इंडो-इस्लामिक शैलीतील दुमजली महाल व भव्य बगीचा.'
    },
    why_visit_i18n: {
      en: 'Remarkably intact palace architecture demonstrating ancient cooling waterways.',
      kn: 'ನೈಸರ್ಗಿಕ ತಂಪಾಗಿಸುವ ಜಲಮಾರ್ಗ ವ್ಯವಸ್ಥೆ ಹೊಂದಿರುವ ಅಪರೂಪದ ಸ್ಮಾರಕ.',
      mr: 'नैसर्गिक थंडावा देणारी प्राचीन जलप्रणाली असणारा महाल.'
    },
    lat: 15.3204, lng: 76.4682, entry_fee_inr: 40, avg_visit_min: 50,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual daytime travel wear.', kn: 'ಪ್ರವಾಸಕ್ಕೆ ಸೂಕ್ತವಾದ ಉಡುಪು.', mr: 'सोयीचे कपडे.' },
    rules_i18n: { en: 'Same ticket valid for Vittala Temple on same day.', kn: 'ಇಲ್ಲಿನ ಟಿಕೆಟ್ ಅದೇ ದಿನ ವಿಠ್ಠಲ ದೇವಾಲಯಕ್ಕೂ ಅನ್ವಯಿಸುತ್ತದೆ.', mr: 'हेच तिकीट विठ्ठल मंदिरासाठीही चालते.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'lotus_mahal_pavilion',
    source: 'Sample data: ASI Hampi Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_elephant_stables',
    region_id: 'reg_hampi',
    category: 'heritage',
    name_i18n: { en: 'Elephant Stables (Gajashala)', kn: 'ಆನೆ ಲಾಯ (ಗಜಶಾಲೆ)', mr: 'हत्तीची पागा (गजशाळा)' },
    summary_i18n: {
      en: 'Row of eleven massive domed chambers built for royal ceremonial elephants.',
      kn: 'ವಿಜಯನಗರದ ರಾಜಮನೆತನದ ಆನೆಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ 11 ಭವ್ಯ ಗುಮ್ಮಟಗಳ ಸಾಲು.',
      mr: 'शाही हत्तींसाठी बांधलेल्या ११ भव्य घुमटांची रांग.'
    },
    why_visit_i18n: {
      en: 'Grand symmetry blending Hindu and Islamic dome vaulting.',
      kn: 'ಹಿಂದೂ ಮತ್ತು ಇಸ್ಲಾಮಿಕ್ ಶೈಲಿಯ ಗುಮ್ಮಟ ವಾಸ್ತುಶಿಲ್ಪದ ಭವ್ಯ ಉದಾಹರಣೆ.',
      mr: 'भव्य आणि देखणी मध्ययुगीन स्थापत्यकला.'
    },
    lat: 15.3209, lng: 76.4710, entry_fee_inr: 40, avg_visit_min: 40,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual day wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'सोयीचे कपडे.' },
    rules_i18n: { en: 'Adjacent to Lotus Mahal.', kn: 'ಕಮಲ ಮಹಲ್ ಪಕ್ಕದಲ್ಲಿದೆ.', mr: 'कमल महालाजवळ आहे.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'elephant_stables',
    source: 'Sample data: ASI Hampi Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_matanga_hill',
    region_id: 'reg_hampi',
    category: 'viewpoint',
    name_i18n: { en: 'Matanga Hill Sunrise Point', kn: 'ಮಾತಂಗ ಬೆಟ್ಟ ಸೂರ್ಯೋದಯ ತಾಣ', mr: 'मातंग टेकडी सूर्योदय पॉइंट' },
    summary_i18n: {
      en: 'Highest elevation in central Hampi offering unmatched 360-degree vista of boulder landscapes and ruins.',
      kn: 'ಹಂಪಿಯ ಅತ್ಯುನ್ನತ ಶಿಖರ; ಸೂರ್ಯೋದಯ ಮತ್ತು ಕಲ್ಲಿನ ವಿಸ್ಮಯ ಭೂದೃಶ್ಯದ 360 ಡಿಗ್ರಿ ವಿಹಂಗಮ ನೋಟ.',
      mr: 'हंपಿचा सर्वोच्च बिंदू; विहंगम सूर्योदय आणि ३६० अंशाचे दृश्य.'
    },
    why_visit_i18n: {
      en: 'Legendary vantage point mentioned in Ramayana where Sugriva found refuge.',
      kn: 'ರಾಮಾಯಣದಲ್ಲಿ ಉಲ್ಲೇಖಿಸಲಾದ ಸುಗ್ರೀವನ ಆಶ್ರಯ ತಾಣ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಸೂರ್ಯೋದಯ ಬಿಂದು.',
      mr: 'रामायणातील सुग्रीवाची गुंफा व सर्वोत्तम सूर्योदय.'
    },
    lat: 15.3340, lng: 76.4678, entry_fee_inr: 0, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 1,
    dress_code_i18n: { en: 'High-traction footwear essential.', kn: 'ಗ್ರಿಪ್ ಇರುವ ಶೂಗಳು ಕಡ್ಡಾಯ.', mr: 'चांगले शूज वापरा.' },
    rules_i18n: { en: 'Avoid climbing during rains due to slippery granite.', kn: 'ಮಳೆಯಲ್ಲಿ ಹತ್ತಬೇಡಿ.', mr: 'पावसात चढणे टाळा.' },
    has_toilet: false, has_water: false, has_shade: false, local_benefit: 3, rating: 4.8, image_hint: 'matanga_sunrise',
    source: 'Sample data: Karnataka Eco Tourism Board', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_malyavanta_hill',
    region_id: 'reg_hampi',
    category: 'spiritual',
    name_i18n: { en: 'Malyavanta Raghunatha Temple & Hill', kn: 'ಮಲ್ಯವಂತ ರಘುನಾಥ ಬೆಟ್ಟ ಮತ್ತು ದೇವಾಲಯ', mr: 'मलयवंत रघुनाथ मंदिर' },
    summary_i18n: {
      en: 'Serene boulder hilltop temple with continuous round-the-clock Ramayana chanting by local sadhus.',
      kn: 'ಸಾಧುಗಳಿಂದ ನಿರಂತರ 24 ಗಂಟೆಗಳ ರಾಮಾಯಣ ಪಠಣ ನಡೆಯುವ ಶಾಂತ ಬೆಟ್ಟದ ದೇಗುಲ.',
      mr: 'अखंड रामायण पठण चालणारे शांत व विस्तीर्ण टेकडी मंदिर.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Matanga Hill: gentle road access with magnificent sunset and soulful music.',
      kn: 'ಮಾತಂಗ ಬೆಟ್ಟಕ್ಕೆ ಸುಲಭ ಶಾಂತ ಪರ್ಯಾಯ: ವಾಹನ ಹೋಗುವ ಹಾದಿ ಮತ್ತು ಅದ್ಭುತ ಸೂರ್ಯಾಸ್ತ.',
      mr: 'मातंग टेकडीला शांत पर्याय: वाहनाने पोहोचता येते व उत्तम सूर्यास्त.'
    },
    lat: 15.3288, lng: 76.4850, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest temple attire.', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು.', mr: 'पारंपरिक कपडे.' },
    rules_i18n: { en: 'Maintain silence near inner sanctum chanting pavilion.', kn: 'ಭಜನಾ ಮಂಟಪದಲ್ಲಿ ಶಾಂತಿ ಕಾಪಾಡಿ.', mr: 'शांतता राखा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'malyavanta_sunset',
    source: 'Sample data: Hampi Local Heritage Registry', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_hemakuta_hill',
    region_id: 'reg_hampi',
    category: 'heritage',
    name_i18n: { en: 'Hemakuta Hill Monolithic Monuments', kn: 'ಹೇಮಕೂಟ ಬೆಟ್ಟ ಮತ್ತು ಪ್ರಾಚೀನ ದೇಗುಲಗಳು', mr: 'हेमकूट टेकडी' },
    summary_i18n: {
      en: 'Gentle rocky expanse dotted with more than thirty pre-Vijayanagara triple-chambered shrines.',
      kn: 'ಮೂವತ್ತಕ್ಕೂ ಹೆಚ್ಚು ಪ್ರಾಚೀನ ತ್ರಿಕೂಟ ದೇವಾಲಯಗಳಿರುವ ಸುಂದರ ಗ್ರಾನೈಟ್ ಬೆಟ್ಟದ ಬಯಲು.',
      mr: '३० पेक्षा जास्त प्राचीन मंदिरांनी वेढलेली सुंदर टेकಡಿ.'
    },
    why_visit_i18n: {
      en: 'Best accessible golden hour sunset overlooking Virupaksha gopuram.',
      kn: 'ವಿರೂಪಾಕ್ಷ ಗೋಪುರದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಸುವರ್ಣ ಸಂಜೆಯ ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆಗೆ ಅತ್ಯಂತ ಸೂಕ್ತ.',
      mr: 'विरुपाक्ष गोपुरमच्या पार्श्वभूमीवर सोनेरी सूर्यास्त पाहण्यासाठी उत्तम.'
    },
    lat: 15.3332, lng: 76.4585, entry_fee_inr: 0, avg_visit_min: 45,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Casual comfortable clothes.', kn: 'ಆರಾಮದಾಯಕ ಉಡುಪು.', mr: 'आरामदायक कपडे.' },
    rules_i18n: { en: 'No climbing on sanctum roofs. Free entry.', kn: 'ಮೇಲ್ಛಾವಣಿ ಹತ್ತಬೇಡಿ. ಉಚಿತ ಪ್ರವೇಶ.', mr: 'छतावर चढू नका.' },
    has_toilet: true, has_water: true, has_shade: false, local_benefit: 3, rating: 4.8, image_hint: 'hemakuta_temples',
    source: 'Sample data: ASI Hampi Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_sasivekalu_ganesha',
    region_id: 'reg_hampi',
    category: 'spiritual',
    name_i18n: { en: 'Sasivekalu Ganesha (Mustard Seed Ganesha)', kn: 'ಸಾಸಿವೆಕಾಳು ಗಣೇಶ', mr: 'सासुवेकाळू गणेश' },
    summary_i18n: {
      en: '8-foot monolithic single-block statue carved around 1500 AD inside an open pavilion.',
      kn: '1500 ರ ಕಾಲದ ಒಂದೇ ಕಲ್ಲಿನಲ್ಲಿ ಕೆತ್ತಲಾದ 8 ಅಡಿ ಎತ್ತರದ ಗಣಪತಿಯ ಭವ್ಯ ವಿಗ್ರಹ.',
      mr: 'एकाच खडकात कोरलेली ८ फूट उंच गणेशाची मूर्ती.'
    },
    why_visit_i18n: {
      en: 'Depicts Ganesha with a snake tied around his stomach to prevent overeating.',
      kn: 'ಹೊಟ್ಟೆಯ ಸುತ್ತ ಹಾವನ್ನು ಕಟ್ಟಿಕೊಂಡ ಅಪರೂಪದ ಗಣೇಶನ ಕೆತ್ತನೆ.',
      mr: 'पोटाभोवती साप बांधलेला आगळावेगळा गणेश.'
    },
    lat: 15.3325, lng: 76.4578, entry_fee_inr: 0, avg_visit_min: 25,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Located at southern foot of Hemakuta hill.', kn: 'ಹೇಮಕೂಟದ ದಕ್ಷಿಣ ಪಾದದಲ್ಲಿದೆ.', mr: 'हेमकूट टेकडीच्या पायथ्याशी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 3, rating: 4.7, image_hint: 'sasivekalu_ganesha',
    source: 'Sample data: ASI Hampi', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_kadalekalu_ganesha',
    region_id: 'reg_hampi',
    category: 'spiritual',
    name_i18n: { en: 'Kadalekalu Ganesha (Gram Seed Ganesha)', kn: 'ಕಡಲೆಕಾಳು ಗಣೇಶ', mr: 'कडळेकाळू गणेश' },
    summary_i18n: {
      en: 'Massive 15-foot high monolithic Ganesha sheltered in classical pillared hall.',
      kn: '15 ಅಡಿ ಎತ್ತರದ ಕಲ್ಲಿನ ಕಂಬಗಳ ಭವ್ಯ ಮಂಟಪದಲ್ಲಿರುವ ಕಡಲೆಕಾಳು ಗಣೇಶ.',
      mr: '१५ फूट उंच भव्य एकाश्म गणेश मूर्ती.'
    },
    why_visit_i18n: {
      en: 'Remarkable belly shaped like a Bengal gram seed with panoramic Hampi bazaar vista.',
      kn: 'ಕಡಲೆಕಾಳಿನ ಆಕಾರದ ಹೊಟ್ಟೆ ಮತ್ತು ಹಂಪಿ ಬಜಾರಿನ ಸುಂದರ ನೋಟ.',
      mr: 'हंपी बाजाराचे सुंदर दृश्य देणारे मंदिर.'
    },
    lat: 15.3345, lng: 76.4580, entry_fee_inr: 0, avg_visit_min: 30,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Modest wear.', kn: 'ಸಭ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Free entrance.', kn: 'ಉಚಿತ ಪ್ರವೇಶ.', mr: 'मोफत प्रवेश.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 3, rating: 4.7, image_hint: 'kadalekalu_ganesha',
    source: 'Sample data: ASI Hampi', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_queens_bath',
    region_id: 'reg_hampi',
    category: 'heritage',
    name_i18n: { en: 'Queen\'s Bath (Antahpura)', kn: 'ರಾಣಿಯ ಸ್ನಾನಗೃಹ (ಅಂತಃಪುರ)', mr: 'राणीचे स्नानगृह' },
    summary_i18n: {
      en: 'Enclosed square water pavilion with ornate arched balconies projecting over sunken pool.',
      kn: 'ಸುಂದರ ಬಾಲ್ಕನಿಗಳು ಮತ್ತು ಜಲಮಾರ್ಗಗಳನ್ನು ಹೊಂದಿರುವ ರಾಜಮನೆತನದ ಮಹಿಳೆಯರ ಈಜುಕೊಳ.',
      mr: 'राजघराण्यातील महिलांसाठी बांधलेले सुरेख जलमंडप.'
    },
    why_visit_i18n: {
      en: 'Shows hydraulic engineering with fragrant water inlet channels.',
      kn: 'ಪ್ರಾಚೀನ ಜಲ ವಿಜ್ಞಾನ ಮತ್ತು ಪರಿಮಳದ ನೀರಿನ ವ್ಯವಸ್ಥೆಯ ಮಾದರಿ.',
      mr: 'प्राचीन जलव्यवस्थापनाचा नमुना.'
    },
    lat: 15.3142, lng: 76.4735, entry_fee_inr: 0, avg_visit_min: 35,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Do not enter the dry sunken pool floor.', kn: 'ಕೊಳದ ತಳಕ್ಕೆ ಇಳಿಯಬೇಡಿ.', mr: 'पात्रात उतरू नका.' },
    has_toilet: false, has_water: false, has_shade: true, local_benefit: 3, rating: 4.5, image_hint: 'queens_bath',
    source: 'Sample data: ASI Hampi', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_hampi_bazaar',
    region_id: 'reg_hampi',
    category: 'food',
    name_i18n: { en: 'Virupaksha Bazaar & Local Crafts', kn: 'ಹಂಪಿ ವಿರೂಪಾಕ್ಷ ಬಜಾರ್', mr: 'हंपी बाजार' },
    summary_i18n: {
      en: 'Half-mile long ancient colonnaded street featuring local artisans, stone carvers, and traditional cafes.',
      kn: 'ಸ್ಥಳೀಯ ಕುಶಲಕರ್ಮಿಗಳು, ಕಲ್ಲಿನ ಕೆತ್ತನೆಗಾರರು ಮತ್ತು ಕೆಫೆಗಳನ್ನು ಹೊಂದಿರುವ ಐತಿಹಾಸಿಕ ಬಜಾರ್ ಬೀದಿ.',
      mr: 'स्थानिक कारागीर व पारंपारिक खानावळी असणारा ऐतिहासिक बाजार.'
    },
    why_visit_i18n: {
      en: 'Direct local community support; handmade Lambani embroidery and banana-fibre crafts.',
      kn: 'ಲಂಬಾಣಿ ಕಸೂತಿ ಮತ್ತು ಬಾಳೆ ನಾರಿನ ಕರಕುಶಲ ವಸ್ತುಗಳ ನೇರ ಖರೀದಿ.',
      mr: 'स्थानिक हस्तकला उत्पादने.'
    },
    lat: 15.3351, lng: 76.4625, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual walking wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'UPI digital payments widely accepted by local vendors.', kn: 'ಯುಪಿಐ ಪಾವತಿ ಲಭ್ಯವಿದೆ.', mr: 'यूपीआय चालते.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.5, image_hint: 'hampi_bazaar_street',
    source: 'Sample data: Ballari Commerce Wing', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_coracle_ride',
    region_id: 'reg_hampi',
    category: 'adventure',
    name_i18n: { en: 'Tungabhadra Coracle Crossing', kn: 'ತುಂಗಭದ್ರಾ ಹರಿಗೋಲು (ತೆಪ್ಪ) ಸವಾರಿ', mr: 'तुंगभद्रा टोपली बोट सफारी' },
    summary_i18n: {
      en: 'Traditional circular reed boat journey drifting beneath massive granite boulders and cave temples.',
      kn: 'ದೊಡ್ಡ ಬಂಡೆಗಳ ನಡುವೆ ತುಂಗಭದ್ರಾ ನದಿಯಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ತೆಪ್ಪದಲ್ಲಿ ತೇಲುವ ರೋಮಾಂಚಕ ಅನುಭವ.',
      mr: 'विशाल खडकांच्या मधून तुंगभद्रेत फिरणारी पारंपारिक गोल बोट.'
    },
    why_visit_i18n: {
      en: 'Intimate perspective of water-smoothed geological formations by local boatmen families.',
      kn: 'ಸ್ಥಳೀಯ ನಾವಿಕ ಕುಟುಂಬಗಳೊಂದಿಗೆ ನದಿಯ ನೈಸರ್ಗಿಕ ಸೌಂದರ್ಯವನ್ನು ಆಸ್ವಾದಿಸಿ.',
      mr: 'नदीवरून हंपीचे अद्वितीय खडकाळ सौंदर्य अनुभवण्याची संधी.'
    },
    lat: 15.3385, lng: 76.4630, entry_fee_inr: 150, avg_visit_min: 30,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Water-resistant footwear.', kn: 'ನೀರಿನ ಪಾದರಕ್ಷೆ.', mr: 'सोयीचे कपडे.' },
    rules_i18n: { en: 'Life jackets mandatory.', kn: 'ಲೈಫ್ ಜಾಕೆಟ್ ಕಡ್ಡಾಯ.', mr: 'लाईफ जॅकेट अनिवार्य.' },
    has_toilet: false, has_water: false, has_shade: false, local_benefit: 5, rating: 4.8, image_hint: 'coracle_river',
    source: 'Sample data: KSTDC River Adventures', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_anjanadri_hill',
    region_id: 'reg_hampi',
    category: 'viewpoint',
    name_i18n: { en: 'Anjanadri Hill (Hanuman Birthplace)', kn: 'ಅಂಜನಾದ್ರಿ ಬೆಟ್ಟ (ಹನುಮ ಜನ್ಮಸ್ಥಳ)', mr: 'अंजनाद्री टेकडी' },
    summary_i18n: {
      en: 'Revered hilltop across Tungabhadra reached via 575 whitewashed granite steps with sprawling paddy views.',
      kn: '575 ಮೆಟ್ಟಿಲುಗಳನ್ನು ಹತ್ತಿ ತಲುಪುವ ಹಸಿರು ಭತ್ತದ ಗದ್ದೆಗಳ ವಿಹಂಗಮ ನೋಟ ನೀಡುವ ಪವಿತ್ರ ಹನುಮ ಬೆಟ್ಟ.',
      mr: '५७५ पायऱ्या चढून जाणारे विहंगम दृश्य देणारे पवित्र स्थान.'
    },
    why_visit_i18n: {
      en: 'Traditional Kishkindha realm of monkey warriors offering serene sunset chanting.',
      kn: 'ಕಿಷ್ಕಿಂಧೆ ಸಾಮ್ರಾಜ್ಯದ ಸುಂದರ ಸೂರ್ಯಾಸ್ತ ಮತ್ತು ಭಕ್ತಿ ಪರಂಪರೆ.',
      mr: 'किष्किंधा प्रदेशातील प्रसिद्ध टेकडी.'
    },
    lat: 15.3540, lng: 76.4720, entry_fee_inr: 0, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 2,
    dress_code_i18n: { en: 'High traction shoes; modest clothes.', kn: 'ಗ್ರಿಪ್ ಇರುವ ಶೂಗಳು.', mr: 'चांगले शूज.' },
    rules_i18n: { en: 'Watch out for monkeys on stairs. Free prasadam.', kn: 'ಕೋತಿಗಳಿಂದ ಎಚ್ಚರವಿರಲಿ. ಪ್ರಸಾದ ಉಚಿತ.', mr: 'माकडांपासून सांभाळा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'anjanadri_steps',
    source: 'Sample data: Koppal Tourism Council', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_anegundi_crafts',
    region_id: 'reg_hampi',
    category: 'food',
    name_i18n: { en: 'Anegundi Heritage & Banana Fibre Crafts', kn: 'ಆನೆಗುಂದಿ ಹೆರಿಟೇಜ್ ಮತ್ತು ಬಾಳೆ ನಾರಿನ ಕರಕುಶಲ', mr: 'आनेगुंदी हस्तकला केंद्र' },
    summary_i18n: {
      en: 'Ancient village older than Hampi producing sustainable banana fibre bags, lamps, and organic lunches.',
      kn: 'ಹಂಪಿಯ ಮೂಲ ನಗರ; ಪರಿಸರಸ್ನೇಹಿ ಬಾಳೆ ನಾರಿನ ವಸ್ತುಗಳು ಮತ್ತು ಗ್ರಾಮೀಣ ಊಟ.',
      mr: 'पर्यावरणपूरक केळीच्या धाग्यांपासून बनवलेल्या वस्तू व पारंपारिक जेवण.'
    },
    why_visit_i18n: {
      en: 'Supports grassroots women artisans and traditional courtyard mud architecture.',
      kn: 'ಗ್ರಾಮೀಣ ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘಗಳಿಗೆ ನೇರ ಬೆಂಬಲ ನೀಡುವ ಸುಸ್ಥಿರ ತಾಣ.',
      mr: 'महिला बचत गटांना थेट पाठिंबा देणारे केंद्र.'
    },
    lat: 15.3512, lng: 76.4680, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Casual cotton clothing.', kn: 'ಹತ್ತಿ ಬಟ್ಟೆ.', mr: 'सुती कपडे.' },
    rules_i18n: { en: 'Workshops for banana fibre weaving open daily 10 AM - 5 PM.', kn: 'ತರಬೇತಿ ಮತ್ತು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಲಭ್ಯ.', mr: 'कार्यशाळा खुली असते.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.7, image_hint: 'anegundi_village',
    source: 'Sample data: The Kishkinda Trust', last_checked: TODAY, verified: 0
  },

  // --- MYSURU REGION (reg_mysuru) - 12 places ---
  {
    id: 'plc_mysuru_palace',
    region_id: 'reg_mysuru',
    category: 'heritage',
    name_i18n: { en: 'Mysuru Palace (Amba Vilas)', kn: 'ಮೈಸೂರು ಅಂಬಾ ವಿಲಾಸ ಅರಮನೆ', mr: 'म्हैसूर राजवाडा (अंबा विलास)' },
    summary_i18n: {
      en: 'Indo-Saracenic royal residence of the Wadiyar dynasty featuring stained glass ceilings, carved mahogany, and evening illumination.',
      kn: 'ಬಣ್ಣದ ಗಾಜುಗಳು, ದಂತದ ಕೆತ್ತನೆ ಬಾಗಿಲುಗಳು ಮತ್ತು ಸಂಜೆಯ 97,000 ದೀಪಗಳ ಬೆಳಕಿನಿಂದ ಕಂಗೊಳಿಸುವ ಒಡೆಯರ್ ರಾಜವಂಶದ ಅರಮನೆ.',
      mr: 'वाडयार घराण्याचा भव्य राजवाडा, अप्रतिम काचकाम आणि संध्याकाळची रोषणाई.'
    },
    why_visit_i18n: {
      en: 'One of India\'s most visited monuments; unmatched royal ceremonial heritage.',
      kn: 'ದಸರಾ ವೈಭವದ ಪ್ರಧಾನ ಕೇಂದ್ರ; ಭಾರತದ ಅತ್ಯಂತ ಪ್ರಸಿದ್ಧ ಸ್ಮಾರಕಗಳಲ್ಲಿ ಒಂದು.',
      mr: 'भारतातील सर्वात प्रसिद्ध ऐतिहासिक वास्तूंपैकी एक.'
    },
    lat: 12.3051, lng: 76.6551, entry_fee_inr: 100, avg_visit_min: 90,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Smart casual modest wear; footwear deposited.', kn: 'ಸಭ್ಯ ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು; ಪಾದರಕ್ಷೆ ಕೌಂಟರ್‌ನಲ್ಲಿ ಇಡಬೇಕು.', mr: 'सभ्य कपडे; पादत्राणे जमा करणे अनिवार्य.' },
    rules_i18n: { en: 'No photography inside residential hall. Illumination Sunday 7 PM.', kn: 'ಒಳಗೆ ಫೋಟೋಗ್ರಫಿ ನಿಷೇಧ. ಭಾನುವಾರ ದೀಪಾಲಂಕಾರ.', mr: 'आत फोटो काढण्यास बंदी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.9, image_hint: 'mysuru_palace_night',
    source: 'Sample data: Mysore Palace Board', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_jaganmohan_palace',
    region_id: 'reg_mysuru',
    category: 'museum',
    name_i18n: { en: 'Jaganmohan Palace Art Gallery', kn: 'ಜಗನ್ಮೋಹನ ಅರಮನೆ ಕಲಾಶಾಲೆ', mr: 'जगनमोहन पॅलेस आर्ट गॅलरी' },
    summary_i18n: {
      en: '1861 royal wooden palace housing South India\'s largest oil painting collection including original masterpieces by Raja Ravi Varma.',
      kn: 'ರಾಜಾ ರವಿವರ್ಮ ಅವರ ಮೂಲ ಕಲಾಕೃತಿಗಳನ್ನು ಹೊಂದಿರುವ ದಕ್ಷಿಣ ಭಾರತದ ಪ್ರಮುಖ ರಾಜಮನೆತನದ ಕಲಾಶಾಲೆ.',
      mr: 'राजा रविवर्मा यांची मूळ चित्रे असणारे ऐतिहासिक कलादालन.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Mysuru Palace: serene art viewing without the massive tourist queues.',
      kn: 'ಮೈಸೂರು ಅರಮನೆಗೆ ಪ್ರಶಾಂತ ಪರ್ಯಾಯ: ಉದ್ದದ ಸಾಲುಗಳಿಲ್ಲದೆ ಅದ್ಭುತ ಕಲಾಕೃತಿಗಳ ವೀಕ್ಷಣೆ.',
      mr: 'म्हैसूर राजवाड्याला शांत पर्याय: गर्दी नसलेले कलादालन.'
    },
    lat: 12.3082, lng: 76.6508, entry_fee_inr: 50, avg_visit_min: 70,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Comfortable indoor attire.', kn: 'ಸಾಮಾನ್ಯ ಆರಾಮದಾಯಕ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Flash photography prohibited.', kn: 'ಫ್ಲ್ಯಾಶ್ ಫೋಟೋಗ್ರಫಿ ನಿಷೇಧ.', mr: 'फ्लॅश बंदी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'jaganmohan_art',
    source: 'Sample data: Sri Jayachamarajendra Art Gallery Trust', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_chamundi_hills',
    region_id: 'reg_mysuru',
    category: 'spiritual',
    name_i18n: { en: 'Chamundeshwari Temple & Nandi', kn: 'ಚಾಮುಂಡೇಶ್ವರಿ ದೇವಾಲಯ ಮತ್ತು ನಂದಿ ವಿಗ್ರಹ', mr: 'चामुंडेश्वरी मंदिर' },
    summary_i18n: {
      en: 'Perched 1,000 metres high, this revered Shakti Peetha overlooks Mysuru city alongside 350-year-old monolithic bull.',
      kn: 'ಮೈಸೂರು ನಗರದ ವಿಹಂಗಮ ನೋಟ ನೀಡುವ 1000 ಮೀಟರ್ ಎತ್ತರದ ಪವಿತ್ರ ಶಕ್ತಿ ಪೀಠ ಮತ್ತು ಏಕಶಿಲಾ ನಂದಿ.',
      mr: 'टेकडीवरील प्रसिद्ध चामुंडेश्वरी शक्तिपीठ आणि अखंड दगडी नंदी.'
    },
    why_visit_i18n: {
      en: 'Spiritual patron goddess of Karnataka with panoramic horizon views.',
      kn: 'ನಾಡದೇವತೆಯ ಆಶೀರ್ವಾದ ಮತ್ತು ಇಡೀ ಮೈಸೂರು ನಗರದ ಸುಂದರ ನೋಟ.',
      mr: 'कर्नाटकची कुलदेवता व विलोभनीय दृश्य.'
    },
    lat: 12.2745, lng: 76.6710, entry_fee_inr: 0, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Traditional Indian temple attire mandatory.', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು ಕಡ್ಡಾಯ.', mr: 'पारंपरिक भारतीय पोशाख.' },
    rules_i18n: { en: 'Special darshan queue ticket ₹100.', kn: 'ಶೀಘ್ರ ದರ್ಶನ ಟಿಕೆಟ್ ₹100.', mr: 'जलद दर्शन तिकीट ₹१००.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'chamundi_temple_view',
    source: 'Sample data: Muzrai Department Karnataka', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_devaraja_market',
    region_id: 'reg_mysuru',
    category: 'food',
    name_i18n: { en: 'Devaraja Heritage Market', kn: 'ದೇವರಾಜ ಮಾರುಕಟ್ಟೆ', mr: 'देवराज हेरिटेज मार्केट' },
    summary_i18n: {
      en: 'Centuries-old covered bazaar bursting with mounds of Kumkuma pigments, fragrant Mysuru jasmine, and betel leaves.',
      kn: 'ಮೈಸೂರು ಮಲ್ಲಿಗೆ, ಗಂಧ, ಬೆಲ್ಲ ಮತ್ತು ಬಣ್ಣದ ಕುಂಕುಮದ ಪರಿಮಳ ಸೂಸುವ ಐತಿಹಾಸಿಕ ಒಳಾಂಗಣ ಮಾರುಕಟ್ಟೆ.',
      mr: 'म्हैसूर मोगरा, चंदन, गूळ आणि हळद-कुंकवाचा प्रसिद्ध जुना बाजार.'
    },
    why_visit_i18n: {
      en: 'Sensory pulse of authentic local trade under historic wooden roof trusses.',
      kn: 'ನೈಜ ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ ಮತ್ತು ಮೈಸೂರಿನ ಸಾಂಪ್ರದಾಯಿಕ ಸುವಾಸನೆ ಅನುಭವಿಸಿ.',
      mr: 'अस्सल स्थानिक खाद्य व फुल संस्कृती.'
    },
    lat: 12.3116, lng: 76.6515, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 3,
    dress_code_i18n: { en: 'Casual comfortable clothes.', kn: 'ಆರಾಮದಾಯಕ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Nanjangud rasabale bananas available at fruit rows.', kn: 'ನಂಜನಗೂಡು ರಸಬಾಳೆ ಹಣ್ಣು ಲಭ್ಯ.', mr: 'स्थानिक केळी उपलब्ध.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.6, image_hint: 'market_jasmine',
    source: 'Sample data: Mysuru Corporation', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_brindavan_gardens',
    region_id: 'reg_mysuru',
    category: 'nature',
    name_i18n: { en: 'Brindavan Gardens & KRS Dam', kn: 'ಬೃಂದಾವನ ಗಾರ್ಡನ್ಸ್ ಮತ್ತು ಕೆಆರ್‌ಎಸ್ ಅಣೆಕಟ್ಟು', mr: 'वृंदावन गार्डन्स' },
    summary_i18n: {
      en: 'Terraced ornamental gardens adjoining Krishnarajasagara dam on Cauvery river featuring musical fountains.',
      kn: 'ಕಾವೇರಿ ನದಿಯ ಕೆಆರ್‌ಎಸ್ ಅಣೆಕಟ್ಟಿನ ಪಕ್ಕದಲ್ಲಿರುವ ಸುಂದರ ಮೆಟ್ಟಿಲುಗಳ ಉದ್ಯಾನವನ ಮತ್ತು ಸಂಗೀತ ಕಾರಂಜಿ.',
      mr: 'कावेरी धरणाशेजारील सुशोभित बागा व संगीतमय कारंजे.'
    },
    why_visit_i18n: {
      en: 'Classic Karnataka evening leisure spot celebrated in countless film songs.',
      kn: 'ಸಂಜೆಯ ತಂಗಾಳಿಯಲ್ಲಿ ನೃತ್ಯ ಕಾರಂಜಿ ಮತ್ತು ಸುಂದರ ಬೆಳಕಿನ ವೈಭವ.',
      mr: 'संध्याकाळच्या म्युझिकल फाऊंटेनसाठी प्रसिद्ध.'
    },
    lat: 12.4240, lng: 76.5728, entry_fee_inr: 50, avg_visit_min: 100,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Warm evening wrap.', kn: 'ಸಂಜೆಯ ಚಳಿಗೆ ಶಾಲು.', mr: 'हलके गरम कपडे.' },
    rules_i18n: { en: 'Fountain show starts at 6:30 PM.', kn: 'ಕಾರಂಜಿ ಶೋ ಸಂಜೆ 6:30 ಕ್ಕೆ ಆರಂಭ.', mr: 'कारंजे शो ६:३० वाजता सुरू.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.4, image_hint: 'brindavan_fountain',
    source: 'Sample data: Cauvery Neeravari Nigam', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_philomena_church',
    region_id: 'reg_mysuru',
    category: 'heritage',
    name_i18n: { en: 'St. Philomena\'s Neo-Gothic Cathedral', kn: 'ಸೇಂಟ್ ಫಿಲೋಮಿನಾ ಕ್ಯಾಥೆಡ್ರಲ್', mr: 'सेंट फिलोमेना कॅथेड्रल' },
    summary_i18n: {
      en: 'Cathedral built in 1936 styled after the Cologne Cathedral in Germany, with twin 175-foot spires.',
      kn: 'ಜರ್ಮನಿಯ ಕಲೋನ್ ಚರ್ಚ್ ಶೈಲಿಯಲ್ಲಿ ನಿರ್ಮಿಸಲಾದ 175 ಅಡಿ ಎತ್ತರದ ಭವ್ಯ ಗೋಪುರಗಳ ಕ್ಯಾಥೆಡ್ರಲ್.',
      mr: 'जर्मनीच्या कोलोन कॅथेड्रल शैलीतील १७५ फूट उंच चर्च.'
    },
    why_visit_i18n: {
      en: 'Stunning French stained-glass windows detailing Biblical scenes and calm underground crypt.',
      kn: 'ಫ್ರೆಂಚ್ ಬಣ್ಣದ ಗಾಜಿನ ಕಿಟಕಿಗಳು ಮತ್ತು ಪ್ರಶಾಂತ ನೆಲಮಾಳಿಗೆಯ ಪ್ರಾರ್ಥನಾ ಮಂದಿರ.',
      mr: 'फ्रेंच रंगीत काचकाम आणि शांत वातावरण.'
    },
    lat: 12.3210, lng: 76.6575, entry_fee_inr: 0, avg_visit_min: 40,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Modest respectful clothing.', kn: 'ಸಭ್ಯ ಗೌರವಯುತ ಉಡುಪು.', mr: 'सभ्य कपडे.' },
    rules_i18n: { en: 'Silence during mass services.', kn: 'ಪ್ರಾರ್ಥನೆಯ ಸಮಯದಲ್ಲಿ ಶಾಂತಿ ಕಾಪಾಡಿ.', mr: 'शांतता पाळा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 3, rating: 4.6, image_hint: 'philomena_spires',
    source: 'Sample data: Diocese of Mysore', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_mysore_zoo',
    region_id: 'reg_mysuru',
    category: 'nature',
    name_i18n: { en: 'Sri Chamarajendra Zoological Gardens', kn: 'ಶ್ರೀ ಚಾಮರಾಜೇಂದ್ರ ಮೃಗಾಲಯ (ಮೈಸೂರು ಝೂ)', mr: 'म्हैसूर प्राणीसंग्रहालय' },
    summary_i18n: {
      en: 'Founded in 1892, one of the oldest and most biodiverse zoos in Asia set in 157 verdant acres.',
      kn: '1892 ರಲ್ಲಿ ಸ್ಥಾಪಿತವಾದ 157 ಎಕರೆಯ ಏಷ್ಯಾದ ಅತ್ಯಂತ ಸುಸಜ್ಜಿತ ಮತ್ತು ಹಸಿರಿನಿಂದ ಕೂಡಿದ ಮೃಗಾಲಯ.',
      mr: '१८९२ मधील आशियातील जुने व मोठे प्राणीसंग्रहालय.'
    },
    why_visit_i18n: {
      en: 'Spacious naturalized enclosures and successful conservation breeding programs.',
      kn: 'ನೈಸರ್ಗಿಕ ವಾತಾವರಣದಲ್ಲಿ ವನ್ಯಜೀವಿ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಹಸಿರು ಪರಿಸರ.',
      mr: 'विशाल नैसर्गिक परिसर व वन्यजीव संवर्धन.'
    },
    lat: 12.3025, lng: 76.6660, entry_fee_inr: 100, avg_visit_min: 120,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Comfortable walking shoes.', kn: 'ನಡಿಗೆಯ ಶೂಗಳು.', mr: 'चालण्यासाठी शूज.' },
    rules_i18n: { en: 'Closed on Tuesdays. Single-use plastic completely prohibited.', kn: 'ಮಂಗಳವಾರ ರಜೆ. ಪ್ಲಾಸ್ಟಿಕ್ ನಿಷೇಧ.', mr: 'मंगळवारी बंद. प्लास्टिक बंदी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'mysore_zoo_park',
    source: 'Sample data: Zoo Authority of Karnataka', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_karanji_lake',
    region_id: 'reg_mysuru',
    category: 'nature',
    name_i18n: { en: 'Karanji Nature Park & Walk-Through Aviary', kn: 'ಕಾರಂಜಿ ಕೆರೆ ಪ್ರಕೃತಿ ಉದ್ಯಾನ ಮತ್ತು ಪಕ್ಷಿಧಾಮ', mr: 'कारंजी लेक व पक्षी अभयारण्य' },
    summary_i18n: {
      en: 'Picturesque wetland lake featuring India\'s largest walk-through aviary and a butterfly garden.',
      kn: 'ಭಾರತದ ಅತಿ ದೊಡ್ಡ ನಡಿಗೆಯ ಪಕ್ಷಿಧಾಮ ಮತ್ತು ಚಿಟ್ಟೆ ಉದ್ಯಾನವಿರುವ ಸುಂದರ ಜಲತಾಣ.',
      mr: 'भारतातील सर्वात मोठे वॉक-थ्रू पक्षी अभयारण्य.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Mysore Zoo: serene lake boating with hundreds of migratory pelicans.',
      kn: 'ಮೈಸೂರು ಝೂಗೆ ಅತ್ಯುತ್ತಮ ಶಾಂತ ಪರ್ಯಾಯ: ದೋಣಿ ವಿಹಾರ ಮತ್ತು ವಲಸೆ ಪಕ್ಷಿಗಳ ವೀಕ್ಷಣೆ.',
      mr: 'प्राणीसंग्रहालयाला शांत पर्याय: शांत नौकाविहार.'
    },
    lat: 12.3015, lng: 76.6740, entry_fee_inr: 50, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual outdoor clothes.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Closed on Tuesdays.', kn: 'ಮಂಗಳವಾರ ರಜೆ ಇರುತ್ತದೆ.', mr: 'मंगळवारी बंद.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'karanji_lake_birds',
    source: 'Sample data: Karnataka Eco-Tourism', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_railway_museum_mysuru',
    region_id: 'reg_mysuru',
    category: 'museum',
    name_i18n: { en: 'Mysuru Rail Museum', kn: 'ಮೈಸೂರು ರೈಲ್ವೆ ವಸ್ತುಸಂಗ್ರಹಾಲಯ', mr: 'म्हैसूर रेल्वे म्युझियम' },
    summary_i18n: {
      en: 'Vintage outdoor and indoor exhibits of royal coaches, steam locomotives, and Maharani dining saloons.',
      kn: 'ಮೈಸೂರು ಮಹಾರಾಣಿಯ ಐಷಾರಾಮಿ ರೈಲು ಬೋಗಿಗಳು ಮತ್ತು ಹಳೆಯ ಹಬೆ ಎಂಜಿನ್‌ಗಳ ಸುಂದರ ಸಂಗ್ರಹಾಲಯ.',
      mr: 'शाही रेल्वे डबे आणि वाफेच्या इंजिनांचे सुंदर संग्रहालय.'
    },
    why_visit_i18n: {
      en: 'Charming transport history with operating mini toy train for families.',
      kn: 'ಪುಟಾಣಿ ರೈಲು ಸವಾರಿ ಮತ್ತು ಭಾರತೀಯ ರೈಲ್ವೆಯ ಗತಕಾಲದ ವೈಭವದ ಅನುಭವ.',
      mr: 'लहान मुलांसाठी टॉय ट्रेन आणि रेल्वेचा इतिहास.'
    },
    lat: 12.3168, lng: 76.6432, entry_fee_inr: 50, avg_visit_min: 60,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: true, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Casual wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Closed on Mondays. Mini train ticket ₹30.', kn: 'ಸೋಮವಾರ ರಜೆ.', mr: 'सोमवारी बंद.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'rail_locomotive',
    source: 'Sample data: South Western Railway Heritage Wing', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_lalitha_mahal',
    region_id: 'reg_mysuru',
    category: 'heritage',
    name_i18n: { en: 'Lalitha Mahal Palace Viewpoint', kn: 'ಲಲಿತ ಮಹಲ್ ಅರಮನೆ ನೋಟ', mr: 'ललिता महाल पॅलेस' },
    summary_i18n: {
      en: 'Gleaming white palace built in 1921 modelled on St. Paul’s Cathedral in London.',
      kn: 'ಲಂಡನ್‌ನ ಸೇಂಟ್ ಪಾಲ್ಸ್ ಕ್ಯಾಥೆಡ್ರಲ್ ಮಾದರಿಯಲ್ಲಿ 1921 ರಲ್ಲಿ ನಿರ್ಮಿಸಲಾದ ಬಿಳಿ ಅಮೃತಶಿಲೆಯ ಅರಮನೆ.',
      mr: 'लंडनच्या सेंट पॉल कॅथेड्रलच्या धर्तीवर बांधलेला पांढरा राजवाडा.'
    },
    why_visit_i18n: {
      en: 'Regal afternoon tea with Italian marble staircases and Chamundi hill views.',
      kn: 'ಇಟಾಲಿಯನ್ ಮಾರ್ಬಲ್ ಮೆಟ್ಟಿಲುಗಳು ಮತ್ತು ಸಂಜೆಯ ಸುಂದರ ಚಹಾ ಕೂಟ.',
      mr: 'इटालियन संगमरवरी पायऱ्या आणि शाही चहाची सोय.'
    },
    lat: 12.2995, lng: 76.6870, entry_fee_inr: null, avg_visit_min: 45,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Smart casual.', kn: 'ಸಭ್ಯ ಉಡುಪು.', mr: 'स्मार्ट कॅज्युअल.' },
    rules_i18n: { en: 'Operated by Ashok Group. Verify non-guest restaurant entry locally.', kn: 'ರೆಸ್ಟೋರೆಂಟ್ ಪ್ರವೇಶ ಸ್ಥಳೀಯವಾಗಿ ಪರಿಶೀಲಿಸಿ.', mr: 'स्थानिक पातळीवर तपासा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.5, image_hint: 'lalitha_mahal_white',
    source: 'Sample data: ITDC Heritage Division', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_ranganathittu',
    region_id: 'reg_mysuru',
    category: 'nature',
    name_i18n: { en: 'Ranganathittu Bird Sanctuary', kn: 'ರಂಗನತಿಟ್ಟು ಪಕ್ಷಿಧಾಮ', mr: 'रंगनाथिट्टू पक्षी अभयारण्य' },
    summary_i18n: {
      en: 'Six islets on the Cauvery river serving as the breeding ground for 40,000 waterfowl and marsh crocodiles.',
      kn: 'ಕಾವೇರಿ ನದಿಯ ಆರು ನಡುಗಡ್ಡೆಗಳಲ್ಲಿ 40,000 ವಲಸೆ ಪಕ್ಷಿಗಳು ಮತ್ತು ಮೊಸಳೆಗಳ ನೈಸರ್ಗಿಕ ಆವಾಸಸ್ಥಾನ.',
      mr: 'कावेरी नदीतील बेटांवर हजारो पक्षी आणि मगरींचे घर.'
    },
    why_visit_i18n: {
      en: 'Guided row-boat safaris bringing you within feet of painted storks and nesting spoonbills.',
      kn: 'ದೋಣಿ ಸವಾರಿಯ ಮೂಲಕ ಪಕ್ಷಿಗಳನ್ನು ಅತ್ಯಂತ ಹತ್ತಿರದಿಂದ ವೀಕ್ಷಿಸುವ ರೋಮಾಂಚಕ ಅನುಭವ.',
      mr: 'बोटीतून पक्षी आणि मगरी अगदी जवळून पाहण्याची संधी.'
    },
    lat: 12.4244, lng: 76.6540, entry_fee_inr: 80, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Dull neutral colors; sun protection.', kn: 'ನೈಸರ್ಗಿಕ ಉಡುಪು; ಟೋಪಿ ಧರಿಸಿ.', mr: 'फिकट रंगाचे कपडे.' },
    rules_i18n: { en: 'Life jackets mandatory during boat safari. Do not put hands in river water.', kn: 'ದೋಣಿಯಲ್ಲಿ ಕೈಯನ್ನು ನೀರಿನಲ್ಲಿ ಇಡಬೇಡಿ.', mr: 'पाण्यात हात घालू नये.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'ranganathittu_boats',
    source: 'Sample data: Karnataka Forest Department', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_dariya_daulat',
    region_id: 'reg_mysuru',
    category: 'heritage',
    name_i18n: { en: 'Dariya Daulat Bagh (Tipu Summer Palace)', kn: 'ದರಿಯಾ ದೌಲತ್ ಬಾಗ್ (ಟಿಪ್ಪು ಬೇಸಿಗೆ ಅರಮನೆ)', mr: 'दरिया दौलत बाग' },
    summary_i18n: {
      en: '1784 teakwood palace surrounded by Mughal gardens with intricate oil murals depicting Anglo-Mysore wars.',
      kn: 'ಸುಂದರ ಮೊಘಲ್ ಉದ್ಯಾನವನದ ನಡುವೆ ಸಂಪೂರ್ಣ ತೇಗದ ಮರದಿಂದ ನಿರ್ಮಿಸಲಾದ ಭಿತ್ತಿಚಿತ್ರಗಳ ಅರಮನೆ.',
      mr: 'सागवानी लाकडात बांधलेला राजवाडा व सुंदर बगीचा.'
    },
    why_visit_i18n: {
      en: 'Exquisite miniature ceiling motifs covering every square inch of wooden pillars.',
      kn: 'ತೇಗದ ಕಂಬಗಳು ಮತ್ತು ಮೇಲ್ಛಾವಣಿಯ ಮೇಲಿನ ಅತ್ಯದ್ಭುತ ಚಿತ್ರಕಲೆ.',
      mr: 'लाकडावरील अप्रतिम नक्षीकाम आणि चित्रे.'
    },
    lat: 12.4208, lng: 76.6970, entry_fee_inr: 25, avg_visit_min: 45,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Comfortable day wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'No flash photography on painted murals.', kn: 'ಭಿತ್ತಿಚಿತ್ರಗಳ ಮೇಲೆ ಫ್ಲ್ಯಾಶ್ ನಿಷೇಧ.', mr: 'फ्लॅश बंदी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'dariya_daulat_teak',
    source: 'Sample data: ASI Bangalore Circle', last_checked: TODAY, verified: 0
  },

  // --- COORG & CHIKKAMAGALURU (reg_coorg) - 12 places ---
  {
    id: 'plc_abbey_falls',
    region_id: 'reg_coorg',
    category: 'nature',
    name_i18n: { en: 'Abbey Falls (Abbi)', kn: 'ಅಬ್ಬಿ ಜಲಪಾತ', mr: 'अब्बे फॉल्स' },
    summary_i18n: {
      en: 'Roaring cascade tumbling down 70 feet amidst lush private coffee plantations and spice vines.',
      kn: 'ಕಾಫಿ ತೋಟಗಳು ಮತ್ತು ಸಾಂಬಾರ ಪದಾರ್ಥಗಳ ಬಳ್ಳಿಗಳ ನಡುವೆ 70 ಅಡಿ ಎತ್ತರದಿಂದ ಧುಮುಕುವ ಸುಂದರ ಜಲಪಾತ.',
      mr: 'कॉफीच्या बागांमधून कोसळणारा ७० फूट उंच सुंदर धबधबा.'
    },
    why_visit_i18n: {
      en: 'Heart of Kodagu green landscapes reached through an aromatic canopy walk.',
      kn: 'ಕಾಫಿ ಸುವಾಸನೆಯ ಹಸಿರು ಹಾದಿಯ ಮೂಲಕ ತಲುಪಬಹುದಾದ ಕೊಡಗಿನ ಜನಪ್ರಿಯ ಜಲಪಾತ.',
      mr: 'कॉफीच्या बागांमधील निसर्गरम्य धबधबा.'
    },
    lat: 12.4539, lng: 75.7176, entry_fee_inr: 15, avg_visit_min: 50,
    best_months: [9, 10, 11, 12, 1], is_outdoor: true, is_indoor_alt: false, senior_friendly: 2,
    dress_code_i18n: { en: 'Non-slip footwear.', kn: 'ಜಾರದಂತಹ ಚಪ್ಪಲಿ.', mr: 'चांगले पादत्राणे.' },
    rules_i18n: { en: 'Swimming strictly forbidden.', kn: 'ಈಜುವುದು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.', mr: 'पाण्यात उतरण्यास बंदी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'abbey_falls_spray',
    source: 'Sample data: Kodagu Tourism Council', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_rajas_seat',
    region_id: 'reg_coorg',
    category: 'viewpoint',
    name_i18n: { en: 'Raja\'s Seat Sunset Pavilion', kn: 'ರಾಜಾಸೀಟ್ ಸೂರ್ಯಾಸ್ತ ತಾಣ', mr: 'राजा सीट' },
    summary_i18n: {
      en: 'Historic seasonal brick pavilion where Kodagu Rajas watched sunsets over cascading Western Ghat valleys.',
      kn: 'ಕೊಡಗಿನ ರಾಜರು ಸಂಜೆಯ ಸೂರ್ಯಾಸ್ತವನ್ನು ಆಸ್ವಾದಿಸುತ್ತಿದ್ದ ಸುಂದರ ಉದ್ಯಾನವನ ಮತ್ತು ಕಣಿವೆ ನೋಟ.',
      mr: 'कूर्गच्या राजांचे सूर्यास्त पाहण्याचे ऐतिहासिक उद्यान.'
    },
    why_visit_i18n: {
      en: 'Spectacular misty sunset valley vistas with musical fountain garden.',
      kn: 'ಮಂಜಿನಿಂದ ಆವೃತವಾದ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಣಿವೆಗಳ ಸಮ್ಮೋಹಕ ಸೂರ್ಯಾಸ್ತದ ನೋಟ.',
      mr: 'धुक्यातील दऱ्या आणि विलोभनीय सूर्यास्त.'
    },
    lat: 12.4183, lng: 75.7366, entry_fee_inr: 20, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 5,
    dress_code_i18n: { en: 'Light woollens for evening.', kn: 'ಸಂಜೆಯ ಚಳಿಗೆ ಸ್ವೆಟರ್.', mr: 'हलके गरम कपडे.' },
    rules_i18n: { en: 'Arrive by 5:15 PM for best sunset seating.', kn: 'ಸಂಜೆ 5:15 ಕ್ಕೆ ತಲುಪುವುದು ಸೂಕ್ತ.', mr: '५:१५ पर्यंत पोहोचावे.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'rajas_seat_view',
    source: 'Sample data: Madikeri Urban Dev Authority', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_dubare',
    region_id: 'reg_coorg',
    category: 'nature',
    name_i18n: { en: 'Dubare Elephant Camp & River Island', kn: 'ದುಬಾರೆ ಆನೆ ಶಿಬಿರ ಮತ್ತು ಕಾವೇರಿ ದ್ವೀಪ', mr: 'दुबारे हत्ती कॅम्प' },
    summary_i18n: {
      en: 'Karnataka Forest Department ecological sanctuary on Cauvery river bank for rescued elephants.',
      kn: 'ಕಾವೇರಿ ನದಿಯ ದಂಡೆಯಲ್ಲಿರುವ ಅರಣ್ಯ ಇಲಾಖೆಯ ಸಂರಕ್ಷಿತ ಆನೆ ತರಬೇತಿ ಶಿಬಿರ.',
      mr: 'कावेरी नदीकाठचा हत्ती संवर्धन कॅम्प.'
    },
    why_visit_i18n: {
      en: 'Observe gentle pachyderm bathing sessions and learn about humane elephant conservation.',
      kn: 'ಆನೆಗಳ ನದಿಸ್ನಾನ ಮತ್ತು ಸಂರಕ್ಷಣಾ ಕಾರ್ಯಗಳನ್ನು ಹತ್ತಿರದಿಂದ ವೀಕ್ಷಿಸಿ.',
      mr: 'हत्तींची आंघोळ आणि संवर्धन जवळून पाहा.'
    },
    lat: 12.3686, lng: 75.9056, entry_fee_inr: 50, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Waterproof sandals.', kn: 'ನೀರಿನ ಚಪ್ಪಲಿ.', mr: 'सोयीचे पादत्राणे.' },
    rules_i18n: { en: 'Morning session 9 AM - 11:30 AM only.', kn: 'ಬೆಳಗಿನ ಸಮಯ 9:00 ರಿಂದ 11:30 ಮಾತ್ರ.', mr: 'सकाळी ९ ते ११:३०.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.7, image_hint: 'dubare_elephants',
    source: 'Sample data: Karnataka Forest Department', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_mullayanagiri',
    region_id: 'reg_coorg',
    category: 'adventure',
    name_i18n: { en: 'Mullayanagiri Peak', kn: 'ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ', mr: 'मुल्लय्यनगिरी शिखर' },
    summary_i18n: {
      en: 'Highest peak in Karnataka at 1,930 metres, offering sweeping panoramic views above rolling sea of clouds.',
      kn: 'ಕರ್ನಾಟಕದ ಅತ್ಯುನ್ನತ ಶಿಖರ (1930 ಮೀಟರ್); ಮೋಡಗಳ ಸಾಗರದ ಮೇಲಿನ ಅದ್ಭುತ ವಿಹಂಗಮ ನೋಟ.',
      mr: 'कर्नाटकातील सर्वोच्च शिखर (१९३० मीटर).'
    },
    why_visit_i18n: {
      en: 'Unrivalled rooftop experience of the Western Ghats with hilltop sage shrine.',
      kn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಶಿಖರಾಗ್ರದ ರೋಮಾಂಚಕ ಅನುಭವ ಮತ್ತು ತಂಪಾದ ಪರ್ವತ ಹವೆ.',
      mr: 'पश्चिम घाटातील सर्वोत्तम ट्रेकिंग.'
    },
    lat: 13.3912, lng: 75.7214, entry_fee_inr: 0, avg_visit_min: 90,
    best_months: [9, 10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 2,
    dress_code_i18n: { en: 'Windbreaker jacket & trekking shoes.', kn: 'ಜಾಕೆಟ್ ಮತ್ತು ಟ್ರೆಕ್ಕಿಂಗ್ ಶೂಗಳು.', mr: 'जॅकेट व ट्रेकिंग शूज.' },
    rules_i18n: { en: 'Narrow ghat road; drive carefully.', kn: 'ಕಿರಿದಾದ ಘಾಟ್ ರಸ್ತೆ.', mr: 'घाट रस्ता अरुंद आहे.' },
    has_toilet: false, has_water: false, has_shade: false, local_benefit: 4, rating: 4.8, image_hint: 'mullayanagiri_clouds',
    source: 'Sample data: Chikkamagaluru Administration', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_madikeri_fort',
    region_id: 'reg_coorg',
    category: 'heritage',
    name_i18n: { en: 'Madikeri Fort & Palace Museum', kn: 'ಮಡಿಕೇರಿ ಕೋಟೆ ಮತ್ತು ಅರಮನೆ ಮ್ಯೂಸಿಯಂ', mr: 'मडिकेरी किल्ला' },
    summary_i18n: {
      en: '17th-century mud fort rebuilt in stone by Tipu Sultan with two life-size masonry elephants at entrance.',
      kn: 'ಟಿಪ್ಪು ಸುಲ್ತಾನನಿಂದ ಮರುನಿರ್ಮಿತವಾದ 17ನೇ ಶತಮಾನದ ಕಲ್ಲಿನ ಕೋಟೆ ಮತ್ತು ಆನೆಗಳ ಪ್ರತಿಮೆ.',
      mr: '१७ व्या शतकातील ऐतिहासिक किल्ला आणि हत्तींच्या मूर्ती.'
    },
    why_visit_i18n: {
      en: 'Houses district heritage museum displaying weapons and Kodava attire under shelter.',
      kn: 'ಕೊಡವ ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪುಗಳು ಮತ್ತು ಶಸ್ತ್ರಾಸ್ತ್ರಗಳ ಒಳಾಂಗಣ ಮ್ಯೂಸಿಯಂ.',
      mr: 'कूर्गच्या संस्कृतीचे इनडोअर संग्रहालय.'
    },
    lat: 12.4225, lng: 75.7380, entry_fee_inr: 25, avg_visit_min: 50,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Museum closed on Mondays.', kn: 'ಸೋಮವಾರ ಮ್ಯೂಸಿಯಂ ರಜೆ.', mr: 'सोमवारी बंद.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.5, image_hint: 'madikeri_fort_view',
    source: 'Sample data: Karnataka Archaeology', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_talakaveri',
    region_id: 'reg_coorg',
    category: 'spiritual',
    name_i18n: { en: 'Talakaveri (Cauvery Origin) & Brahmagiri', kn: 'ತಲಕಾವೇರಿ (ಕಾವೇರಿ ಉಗಮ) ಮತ್ತು ಬ್ರಹ್ಮಗಿರಿ', mr: 'तलकावेरी (कावेरी उगम)' },
    summary_i18n: {
      en: 'Holy spring birthplace of the sacred River Cauvery set 1,276 metres up on the slopes of Brahmagiri Hill.',
      kn: 'ಬ್ರಹ್ಮಗಿರಿ ಬೆಟ್ಟದ ಮಡಿಲಲ್ಲಿರುವ ಪವಿತ್ರ ಕಾವೇರಿ ಮಾತೆಯ ಉಗಮ ಸ್ಥಾನ.',
      mr: 'ब्रह्मगिरी टेकडीवरील पवित्र कावेरी नदीचे उगमस्थान.'
    },
    why_visit_i18n: {
      en: 'Spiritual soul of Kodagu; Tula Sankramana holy water surge witnessed by thousands.',
      kn: 'ಕೊಡಗಿನ ಪರಮ ಪವಿತ್ರ ಧಾರ್ಮಿಕ ತಾಣ ಮತ್ತು ಕಾವೇರಿ ತೀರ್ಥೋದ್ಭವ ಕ್ಷೇತ್ರ.',
      mr: 'कावेरीचे उगमस्थान व आध्यात्मिक केंद्र.'
    },
    lat: 12.3833, lng: 75.4833, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Traditional dress for holy pond.', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು.', mr: 'पारंपरिक कपडे.' },
    rules_i18n: { en: 'Footwear strictly prohibited within upper shrine precinct.', kn: 'ಪಾದರಕ್ಷೆ ನಿಷೇಧಿಸಲಾಗಿದೆ.', mr: 'पादत्राणे बंदी.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'talakaveri_shrine',
    source: 'Sample data: Muzrai Department', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_golden_temple_bylakuppe',
    region_id: 'reg_coorg',
    category: 'spiritual',
    name_i18n: { en: 'Namdroling Monastery (Golden Temple)', kn: 'ನಾಮಡ್ರೋಲಿಂಗ್ ಮಠ (ಗೋಲ್ಡನ್ ಟೆಂಪಲ್)', mr: 'नामड्रोलिंग बौद्ध मठ' },
    summary_i18n: {
      en: 'Second largest Tibetan settlement in India, boasting 60-foot gilded copper Buddha statues and hand-painted thangkas.',
      kn: '60 ಅಡಿ ಎತ್ತರದ ಚಿನ್ನದ ಲೇಪನದ ಬುದ್ಧ ವಿಗ್ರಹಗಳು ಮತ್ತು ಟಿಬೆಟಿಯನ್ ಸಂಸ್ಕೃತಿಯ ಬೃಹತ್ ಬೌದ್ಧ ಮಠ.',
      mr: '६० फूट उंच सोन्याचा मुलामा असणाऱ्या बुद्ध मूर्तींचा तिबेटी मठ.'
    },
    why_visit_i18n: {
      en: 'Transcendent monastic atmosphere with echoing prayer gongs and Tibetan craft market.',
      kn: 'ಧ್ಯಾನ ಮತ್ತು ಪ್ರಾರ್ಥನೆಯ ದಿವ್ಯ ಅನುಭವ ಮತ್ತು ಟಿಬೆಟಿಯನ್ ಕರಕುಶಲ ಮಾರುಕಟ್ಟೆ.',
      mr: 'प्रार्थना आणि शांततेचा अनुभव.'
    },
    lat: 12.4285, lng: 75.9680, entry_fee_inr: 0, avg_visit_min: 75,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Modest wear; remove shoes at temple doorway.', kn: 'ಸಭ್ಯ ಉಡುಪು; ಬಾಗಿಲಲ್ಲಿ ಶೂ ತೆಗೆಯಿರಿ.', mr: 'सभ्य कपडे.' },
    rules_i18n: { en: 'Daily monk chanting prayer at 1 PM. Free entry.', kn: 'ಮಧ್ಯಾಹ್ನ 1:00 ಗಂಟೆಗೆ ಸಾಮೂಹಿಕ ಪ್ರಾರ್ಥನೆ.', mr: 'दुपारी १ वाजता प्रार्थना.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'golden_temple_buddha',
    source: 'Sample data: Namdroling Monastery Administration', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_chelavara_falls',
    region_id: 'reg_coorg',
    category: 'nature',
    name_i18n: { en: 'Chelavara Falls', kn: 'ಚೆಲಾವರ ಜಲಪಾತ', mr: 'चेलावरा फॉल्स' },
    summary_i18n: {
      en: 'Tortoise-shaped rock cascade gushing over green coffee and cardamom plantations near Cheyyandane.',
      kn: 'ಆಮೆಯ ಆಕಾರದ ಬಂಡೆಯ ಮೇಲೆ ಧುಮುಕುವ ಕಾಫಿ ತೋಟಗಳ ನಡುವಿನ ಸುಂದರ ನೈಸರ್ಗಿಕ ಜಲಪಾತ.',
      mr: 'कासवाच्या आकाराच्या खडकावरून कोसळणारा धबधबा.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Abbey Falls: untouched greenery with 70% fewer tourists.',
      kn: 'ಅಬ್ಬಿ ಜಲಪಾತಕ್ಕೆ ಪ್ರಶಾಂತ ಪರ್ಯಾಯ: ನೈಸರ್ಗಿಕ ಸೌಂದರ್ಯ ಮತ್ತು ಕಡಿಮೆ ಜನದಟ್ಟಣೆ.',
      mr: 'अब्बे फॉल्सला शांत पर्याय: निसर्गरम्य आणि गर्दी नसलेले.'
    },
    lat: 12.2155, lng: 75.7890, entry_fee_inr: 20, avg_visit_min: 50,
    best_months: [9, 10, 11, 12, 1], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Trekking sandals.', kn: 'ಟ್ರೆಕ್ಕಿಂಗ್ ಚಪ್ಪಲಿ.', mr: 'सोयीचे पादत्राणे.' },
    rules_i18n: { en: 'Do not venture near the slippery crest.', kn: 'ಜಲಪಾತದ ತುದಿಗೆ ಹೋಗಬೇಡಿ.', mr: 'कडेला जाऊ नये.' },
    has_toilet: false, has_water: false, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'chelavara_falls',
    source: 'Sample data: Kodagu District Administration', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_baba_budangiri',
    region_id: 'reg_coorg',
    category: 'spiritual',
    name_i18n: { en: 'Baba Budangiri (Dattatreya Peetha)', kn: 'ಬಾಬಾ ಬುಡನ್‌ಗಿರಿ (ದತ್ತಾತ್ರೇಯ ಪೀಠ)', mr: 'बाबा बुडनगिरी' },
    summary_i18n: {
      en: 'Sacred mountain range where Sufi saint Baba Budan first planted coffee seeds smuggled from Yemen.',
      kn: 'ಭಾರತಕ್ಕೆ ಮೊದಲ ಬಾರಿಗೆ ಕಾಫಿ ಬೀಜಗಳನ್ನು ತಂದು ನೆಟ್ಟ ಐತಿಹಾಸಿಕ ಪರ್ವತ ಶ್ರೇಣಿ.',
      mr: 'भारतात पहिल्यांदा कॉफी आणणारे ऐतिहासिक पर्वतक्षेत्र.'
    },
    why_visit_i18n: {
      en: 'Cradle of Indian coffee history surrounded by high-altitude shola grasslands.',
      kn: 'ಭಾರತೀಯ ಕಾಫಿಯ ತೊಟ್ಟಿಲು ಮತ್ತು ಶೋಲಾ ಹುಲ್ಲುಗಾವಲುಗಳ ಸುಂದರ ದೃಶ್ಯ.',
      mr: 'भारतीय कॉफीचा उगम.'
    },
    lat: 13.4215, lng: 75.7650, entry_fee_inr: 0, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Warm layered clothes.', kn: 'ಸ್ವೆಟರ್ ಅಥವಾ ಜಾಕೆಟ್.', mr: 'गरम कपडे.' },
    rules_i18n: { en: 'Respect syncretic cave shrine traditions.', kn: 'ಪವಿತ್ರ ಗುಹೆಯಲ್ಲಿ ನಿಯಮ ಪಾಲಿಸಿ.', mr: 'शांतता राखा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'baba_budan_hills',
    source: 'Sample data: Muzrai Department', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_coffee_museum',
    region_id: 'reg_coorg',
    category: 'museum',
    name_i18n: { en: 'Coffee Museum Chikkamagaluru', kn: 'ಕಾಫಿ ಮ್ಯೂಸಿಯಂ ಚಿಕ್ಕಮಗಳೂರು', mr: 'कॉफी संग्रहालय चिकमंगळूर' },
    summary_i18n: {
      en: 'Interactive thematic museum operated by Coffee Board of India displaying coffee processing history and aroma labs.',
      kn: 'ಕಾಫಿ ಮಂಡಳಿಯ ಸುಸಜ್ಜಿತ ಒಳಾಂಗಣ ಮ್ಯೂಸಿಯಂ; ಕಾಫಿ ಇತಿಹಾಸ ಮತ್ತು ಸುವಾಸನೆಯ ಲ್ಯಾಬ್.',
      mr: 'कॉफी बोर्डाचे इनडोअर संग्रहालय आणि कॉफीचा इतिहास.'
    },
    why_visit_i18n: {
      en: 'Ideal sheltered spot during mountain downpours; includes bean roasting demonstrations.',
      kn: 'ಮಳೆಯಲ್ಲಿ ಭೇಟಿ ನೀಡಲು ಅತ್ಯುತ್ತಮ ಒಳಾಂಗಣ ತಾಣ; ಕಾಫಿ ತಯಾರಿಕೆಯ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಲಭ್ಯ.',
      mr: 'पावसात पाहण्यासाठी उत्तम इनडोअर ठिकाण.'
    },
    lat: 13.3150, lng: 75.7720, entry_fee_inr: 20, avg_visit_min: 50,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 5,
    dress_code_i18n: { en: 'Casual wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Closed on weekends and national holidays. Open 10 AM - 5:30 PM weekdays.', kn: 'ವಾರಾಂತ್ಯದಲ್ಲಿ ರಜೆ ಇರುತ್ತದೆ.', mr: 'शनिवार-रविवार बंद.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.6, image_hint: 'coffee_beans_display',
    source: 'Sample data: Coffee Board of India', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_hebbe_falls',
    region_id: 'reg_coorg',
    category: 'adventure',
    name_i18n: { en: 'Hebbe Falls Kemmangundi', kn: 'ಹೆಬ್ಬೆ ಜಲಪಾತ ಕೆಮ್ಮಣ್ಣುಗುಂಡಿ', mr: 'हेब्बे फॉल्स' },
    summary_i18n: {
      en: '551-foot dramatic two-stage drop inside dense Bhadra tiger reserve forests reached by 4x4 jeep safari.',
      kn: 'ಭದ್ರಾ ಹುಲಿ ಸಂರಕ್ಷಿತಾರಣ್ಯದಲ್ಲಿ 551 ಅಡಿ ಎತ್ತರದಿಂದ ಧುಮುಕುವ ಎರಡು ಹಂತದ ಜಲಪಾತ.',
      mr: 'घनदाट जंगलातील ५५१ फूट उंच धबधबा.'
    },
    why_visit_i18n: {
      en: 'Natural medicinal herbal mineral pool at the base of the falls.',
      kn: 'ಔಷಧೀಯ ಸಸ್ಯಗಳ ನೀರಿನಲ್ಲಿ ಮಿಂದು ಪುನಶ್ಚೇತನ ಪಡೆಯುವ ಅನುಭವ.',
      mr: 'औषधी वनस्पतींनी समृद्ध पाण्याचा धबधबा.'
    },
    lat: 13.5510, lng: 75.7280, entry_fee_inr: 50, avg_visit_min: 120,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 2,
    dress_code_i18n: { en: 'Quick-dry clothes & leech socks.', kn: 'ಜೀಪ್ ಸವಾರಿಗೆ ಸೂಕ್ತ ಉಡುಪು.', mr: 'ट्रेकिंग कपडे.' },
    rules_i18n: { en: 'Local 4x4 forest jeep costs ₹3,200 per vehicle (shared).', kn: 'ಅರಣ್ಯ ಇಲಾಖೆಯ ಜೀಪ್ ಸೌಲಭ್ಯವಿದೆ.', mr: 'वन विभागाची जीप लागते.' },
    has_toilet: false, has_water: false, has_shade: true, local_benefit: 5, rating: 4.7, image_hint: 'hebbe_falls_cascade',
    source: 'Sample data: Kemmangundi Forest Division', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_bhagamandala',
    region_id: 'reg_coorg',
    category: 'spiritual',
    name_i18n: { en: 'Bhagamandala Triveni Sangama', kn: 'ಭಾಗಮಂಡಲ ತ್ರಿವೇಣಿ ಸಂಗಮ', mr: 'भागमंडला त्रिवेणी संगम' },
    summary_i18n: {
      en: 'Holy confluence of three sacred rivers: Cauvery, Kannike and mythical Sujyoti.',
      kn: 'ಕಾವೇರಿ, ಕನ್ನಿಕೆ ಮತ್ತು ಸುಜ್ಯೋತಿ ನದಿಗಳ ಪವಿತ್ರ ಸಂಗಮ ಕ್ಷೇತ್ರ.',
      mr: 'कावेरी, कन्निके आणि सुज्योती नद्यांचा त्रिवेणी संगम.'
    },
    why_visit_i18n: {
      en: 'Ancient Kerala-style tiled Bhagandeshwara temple with wood carvings.',
      kn: 'ಕೇರಳ ವಾಸ್ತುಶಿಲ್ಪ ಶೈಲಿಯ ಭಗಂಡೇಶ್ವರ ದೇವಾಲಯ ಮತ್ತು ಪವಿತ್ರ ಸ್ನಾನ.',
      mr: 'प्राचीन लाकडी कोरीव काम असलेले मंदिर.'
    },
    lat: 12.3915, lng: 75.5280, entry_fee_inr: 0, avg_visit_min: 45,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Traditional modest attire.', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು.', mr: 'पारंपरिक कपडे.' },
    rules_i18n: { en: 'Footwear removed before crossing temple gateway.', kn: 'ಬಾಗಿಲಲ್ಲಿ ಪಾದರಕ್ಷೆ ತೆಗೆಯಿರಿ.', mr: 'पादत्राणे बाहेर काढा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'bhagamandala_temple',
    source: 'Sample data: Muzrai Department', last_checked: TODAY, verified: 0
  },

  // --- COASTAL KARNATAKA (reg_coast) - 10 places ---
  {
    id: 'plc_udupi_krishna',
    region_id: 'reg_coast',
    category: 'spiritual',
    name_i18n: { en: 'Udupi Sri Krishna Matha', kn: 'ಉಡುಪಿ ಶ್ರೀ ಕೃಷ್ಣ ಮಠ', mr: 'उडुपी श्रीकृष्ण मठ' },
    summary_i18n: {
      en: '13th-century Dvaita monastery established by Saint Madhvacharya where the deity is worshipped through 9-holed silver Kanakana Kindi window.',
      kn: '13ನೇ ಶತಮಾನದ ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯರು ಸ್ಥಾಪಿಸಿದ, ಕನಕನ ಕಿಂಡಿಯ ಮೂಲಕ ಶ್ರೀಕೃಷ್ಣನ ದರ್ಶನ ಪಡೆಯುವ ಪವಿತ್ರ ಮಠ.',
      mr: '१३ व्या शतकातील मध्वाचार्यांनी स्थापन केलेला प्रसिद्ध कृष्ण मठ आणि कनक खिडकी.'
    },
    why_visit_i18n: {
      en: 'Spiritual epicenter of pure Udupi Satvik cuisine and daily free Anna Brahma Prasada.',
      kn: 'ಉಡುಪಿ ಸಾತ್ವಿಕ ಪಾಕಪದ್ಧತಿಯ ಉಗಮ ಸ್ಥಾನ ಮತ್ತು ಪ್ರತಿದಿನದ ಉಚಿತ ಅನ್ನದಾನ ಸೇವೆ.',
      mr: 'अस्सल उडुपी शाकाहारी अन्नाचा उगम आणि मोफत महाप्रसाद.'
    },
    lat: 13.3409, lng: 74.7521, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Men remove shirts; dhotis/trousers; women sarees/salwars.', kn: 'ಪುರುಷರು ಅಂಗಿ ತೆಗೆಯಬೇಕು; ಮಹಿಳೆಯರಿಗೆ ಸೀರೆ/ಚೂಡಿದಾರ್.', mr: 'पुरुषांनी शर्ट काढावा; महिलांसाठी साडी/सलवार.' },
    rules_i18n: { en: 'Free community meal served 11:45 AM - 2:00 PM.', kn: 'ಮಧ್ಯಾಹ್ನ 11:45 ರಿಂದ 2:00 ರವರೆಗೆ ಉಚಿತ ಅನ್ನಪ್ರಸಾದ.', mr: 'दुपारी मोफत महाप्रसाद.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.9, image_hint: 'udupi_krishna_matha',
    source: 'Sample data: Paryaya Sri Krishna Matha', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_om_beach',
    region_id: 'reg_coast',
    category: 'beach',
    name_i18n: { en: 'Gokarna Om Beach', kn: 'ಗೋಕರ್ಣ ಓಂ ಬೀಚ್', mr: 'गोकर्ण ओम बीच' },
    summary_i18n: {
      en: 'Naturally contoured shoreline resembling the sacred spiritual symbol ॐ, flanked by black rock cliffs.',
      kn: 'ನೈಸರ್ಗಿಕವಾಗಿ ಪವಿತ್ರ ‘ಓಂ’ ಆಕಾರವನ್ನು ಹೋಲುವ ಕಪ್ಪು ಬಂಡೆಗಳು ಮತ್ತು ಶಾಂತ ಅಲೆಗಳನ್ನು ಹೊಂದಿರುವ ಸುಂದರ ಕಡಲತೀರ.',
      mr: 'नैसर्गिकरित्या "ॐ" च्या आकाराचा सुंदर समुद्रकिनारा व काळे खडक.'
    },
    why_visit_i18n: {
      en: 'Iconic coastal geology where Western Ghats tumble directly into Arabian Sea.',
      kn: 'ಅರಬ್ಬೀ ಸಮುದ್ರಕ್ಕೆ ಮುಖಮಾಡಿ ನಿಂತ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಸುಂದರ ಸಂಗಮ ಸ್ಥಳ.',
      mr: 'अरबी समुद्राचे शांत पाणी आणि अद्वितीय नैसर्गिक रचना.'
    },
    lat: 14.5186, lng: 74.3168, entry_fee_inr: 0, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Beach leisure wear, hat, sunglasses.', kn: 'ಕಡಲತೀರದ ಉಡುಪು, ಟೋಪಿ.', mr: 'सोयीचे कपडे.' },
    rules_i18n: { en: 'Obey red flags during high tide.', kn: 'ಉಬ್ಬರವಿಳಿತದ ಸಮಯದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಪಾಲಿಸಿ.', mr: 'लाटा असताना खोल पाण्यात जाऊ नका.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'om_beach_curve',
    source: 'Sample data: Uttara Kannada Tourism', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_kudle_beach',
    region_id: 'reg_coast',
    category: 'beach',
    name_i18n: { en: 'Kudle Beach', kn: 'ಕುಡ್ಲೆ ಬೀಚ್', mr: 'कुडले बीच' },
    summary_i18n: {
      en: 'Wide golden sand horseshoe bay framed by green headlands with laid-back beach shacks.',
      kn: 'ಹಸಿರು ಬೆಟ್ಟಗಳ ನಡುವೆ ವಿಸ್ತಾರವಾದ ಸುವರ್ಣ ಮರಳಿನ ಮತ್ತು ಪ್ರಶಾಂತ ಕೆಫೆಗಳನ್ನು ಹೊಂದಿರುವ ಕಡಲತೀರ.',
      mr: 'विस्तीर्ण वाळूचा किनारा आणि शांत वातावरण.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Om Beach: gentler waves and wider walking shorelines with fewer motorboats.',
      kn: 'ಓಂ ಬೀಚ್‌ಗೆ ಶಾಂತ ಪರ್ಯಾಯ: ಕಡಿಮೆ ದೋಣಿಗಳ ಸದ್ದು, ವಿಶಾಲ ನಡಿಗೆಯ ಜಾಗ.',
      mr: 'ओम बीचला शांत पर्याय: पोहण्यासाठी व चालण्यासाठी अधिक शांत.'
    },
    lat: 14.5298, lng: 74.3120, entry_fee_inr: 0, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Beach attire.', kn: 'ಕಡಲತೀರದ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Leave no litter; clean up after pets.', kn: 'ಕಸ ಹಾಕಬೇಡಿ.', mr: 'परिसर स्वच्छ ठेवा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'kudle_beach_sunset',
    source: 'Sample data: Gokarna Panchayat', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_mirjan_fort',
    region_id: 'reg_coast',
    category: 'heritage',
    name_i18n: { en: 'Mirjan Fort (Queen of Pepper Fort)', kn: 'ಮಿರ್ಜಾನ್ ಕೋಟೆ', mr: 'मिर्जान किल्ला' },
    summary_i18n: {
      en: '16th-century laterite bastion on Aganashini river constructed by Queen Chennabhairadevi.',
      kn: 'ಕಾಳುಮೆಣಸಿನ ರಾಣಿ ಚೆನ್ನಭೈರಾದೇವಿ ನಿರ್ಮಿಸಿದ ಅಗನಾಶಿನಿ ನದಿ ದಂಡೆಯ ಭವ್ಯ ಕೆಂಪು ಕಲ್ಲಿನ ಕೋಟೆ.',
      mr: 'राणी चेन्नभैरादेवी यांनी मसाल्यांच्या व्यापाराच्या संरक्षणासाठी बांधलेला किल्ला.'
    },
    why_visit_i18n: {
      en: 'Fascinating story of female rulers defending coastal maritime trade networks.',
      kn: 'ಕರಾವಳಿಯ ಧೀರ ಮಹಿಳಾ ರಾಣಿಯ ಆಡಳಿತ ವೈಭವ.',
      mr: 'कर्नाटकच्या शूर राणीचा गौरवशाली इतिहास.'
    },
    lat: 14.4920, lng: 74.4190, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [9, 10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Walking shoes and cotton wear.', kn: 'ಹತ್ತಿ ಬಟ್ಟೆ ಮತ್ತು ಶೂಗಳು.', mr: 'सुती कपडे.' },
    rules_i18n: { en: 'Open 8 AM - 6 PM.', kn: 'ಬೆಳಿಗ್ಗೆ 8 ರಿಂದ ಸಂಜೆ 6 ರವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ.', mr: 'सकाळी ८ ते संध्याकाळी ६.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 3, rating: 4.6, image_hint: 'mirjan_laterite_fort',
    source: 'Sample data: ASI Dharwad Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_st_marys_island',
    region_id: 'reg_coast',
    category: 'nature',
    name_i18n: { en: 'St. Mary\'s Island & Columnar Basalt', kn: 'ಸೇಂಟ್ ಮೇರಿಸ್ ದ್ವೀಪ (ತೋನ್ಸೆಪಾರ್)', mr: 'सेंट मेरी बेट' },
    summary_i18n: {
      en: 'National Geological Monument of hexagonal basalt columns formed 88 million years ago when Madagascar split from India.',
      kn: '8.8 ಕೋಟಿ ವರ್ಷಗಳ ಹಿಂದೆ ಮಡಗಾಸ್ಕರ್ ಭಾರತದಿಂದ ಬೇರ್ಪಟ್ಟಾಗ ಸೃಷ್ಟಿಯಾದ ಷಟ್ಕೋನ ಲಾವಾರಸದ ಬಸಾಲ್ಟ್ ಶಿಲಾಸ್ತಂಭಗಳು.',
      mr: '८८ दशलक्ष वर्षांपूर्वी तयार झालेले षटकोनी खडकांचे दुर्मिळ बेट.'
    },
    why_visit_i18n: {
      en: 'Rare geological treasure found in only a few places worldwide; turquoise sea waters.',
      kn: 'ವಿಶ್ವದಲ್ಲೇ ಅತ್ಯಂತ ಅಪರೂಪದ ನೈಸರ್ಗಿಕ ಶಿಲಾರಚನೆ ಮತ್ತು ನೀಲಿ ಸಮುದ್ರದ ಸೌಂದರ್ಯ.',
      mr: 'जगात अत्यंत दुर्मिळ अशी खडकांची नैसर्गिक रचना.'
    },
    lat: 13.3800, lng: 74.6730, entry_fee_inr: 400, avg_visit_min: 120,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Beachwear and sunglasses.', kn: 'ಕಡಲತೀರದ ಉಡುಪು.', mr: 'सोयीचे कपडे.' },
    rules_i18n: { en: 'Ferry operates from Malpe harbour. Closed during monsoon.', kn: 'ಮಾಲ್ಪೆಯಿಂದ ಬೋಟ್ ಸೌಲಭ್ಯ. ಮಳೆಗಾಲದಲ್ಲಿ ಮುಚ್ಚಿರುತ್ತದೆ.', mr: 'मालपे बंदरावरून बोट मिळते.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'basalt_columns',
    source: 'Sample data: Geological Survey of India', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_kaup_lighthouse',
    region_id: 'reg_coast',
    category: 'viewpoint',
    name_i18n: { en: 'Kaup Beach & Historic Lighthouse', kn: 'ಕಾಪು ಬೀಚ್ ಮತ್ತು ಲೈಟ್‌ಹೌಸ್', mr: 'कापू बीच व दीपगृह' },
    summary_i18n: {
      en: '1901 stone beacon tower standing 89 feet tall atop a massive coastal sea boulder.',
      kn: '1901 ರಲ್ಲಿ ನಿರ್ಮಿಸಲಾದ ಸಮುದ್ರದ ಬಂಡೆಯ ಮೇಲಿನ 89 ಅಡಿ ಎತ್ತರದ ಐತಿಹಾಸಿಕ ದೀಪಸ್ತಂಭ.',
      mr: '१९०१ मध्ये खडकावर बांधलेले ८९ फूट उंच ऐतिहासिक दीपगृह.'
    },
    why_visit_i18n: {
      en: 'Climb the spiral staircase for an awe-inspiring horizon view of the Arabian Sea.',
      kn: 'ತಿರುವು ಮೆಟ್ಟಿಲುಗಳನ್ನು ಹತ್ತಿ ಅರಬ್ಬೀ ಸಮುದ್ರದ ವಿಹಂಗಮ ಸೂರ್ಯಾಸ್ತವನ್ನು ಕಣ್ತುಂಬಿಕೊಳ್ಳಿ.',
      mr: 'दीपगृहावरून समुद्राचा अप्रतिम सूर्यास्त दिसतो.'
    },
    lat: 13.2230, lng: 74.7390, entry_fee_inr: 25, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 3,
    dress_code_i18n: { en: 'Beach casual.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Lighthouse open for climbing 4 PM - 6 PM daily.', kn: 'ದೀಪಸ್ತಂಭ ಹತ್ತಲು ಸಂಜೆ 4 ರಿಂದ 6 ರವರೆಗೆ ಮಾತ್ರ ಅವಕಾಶ.', mr: 'दीपगृह संध्याकाळी ४ ते ६ खुले असते.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'kaup_lighthouse_sea',
    source: 'Sample data: Directorate of Lighthouses', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_gokarna_mahabaleshwar',
    region_id: 'reg_coast',
    category: 'spiritual',
    name_i18n: { en: 'Gokarna Mahabaleshwar Temple (Atmalinga)', kn: 'ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೇವಾಲಯ (ಆತ್ಮಲಿಂಗ)', mr: 'गोकर्ण महाबळेश्वर मंदिर' },
    summary_i18n: {
      en: '4th-century classical Dravidian pilgrimage shrine enshrining the revered Pranalinga given to Ravana by Shiva.',
      kn: 'ರಾವಣನಿಂದ ಪ್ರತಿಷ್ಠಾಪಿಸಲ್ಪಟ್ಟ ಪರಮ ಪವಿತ್ರ ಆತ್ಮಲಿಂಗವಿರುವ 4ನೇ ಶತಮಾನದ ಮುಕ್ತಿ ಕ್ಷೇತ್ರ.',
      mr: 'रावणाने आणलेले शंकराचे आत्मलिंग असणारे प्रसिद्ध तीर्थक्षेत्र.'
    },
    why_visit_i18n: {
      en: 'One of the seven sacred Muktistalas of Karnataka on the sea shore.',
      kn: 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಸಪ್ತ ಮುಕ್ತಿ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಒಂದು.',
      mr: 'कर्नाटकातील सात प्रमुख तीर्थक्षेत्रांपैकी एक.'
    },
    lat: 14.5428, lng: 74.3180, entry_fee_inr: 0, avg_visit_min: 50,
    best_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], is_outdoor: false, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Men must wear dhoti without shirt; women in saree/salwar.', kn: 'ಪುರುಷರಿಗೆ ಧೋತಿ ಕಡ್ಡಾಯ; ಮಹಿಳೆಯರಿಗೆ ಸೀರೆ.', mr: 'पुरुषांसाठी धोती; महिलांसाठी साडी.' },
    rules_i18n: { en: 'Devotees may touch the Atmalinga during special sparsha darshan hours.', kn: 'ಸ್ಪರ್ಶ ದರ್ಶನ ಸಮಯದಲ್ಲಿ ಆತ್ಮಲಿಂಗವನ್ನು ಸ್ಪರ್ಶಿಸಬಹುದು.', mr: 'स्पर्श दर्शन उपलब्ध असते.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'mahabaleshwar_gokarna',
    source: 'Sample data: Temple Administration', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_murudeshwar',
    region_id: 'reg_coast',
    category: 'spiritual',
    name_i18n: { en: 'Murudeshwar Shiva Statue & Raja Gopura', kn: 'ಮುರುಡೇಶ್ವರ ಶಿವನ ಪ್ರತಿಮೆ ಮತ್ತು ರಾಜಗೋಪುರ', mr: 'मुरुडेश्वर शिवमंदिर' },
    summary_i18n: {
      en: 'World\'s second tallest Shiva statue (123 feet) and a 20-storey Raja Gopura (249 feet) with an internal elevator.',
      kn: 'ವಿಶ್ವದ ಎರಡನೇ ಅತಿ ದೊಡ್ಡ 123 ಅಡಿ ಶಿವನ ಪ್ರತಿಮೆ ಮತ್ತು ಲಿಫ್ಟ್ ಸೌಲಭ್ಯವಿರುವ 249 ಅಡಿ ಎತ್ತರದ ಭವ್ಯ ರಾಜಗೋಪುರ.',
      mr: 'जगातील दुसरी सर्वोच्च १२३ फूट शिवप्रतिमा आणि २४९ फूट उंच गोपुरम.'
    },
    why_visit_i18n: {
      en: 'Take the elevator to the 18th floor of the gopura for a breathtaking view of the sea on three sides.',
      kn: 'ರಾಜಗೋಪುರದ 18ನೇ ಅಂತಸ್ತಿಗೆ ಲಿಫ್ಟ್‌ನಲ್ಲಿ ತೆರಳಿ ಮೂರು ಕಡೆ ಸಮುದ್ರ ಆವರಿಸಿದ ಅದ್ಭುತ ನೋಟ ಕಣ್ತುಂಬಿಕೊಳ್ಳಿ.',
      mr: 'गोपुरमच्या १८ व्या मजल्यावरून समुद्राचे अप्रतिम दृश्य.'
    },
    lat: 14.0942, lng: 74.4847, entry_fee_inr: 20, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest clothes.', kn: 'ಸಭ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Elevator charge to top floor ₹20.', kn: 'ಲಿಫ್ಟ್ ಶುಲ್ಕ ₹20.', mr: 'लिफ्ट फी ₹२०.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.8, image_hint: 'murudeshwar_statue',
    source: 'Sample data: R.N. Shetty Trust', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_tagore_beach_karwar',
    region_id: 'reg_coast',
    category: 'beach',
    name_i18n: { en: 'Rabindranath Tagore Beach & Warship Museum', kn: 'ರವೀಂದ್ರನಾಥ ಟ್ಯಾಗೋರ್ ಬೀಚ್ ಮತ್ತು ಯುದ್ಧನೌಕೆ ಮ್ಯೂಸಿಯಂ', mr: 'टागोर बीच आणि युद्धनौका संग्रहालय' },
    summary_i18n: {
      en: 'Sprawling shoreline where Nobel Laureate Tagore was inspired to write his first play, with decommissioned missile boat INS Chapal.',
      kn: 'ರವೀಂದ್ರನಾಥ ಟ್ಯಾಗೋರ್ ಅವರಿಗೆ ಸ್ಫೂರ್ತಿ ನೀಡಿದ ಪ್ರಶಾಂತ ಕಡಲತೀರ ಮತ್ತು ಐಎನ್‌ಎಸ್ ಚಪಲ್ ಯುದ್ಧನೌಕೆ ಮ್ಯೂಸಿಯಂ.',
      mr: 'टागोरांना प्रेरणा देणारा किनारा आणि युद्धनौका संग्रहालय.'
    },
    why_visit_i18n: {
      en: 'Step aboard a real naval missile boat museum and enjoy calm estuary sunsets.',
      kn: 'ನೈಜ ನೌಕಾಪಡೆಯ ಕ್ಷಿಪಣಿ ಯುದ್ಧನೌಕೆಯ ಒಳಾಂಗಣ ವೀಕ್ಷಣೆ.',
      mr: 'प्रत्यक्ष युद्धनौकेत जाऊन पाहण्याची संधी.'
    },
    lat: 14.8150, lng: 74.1280, entry_fee_inr: 30, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual wear.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Warship museum open 10 AM - 1 PM, 4:30 PM - 7 PM.', kn: 'ಯುದ್ಧನೌಕೆ ಮ್ಯೂಸಿಯಂ ಸಮಯ 10:00 - 13:00, 16:30 - 19:00.', mr: 'वेळ: सकाळी १० ते १, संध्याकाळी ४:३० ते ७.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'ins_chapal_warship',
    source: 'Sample data: Indian Navy / Uttara Kannada Tourism', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_maravanthe_beach',
    region_id: 'reg_coast',
    category: 'nature',
    name_i18n: { en: 'Maravanthe Beach & Souparnika Estuary', kn: 'ಮರವಂತೆ ಬೀಚ್ ಮತ್ತು ಸೌಪರ್ಣಿಕಾ ನದಿ', mr: 'मरवंथे बीच' },
    summary_i18n: {
      en: 'One of India\'s most scenic coastal drives where NH 66 runs with Arabian Sea on left and Souparnika River on right.',
      kn: 'ಎಡಕ್ಕೆ ಅರಬ್ಬೀ ಸಮುದ್ರ, ಬಲಕ್ಕೆ ಸೌಪರ್ಣಿಕಾ ನದಿಯ ನಡುವೆ ಹಾದುಹೋಗುವ ಭಾರತದ ಅತ್ಯಂತ ಸುಂದರ ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ.',
      mr: 'एका बाजूला अरबी समुद्र आणि दुसऱ्या बाजूला नदी असणारा महामार्ग.'
    },
    why_visit_i18n: {
      en: 'Unmatched highway vista witnessing sunset over waves and calm freshwater reflections simultaneously.',
      kn: 'ಒಂದೇ ಕ್ಷಣದಲ್ಲಿ ಸಮುದ್ರದ ಸೂರ್ಯಾಸ್ತ ಮತ್ತು ನದಿಯ ಶಾಂತ ನೀರನ್ನು ಕಣ್ತುಂಬಿಕೊಳ್ಳುವ ನೈಸರ್ಗಿಕ ವಿಸ್ಮಯ.',
      mr: 'एकत्रित समुद्र आणि नदीचा सुंदर संगम.'
    },
    lat: 13.7020, lng: 74.6480, entry_fee_inr: 0, avg_visit_min: 45,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Casual.', kn: 'ಸಾಮಾನ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'Park vehicles in demarcated bays along highway promenade.', kn: 'ವಾಹನಗಳನ್ನು ಪಾರ್ಕಿಂಗ್ ಸ್ಥಳದಲ್ಲೇ ನಿಲ್ಲಿಸಿ.', mr: 'पार्किंगच्या जागीच वाहने लावा.' },
    has_toilet: false, has_water: false, has_shade: false, local_benefit: 3, rating: 4.8, image_hint: 'maravanthe_highway',
    source: 'Sample data: NHAI / Udupi Tourism', last_checked: TODAY, verified: 0
  },

  // --- NORTH KARNATAKA HERITAGE (reg_north) - 8 places ---
  {
    id: 'plc_badami_caves',
    region_id: 'reg_north',
    category: 'heritage',
    name_i18n: { en: 'Badami Rock-Cut Cave Temples', kn: 'ಬದಾಮಿ ಗುಹಾ ದೇವಾಲಯಗಳು', mr: 'बदामी लेणी मंदिरे' },
    summary_i18n: {
      en: 'Four 6th-century rock-cut shrines carved into glowing red sandstone cliffs overlooking Agastya Lake reservoir.',
      kn: 'ಅಗಸ್ತ್ಯ ತೀರ್ಥದ ತೀರದಲ್ಲಿ ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಬಂಡೆಗಳನ್ನು ಕೊರೆದು ನಿರ್ಮಿಸಲಾದ 6ನೇ ಶತಮಾನದ 4 ಗುಹಾ ದೇವಾಲಯಗಳು.',
      mr: 'लाल वाळूच्या खडकात कोरलेली ६ व्या शतकातील अप्रतिम चालुक्य लेणी.'
    },
    why_visit_i18n: {
      en: 'Cradle of Indian temple architecture featuring the 18-armed Nataraja sculpture.',
      kn: '18 ತೋಳುಗಳ ನಟರಾಜನ ಅಪರೂಪದ ಶಿಲ್ಪವಿರುವ ಚಾಲುಕ್ಯ ವಾಸ್ತುಶಿಲ್ಪದ ತೊಟ್ಟಿಲು.',
      mr: '१८ हातांच्या नटराजाची अद्वितीय मूर्ती असणारे चालुक्य स्थापत्य.'
    },
    lat: 15.9189, lng: 75.6766, entry_fee_inr: 25, avg_visit_min: 90,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 2,
    dress_code_i18n: { en: 'Modest walking attire and grip shoes.', kn: 'ಸಭ್ಯ ಉಡುಪು ಮತ್ತು ಶೂಗಳು.', mr: 'चांगले शूज.' },
    rules_i18n: { en: 'Protect food from monkeys.', kn: 'ಕೋತಿಗಳಿಂದ ಆಹಾರ ರಕ್ಷಿಸಿ.', mr: 'माकडांपासून सांभाळा.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'badami_caves_lake',
    source: 'Sample data: ASI Bangalore Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_pattadakal',
    region_id: 'reg_north',
    category: 'heritage',
    name_i18n: { en: 'Pattadakal UNESCO Temple Complex', kn: 'ಪಟ್ಟದಕಲ್ಲು ಯುನೆಸ್ಕೋ ಸ್ಮಾರಕ ಸಮೂಹ', mr: 'पट्टदकल युनेस्को मंदिरे' },
    summary_i18n: {
      en: '7th-8th century royal coronation site exhibiting an extraordinary fusion of northern Rekha-Nagara and southern Dravidian vimanas.',
      kn: 'ಉತ್ತರ ಮತ್ತು ದಕ್ಷಿಣ ಭಾರತದ ವಾಸ್ತುಶಿಲ್ಪ ಶೈಲಿಗಳ ಸಂಗಮವಿರುವ ಚಾಲುಕ್ಯ ದೊರೆಗಳ ಪಟ್ಟಾಭಿಷೇಕ ತಾಣ.',
      mr: 'नागर आणि द्रविड स्थापत्यशैलीचा संगम असणारे चालुक्य कालीन राज्याभिषेक केंद्र.'
    },
    why_visit_i18n: {
      en: 'UNESCO World Heritage monument documenting evolution of Hindu stone temple building.',
      kn: 'ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆ ತಾಣ; ದೇವಾಲಯ ನಿರ್ಮಾಣ ಕಲೆಯ ಮಹಾನ್ ಪ್ರಯೋಗಶಾಲೆ.',
      mr: 'युनेस्को जागतिक वारसा स्थळ.'
    },
    lat: 15.9486, lng: 75.8160, entry_fee_inr: 40, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest attire; hat recommended.', kn: 'ಸಭ್ಯ ಉಡುಪು ಮತ್ತು ಟೋಪಿ.', mr: 'उन्हासाठी टोपी.' },
    rules_i18n: { en: 'Audio guides available at entrance kiosk.', kn: 'ಆಡಿಯೋ ಗೈಡ್ ಲಭ್ಯವಿದೆ.', mr: 'ऑडिओ गाईड उपलब्ध.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'pattadakal_complex',
    source: 'Sample data: ASI Bangalore Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_gol_gumbaz',
    region_id: 'reg_north',
    category: 'heritage',
    name_i18n: { en: 'Gol Gumbaz & Whispering Gallery', kn: 'ಗೋಲ್ ಗುಂಬಜ್ ಮತ್ತು ಪಿಸುಗುಟ್ಟುವ ಮೊಗಸಾಲೆ', mr: 'गोल घुमट आणि कुजबुज गॅलरी' },
    summary_i18n: {
      en: '1656 mausoleum of Mohammed Adil Shah sporting second largest unsupported dome in the world with legendary acoustic resonance.',
      kn: 'ವಿಶ್ವದ ಎರಡನೇ ಅತಿ ದೊಡ್ಡ ಆಧಾರರಹಿತ ಗುಮ್ಮಟ ಮತ್ತು 7 ಬಾರಿ ಧ್ವನಿ ಪ್ರತಿಫಲಿಸುವ ಪಿಸುಗುಟ್ಟುವ ಮೊಗಸಾಲೆ.',
      mr: 'जगातील दुसऱ्या क्रमांकाचा भव्य घुमट आणि आवाज ७ वेळा प्रतिध्वनित होणारी गॅलरी.'
    },
    why_visit_i18n: {
      en: 'Unrivalled architectural acoustics where faintest whisper echoes distinctly across 44 metres.',
      kn: 'ಸಣ್ಣ ಪಿಸುಮಾತು ಕೂಡ 44 ಮೀಟರ್ ದೂರದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸುವ ಅಸಾಧಾರಣ ಧ್ವನಿ ವಿಜ್ಞಾನದ ಪವಾಡ.',
      mr: 'असामान्य ध्वनीशास्त्राचा चमत्कार.'
    },
    lat: 16.8302, lng: 75.7360, entry_fee_inr: 25, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2], is_outdoor: false, is_indoor_alt: true, senior_friendly: 3,
    dress_code_i18n: { en: 'Modest respectful clothing; footwear removed on tomb level.', kn: 'ಸಭ್ಯ ಉಡುಪು; ಸಮಾಧಿ ಮಟ್ಟದಲ್ಲಿ ಪಾದರಕ್ಷೆ ತೆಗೆಯಿರಿ.', mr: 'आदरपूर्वक पोशाख.' },
    rules_i18n: { en: 'Morning visits at 8 AM recommended for clear whispers.', kn: 'ಮುಂಜಾನೆ 8 ಗಂಟೆಗೆ ಭೇಟಿ ನೀಡುವುದು ಸೂಕ್ತ.', mr: 'सकाळी लवकर भेट द्या.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'gol_gumbaz_dome',
    source: 'Sample data: ASI Vijayapura Sub-circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_mahakuta',
    region_id: 'reg_north',
    category: 'spiritual',
    name_i18n: { en: 'Mahakuta Temple & Natural Spring Pool', kn: 'ಮಹಾಕೂಟ ದೇವಾಲಯ ಮತ್ತು ವಿಷ್ಣು ಪುಷ್ಕರಣಿ', mr: 'महाकूट मंदिर आणि नैसर्गिक कुंड' },
    summary_i18n: {
      en: 'Ancient tree-shaded temple courtyard centered around crystal-clear natural perennial spring waters.',
      kn: 'ದಟ್ಟ ಮರಗಳ ನೆರಳಿನಲ್ಲಿ ಸದಾ ಶುದ್ಧ ನೀರು ಹರಿಯುವ ನೈಸರ್ಗಿಕ ಪುಷ್ಕರಣಿ ಹೊಂದಿರುವ ಪುರಾತನ ದೇವಾಲಯ.',
      mr: 'झाडांच्या सावलीत वसलेले निसर्गरम्य प्राचीन मंदिर आणि पाण्याचे पवित्र कुंड.'
    },
    why_visit_i18n: {
      en: 'Quiet Alternative to Badami Caves: calm sacred groves with 70% fewer tourists.',
      kn: 'ಬದಾಮಿ ಗುಹೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಶಾಂತ ಪರ್ಯಾಯ: ದಟ್ಟ ಹಸಿರು, ತಂಪಾದ ನೀರು ಮತ್ತು ಶಾಂತ ಪರಿಸರ.',
      mr: 'बदामी लेण्यांना शांत पर्याय: अतिशय शांत व गर्दी नसलेले पवित्र ठिकाण.'
    },
    lat: 15.9320, lng: 75.7280, entry_fee_inr: 0, avg_visit_min: 50,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest traditional clothes.', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು.', mr: 'पारंपरिक कपडे.' },
    rules_i18n: { en: 'Spring water sacred; do not use soap.', kn: 'ಪುಷ್ಕರಣಿಯಲ್ಲಿ ಸಾಬೂನು ಬಳಸಬೇಡಿ.', mr: 'पाण्यात साबण वापरू नये.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'mahakuta_spring',
    source: 'Sample data: Karnataka Religious Endowments', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_aihole_durga',
    region_id: 'reg_north',
    category: 'heritage',
    name_i18n: { en: 'Aihole Durga Temple Complex', kn: 'ಐಹೊಳೆ ದುರ್ಗಾ ದೇವಾಲಯ ಸಮೂಹ', mr: 'ऐहोळे दुर्गा मंदिर' },
    summary_i18n: {
      en: '7th-century apsidal temple with semi-circular sanctum and peristyle pillared corridor along Malaprabha river.',
      kn: 'ಮಲಪ್ರಭಾ ನದಿಯ ತೀರದಲ್ಲಿರುವ ಅರ್ಧವೃತ್ತಾಕಾರದ ಗರ್ಭಗುಡಿ ಹೊಂದಿರುವ 7ನೇ ಶತಮಾನದ ಅಪರೂಪದ ದೇವಾಲಯ.',
      mr: 'अर्धगोलाकार गर्भगृह असलेले दुर्मीळ ७ व्या शतकातील चालुक्य मंदिर.'
    },
    why_visit_i18n: {
      en: 'Known as the "Laboratory of Indian Architecture" with over 120 stone temples.',
      kn: '120 ಕ್ಕೂ ಹೆಚ್ಚು ಕಲ್ಲಿನ ದೇವಾಲಯಗಳನ್ನು ಹೊಂದಿರುವ ಭಾರತೀಯ ವಾಸ್ತುಶಿಲ್ಪದ ಪ್ರಯೋಗಶಾಲೆ.',
      mr: 'भारतीय स्थापत्यकलेची प्रयोगशाळा.'
    },
    lat: 16.0185, lng: 75.8810, entry_fee_inr: 25, avg_visit_min: 75,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest wear.', kn: 'ಸಭ್ಯ ಉಡುಪು.', mr: 'साधे कपडे.' },
    rules_i18n: { en: 'ASI museum inside complex.', kn: 'ಆವರಣದಲ್ಲಿ ಪುರಾತತ್ವ ವಸ್ತುಸಂಗ್ರಹಾಲಯವಿದೆ.', mr: 'आत संग्रहालय आहे.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.7, image_hint: 'aihole_apsidal',
    source: 'Sample data: ASI Bangalore Circle', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_ibrahim_rauza',
    region_id: 'reg_north',
    category: 'heritage',
    name_i18n: { en: 'Ibrahim Rauza (Taj Mahal of the Deccan)', kn: 'ಇಬ್ರಾಹಿಂ ರೋಜಾ (ದಕ್ಷಿಣ ಭಾರತದ ತಾಜ್ ಮಹಲ್)', mr: 'इब्राहिम रौझा' },
    summary_i18n: {
      en: '1627 palatial tomb and mosque complex featuring delicate minarets, hanging stone chains, and Persian calligraphy.',
      kn: 'ಸೂಕ್ಷ್ಮ ಕೆತ್ತನೆಯ ಮಿನಾರಗಳು, ಕಲ್ಲಿನ ಸರಪಳಿಗಳು ಮತ್ತು ಪರ್ಷಿಯನ್ ಲಿಪಿಯನ್ನೊಳಗೊಂಡ ಅದ್ಭುತ ಸ್ಮಾರಕ.',
      mr: 'दख्खनचा ताजमहाल म्हणून ओळखला जाणारा भव्य मकबरा.'
    },
    why_visit_i18n: {
      en: 'Masterpiece of Adil Shahi architecture that directly inspired the design of Agra\'s Taj Mahal.',
      kn: 'ಆಗ್ರಾದ ತಾಜ್ ಮಹಲ್ ನಿರ್ಮಾಣಕ್ಕೆ ಪ್ರೇರಣೆ ನೀಡಿದ ಅದಿಲ್ ಶಾಹಿ ವಾಸ್ತುಶಿಲ್ಪದ ಮೇರುಕೃತಿ.',
      mr: 'ताजमहालाच्या डिझाईनची प्रेरणा मानली जाणारी वास्तू.'
    },
    lat: 16.8240, lng: 75.7010, entry_fee_inr: 25, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2], is_outdoor: true, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest clothes; cover head inside tomb.', kn: 'ಸಭ್ಯ ಉಡುಪು.', mr: 'सभ्य कपडे.' },
    rules_i18n: { en: 'Open sunrise to sunset.', kn: 'ಸೂರ್ಯೋದಯದಿಂದ ಸೂರ್ಯಾಸ್ತದವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ.', mr: 'सूर्योदय ते सूर्यास्त खुले.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.8, image_hint: 'ibrahim_rauza_facade',
    source: 'Sample data: ASI Vijayapura', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_kalaburagi_fort',
    region_id: 'reg_north',
    category: 'heritage',
    name_i18n: { en: 'Kalaburagi (Gulbarga) Fort & Jama Masjid', kn: 'ಕಲಬುರಗಿ ಕೋಟೆ ಮತ್ತು ಜುಮ್ಮಾ ಮಸೀದಿ', mr: 'कलबुर्गी किल्ला' },
    summary_i18n: {
      en: '14th-century Bahmani citadel containing unique completely roofed Persian-style Jama Masjid spanning 38,000 sq ft.',
      kn: 'ಸಂಪೂರ್ಣ ಮೇಲ್ಛಾವಣಿಯನ್ನು ಹೊಂದಿರುವ 38,000 ಚದರ ಅಡಿಯ ಅಪರೂಪದ ಪರ್ಷಿಯನ್ ಶೈಲಿಯ ಜುಮ್ಮಾ ಮಸೀದಿ ಹೊಂದಿರುವ ಕೋಟೆ.',
      mr: '१४ व्या शतकातील बहामनी किल्ला आणि पूर्ण छत असणारी प्रसिद्ध मशीद.'
    },
    why_visit_i18n: {
      en: 'Only mosque in South Asia with no open courtyard, covered entirely by 68 domes.',
      kn: 'ದಕ್ಷಿಣ ಏಷ್ಯಾದಲ್ಲೇ ಬಯಲು ಅಂಗಳವಿಲ್ಲದ, 68 ಗುಮ್ಮಟಗಳಿಂದ ಆವೃತವಾದ ಏಕೈಕ ಅಪರೂಪದ ಮಸೀದಿ.',
      mr: '६८ घुमटांनी आच्छादलेली दक्षिण आशियातील एकमेव मशीद.'
    },
    lat: 17.3420, lng: 76.8250, entry_fee_inr: 0, avg_visit_min: 60,
    best_months: [10, 11, 12, 1, 2], is_outdoor: false, is_indoor_alt: true, senior_friendly: 4,
    dress_code_i18n: { en: 'Modest attire.', kn: 'ಸಭ್ಯ ಉಡುಪು.', mr: 'सभ्य पोशाख.' },
    rules_i18n: { en: 'Free entrance.', kn: 'ಪ್ರವೇಶ ಉಚಿತ.', mr: 'मोफत प्रवेश.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 4, rating: 4.6, image_hint: 'gulbarga_fort',
    source: 'Sample data: ASI Dharwad', last_checked: TODAY, verified: 0
  },
  {
    id: 'plc_banashankari_badami',
    region_id: 'reg_north',
    category: 'spiritual',
    name_i18n: { en: 'Banashankari Temple & Haridra Teertha', kn: 'ಬನಶಂಕರಿ ದೇವಾಲಯ ಮತ್ತು ಹರಿದ್ರಾ ತೀರ್ಥ', mr: 'बनशंकरी मंदिर बदामी' },
    summary_i18n: {
      en: 'Ancient Shakta temple in Tilakaaranya forest centered around a large stepped square stone pond with cloistered pillared walkways.',
      kn: 'ತಿಲಕಾರಣ್ಯ ಅರಣ್ಯದಲ್ಲಿರುವ ಮೆಟ್ಟಿಲುಗಳ ದೊಡ್ಡ ಕಲ್ಲಿನ ಕಲ್ಯಾಣಿ ಹೊಂದಿರುವ ಪವಿತ್ರ ಶಕ್ತಿ ದೇವತೆಯ ಕ್ಷೇತ್ರ.',
      mr: 'भव्य पुष्करणी असणारे प्राचीन शक्तिपीठ मंदिर.'
    },
    why_visit_i18n: {
      en: 'Annual Banashankari Jathre fair is one of North Karnataka\'s largest rural gatherings.',
      kn: 'ಉತ್ತರ ಕರ್ನಾಟಕದ ಅತಿ ದೊಡ್ಡ ಗ್ರಾಮೀಣ ಜಾತ್ರೆಗಳಲ್ಲಿ ಒಂದಾದ ಬನಶಂಕರಿ ಜಾತ್ರಾ ತಾಣ.',
      mr: 'उत्तर कर्नाटकातील प्रसिद्ध यात्रा केंद्र.'
    },
    lat: 15.8750, lng: 75.7020, entry_fee_inr: 0, avg_visit_min: 50,
    best_months: [10, 11, 12, 1, 2, 3], is_outdoor: false, is_indoor_alt: false, senior_friendly: 4,
    dress_code_i18n: { en: 'Traditional temple dress.', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು.', mr: 'पारंपरिक कपडे.' },
    rules_i18n: { en: 'Special deepotsava lamps lit around the pond on full moon.', kn: 'ಹುಣ್ಣಿಮೆಯಂದು ಕಲ್ಯಾಣಿಯ ಸುತ್ತ ದೀಪೋತ್ಸವ.', mr: 'पौर्णिमेला दीपोत्सव.' },
    has_toilet: true, has_water: true, has_shade: true, local_benefit: 5, rating: 4.7, image_hint: 'banashankari_pond',
    source: 'Sample data: Muzrai Department', last_checked: TODAY, verified: 0
  }
];

export const SEED_PLACE_HOURS: PlaceHours[] = SEED_PLACES.flatMap(place => {
  return [0, 1, 2, 3, 4, 5, 6].map(weekday => ({
    place_id: place.id,
    weekday,
    opens: place.id === 'plc_museum_kamalapura' || place.id === 'plc_coffee_museum' ? '10:00' : '06:00',
    closes: place.id === 'plc_museum_kamalapura' || place.id === 'plc_coffee_museum' ? '17:00' : (place.id === 'plc_brindavan_gardens' ? '20:30' : '18:30'),
    closed: (place.id === 'plc_museum_kamalapura' && weekday === 5) || (place.id === 'plc_mysore_zoo' && weekday === 2)
  }));
});

export const SEED_ALTERNATIVES: PlaceAlternative[] = [
  {
    place_id: 'plc_vittala',
    alt_place_id: 'plc_achyutaraya',
    similarity: 0.88,
    trade_off_i18n: {
      en: 'Similar Vijayanagara stone architecture, 60% fewer visitors, 12 minutes walk away',
      kn: 'ವಿಜಯನಗರ ಕಾಲದ ಸಮಾನ ಶಿಲ್ಪಕಲೆ, 60% ಕಡಿಮೆ ಜನದಟ್ಟಣೆ, 12 ನಿಮಿಷಗಳ ನಡಿಗೆ ಹಾದಿ',
      mr: 'समान विजयनगर शिल्पकला, ६०% कमी गर्दी, १२ मिनिटांच्या अंतरावर'
    }
  },
  {
    place_id: 'plc_matanga_hill',
    alt_place_id: 'plc_malyavanta_hill',
    similarity: 0.82,
    trade_off_i18n: {
      en: 'Gentler vehicle access, magnificent sunset with live Ramayana chanting, peaceful boulder vantage',
      kn: 'ವಾಹನ ತಲುಪುವ ಸುಲಭ ಹಾದಿ, ಜೀವಂತ ರಾಮಾಯಣ ಭಜನೆ ಮತ್ತು ಶಾಂತ ಸೂರ್ಯಾಸ್ತದ ಸುಂದರ ನೋಟ',
      mr: 'वाहनाने जाता येणारा सोपा रस्ता, अखंड रामायण पठण आणि शांत सूर्यास्त'
    }
  },
  {
    place_id: 'plc_mysuru_palace',
    alt_place_id: 'plc_jaganmohan_palace',
    similarity: 0.85,
    trade_off_i18n: {
      en: 'Ravi Varma royal art collection, calm interior galleries, zero queue time, 8 minutes away',
      kn: 'ರವಿವರ್ಮ ಕಲಾಕೃತಿಗಳು, ಪ್ರಶಾಂತ ಒಳಾಂಗಣ, ಯಾವುದೇ ಉದ್ದದ ಸರತಿ ಸಾಲಿಲ್ಲ, 8 ನಿಮಿಷ ದೂರ',
      mr: 'रविवर्मा यांची चित्रे, शांत दालने आणि अजिबात रांग नाही'
    }
  },
  {
    place_id: 'plc_om_beach',
    alt_place_id: 'plc_kudle_beach',
    similarity: 0.90,
    trade_off_i18n: {
      en: 'Wider soft-sand crescent, calmer swimming waves, 40% less boat traffic',
      kn: 'ವಿಶಾಲ ಮರಳಿನ ಕಡಲತೀರ, ಈಜಲು ಸುಲಭ ಶಾಂತ ಅಲೆಗಳು, 40% ಕಡಿಮೆ ಬೋಟ್ ಶಬ್ದ',
      mr: 'मोकळा वाळूचा किनारा, पोहण्यासाठी सुरक्षित लाटा आणि शांतता'
    }
  },
  {
    place_id: 'plc_abbey_falls',
    alt_place_id: 'plc_chelavara_falls',
    similarity: 0.86,
    trade_off_i18n: {
      en: 'Untouched coffee estate setting, 70% fewer tourists, tranquil natural stream pool',
      kn: 'ಕಾಫಿ ತೋಟಗಳ ನೈಸರ್ಗಿಕ ಪರಿಸರ, 70% ಕಡಿಮೆ ಜನದಟ್ಟಣೆ, ಶಾಂತ ನೀರಿನ ತೊರೆ',
      mr: 'कॉफीच्या बागांमधील शांत वातावरण, ७०% कमी गर्दी'
    }
  },
  {
    place_id: 'plc_mysore_zoo',
    alt_place_id: 'plc_karanji_lake',
    similarity: 0.83,
    trade_off_i18n: {
      en: 'Quiet nature walk through India\'s largest aviary, peaceful lake boating, 60% less crowd',
      kn: 'ದೊಡ್ಡ ಪಕ್ಷಿಧಾಮದಲ್ಲಿ ಪ್ರಶಾಂತ ನಡಿಗೆ, ಕೆರೆಯಲ್ಲಿ ದೋಣಿ ವಿಹಾರ, 60% ಕಡಿಮೆ ಜನ',
      mr: 'शांत पक्षी अभयारण्य, नौकाविहार आणि ६०% कमी गर्दी'
    }
  },
  {
    place_id: 'plc_badami_caves',
    alt_place_id: 'plc_mahakuta',
    similarity: 0.84,
    trade_off_i18n: {
      en: 'Ancient Chalukya shrines in lush shady grove around perennial natural pool, 65% fewer tourists',
      kn: 'ದಟ್ಟ ಮರಗಳ ನೆರಳಿನಲ್ಲಿರುವ ಪ್ರಾಚೀನ ಚಾಲುಕ್ಯ ದೇವಾಲಯಗಳು, ನೈಸರ್ಗಿಕ ಪುಷ್ಕರಣಿ, 65% ಕಡಿಮೆ ಜನ',
      mr: 'हिरवळीत वसलेली प्राचीन मंदिरे व नैसर्गिक पाण्याचे कुंड, ६५% कमी गर्दी'
    }
  }
];

// --- 30 STAYS (mix of registered KSTDC / unverified) ---
export const SEED_STAYS: Stay[] = [
  // Hampi & Badami
  { id: 'sty_kstdc_hampi', region_id: 'reg_hampi', name_i18n: { en: 'KSTDC Hotel Mayura Bhuvaneshwari Kamalapura', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ಭುವನೇಶ್ವರಿ ಕಮಲಾಪುರ', mr: 'केएसटीडीसी हॉटेल मयूरा भुवनेश्वरी' }, lat: 15.3125, lng: 76.4810, price_per_night_inr: 2200, registration_status: 'registered', source: 'KSTDC', last_checked: TODAY },
  { id: 'sty_clarks_hampi', region_id: 'reg_hampi', name_i18n: { en: 'Clarks Inn Hampi (Museum Road)', kn: 'ಕ್ಲಾರ್ಕ್ಸ್ ಇನ್ ಹಂಪಿ', mr: 'क्लार्क्स इन हंपी' }, lat: 15.3130, lng: 76.4820, price_per_night_inr: 3400, registration_status: 'registered', source: 'KSTDC Registry', last_checked: TODAY },
  { id: 'sty_heritage_homestay', region_id: 'reg_hampi', name_i18n: { en: 'Hampi Heritage Farmers Homestay Anegundi', kn: 'ಹಂಪಿ ಹೆರಿಟೇಜ್ ರೈತರ ಹೋಮ್‌ಸ್ಟೇ ಆನೆಗುಂದಿ', mr: 'हंपी हेरिटेज होमस्टे' }, lat: 15.3520, lng: 76.4710, price_per_night_inr: 1400, registration_status: 'registered', source: 'Ecotourism Cell', last_checked: TODAY },
  { id: 'sty_tungabhadra_lodge', region_id: 'reg_hampi', name_i18n: { en: 'Tungabhadra Rest Lodge (Budget)', kn: 'ತುಂಗಭದ್ರಾ ರೆಸ್ಟ್ ಲಾಡ್ಜ್', mr: 'तुंगभद्रा लॉज' }, lat: 15.3345, lng: 76.4635, price_per_night_inr: 950, registration_status: 'unverified', source: 'Commercial Registry', last_checked: TODAY },
  { id: 'sty_gopi_guesthouse', region_id: 'reg_hampi', name_i18n: { en: 'Gopi Heritage Guesthouse Bazaar', kn: 'ಗೋಪಿ ಹೆರಿಟೇಜ್ ಗೆಸ್ಟ್‌ಹೌಸ್', mr: 'गोपी गेस्टहाऊस' }, lat: 15.3355, lng: 76.4610, price_per_night_inr: 1100, registration_status: 'unverified', source: 'Local Registry', last_checked: TODAY },
  { id: 'sty_kstdc_badami', region_id: 'reg_north', name_i18n: { en: 'KSTDC Hotel Mayura Chalukya Badami', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ಚಾಲುಕ್ಯ ಬದಾಮಿ', mr: 'केएसटीडीसी हॉटेल मयूरा चालुक्य' }, lat: 15.9195, lng: 75.6810, price_per_night_inr: 1950, registration_status: 'registered', source: 'KSTDC North', last_checked: TODAY },
  { id: 'sty_badami_court', region_id: 'reg_north', name_i18n: { en: 'The Badami Court Station Road', kn: 'ದಿ ಬದಾಮಿ ಕೋರ್ಟ್', mr: 'द बदामी कोर्ट' }, lat: 15.9230, lng: 75.6880, price_per_night_inr: 2600, registration_status: 'registered', source: 'Bagalkot Tourism', last_checked: TODAY },
  { id: 'sty_mukambika_lodge_badami', region_id: 'reg_north', name_i18n: { en: 'Mookambika Deluxe Lodge Badami', kn: 'ಮೂಕಾಂಬಿಕಾ ಡೀಲಕ್ಸ್ ಲಾಡ್ಜ್', mr: 'मूकांबिका लॉज' }, lat: 15.9180, lng: 75.6790, price_per_night_inr: 850, registration_status: 'unverified', source: 'Local Registry', last_checked: TODAY },

  // Mysuru
  { id: 'sty_kstdc_mysuru', region_id: 'reg_mysuru', name_i18n: { en: 'KSTDC Hotel Mayura Hoysala Mysuru', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ಹೊಯ್ಸಳ ಮೈಸೂರು', mr: 'केएसटीडीसी हॉटेल मयूरा होयसळ' }, lat: 12.3080, lng: 76.6430, price_per_night_inr: 2100, registration_status: 'registered', source: 'KSTDC Mysuru', last_checked: TODAY },
  { id: 'sty_royal_heritage_mysuru', region_id: 'reg_mysuru', name_i18n: { en: 'Green Heritage Hotel near Palace', kn: 'ಗ್ರೀನ್ ಹೆರಿಟೇಜ್ ಹೋಟೆಲ್ ಮೈಸೂರು', mr: 'ग्रीन हेरिटेज हॉटेल म्हैसूर' }, lat: 12.3030, lng: 76.6580, price_per_night_inr: 2800, registration_status: 'registered', source: 'Mysuru Hotel Assoc', last_checked: TODAY },
  { id: 'sty_chamaraja_lodge', region_id: 'reg_mysuru', name_i18n: { en: 'Sri Chamaraja Rest House Gandhi Square', kn: 'ಶ್ರೀ ಚಾಮರಾಜ ರೆಸ್ಟ್ ಹೌಸ್', mr: 'श्री चामराज लॉज' }, lat: 12.3110, lng: 76.6530, price_per_night_inr: 900, registration_status: 'unverified', source: 'Local Registry', last_checked: TODAY },
  { id: 'sty_roopa_mysuru', region_id: 'reg_mysuru', name_i18n: { en: 'Hotel Roopa B.N. Road Mysuru', kn: 'ಹೋಟೆಲ್ ರೂಪಾ ಮೈಸೂರು', mr: 'हॉटेल रूपा' }, lat: 12.3100, lng: 76.6570, price_per_night_inr: 1600, registration_status: 'registered', source: 'Commercial Registry', last_checked: TODAY },
  { id: 'sty_kstdc_krs', region_id: 'reg_mysuru', name_i18n: { en: 'KSTDC Hotel Mayura Cauvery KRS', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ಕಾವೇರಿ ಕೆಆರ್‌ಎಸ್', mr: 'केएसटीडीसी हॉटेल मयूरा कावेरी' }, lat: 12.4230, lng: 76.5740, price_per_night_inr: 2400, registration_status: 'registered', source: 'KSTDC', last_checked: TODAY },
  { id: 'sty_chamundi_yatri_nivas', region_id: 'reg_mysuru', name_i18n: { en: 'Chamundi Hills Yatri Nivas Muzrai', kn: 'ಚಾಮುಂಡಿ ಬೆಟ್ಟ ಯಾತ್ರಿ ನಿವಾಸ', mr: 'चामुंडी यात्रि निवास' }, lat: 12.2750, lng: 76.6720, price_per_night_inr: 750, registration_status: 'registered', source: 'Muzrai Board', last_checked: TODAY },

  // Coorg & Chikkamagaluru
  { id: 'sty_madikeri_homestay', region_id: 'reg_coorg', name_i18n: { en: 'Coffee Valley Registered Homestay Madikeri', kn: 'ಕಾಫಿ ವ್ಯಾಲಿ ನೋಂದಾಯಿತ ಹೋಮ್‌ಸ್ಟೇ ಮಡಿಕೇರಿ', mr: 'कॉफी व्हॅली होमस्टे मडिकेरी' }, lat: 12.4200, lng: 75.7400, price_per_night_inr: 2400, registration_status: 'registered', source: 'Coorg Homestay Assoc', last_checked: TODAY },
  { id: 'sty_kstdc_madikeri', region_id: 'reg_coorg', name_i18n: { en: 'KSTDC Hotel Mayura Valley View Madikeri', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ವ್ಯಾಲಿ ವ್ಯೂ ಮಡಿಕೇರಿ', mr: 'केएसटीडीसी हॉटेल मयूरा व्हॅली व्ह्यू' }, lat: 12.4170, lng: 75.7350, price_per_night_inr: 2600, registration_status: 'registered', source: 'KSTDC', last_checked: TODAY },
  { id: 'sty_plantation_trails', region_id: 'reg_coorg', name_i18n: { en: 'Tata Coffee Heritage Bungalow Pollibetta', kn: 'ಟಾಟಾ ಕಾಫಿ ಹೆರಿಟೇಜ್ ಬಂಗಲೆ', mr: 'टाटा कॉफी हेरिटेज बंगला' }, lat: 12.2600, lng: 75.9100, price_per_night_inr: 4500, registration_status: 'registered', source: 'Tourism Dept', last_checked: TODAY },
  { id: 'sty_coorg_backpacker', region_id: 'reg_coorg', name_i18n: { en: 'Madikeri Budget Backpackers Nest', kn: 'ಮಡಿಕೇರಿ ಬಜೆಟ್ ಬ್ಯಾಕ್‌ಪ್ಯಾಕರ್ಸ್ ನೆಸ್ಟ್', mr: 'मडिकेरी बॅकपॅकर्स' }, lat: 12.4240, lng: 75.7360, price_per_night_inr: 800, registration_status: 'unverified', source: 'Local Registry', last_checked: TODAY },
  { id: 'sty_chik_estate_stay', region_id: 'reg_coorg', name_i18n: { en: 'Mullayanagiri Mist Plantation Homestay', kn: 'ಮುಳ್ಳಯ್ಯನಗಿರಿ ಮಿಸ್ಟ್ ಪ್ಲಾಂಟೇಶನ್ ಹೋಮ್‌ಸ್ಟೇ', mr: 'मुल्लय्यनगिरी होमस्टे' }, lat: 13.3850, lng: 75.7300, price_per_night_inr: 2200, registration_status: 'registered', source: 'Chikkamagaluru Tourism', last_checked: TODAY },
  { id: 'sty_kstdc_kemmangundi', region_id: 'reg_coorg', name_i18n: { en: 'KSTDC Horticultural Guest House Kemmangundi', kn: 'ತೋಟಗಾರಿಕೆ ಇಲಾಖೆ ಅತಿಥಿ ಗೃಹ ಕೆಮ್ಮಣ್ಣುಗುಂಡಿ', mr: 'केएसटीडीसी गेस्ट हाऊस' }, lat: 13.5480, lng: 75.7520, price_per_night_inr: 1800, registration_status: 'registered', source: 'Horticulture Dept', last_checked: TODAY },

  // Coast (Udupi & Gokarna)
  { id: 'sty_udupi_kstdc', region_id: 'reg_coast', name_i18n: { en: 'KSTDC Hotel Mayura Kaup Beach', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ಕಾಪು ಬೀಚ್', mr: 'केएसटीडीसी हॉटेल मयूरा कापू' }, lat: 13.2250, lng: 74.7430, price_per_night_inr: 2200, registration_status: 'registered', source: 'KSTDC Coastal', last_checked: TODAY },
  { id: 'sty_malpe_sea_resort', region_id: 'reg_coast', name_i18n: { en: 'Malpe Beach View Heritage Stay', kn: 'ಮಾಲ್ಪೆ ಬೀಚ್ ವ್ಯೂ ಹೆರಿಟೇಜ್ ಸ್ಟೇ', mr: 'मालपे बीच स्टे' }, lat: 13.3550, lng: 74.7020, price_per_night_inr: 2900, registration_status: 'registered', source: 'Coastal Tourism', last_checked: TODAY },
  { id: 'sty_udupi_krishna_nivas', region_id: 'reg_coast', name_i18n: { en: 'Sri Krishna Temple Yatri Nivas Car Street', kn: 'ಶ್ರೀ ಕೃಷ್ಣ ಮಠ ಯಾತ್ರಿ ನಿವಾಸ ರಥಬೀದಿ', mr: 'श्रीकृष्ण यात्री निवास' }, lat: 13.3415, lng: 74.7530, price_per_night_inr: 700, registration_status: 'registered', source: 'Matha Trust', last_checked: TODAY },
  { id: 'sty_gokarna_namaste_cafe', region_id: 'reg_coast', name_i18n: { en: 'Namaste Cafe & Cottages Om Beach', kn: 'ನಮಸ್ತೆ ಕೆಫೆ ಮತ್ತು ಕಾಟೇಜ್ ಗೋಕರ್ಣ', mr: 'नमस्ते कॅफे ओम बीच' }, lat: 14.5190, lng: 74.3170, price_per_night_inr: 2400, registration_status: 'registered', source: 'Uttara Kannada Reg', last_checked: TODAY },
  { id: 'sty_kudle_beach_shacks', region_id: 'reg_coast', name_i18n: { en: 'Kudle Eco Huts (Unverified)', kn: 'ಕುಡ್ಲೆ ಇಕೋ ಹಟ್ಸ್', mr: 'कुडले इको हट्स' }, lat: 14.5290, lng: 74.3130, price_per_night_inr: 900, registration_status: 'unverified', source: 'Local Gram Panchayat', last_checked: TODAY },
  { id: 'sty_murudeshwar_rns', region_id: 'reg_coast', name_i18n: { en: 'RNS Residency Sea View Murudeshwar', kn: 'ಆರ್‌ಎನ್‌ಎಸ್ ರೆಸಿಡೆನ್ಸಿ ಮುರುಡೇಶ್ವರ', mr: 'आरएनएस रेसिडेन्सी मुरुडेश्वर' }, lat: 14.0950, lng: 74.4850, price_per_night_inr: 2800, registration_status: 'registered', source: 'Hotel Assoc', last_checked: TODAY },

  // North Karnataka (Vijayapura & Kalaburagi)
  { id: 'sty_kstdc_vijayapura', region_id: 'reg_north', name_i18n: { en: 'KSTDC Hotel Mayura Adil Shahi Vijayapura', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ಆದಿಲ್ ಶಾಹಿ ವಿಜಯಪುರ', mr: 'केएसटीडीसी हॉटेल मयूरा विजापूर' }, lat: 16.8280, lng: 75.7150, price_per_night_inr: 1900, registration_status: 'registered', source: 'KSTDC', last_checked: TODAY },
  { id: 'sty_shashinag_residency', region_id: 'reg_north', name_i18n: { en: 'Shashinag Residency Station Road Vijayapura', kn: 'ಶಶಿನಾಗ್ ರೆಸಿಡೆನ್ಸಿ ವಿಜಯಪುರ', mr: 'शशिनाग रेसिडेन्सी' }, lat: 16.8320, lng: 75.7200, price_per_night_inr: 1500, registration_status: 'registered', source: 'Commercial Reg', last_checked: TODAY },
  { id: 'sty_hubballi_kstdc', region_id: 'reg_north', name_i18n: { en: 'KSTDC Hotel Mayura Varun Hubballi', kn: 'ಕೆಎಸ್‌ಟಿಡಿಸಿ ಹೋಟೆಲ್ ಮಯೂರ ವರುಣ ಹುಬ್ಬಳ್ಳಿ', mr: 'केएसटीडीसी हॉटेल मयूरा हुबळी' }, lat: 15.3580, lng: 75.1320, price_per_night_inr: 2100, registration_status: 'registered', source: 'KSTDC', last_checked: TODAY },
  { id: 'sty_kalaburagi_lodge', region_id: 'reg_north', name_i18n: { en: 'Bahmani Heritage Lodge Kalaburagi', kn: 'ಬಹಮನಿ ಹೆರಿಟೇಜ್ ಲಾಡ್ಜ್ ಕಲಬುರಗಿ', mr: 'बहामनी लॉज कलबुर्गी' }, lat: 17.3390, lng: 76.8310, price_per_night_inr: 850, registration_status: 'unverified', source: 'Local Registry', last_checked: TODAY }
];

// --- 40 FOOD SPOTS ---
export const SEED_FOOD_SPOTS: FoodSpot[] = [
  // Hampi & Ballari
  { id: 'food_mango_tree', region_id: 'reg_hampi', name_i18n: { en: 'Mango Tree Restaurant Kamalapura', kn: 'ಮ್ಯಾಂಗೋ ಟ್ರೀ ರೆಸ್ಟೋರೆಂಟ್ ಕಮಲಾಪುರ', mr: 'मँगो ट्री रेस्टॉरंट' }, dish_i18n: { en: 'Karnataka Veg Thali & Banana Lassi', kn: 'ಕರ್ನಾಟಕ ಸಸ್ಯಾಹಾರಿ ಊಟ ಮತ್ತು ಬಾಳೆಹಣ್ಣಿನ ಲಸ್ಸಿ', mr: 'कर्नाटक व्हेज थाळी आणि लस्सी' }, veg: true, avg_cost_inr: 180, lat: 15.3135, lng: 76.4795 },
  { id: 'food_kamat_kamalapura', region_id: 'reg_hampi', name_i18n: { en: 'Kamat Upachar Hampi Bypass', kn: 'ಕಾಮತ್ ಉಪಾಹಾರ ಹಂಪಿ ಬೈಪಾಸ್', mr: 'कामत उपहार' }, dish_i18n: { en: 'Jolada Rotti Meals with Yennegai & Shenga Chutney', kn: 'ಜೋಳದ ರೊಟ್ಟಿ ಊಟ, ಎಣ್ಣೆಗಾಯಿ ಬದನೆಕಾಯಿ ಮತ್ತು ಶೇಂಗಾ ಚಟ್ನಿ', mr: 'ज्वारीची भाकरी आणि वांग्याची भाजी' }, veg: true, avg_cost_inr: 160, lat: 15.3090, lng: 76.4780 },
  { id: 'food_suresh_tea', region_id: 'reg_hampi', name_i18n: { en: 'Suresh Tea Stall & Mirchi Bajji', kn: 'ಸುರೇಶ್ ಟೀ ಸ್ಟಾಲ್ ಮತ್ತು ಬಿಸಿ ಮೆಣಸಿನಕಾಯಿ ಬಜ್ಜಿ', mr: 'सुरेश टी आणि मिरची भजी' }, dish_i18n: { en: 'Piping hot Bellary Mirchi Bajji with Filter Coffee', kn: 'ಬಳ್ಳಾರಿ ಗರಿಗರಿ ಮೆಣಸಿನಕಾಯಿ ಬಜ್ಜಿ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ', mr: 'गरमागरम मिरची भजी आणि फिल्टर कॉफी' }, veg: true, avg_cost_inr: 45, lat: 15.3348, lng: 76.4618 },
  { id: 'food_anegundi_khanavali', region_id: 'reg_hampi', name_i18n: { en: 'Ranganatha Khanavali Anegundi', kn: 'ರಂಗನಾಥ ಖಾನಾವಳಿ ಆನೆಗುಂದಿ', mr: 'रंगनाथ खानावळ' }, dish_i18n: { en: 'Sajje Rotti with Kaalu Palya & Pure Cow Ghee', kn: 'ಸಜ್ಜೆ ರೊಟ್ಟಿ, ಕಾಳು ಪಲ್ಯ ಮತ್ತು ತುಪ್ಪ', mr: 'बाजरीची भाकरी आणि उसळ' }, veg: true, avg_cost_inr: 120, lat: 15.3525, lng: 76.4690 },
  { id: 'food_hosapete_dosa', region_id: 'reg_hampi', name_i18n: { en: 'Shanbhag Dosa Corner Hosapete', kn: 'ಶಾನಭಾಗ್ ದೋಸೆ ಕಾರ್ನರ್ ಹೊಸಪೇಟೆ', mr: 'शणभाग डोसा कॉर्नर' }, dish_i18n: { en: 'Crispy Benne Masala Dosa with White Coconut Chutney', kn: 'ಗರಿಗರಿ ಬೆಣ್ಣೆ ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಚಟ್ನಿ', mr: 'मसाला डोसा आणि चटणी' }, veg: true, avg_cost_inr: 75, lat: 15.2710, lng: 76.3950 },
  { id: 'food_buddha_cafe_hampi', region_id: 'reg_hampi', name_i18n: { en: 'Laughing Buddha Riverfront Cafe', kn: 'ಲಾಫಿಂಗ್ ಬುದ್ಧ ಕೆಫೆ ಹಂಪಿ', mr: 'लाफिंग बुद्ध कॅफे' }, dish_i18n: { en: 'Lemon Mint Juice and Woodfire Thin Crust Pizza', kn: 'ಲೆಮನ್ ಮಿಂಟ್ ಜ್ಯೂಸ್ ಮತ್ತು ಪಿಜ್ಜಾ', mr: 'लेमन मिंट ज्यूस आणि पिझ्झा' }, veg: true, avg_cost_inr: 220, lat: 15.3390, lng: 76.4640 },
  { id: 'food_bellary_biryani', region_id: 'reg_hampi', name_i18n: { en: 'Hotel Mayura Classic Hosapete', kn: 'ಹೋಟೆಲ್ ಮಯೂರ ಕ್ಲಾಸಿಕ್ ಹೊಸಪೇಟೆ', mr: 'हॉटेल मयूरा होसपेट' }, dish_i18n: { en: 'South Karnataka Jeera Rice & Veg Biryani', kn: 'ದಕ್ಷಿಣ ಕರ್ನಾಟಕ ಜೀರಾ ರೈಸ್ ಮತ್ತು ವೆಜ್ ಬಿರಿಯಾನಿ', mr: 'व्हेज बिर्याणी' }, veg: true, avg_cost_inr: 150, lat: 15.2750, lng: 76.3910 },
  { id: 'food_badami_khanavali', region_id: 'reg_north', name_i18n: { en: 'Banashankari Khanavali Badami', kn: 'ಬನಶಂಕರಿ ಖಾನಾವಳಿ ಬದಾಮಿ', mr: 'बनशंकरी खानावळ बदामी' }, dish_i18n: { en: 'Lingayat Jolada Rotti Meals with Shenga Chutney Pudi', kn: 'ಲಿಂಗಾಯತ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಮತ್ತು ಶೇಂಗಾ ಹಿಂಡಿ', mr: 'ज्वारीची भाकरी आणि शेंगदाणा चटणी' }, veg: true, avg_cost_inr: 110, lat: 15.9170, lng: 75.6820 },

  // Mysuru & Mandya
  { id: 'food_mylari_mysuru', region_id: 'reg_mysuru', name_i18n: { en: 'Original Vinayaka Mylari Nazarbad', kn: 'ಒರಿಜಿನಲ್ ವಿನಾಯಕ ಮೈಲಾರಿ ಮೈಸೂರು', mr: 'विनायक मैलारी म्हैसूर' }, dish_i18n: { en: 'Signature Melt-in-Mouth Mylari Butter Dosa', kn: 'ಬೆಣ್ಣೆ ಮೈಲಾರಿ ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ತೆಂಗಿನಕಾಯಿ ಚಟ್ನಿ', mr: 'प्रसिद्ध मैलारी बटर डोसा' }, veg: true, avg_cost_inr: 90, lat: 12.3120, lng: 76.6620 },
  { id: 'food_dasaprakash', region_id: 'reg_mysuru', name_i18n: { en: 'Hotel Dasaprakash Traditional Dining', kn: 'ಹೋಟೆಲ್ ದಾಸಪ್ರಕಾಶ್ ಸಾಂಪ್ರದಾಯಿಕ ಊಟ', mr: 'हॉटेल दासप्रकाश' }, dish_i18n: { en: 'Royal Mysore Masala Dosa & Mysore Pak', kn: 'ಮೈಸೂರು ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಬಿಸಿ ಮೈಸೂರು ಪಾಕ್', mr: 'म्हैसूर मसाला डोसा आणि म्हैसूर पाक' }, veg: true, avg_cost_inr: 150, lat: 12.3085, lng: 76.6490 },
  { id: 'food_guru_sweets', region_id: 'reg_mysuru', name_i18n: { en: 'Guru Sweet Mart (Inventors of Mysore Pak)', kn: 'ಗುರು ಸ್ವೀಟ್ ಮಾರ್ಟ್ ಮೈಸೂರು', mr: 'गुरु स्वीट मार्ट' }, dish_i18n: { en: 'Authentic Traditional Ghee Mysore Pak', kn: 'ಅಸಲಿ ಸಾಂಪ್ರದಾಯಿಕ ತುಪ್ಪದ ಮೈಸೂರು ಪಾಕ್', mr: 'अस्सल म्हैसूर पाक' }, veg: true, avg_cost_inr: 80, lat: 12.3095, lng: 76.6520 },
  { id: 'food_maddur_tiffany', region_id: 'reg_mysuru', name_i18n: { en: 'Maddur Tiffany Highway Stop', kn: 'ಮದ್ದೂರು ಟಿಫಾನಿಸ್ ಹೆದ್ದಾರಿ ನಿಲ್ದಾಣ', mr: 'मद्दूर टिफिन' }, dish_i18n: { en: 'Original GI-Tagged Crispy Maddur Vada', kn: 'ಅಸಲಿ ಮದ್ದೂರು ವಡೆ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ', mr: 'गरमागरम मद्दूर वडा' }, veg: true, avg_cost_inr: 60, lat: 12.5840, lng: 77.0420 },
  { id: 'food_gayatri_tiffin', region_id: 'reg_mysuru', name_i18n: { en: 'Gayatri Tiffin Room (GTR) Chamundipuram', kn: 'ಗಾಯತ್ರಿ ಟಿಫಿನ್ ರೂಮ್ ಮೈಸೂರು', mr: 'गायत्री टिफिन रूम' }, dish_i18n: { en: 'Khara Bath, Kesari Bath & Filter Kaapi', kn: 'ಖಾರಾ ಬಾತ್, ಕೇಸರಿ ಬಾತ್ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ', mr: 'उपमा आणि शिरा' }, veg: true, avg_cost_inr: 70, lat: 12.2980, lng: 76.6540 },
  { id: 'food_hanumanthu_mysuru', region_id: 'reg_mysuru', name_i18n: { en: 'Hotel Hanumanthu 1930 Mandi Mohalla', kn: 'ಹೋಟೆಲ್ ಹನುಮಂತು ಮೈಸೂರು', mr: 'हॉटेल हनुमंतू' }, dish_i18n: { en: 'Mysore Mutton Pulao in Banana Leaf', kn: 'ಮೈಸೂರು ಮಟನ್ ಪುಲಾವ್ ಮತ್ತು ಬೋಟಿ ಸಾರು', mr: 'म्हैसूर मटन पुलाव' }, veg: false, avg_cost_inr: 250, lat: 12.3180, lng: 76.6510 },
  { id: 'food_brahmin_soda', region_id: 'reg_mysuru', name_i18n: { en: 'Brahmin Soda Factory Old Statue', kn: 'ಬ್ರಾಹ್ಮಿನ್ ಸೋಡಾ ಫ್ಯಾಕ್ಟರಿ', mr: 'सोडा फॅक्टरी' }, dish_i18n: { en: 'Fizzy Ginger Masala Soda & Nannari Sherbet', kn: 'ಶುಂಠಿ ಮಸಾಲೆ ಸೋಡಾ ಮತ್ತು ನನ್ನಾರಿ ಶರಬತ್', mr: 'मसाला सोडा' }, veg: true, avg_cost_inr: 30, lat: 12.3080, lng: 76.6518 },
  { id: 'food_shivamalli_dosa', region_id: 'reg_mysuru', name_i18n: { en: 'Hotel Shivamalli Mysore Express', kn: 'ಹೋಟೆಲ್ ಶಿವಮಲ್ಲಿ', mr: 'हॉटेल शिवमल्ली' }, dish_i18n: { en: 'Open Butter Dosa with Potato Sagu', kn: 'ಓಪನ್ ಬಟರ್ ದೋಸೆ ಮತ್ತು ಆಲೂ ಸಾಗು', mr: 'बटर डोसा आणि सागू' }, veg: true, avg_cost_inr: 85, lat: 12.3150, lng: 76.6450 },

  // Coorg & Chikkamagaluru
  { id: 'food_coorg_cuisine', region_id: 'reg_coorg', name_i18n: { en: 'Coorg Traditional Kitchen Madikeri', kn: 'ಕೊಡಗು ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ಮನೆ ಮಡಿಕೇರಿ', mr: 'कूर्ग पारंपारिक किचन' }, dish_i18n: { en: 'Akki Rotti with Bamboo Shoot Curry / Kadambuttu', kn: 'ಅಕ್ಕಿ ರೊಟ್ಟಿ, ಕಣಿಲೆ ಪಲ್ಯ ಮತ್ತು ಕಾದಂಬುಟ್ಟು', mr: 'अक्की रोटी आणि बांबू करी' }, veg: true, avg_cost_inr: 180, lat: 12.4210, lng: 75.7380 },
  { id: 'food_taste_of_coorg', region_id: 'reg_coorg', name_i18n: { en: 'Taste of Coorg Club Road', kn: 'ಟೇಸ್ಟ್ ಆಫ್ ಕೊಡಗು', mr: 'टेस्ट ऑफ कूर्ग' }, dish_i18n: { en: 'Traditional Coorg Pandi Curry with Steamed Kadambuttu', kn: 'ಕೊಡಗಿನ ಪ್ರಸಿದ್ಧ ಪಾಂದಿ ಕರಿ ಮತ್ತು ಕಾದಂಬುಟ್ಟು', mr: 'पारंपारिक पांदी करी' }, veg: false, avg_cost_inr: 260, lat: 12.4230, lng: 75.7370 },
  { id: 'food_coffee_cup_chik', region_id: 'reg_coorg', name_i18n: { en: 'The Coffee Cup Estate Cafe Chikkamagaluru', kn: 'ದಿ ಕಾಫಿ ಕಪ್ ಚಿಕ್ಕಮಗಳೂರು', mr: 'द कॉफी कप' }, dish_i18n: { en: 'Artisanal Single-Origin Arabica Pour-Over & Banana Cake', kn: 'ಅರೇಬಿಕಾ ಫಿಲ್ಟರ್ ಕಾಫಿ ಮತ್ತು ಬನಾನ ಕೇಕ್', mr: 'अरेबिका कॉफी आणि केक' }, veg: true, avg_cost_inr: 140, lat: 13.3180, lng: 75.7680 },
  { id: 'food_town_canteen_chik', region_id: 'reg_coorg', name_i18n: { en: 'Town Canteen Chikkamagaluru (Since 1965)', kn: 'ಟೌನ್ ಕ್ಯಾಂಟೀನ್ ಚಿಕ್ಕಮಗಳೂರು', mr: 'टाऊन कॅन्टीन' }, dish_i18n: { en: 'Legendary Gulab Jamun & Crisp Benne Masale', kn: 'ಗುಲಾಬ್ ಜಾಮೂನ್ ಮತ್ತು ಬೆಣ್ಣೆ ಮಸಾಲೆ ದೋಸೆ', mr: 'गुलाब जामुन आणि डोसा' }, veg: true, avg_cost_inr: 95, lat: 13.3220, lng: 75.7740 },
  { id: 'food_bylakuppe_tibetan', region_id: 'reg_coorg', name_i18n: { en: 'Tibetan Potala Kitchen Bylakuppe', kn: 'ಟಿಬೆಟಿಯನ್ ಪೊಟಾಲ ಕಿಚನ್ ಬೈಲಕುಪ್ಪೆ', mr: 'तिबेटी पोताला किचन' }, dish_i18n: { en: 'Steamed Vegetable Momos with Clear Thukpa Soup', kn: 'ತರಕಾರಿ ಮೊಮೋಸ್ ಮತ್ತು ತುಕ್ಪಾ ಸೂಪ್', mr: 'मोमोज आणि थुकपा सूप' }, veg: true, avg_cost_inr: 130, lat: 12.4310, lng: 75.9650 },
  { id: 'food_devaraj_mess_madikeri', region_id: 'reg_coorg', name_i18n: { en: 'Devaraj Mess Bus Stand Madikeri', kn: 'ದೇವರಾಜ್ ಮೆಸ್ ಮಡಿಕೇರಿ', mr: 'देवराज मेस' }, dish_i18n: { en: 'Noolputtu (String Hoppers) with Chicken Curry', kn: 'ನೂಲ್ಪುಟ್ಟು ಮತ್ತು ನಾಟಿಕೋಳಿ ಸಾರು', mr: 'नूलपुट्टू आणि चिकन करी' }, veg: false, avg_cost_inr: 210, lat: 12.4200, lng: 75.7410 },
  { id: 'food_woodlands_madikeri', region_id: 'reg_coorg', name_i18n: { en: 'Hotel Woodlands Veg Madikeri', kn: 'ಹೋಟೆಲ್ ವುಡ್‌ಲ್ಯಾಂಡ್ಸ್ ಮಡಿಕೇರಿ', mr: 'हॉटेल वूडलँड्स' }, dish_i18n: { en: 'South Indian Filter Coffee and Neer Dosa', kn: 'ನೀರು ದೋಸೆ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ', mr: 'नीर डोसा आणि कॉफी' }, veg: true, avg_cost_inr: 85, lat: 12.4220, lng: 75.7390 },
  { id: 'food_sri_krishna_bhavan_chik', region_id: 'reg_coorg', name_i18n: { en: 'Sri Krishna Bhavan MG Road Chikkamagaluru', kn: 'ಶ್ರೀ ಕೃಷ್ಣ ಭವನ ಚಿಕ್ಕಮಗಳೂರು', mr: 'श्रीकृष्ण भवन' }, dish_i18n: { en: 'Akki Shavige with Sweet Coconut Milk', kn: 'ಅಕ್ಕಿ ಶಾವಿಗೆ ಮತ್ತು ಸಿಹಿ ಕಾಯಿಹಾಲು', mr: 'शेवया आणि नारळाचे दूध' }, veg: true, avg_cost_inr: 90, lat: 13.3190, lng: 75.7710 },

  // Coast (Udupi & Gokarna)
  { id: 'food_mitra_samaja_udupi', region_id: 'reg_coast', name_i18n: { en: 'Mitra Samaj Temple Square Udupi', kn: 'ಮಿತ್ರ ಸಮಾಜ ಉಡುಪಿ ರಥಬೀದಿ', mr: 'मित्र समाज उडुपी' }, dish_i18n: { en: 'Goli Baje, Masala Dosa & Pure Filter Coffee', kn: 'ಉಡುಪಿ ಗೋಳಿಬಜೆ, ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ', mr: 'उडुपी गोळी भजी आणि डोसा' }, veg: true, avg_cost_inr: 85, lat: 13.3412, lng: 74.7515 },
  { id: 'food_thamboolam_udupi', region_id: 'reg_coast', name_i18n: { en: 'Thamboolam Coastal Dining Udupi', kn: 'ತಾಂಬೂಲಂ ಕೋಸ್ಟಲ್ ಡೈನಿಂಗ್ ಉಡುಪಿ', mr: 'तांबूलम कोस्टल' }, dish_i18n: { en: 'Anjal (Kingfish) Tawa Fry & Soft Neer Dosa', kn: 'ಅಂಜಲ್ ತವಾ ಫ್ರೈ ಮತ್ತು ಮೃದು ನೀರು ದೋಸೆ', mr: 'सुरमई तवा फ्राय आणि नीर डोसा' }, veg: false, avg_cost_inr: 280, lat: 13.3440, lng: 74.7480 },
  { id: 'food_pai_tiffin_gokarna', region_id: 'reg_coast', name_i18n: { en: 'Pai Tiffin Home Car Street Gokarna', kn: 'ಪೈ ಟಿಫಿನ್ ಹೋಮ್ ಗೋಕರ್ಣ', mr: 'पाई टिफिन होम' }, dish_i18n: { en: 'Mangalore Buns with Spicy Chana Gassi', kn: 'ಮಂಗಳೂರು ಬನ್ಸ್ ಮತ್ತು ಕಡಲೆ ಗಸ್ಸಿ', mr: 'मंगळूर बन्स आणि चणा उसळ' }, veg: true, avg_cost_inr: 70, lat: 14.5420, lng: 74.3190 },
  { id: 'food_prema_restaurant_gokarna', region_id: 'reg_coast', name_i18n: { en: 'Prema Restaurant Beach Road Gokarna', kn: 'ಪ್ರೇಮಾ ರೆಸ್ಟೋರೆಂಟ್ ಗೋಕರ್ಣ', mr: 'प्रेमा रेस्टॉरंट' }, dish_i18n: { en: 'Fresh Coconut Gadbad Ice Cream & Thali', kn: 'ಗಡ್‌ಬಡ್ ಐಸ್‌ಕ್ರೀಮ್ ಮತ್ತು ಸಸ್ಯಾಹಾರಿ ಊಟ', mr: 'गडबड आईस्क्रीम आणि थाळी' }, veg: true, avg_cost_inr: 120, lat: 14.5440, lng: 74.3160 },
  { id: 'food_machali_karwar', region_id: 'reg_coast', name_i18n: { en: 'Amrut Karwar Coastal Kitchen', kn: 'ಅಮೃತ್ ಕಾರವಾರ ಕೋಸ್ಟಲ್ ಕಿಚನ್', mr: 'अमृत कारवार' }, dish_i18n: { en: 'Karwar Fish Curry Meals with Tisrya Masala (Clams)', kn: 'ಕಾರವಾರ ಮೀನು ಸಾರು ಊಟ ಮತ್ತು ಚಿಪ್ಪುಮೀನು ಮಸಾಲೆ', mr: 'कारवारी मासळी थाळी' }, veg: false, avg_cost_inr: 240, lat: 14.8120, lng: 74.1310 },
  { id: 'food_diana_udupi', region_id: 'reg_coast', name_i18n: { en: 'Hotel Diana Udupi (Home of Gadbad)', kn: 'ಹೋಟೆಲ್ ಡಯಾನಾ ಉಡುಪಿ (ಗಡ್‌ಬಡ್ ಜನಕರು)', mr: 'हॉटेल डायना उडुपी' }, dish_i18n: { en: 'Original 1970s Invention: Layered Udupi Gadbad Ice Cream', kn: 'ಅಸಲಿ ಉಡುಪಿ ಗಡ್‌ಬಡ್ ಐಸ್‌ಕ್ರೀಮ್', mr: 'अस्सल गडबड आईस्क्रीम' }, veg: true, avg_cost_inr: 95, lat: 13.3390, lng: 74.7470 },
  { id: 'food_woodlands_udupi', region_id: 'reg_coast', name_i18n: { en: 'Woodlands Satvik Dining Udupi', kn: 'ವುಡ್‌ಲ್ಯಾಂಡ್ಸ್ ಸಾತ್ವಿಕ ಭೋಜನ ಉಡುಪಿ', mr: 'वूडलँड्स सात्विक भोजनालय' }, dish_i18n: { en: 'Traditional Plantain Leaf Udupi Brahmin Lunch', kn: 'ಬಾಳೆ ಎಲೆ ಊಟ, ಸಾರು, ಹುಳಿ ಮತ್ತು ಪಾಯಸ', mr: 'केळीच्या पानावरील सात्विक जेवण' }, veg: true, avg_cost_inr: 160, lat: 13.3420, lng: 74.7500 },
  { id: 'food_bhatkal_biryani', region_id: 'reg_coast', name_i18n: { en: 'Kwality Navayathi Dining Bhatkal', kn: 'ಕ್ವಾಲಿಟಿ ನವಾಯಿತಿ ಊಟ ಭಟ್ಕಳ', mr: 'भटकळ बिर्याणी' }, dish_i18n: { en: 'Authentic White Masala Bhatkali Chicken Biryani', kn: 'ಅಸಲಿ ಬಿಳಿ ಮಸಾಲೆ ಭಟ್ಕಳಿ ಬಿರಿಯಾನಿ', mr: 'अस्सल भटकळी बिर्याणी' }, veg: false, avg_cost_inr: 220, lat: 13.9850, lng: 74.5510 },

  // North Karnataka (Hubballi, Vijayapura, Kalaburagi)
  { id: 'food_mishra_pedha', region_id: 'reg_north', name_i18n: { en: 'Mishra Pedha & Khanavali Hubballi', kn: 'ಮಿಶ್ರಾ ಪೇಡಾ ಮತ್ತು ಖಾನಾವಳಿ ಹುಬ್ಬಳ್ಳಿ', mr: 'मिश्रा पेढा' }, dish_i18n: { en: 'Authentic Dharwad Pedha & Jolada Rotti Oota', kn: 'ಅಸಲಿ ಧಾರವಾಡ ಪೇಡಾ ಮತ್ತು ಜೋಳದ ರೊಟ್ಟಿ ಊಟ', mr: 'धारवाड पेढा आणि ज्वारीची भाकरी' }, veg: true, avg_cost_inr: 140, lat: 15.3647, lng: 75.1240 },
  { id: 'food_davangere_benne_dosa', region_id: 'reg_north', name_i18n: { en: 'Sagar Benne Dosa Hubballi Circle', kn: 'ಸಾಗರ್ ಬೆಣ್ಣೆ ದೋಸೆ ಹುಬ್ಬಳ್ಳಿ', mr: 'दावणगेरे बटर डोसा' }, dish_i18n: { en: 'GI-Famous Davangere Benne Dosa with Aloo Palya', kn: 'ದಾವಣಗೆರೆ ಬೆಣ್ಣೆ ದೋಸೆ ಮತ್ತು ಆಲೂಗೆಡ್ಡೆ ಪಲ್ಯ', mr: 'लोणी डोसा आणि बटाटा भाजी' }, veg: true, avg_cost_inr: 80, lat: 15.3590, lng: 75.1380 },
  { id: 'food_vijayapura_khanavali', region_id: 'reg_north', name_i18n: { en: 'Basaveshwara Khanavali Vijayapura', kn: 'ಬಸವೇಶ್ವರ ಖಾನಾವಳಿ ವಿಜಯಪುರ', mr: 'बसवेश्वर खानावळ विजापूर' }, dish_i18n: { en: 'North Karnataka Jolada Rotti, Shenga Chutney & Jhunka', kn: 'ಜೋಳದ ರೊಟ್ಟಿ, ಶೇಂಗಾ ಚಟ್ನಿ ಮತ್ತು ಜುಣಕ', mr: 'ज्वारीची भाकरी आणि झुणका' }, veg: true, avg_cost_inr: 120, lat: 16.8310, lng: 75.7180 },
  { id: 'food_kalaburagi_malpuri', region_id: 'reg_north', name_i18n: { en: 'Siddharth Sweet Stall Kalaburagi', kn: 'ಸಿದ್ಧಾರ್ಥ ಸ್ವೀಟ್ಸ್ ಕಲಬುರಗಿ', mr: 'सिद्धार्थ स्वीट्स कलबुर्गी' }, dish_i18n: { en: 'Famous Kalaburagi Malpuri & Mawa Khaja', kn: 'ಕಲಬುರಗಿ ಮಾಲ್‌ಪುರಿ ಮತ್ತು ಮಾವಾ ಖಾಜಾ', mr: 'कलबुर्गी मालपोआ आणि खवा खाजा' }, veg: true, avg_cost_inr: 65, lat: 17.3380, lng: 76.8290 },
  { id: 'food_line_bazaar_pedha', region_id: 'reg_north', name_i18n: { en: 'Thakur Line Bazaar Pedha Dharwad', kn: 'ಠಾಕೂರ್ ಲೈನ್ ಬಜಾರ್ ಪೇಡಾ ಧಾರವಾಡ', mr: 'ठाकूर पेढा धारवाड' }, dish_i18n: { en: 'GI Heritage Babu Singh Thakur Dharwad Pedha', kn: 'ಬಾಬು ಸಿಂಗ್ ಠಾಕೂರ್ ಅಸಲಿ ಧಾರವಾಡ ಪೇಡಾ', mr: 'अस्सल धारवाड पेढा' }, veg: true, avg_cost_inr: 90, lat: 15.4590, lng: 75.0080 },
  { id: 'food_ilkal_tea', region_id: 'reg_north', name_i18n: { en: 'Ilkal Chowk Tea & Girmit Stall', kn: 'ಇಲಕಲ್ ಚೌಕ್ ಟೀ ಮತ್ತು ಗಿರ್ಮಿಟ್ ಅಂಗಡಿ', mr: 'गिरमिट आणि चहा' }, dish_i18n: { en: 'Spicy North Karnataka Girmit with Mirchi Bajji', kn: 'ಉತ್ತರ ಕರ್ನಾಟಕದ ಖಾರ ಗಿರ್ಮಿಟ್ ಮತ್ತು ಮೆಣಸಿನಕಾಯಿ ಬಜ್ಜಿ', mr: 'मसालेदार गिरमिट आणि भजी' }, veg: true, avg_cost_inr: 40, lat: 15.9620, lng: 76.1210 },
  { id: 'food_badami_chutney_pudi', region_id: 'reg_north', name_i18n: { en: 'Chalukya Rural Kitchen Station Road Badami', kn: 'ಚಾಲುಕ್ಯ ಗ್ರಾಮೀಣ ಅಡುಗೆ ಮನೆ ಬದಾಮಿ', mr: 'चालुक्य किचन बदामी' }, dish_i18n: { en: 'Freshly Pounded Shenga & Agasi (Flaxseed) Chutney Meals', kn: 'ಶೇಂಗಾ ಮತ್ತು ಅಗಸಿ ಚಟ್ನಿ ಪುಡಿ ರೊಟ್ಟಿ ಊಟ', mr: 'ज्वारीची भाकरी आणि जवस चटणी' }, veg: true, avg_cost_inr: 110, lat: 15.9210, lng: 75.6840 },
  { id: 'food_kalaburagi_tahri', region_id: 'reg_north', name_i18n: { en: 'Gulbarga Dastarkhwan Heritage Dining', kn: 'ಗುಲ್ಬರ್ಗಾ ದಸ್ತರ್‌ಖಾನ್ ಕಲಬುರಗಿ', mr: 'कलबुर्गी दस्तरखान' }, dish_i18n: { en: 'Deccan Mutton Tahri cooked in fragrant basmati', kn: 'ದಖನಿ ಮಟನ್ ತೆಹರಿ', mr: 'दख्खनी मटन ताहरी' }, veg: false, avg_cost_inr: 220, lat: 17.3350, lng: 76.8340 }
];

// --- 20 TRANSPORT LEGS ---
export const SEED_TRANSPORT_LEGS: TransportLeg[] = [
  // Bengaluru to Hosapete / Hampi
  {
    id: 'leg_beng_hampi_ksrtc_exp',
    from_name: 'Bengaluru (Majestic / Kempegowda)',
    to_name: 'Hosapete / Hampi',
    mode: 'bus',
    operator: 'KSRTC (Karnataka Sarige)',
    service_class: 'express',
    depart: '06:30',
    arrive: '13:45',
    duration_min: 435,
    stops: 6,
    runs_on: 'Daily',
    fare_inr: 460,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Central Timetable',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_hampi_ksrtc_ord',
    from_name: 'Bengaluru (Kempegowda)',
    to_name: 'Hosapete / Hampi',
    mode: 'bus',
    operator: 'KSRTC (Gramantara)',
    service_class: 'ordinary',
    depart: '08:15',
    arrive: '16:00',
    duration_min: 465,
    stops: 11,
    runs_on: 'Daily',
    fare_inr: 380,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Central Timetable',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_hampi_ksrtc_airavat',
    from_name: 'Bengaluru (Shantinagar)',
    to_name: 'Hosapete (Hampi)',
    mode: 'bus',
    operator: 'KSRTC (Airavat Club Class AC)',
    service_class: 'ac',
    depart: '22:30',
    arrive: '05:30',
    duration_min: 420,
    stops: 3,
    runs_on: 'Daily',
    fare_inr: 890,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Premier Services',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_hampi_vrl_sleeper',
    from_name: 'Bengaluru (Anand Rao Circle)',
    to_name: 'Hampi (Bazaar Stand)',
    mode: 'bus',
    operator: 'VRL Travels (Private Sleeper)',
    service_class: 'ac_sleeper',
    depart: '23:00',
    arrive: '06:00',
    duration_min: 420,
    stops: 2,
    runs_on: 'Daily',
    fare_inr: 1050,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.vrlbus.in',
    source: 'Sample data: VRL Schedule',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_hampi_beng_ksrtc_return_last',
    from_name: 'Hosapete / Hampi',
    to_name: 'Bengaluru (Majestic)',
    mode: 'bus',
    operator: 'KSRTC (Rajahamsa / Express)',
    service_class: 'express',
    depart: '21:30',
    arrive: '05:15',
    duration_min: 465,
    stops: 5,
    runs_on: 'Daily',
    fare_inr: 510,
    shakti_eligible: true,
    last_bus: true,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Depot Hosapete',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_hampi_train_hampi_exp',
    from_name: 'KSR Bengaluru City (SBC)',
    to_name: 'Hosapete Jn (HPT)',
    mode: 'train',
    operator: 'Indian Railways (Hampi Express 16592)',
    service_class: 'non_ac',
    depart: '21:50',
    arrive: '07:10',
    duration_min: 560,
    stops: 14,
    runs_on: 'Daily',
    fare_inr: 295,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.irctc.co.in',
    source: 'Sample data: IRCTC Train Schedule',
    last_checked: TODAY,
    verified: 0
  },

  // Bengaluru to Mysuru
  {
    id: 'leg_beng_mys_ksrtc_exp',
    from_name: 'Bengaluru (Satellite Bus Stand)',
    to_name: 'Mysuru (Suburban Bus Stand)',
    mode: 'bus',
    operator: 'KSRTC (Ashwamedha Point-to-Point)',
    service_class: 'express',
    depart: '07:00',
    arrive: '09:45',
    duration_min: 165,
    stops: 2,
    runs_on: 'Every 15 min',
    fare_inr: 210,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Mysuru Expressway',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_mys_ksrtc_ord',
    from_name: 'Bengaluru (Kengeri)',
    to_name: 'Mysuru (Suburban)',
    mode: 'bus',
    operator: 'KSRTC (Ordinary Karnataka Sarige)',
    service_class: 'ordinary',
    depart: '07:30',
    arrive: '10:45',
    duration_min: 195,
    stops: 8,
    runs_on: 'Every 20 min',
    fare_inr: 175,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Express Division',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_mys_beng_ksrtc_return_last',
    from_name: 'Mysuru (Suburban)',
    to_name: 'Bengaluru (Majestic)',
    mode: 'bus',
    operator: 'KSRTC (Express)',
    service_class: 'express',
    depart: '23:30',
    arrive: '02:15',
    duration_min: 165,
    stops: 2,
    runs_on: 'Daily',
    fare_inr: 210,
    shakti_eligible: true,
    last_bus: true,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Central Depot',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_mys_train_chamundi',
    from_name: 'KSR Bengaluru (SBC)',
    to_name: 'Mysuru Jn (MYS)',
    mode: 'train',
    operator: 'Indian Railways (Chamundi Express 16216)',
    service_class: 'non_ac',
    depart: '18:15',
    arrive: '21:05',
    duration_min: 170,
    stops: 6,
    runs_on: 'Daily',
    fare_inr: 95,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.irctc.co.in',
    source: 'Sample data: South Western Railway',
    last_checked: TODAY,
    verified: 0
  },

  // Mysuru to Madikeri (Coorg)
  {
    id: 'leg_mys_coorg_ksrtc_exp',
    from_name: 'Mysuru (Suburban Bus Stand)',
    to_name: 'Madikeri (Coorg Bus Stand)',
    mode: 'bus',
    operator: 'KSRTC (Express)',
    service_class: 'express',
    depart: '08:30',
    arrive: '11:45',
    duration_min: 195,
    stops: 4,
    runs_on: 'Every 30 min',
    fare_inr: 165,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Madikeri Depot',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_coorg_mys_ksrtc_return_last',
    from_name: 'Madikeri (Coorg Stand)',
    to_name: 'Mysuru / Bengaluru',
    mode: 'bus',
    operator: 'KSRTC (Express)',
    service_class: 'express',
    depart: '20:15',
    arrive: '23:30',
    duration_min: 195,
    stops: 4,
    runs_on: 'Daily',
    fare_inr: 165,
    shakti_eligible: true,
    last_bus: true,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Madikeri Depot',
    last_checked: TODAY,
    verified: 0
  },

  // Bengaluru to Coast (Udupi / Gokarna)
  {
    id: 'leg_beng_udupi_ksrtc_exp',
    from_name: 'Bengaluru (Majestic)',
    to_name: 'Udupi (City Service Bus Stand)',
    mode: 'bus',
    operator: 'KSRTC (Karnataka Sarige Express)',
    service_class: 'express',
    depart: '07:15',
    arrive: '16:00',
    duration_min: 525,
    stops: 8,
    runs_on: 'Daily',
    fare_inr: 495,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Mangaluru Division',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_udupi_ac_sleeper',
    from_name: 'Bengaluru (Navrang Circle)',
    to_name: 'Udupi (Service Bus Stand)',
    mode: 'bus',
    operator: 'Durgamba Motors (AC Sleeper)',
    service_class: 'ac_sleeper',
    depart: '22:00',
    arrive: '06:15',
    duration_min: 495,
    stops: 3,
    runs_on: 'Daily',
    fare_inr: 1100,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.durgamba.net',
    source: 'Sample data: Private Operators Coastal',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_udupi_beng_ksrtc_return_last',
    from_name: 'Udupi (Service Bus Stand)',
    to_name: 'Bengaluru (Majestic)',
    mode: 'bus',
    operator: 'KSRTC (Express)',
    service_class: 'express',
    depart: '21:00',
    arrive: '05:45',
    duration_min: 525,
    stops: 7,
    runs_on: 'Daily',
    fare_inr: 495,
    shakti_eligible: true,
    last_bus: true,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: KSRTC Mangaluru',
    last_checked: TODAY,
    verified: 0
  },

  // Hubballi to Badami & Vijayapura
  {
    id: 'leg_hubballi_badami_ksrtc',
    from_name: 'Hubballi (CBT)',
    to_name: 'Badami (Bus Stand)',
    mode: 'bus',
    operator: 'NWKRTC (North Western Express)',
    service_class: 'express',
    depart: '07:45',
    arrive: '10:30',
    duration_min: 165,
    stops: 4,
    runs_on: 'Every 45 min',
    fare_inr: 135,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: NWKRTC Hubballi Division',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_badami_hubballi_ksrtc_return',
    from_name: 'Badami (Bus Stand)',
    to_name: 'Hubballi (CBT)',
    mode: 'bus',
    operator: 'NWKRTC (Express)',
    service_class: 'express',
    depart: '20:30',
    arrive: '23:15',
    duration_min: 165,
    stops: 4,
    runs_on: 'Daily',
    fare_inr: 135,
    shakti_eligible: true,
    last_bus: true,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: NWKRTC',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_hubballi_vijayapura_ksrtc',
    from_name: 'Hubballi (Gokul Road)',
    to_name: 'Vijayapura (Central Bus Stand)',
    mode: 'bus',
    operator: 'NWKRTC (Express)',
    service_class: 'express',
    depart: '08:00',
    arrive: '12:30',
    duration_min: 270,
    stops: 5,
    runs_on: 'Hourly',
    fare_inr: 235,
    shakti_eligible: true,
    last_bus: false,
    booking_url: 'https://www.ksrtc.in',
    source: 'Sample data: NWKRTC',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_kalaburagi_train',
    from_name: 'KSR Bengaluru (SBC)',
    to_name: 'Kalaburagi Jn (KLBG)',
    mode: 'train',
    operator: 'Indian Railways (Udyan Express 11302)',
    service_class: 'non_ac',
    depart: '20:40',
    arrive: '07:05',
    duration_min: 625,
    stops: 12,
    runs_on: 'Daily',
    fare_inr: 340,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.irctc.co.in',
    source: 'Sample data: South Western Railway',
    last_checked: TODAY,
    verified: 0
  },
  {
    id: 'leg_beng_hampi_cab_private',
    from_name: 'Bengaluru Airport / City',
    to_name: 'Hampi Heritage Zone',
    mode: 'cab',
    operator: 'Karnataka Tourist Taxi Association (Sedan)',
    service_class: 'ac',
    depart: 'On Demand',
    arrive: 'Flexible',
    duration_min: 360,
    stops: 1,
    runs_on: '24x7',
    fare_inr: 5800,
    shakti_eligible: false,
    last_bus: false,
    booking_url: 'https://www.kstdc.co',
    source: 'Sample data: KSTDC Taxi Desk',
    last_checked: TODAY,
    verified: 0
  }
];
