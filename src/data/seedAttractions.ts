import { ATTRACTIONS_DATA, getAttractions as fetchAttractions } from '../lib/db';
import { Attraction, Day, TripItem } from './types';

export const SEED_ATTRACTIONS: Attraction[] = ATTRACTIONS_DATA as unknown as Attraction[];

/**
 * Loads attractions for a destination from data/attractions.json via dataSource.
 */
export async function getAttractions(destinationId: string = 'hampi'): Promise<Attraction[]> {
  return fetchAttractions(destinationId);
}

/**
 * Generates an adaptive Plan B for a specific day and simulated weather/crowd condition.
 * TODO: replace with server-side Gemini Plan B agent
 */
export async function generatePlanB(
  day: Day,
  condition: 'Rain' | 'Heat' | 'Crowd'
): Promise<{
  dayNumber: number;
  summary: string;
  items: TripItem[];
  changesExplained: string[];
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items: TripItem[] = [];
      const changesExplained: string[] = [];

      if (condition === 'Rain') {
        changesExplained.push(
          'Replaced open Hemakuta boulder trail with indoor Kamalapur Archaeological Museum',
          'Shifted outdoor riverside walking to covered KSTDC Mayura pavilion and craft center',
          'Scheduled indoor traditional Karnataka thali with sheltered seating'
        );

        items.push(
          {
            time: '09:00',
            attractionId: 'asi-museum',
            title: 'Kamalapur Archaeological Museum (Sheltered)',
            category: 'heritage',
            estimatedCost: 25,
            durationMinutes: 100,
            reason: 'Covered galleries and Vijayanagara models protected from sudden downpours.',
            tags: ['Indoor sanctuary', 'Weather protected'],
            travelToNextMinutes: 15
          },
          {
            time: '11:30',
            attractionId: 'lotus-mahal',
            title: 'Lotus Mahal Arcaded Pavilions',
            category: 'heritage',
            estimatedCost: 40,
            durationMinutes: 75,
            reason: 'Stone vaulted halls with covered overhangs and good rain run-off drainage.',
            tags: ['Covered arches', 'Low mud hazard'],
            travelToNextMinutes: 20
          },
          {
            time: '13:00',
            attractionId: 'mango-tree',
            title: 'Sheltered Garden Lunch at Mango Tree',
            category: 'food',
            estimatedCost: 260,
            durationMinutes: 75,
            reason: 'Enclosed veranda dining with hot piping rasam and Davanagere dose.',
            tags: ['Warm local meals', 'Dry seating'],
            travelToNextMinutes: 25
          },
          {
            time: '15:30',
            attractionId: 'virupaksha',
            title: 'Virupaksha Temple Main Hall (Pillared Mandapa)',
            category: 'temple',
            estimatedCost: 0,
            durationMinutes: 90,
            reason: 'Massive sheltered stone mandapa; rain mist on Tungabhadra river creates a magical sight.',
            tags: ['Covered stone halls', 'Atmospheric rain views']
          }
        );
      } else if (condition === 'Heat') {
        changesExplained.push(
          'Shifted intense boulder climbing to early morning (07:30 AM) before peak sun',
          'Scheduled air-cooled museum galleries during peak heat window (12:30 PM - 03:30 PM)',
          'Moved lake breezes and evening riverside visits to after 04:45 PM'
        );

        items.push(
          {
            time: '07:30',
            attractionId: 'hemakuta',
            title: 'Early Morning Hemakuta Hill Walk',
            category: 'nature',
            estimatedCost: 0,
            durationMinutes: 90,
            reason: 'Pleasant 24°C morning breeze before granite stones absorb solar heat.',
            tags: ['Cool morning', 'Minimum heat stress'],
            travelToNextMinutes: 20
          },
          {
            time: '10:00',
            attractionId: 'virupaksha',
            title: 'Virupaksha Temple & Shaded Corridors',
            category: 'temple',
            estimatedCost: 0,
            durationMinutes: 90,
            reason: 'Cool granite pillars and shaded perimeter colonnade.',
            tags: ['Shaded pathways', 'Water fountain nearby'],
            travelToNextMinutes: 20
          },
          {
            time: '12:30',
            attractionId: 'asi-museum',
            title: 'Kamalapur Museum (Air-Cooled Midday Refuge)',
            category: 'heritage',
            estimatedCost: 25,
            durationMinutes: 120,
            reason: 'Indoor air-cooled halls during the peak 38°C afternoon hours.',
            tags: ['Air-cooled', 'Peak sun avoidance'],
            travelToNextMinutes: 25
          },
          {
            time: '16:30',
            attractionId: 'sanapur-lake',
            title: 'Sanapur Lake Sunset Breeze',
            category: 'nature',
            estimatedCost: 0,
            durationMinutes: 90,
            reason: 'Waterfront cool breeze and shaded cliff backdrop after sun dips.',
            tags: ['Evening cool', 'Tranquil sunset']
          }
        );
      } else {
        // Crowd condition
        changesExplained.push(
          'Re-routed away from Vijaya Vittala main line to quieter Anegundi artisan trails',
          'Replaced congested sunset points with secluded Sanapur boulder view',
          'Selected off-peak temple darshan window avoiding tour bus arrivals'
        );

        items.push(
          {
            time: '08:00',
            attractionId: 'underground-shiva',
            title: 'Underground Temple Quiet Morning',
            category: 'temple',
            estimatedCost: 0,
            durationMinutes: 75,
            reason: 'Consistently receives under 15% of the tourist volume of central shrines.',
            tags: ['Zero queue', 'Peaceful sanctuary'],
            travelToNextMinutes: 25
          },
          {
            time: '10:30',
            attractionId: 'lotus-mahal',
            title: 'Zenana Enclosure East Garden Walk',
            category: 'heritage',
            estimatedCost: 40,
            durationMinutes: 75,
            reason: 'Spacious 10-acre open lawn permits easy social dispersal.',
            tags: ['Wide open lawns', 'Moderate crowd'],
            travelToNextMinutes: 30
          },
          {
            time: '13:00',
            attractionId: 'mayura-lunch',
            title: 'Spacious Garden Dining at KSTDC Mayura',
            category: 'food',
            estimatedCost: 310,
            durationMinutes: 70,
            reason: 'Avoids overcrowded bazaar canteens with reserved table spacing.',
            tags: ['Unhurried dining', 'Hygiene certified'],
            travelToNextMinutes: 30
          },
          {
            time: '16:00',
            attractionId: 'sanapur-lake',
            title: 'Anegundi Village & Sanapur Lakeside',
            category: 'nature',
            estimatedCost: 0,
            durationMinutes: 100,
            reason: 'Far less crowded alternative to Matanga Hill while offering matching sunset charm.',
            tags: ['Off the beaten path', 'Quiet solitude']
          }
        );
      }

      resolve({
        dayNumber: day.dayNumber,
        summary: `Plan B (${condition} adapted): ${changesExplained[0]}`,
        items,
        changesExplained
      });
    }, 400);
  });
}
