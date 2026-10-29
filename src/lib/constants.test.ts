import { describe, expect, it } from 'vitest';
import { ISO_COUNTRIES } from './constants';
import worldMap from '../../public/datamaps.world.json';

describe('ISO_COUNTRIES', () => {
  it('maps South Sudan (SSD) to SS', () => {
    expect(ISO_COUNTRIES['SSD']).toBe('SS');
  });

  it('maps Antarctica (ATA) to AQ', () => {
    expect(ISO_COUNTRIES['ATA']).toBe('AQ');
  });

  it('maps major world countries correctly', () => {
    expect(ISO_COUNTRIES['USA']).toBe('US');
    expect(ISO_COUNTRIES['GBR']).toBe('GB');
    expect(ISO_COUNTRIES['EGY']).toBe('EG');
    expect(ISO_COUNTRIES['DEU']).toBe('DE');
    expect(ISO_COUNTRIES['FRA']).toBe('FR');
  });

  it('maps all sovereign world map feature codes in datamaps.world.json', () => {
    const features = worldMap.features || [];
    const unmapped = features
      .map(f => f.id)
      .filter(id => id && id !== '-99' && !ISO_COUNTRIES[id]);

    expect(unmapped).toEqual([]);
  });
});
