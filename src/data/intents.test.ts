import { describe, expect, it } from 'vitest';
import { INTENTS } from './intents';
import { GUIDE_MAP } from './guides';
import { CALCULATOR_MAP } from './calculators';

describe('quick-start intents', () => {
  it('each offers a choice of existing guides and at least one calculator or tool', () => {
    expect(INTENTS).toHaveLength(6);
    for (const i of INTENTS) {
      expect(i.guides.length + i.tools.length, i.id).toBeGreaterThanOrEqual(3);
      expect(i.guides.length + i.tools.length, i.id).toBeLessThanOrEqual(5);
      expect(i.guides.length, i.id).toBeGreaterThan(0);
      expect(i.tools.length, i.id).toBeGreaterThan(0);
      for (const g of i.guides) expect(GUIDE_MAP[g], `${i.id} → ${g}`).toBeDefined();
      for (const t of i.tools) expect(CALCULATOR_MAP[t], `${i.id} → ${t}`).toBeDefined();
    }
  });
});
