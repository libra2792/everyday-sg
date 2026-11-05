import { describe, expect, it } from 'vitest';
import { pct, sgd } from './format';

describe('sgd', () => {
  it('keeps everyday amounts exact and abbreviates from S$10 million', () => {
    expect(sgd(1_065_000)).toBe('$1,065,000');
    expect(sgd(9_999_999)).toBe('$9,999,999');
    expect(sgd(12_345_678)).toBe('$12.3m');
    expect(sgd(25_000_000_000)).toBe('$25.0b');
    expect(sgd(-15_000_000)).toBe('-$15.0m');
    expect(sgd(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('pct', () => {
  it('caps meaningless percentages', () => {
    expect(pct(0.153)).toBe('15%');
    expect(pct(27338.27)).toBe('over 9,999%');
  });
});
