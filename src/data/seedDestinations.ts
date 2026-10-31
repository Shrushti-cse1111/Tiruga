import {
  DestinationItem,
  DESTINATIONS_DATA,
  getDestinations as fetchDestinations
} from '../lib/db';

export type Destination = DestinationItem;

export const SEED_DESTINATIONS: Destination[] = DESTINATIONS_DATA;

export async function getDestinations(): Promise<Destination[]> {
  return fetchDestinations();
}
