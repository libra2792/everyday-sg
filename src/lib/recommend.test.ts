import { describe, expect, it } from 'vitest';
import { EMPTY_PROFILE, migrateProfile } from '@/state/AppState';
import { recommend } from './recommend';

describe('profile housing', () => {
  it('reads a profile saved with a single housing answer as a one-item list', () => {
    expect(migrateProfile({ ...EMPTY_PROFILE, housing: 'renting' })?.housing).toEqual(['renting']);
    expect(migrateProfile({ ...EMPTY_PROFILE, housing: '' })?.housing).toEqual([]);
    expect(migrateProfile({ ...EMPTY_PROFILE, housing: ['renting', 'planning-to-buy'] })?.housing).toEqual(['renting', 'planning-to-buy']);
    expect(migrateProfile(null)).toBeNull();
  });

  it('ranks both the renting guide and the buying guides for a renter planning to buy', () => {
    const ids = recommend({ ...EMPTY_PROFILE, housing: ['renting', 'planning-to-buy'] }, {}, 6).map((r) => r.id);
    expect(ids).toContain('renting-in-singapore');
    expect(ids).toContain('home-affordability-and-loans');
    expect(ids).toContain('hdb-bto-vs-resale');
  });
});
