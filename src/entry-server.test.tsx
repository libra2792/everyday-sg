import { describe, expect, it } from 'vitest';
import { renderRoute } from './entry-server';
import { headRoutes } from './lib/head';
import { GUIDES } from './data/guides';
import { CALCULATORS } from './data/calculators';

/** Text as React writes it into HTML. */
const asHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

describe('prerendered pages', () => {
  it('every guide carries its title, summary, checklist and steps', async () => {
    for (const g of GUIDES) {
      const body = await renderRoute(`/guides/${g.id}`);
      for (const text of [g.title, g.summary, ...g.checklist.map((c) => c.text), ...g.steps.map((s) => s.title)]) expect(body, `${g.id}: ${text}`).toContain(asHtml(text));
    }
  });

  it('calculators and tools arrive complete, not "Loading…"', async () => {
    for (const c of CALCULATORS) {
      const body = await renderRoute(c.path);
      expect(body, c.path).toContain(asHtml(c.name));
      expect(body, c.path).not.toContain('Loading…');
    }
  });

  it('no public page needs JavaScript to show its content', async () => {
    for (const route of headRoutes()) expect(await renderRoute(route), route).not.toMatch(/<script|<template/);
  });
});
