import { PHRASES_DATA, getPhrases as fetchPhrases } from '../lib/db';

export interface KannadaPhrase {
  id: string;
  category:
    | 'Basic conversation'
    | 'Restaurant'
    | 'Transport'
    | 'Directions'
    | 'Hotel'
    | 'Shopping'
    | 'Emergency'
    | string;
  kannada: string;
  english: string;
  pronunciation: string;
  situation: string;
}

export const SEED_PHRASES: KannadaPhrase[] = PHRASES_DATA as KannadaPhrase[];

/**
 * Loads phrases optionally filtered by category via dataSource.
 */
export async function getPhrases(category?: string): Promise<KannadaPhrase[]> {
  return fetchPhrases(category);
}

/**
 * Generates an appropriate Kannada phrase for a specific traveller situation.
 * TODO: replace with server call (POST /api/generate-phrase via Gemini)
 */
export async function generatePhrase(
  intent: string,
  situation?: string
): Promise<{ kannada: string; english: string; pronunciation: string; situation: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const q = intent.trim().toLowerCase();
      if (!q) {
        reject(new Error('Intent cannot be empty.'));
        return;
      }

      if (q.includes('spice') || q.includes('spicy') || q.includes('hot')) {
        resolve({
          kannada: 'ಖಾರ ಕಡಿಮೆ ಮಾಡಿ, ದಯವಿಟ್ಟು',
          english: 'Please make it less spicy',
          pronunciation: 'Khaara kadime maadi, dayavittu',
          situation: 'Customized food request for mild spice levels'
        });
      } else if (q.includes('sugar') || q.includes('sweet') || q.includes('tea')) {
        resolve({
          kannada: 'ಸಕ್ಕರೆ ಬೇಡ / ಸಕ್ಕರೆ ಕಡಿಮೆ ಹಾಕಿ',
          english: 'No sugar / Put less sugar',
          pronunciation: 'Sakkare beda / Sakkare kadime haaki',
          situation: 'Ordering tea or filter coffee without extra sugar'
        });
      } else if (q.includes('photo') || q.includes('picture') || q.includes('camera')) {
        resolve({
          kannada: 'ಒಂದು ಫೋಟೋ ತೆಗೆಯಬಹುದಾ?',
          english: 'Can I take a photo here?',
          pronunciation: 'Ondu photo tegeyabahudaa?',
          situation: 'Asking permission before photographing monuments or locals'
        });
      } else if (q.includes('shoe') || q.includes('footwear') || q.includes('sandal')) {
        resolve({
          kannada: 'ಚಪ್ಪಲಿ ಎಲ್ಲಿ ಬಿಡಬೇಕು?',
          english: 'Where should I leave my footwear?',
          pronunciation: 'Chappali elli bidabeku?',
          situation: 'Entering temple or sacred monument complex'
        });
      } else {
        resolve({
          kannada: `ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ (${intent.slice(0, 16)})`,
          english: `Please assist me: ${intent}`,
          pronunciation: `Dayavittu sahaya maadi: ${intent.slice(0, 16)}`,
          situation: situation || 'Customized situational Kannada phrase'
        });
      }
    }, 450);
  });
}
