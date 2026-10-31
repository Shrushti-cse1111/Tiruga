import { TRANSPORT_DATA, getTransport as fetchTransport } from '../lib/db';
import { TransportOption } from './types';

export const SEED_TRANSPORT_OPTIONS: TransportOption[] = TRANSPORT_DATA as unknown as TransportOption[];

/**
 * Loads transport options for a given route and date via dataSource.
 */
export async function getTransport(
  from: string = 'Bengaluru',
  to: string = 'Hampi',
  travelDate?: string
): Promise<TransportOption[]> {
  const options = await fetchTransport(from, to);
  return options as unknown as TransportOption[];
}
