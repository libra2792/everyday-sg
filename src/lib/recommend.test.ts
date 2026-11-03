import { describe, expect, it } from 'vitest';
import { EMPTY_PROFILE, migrateProfile } from '@/state/AppState';
import { likelyLifeStage, recommend } from './recommend';

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

describe('likelyLifeStage', () => {
  it('reads the stage from age and household', () => {
    expect(likelyLifeStage(null)).toBeNull();
    expect(likelyLifeStage({ ...EMPTY_PROFILE, ageRange: '18-24' })).toBe('starting-out');
    expect(likelyLifeStage({ ...EMPTY_PROFILE, ageRange: '25-34' })).toBe('building');
    expect(likelyLifeStage({ ...EMPTY_PROFILE, ageRange: '25-34', household: ['parent'] })).toBe('family');
    expect(likelyLifeStage({ ...EMPTY_PROFILE, ageRange: '45-54' })).toBe('midlife');
    expect(likelyLifeStage({ ...EMPTY_PROFILE, ageRange: '65+' })).toBe('later-life');
  });
});
