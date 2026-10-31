import { Trip, Day, TripItem } from './types';

export const SEED_HAMPI_TRIP: Trip = {
  id: 'trip_hampi_3d',
  title: 'Hampi Heritage & Boulders',
  destination: 'Hampi',
  destinationId: 'dest-hampi',
  totalDays: 3,
  estimatedBudget: 6000,
  travelStyle: 'Cultural Explorer',
  heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1200&q=80',
  tags: ['Heritage', 'Adventure', 'Culture'],
  days: [
    {
      dayNumber: 1,
      summary: 'Sacred Centre & Virupaksha Bazaar',
      items: [
        {
          time: '08:30',
          attractionId: 'virupaksha',
          title: 'Virupaksha Temple & Ghats',
          category: 'temple',
          estimatedCost: 0,
          durationMinutes: 90,
          reason: 'Best early morning light, fewer crowds, and active morning puja chants.',
          tags: ['Sacred morning', 'Free entry'],
          travelToNextMinutes: 15
        },
        {
          time: '10:30',
          attractionId: 'hema-kuta',
          title: 'Hemakuta Hill Monolithic Ganeshas',
          category: 'heritage',
          estimatedCost: 0,
          durationMinutes: 75,
          reason: 'Cluster of pre-Vijayanagara stone shrines overlooking the river valley.',
          tags: ['Panoramic vista', 'Gentle climb'],
          travelToNextMinutes: 20
        },
        {
          time: '12:30',
          attractionId: 'mango-tree',
          title: 'Authentic South Indian Thali at Mango Tree',
          category: 'food',
          estimatedCost: 240,
          durationMinutes: 60,
          reason: 'Iconic backpacker café serving fresh banana-leaf meals and filter coffee.',
          tags: ['Local flavours', 'Rest stop'],
          travelToNextMinutes: 30
        },
        {
          time: '14:30',
          attractionId: 'krishna-temple',
          title: 'Krishna Temple Complex & Sacred Tank',
          category: 'temple',
          estimatedCost: 0,
          durationMinutes: 60,
          reason: 'Remarkable carved pillars depicting mythical Yali creatures and sacred stepwell.',
          tags: ['Intricate carvings', 'Quiet courtyard'],
          travelToNextMinutes: 35
        },
        {
          time: '16:30',
          attractionId: 'matanga-sunset',
          title: 'Matanga Hill Golden Hour Sunset',
          category: 'viewpoint',
          estimatedCost: 0,
          durationMinutes: 90,
          reason: 'The highest elevation in central Hampi offering 360-degree golden hour boulder views.',
          tags: ['Sunset icon', '360° view']
        }
      ]
    },
    {
      dayNumber: 2,
      summary: 'Royal Enclosure & Vittala Chariot',
      items: [
        {
          time: '09:00',
          attractionId: 'vittala',
          title: 'Vijaya Vittala & Stone Chariot',
          category: 'heritage',
          estimatedCost: 40,
          durationMinutes: 120,
          reason: 'Pinnacle of Vijayanagara architecture with 56 musical pillars and iconic chariot.',
          tags: ['ASI Monument', 'Must visit'],
          travelToNextMinutes: 25
        },
        {
          time: '11:45',
          attractionId: 'lotus-mahal',
          title: 'Lotus Mahal & Zenana Enclosure',
          category: 'heritage',
          estimatedCost: 40,
          durationMinutes: 60,
          reason: 'Indo-Islamic pavilion built for royal women, remarkably preserved.',
          tags: ['Royal quarters', 'Shaded lawns'],
          travelToNextMinutes: 10
        },
        {
          time: '12:55',
          attractionId: 'elephant-stables',
          title: 'Royal Elephant Stables',
          category: 'heritage',
          estimatedCost: 0,
          durationMinutes: 45,
          reason: 'Eleven domed chambers where royal elephants were housed in the 15th century.',
          tags: ['Grand architecture', 'High domes'],
          travelToNextMinutes: 30
        },
        {
          time: '14:30',
          attractionId: 'mayura-lunch',
          title: 'KSTDC Hotel Mayura Bhuvaneshwari Lunch',
          category: 'food',
          estimatedCost: 320,
          durationMinutes: 60,
          reason: 'Air-conditioned dining with reliable North Karnataka jolada rotti meals.',
          tags: ['AC comfort', 'KSTDC certified'],
          travelToNextMinutes: 40
        },
        {
          time: '16:30',
          attractionId: 'queen-bath',
          title: "Queen's Bath & Royal Stepwell (Pushkarani)",
          category: 'heritage',
          estimatedCost: 0,
          durationMinutes: 60,
          reason: 'Geometric stepped tank fed by ancient stone aqueducts.',
          tags: ['Ancient engineering', 'Stepped architecture']
        }
      ]
    },
    {
      dayNumber: 3,
      summary: 'Anegundi, Sanapur Lake & Coracle Ride',
      items: [
        {
          time: '08:30',
          attractionId: 'tungabhadra-coracle',
          title: 'Tungabhadra River Coracle Crossing',
          category: 'nature',
          estimatedCost: 100,
          durationMinutes: 45,
          reason: 'Traditional circular woven boat gliding along granite boulder river rapids.',
          tags: ['River adventure', 'Local boatmen'],
          travelToNextMinutes: 20
        },
        {
          time: '10:00',
          attractionId: 'anegundi-village',
          title: 'Anegundi Heritage Village Walk',
          category: 'heritage',
          estimatedCost: 0,
          durationMinutes: 90,
          reason: 'Mythological Kishkindha realm predating Hampi by centuries, quiet village craft lanes.',
          tags: ['Living heritage', 'Rural Karnataka'],
          travelToNextMinutes: 25
        },
        {
          time: '12:30',
          attractionId: 'laughing-buddha',
          title: 'Lakeside Café Chilled Coconut & Roti',
          category: 'food',
          estimatedCost: 280,
          durationMinutes: 70,
          reason: 'Relaxed bohemian seating overlooking paddy fields and granite hills.',
          tags: ['Paddy views', 'Chill vibes'],
          travelToNextMinutes: 30
        },
        {
          time: '14:30',
          attractionId: 'sanapur-lake',
          title: 'Sanapur Lake Cliff & Coracle Ride',
          category: 'nature',
          estimatedCost: 150,
          durationMinutes: 90,
          reason: 'Scenic reservoir formed naturally among giant boulders, ideal for calm waters.',
          tags: ['Nature reserve', 'Breathtaking blue'],
          travelToNextMinutes: 30
        },
        {
          time: '17:00',
          attractionId: 'anjeyanadri-hill',
          title: 'Anjanadri Hill Sunset (Birthplace of Hanuman)',
          category: 'viewpoint',
          estimatedCost: 0,
          durationMinutes: 100,
          reason: '575 whitewashed steps leading to summit temple with sweeping views across Tungabhadra.',
          tags: ['Sacred summit', 'Panoramic sunset']
        }
      ]
    }
  ]
};

// TODO: replace with server call (GET /api/trips/:id or Firestore users/{uid}/trips/{id})
export async function getTrip(tripId: string = 'trip_hampi_3d'): Promise<Trip> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In-memory clone to prevent mutation bugs
      const cloned = JSON.parse(JSON.stringify(SEED_HAMPI_TRIP));
      resolve(cloned);
    }, 250);
  });
}

// TODO: replace with server call (POST /api/trips/:id/modify via Gemini)
export async function modifyTrip(tripId: string, instruction: string): Promise<Trip> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!instruction.trim()) {
        reject(new Error('Modification prompt cannot be empty.'));
        return;
      }

      const trip: Trip = JSON.parse(JSON.stringify(SEED_HAMPI_TRIP));
      const lower = instruction.toLowerCase();

      if (lower.includes('relax') || lower.includes('slow') || lower.includes('chill')) {
        // Remove high physical exertion items and reduce pace
        trip.days = trip.days.map((day) => ({
          ...day,
          summary: `${day.summary} (Relaxed Pace)`,
          items: day.items.slice(0, 3).map((item) => ({
            ...item,
            durationMinutes: item.durationMinutes + 30,
            reason: `${item.reason} Extended for a leisurely, stress-free experience.`
          }))
        }));
      } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('free')) {
        // Budget focus: cut down extra paid activities
        trip.estimatedBudget = 4200;
        trip.days = trip.days.map((day) => ({
          ...day,
          summary: `${day.summary} (Budget-Friendly)`,
          items: day.items.map((item) => ({
            ...item,
            estimatedCost: Math.min(item.estimatedCost, 120),
            reason: `${item.reason} Optimized for maximum value on a conservative budget.`
          }))
        }));
      } else if (lower.includes('food') || lower.includes('cuisine') || lower.includes('cafe')) {
        trip.title = 'Hampi Heritage & Culinary Discovery';
        trip.days[0].items.unshift({
          time: '07:30',
          attractionId: 'bazaar-tiffin',
          title: 'Hampi Bazaar Benne Dosa & Filter Kaapi',
          category: 'food',
          estimatedCost: 110,
          durationMinutes: 45,
          reason: 'Crispy butter dosas straight from local charcoal tawas.',
          tags: ['Breakfast hotspot', 'Davangere style'],
          travelToNextMinutes: 15
        });
      } else {
        // Generic customized update
        trip.title = `Hampi Personalized: ${instruction.slice(0, 24)}...`;
        trip.days[0].summary = `Customized Day 1 based on: "${instruction}"`;
      }

      resolve(trip);
    }, 400);
  });
}

// TODO: replace with server call (POST /api/ask-place via Gemini search grounding)
export async function askAboutPlace(
  placeName: string,
  query: string
): Promise<{ answer: string; confidence: number; source: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.toLowerCase();
      let answer = `${placeName} is a celebrated heritage landmark in the Hampi UNESCO precinct. It is maintained by the Archaeological Survey of India (ASI) with open visitor access.`;
      let source = 'KSTDC Tourism & ASI Karnataka Guidelines';

      if (q.includes('dress') || q.includes('clothes') || q.includes('wear')) {
        answer = `Modest clothing covering shoulders and knees is recommended out of respect for active temple shrines at ${placeName}. Comfortable slip-on footwear is best as shoes must be left outside sacred precincts.`;
        source = 'Karnataka Temples Protocol & Travellers Code';
      } else if (q.includes('time') || q.includes('open') || q.includes('hour')) {
        answer = `${placeName} is generally open daily from 06:00 AM to 06:00 PM. Visiting before 09:30 AM or after 04:00 PM is strongly recommended to avoid the harsh boulder heat.`;
        source = 'ASI Hampi Circle Official Timings (Demo Data)';
      } else if (q.includes('guide') || q.includes('audio') || q.includes('ticket')) {
        answer = `Official government-badged guides carrying KSTDC photo IDs are available at the entrance gate (rates typically INR 300–600 for a 2-hour tour). UPI payments and official e-tickets are accepted.`;
        source = 'ASI Official Ticketing Desk';
      } else if (q.includes('child') || q.includes('senior') || q.includes('wheelchair')) {
        answer = `Central paths at ${placeName} are mostly stone-paved, but historical threshold slabs and boulder steps may require assistance for senior travellers and strollers. Shaded rest benches are located near the ASI information kiosk.`;
        source = 'Tiruga Accessibility Audits 2025';
      }

      resolve({
        answer,
        confidence: 0.94,
        source
      });
    }, 350);
  });
}
