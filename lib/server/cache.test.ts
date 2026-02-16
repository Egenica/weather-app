import { TtlCache } from './cache';

describe('TtlCache', () => {
  it('returns cached values while entry is fresh', () => {
    const cache = new TtlCache(10_000);
    cache.set('key', { a: 1 });

    expect(cache.get<{ a: number }>('key')).toEqual({ a: 1 });
  });

  it('expires values after ttl', () => {
    jest.useFakeTimers();

    const cache = new TtlCache(50);
    cache.set('key', 'value');

    jest.advanceTimersByTime(51);
    expect(cache.get<string>('key')).toBeNull();

    jest.useRealTimers();
  });
});
