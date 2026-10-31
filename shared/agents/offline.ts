import { Trip, OfflinePack, Place, Stay, TransportLeg, RulesConfig } from '../types';

export class OfflineAgent {
  static createBundle(
    trip: Trip,
    places: Place[],
    stays: Stay[],
    transportLegs: TransportLeg[],
    rulesConfig: RulesConfig,
    climatology: any,
    emergencyNumbers: Record<string, string>
  ): OfflinePack {
    const bundleData = {
      trip,
      places,
      stays,
      transport_legs: transportLegs,
      rules_config: rulesConfig,
      climatology,
      emergency_numbers: emergencyNumbers
    };

    const serialized = JSON.stringify(bundleData);
    const sizeBytes = new Blob([serialized]).size;

    return {
      id: `pack_${trip.id}_v${trip.version}`,
      trip_id: trip.id,
      version: trip.version,
      size_bytes: sizeBytes,
      built_at: new Date().toISOString(),
      bundle: bundleData
    };
  }

  static formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
