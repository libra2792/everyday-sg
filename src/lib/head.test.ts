import { describe, expect, it } from 'vitest';
import { GUIDES } from '@/data/guides';
import { headForPath, headRoutes, headTags } from './head';

describe('route heads', () => {
  it('gives every page its own title, following "{Page} · Everyday SG"', () => {
    expect(headForPath('/guides/home-affordability-and-loans')).toMatchObject({ title: 'What home can you afford? · Everyday SG', description: 'Upfront cash and CPF, monthly repayments, and your own comfort limit.' });
    expect(headForPath('/calculators/housing').title).toBe('Housing affordability and mortgage · Everyday SG');
    expect(headForPath('/tools/tax-prep').title).toBe('Annual tax preparation checklist · Everyday SG');
    expect(headForPath('/search', '?q=BTO').title).toBe('Search: BTO · Everyday SG');
    expect(headForPath('/guides/no-such-guide').title).toBe('Page not found · Everyday SG');
    expect(headForPath('/calculators/tax-prep').title).toBe('Page not found · Everyday SG');
    const titles = new Set(GUIDES.map((g) => headForPath(`/guides/${g.id}`).title));
    expect(titles.size).toBe(GUIDES.length);
  });

  it('lists the public routes and writes absolute URLs only when the origin is known', () => {
    expect(headRoutes()).toContain('/guides/emergency-fund');
    expect(headRoutes()).not.toContain('/plan');
    expect(headTags('/guides/emergency-fund')).not.toContain('canonical');
    expect(headTags('/guides/emergency-fund', 'https://example.org')).toContain('<link rel="canonical" href="https://example.org/guides/emergency-fund" />');
  });
});
