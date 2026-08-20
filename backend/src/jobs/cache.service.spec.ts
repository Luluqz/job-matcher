import { CacheService } from './cache.service';

describe('CacheService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns undefined for a missing key', () => {
    const cache = new CacheService();

    expect(cache.get('missing')).toBeUndefined();
  });

  it('returns the cached value before it expires', () => {
    const cache = new CacheService();

    cache.set('key', { foo: 'bar' }, 1000);

    expect(cache.get('key')).toEqual({ foo: 'bar' });
  });

  it('returns undefined and evicts the entry once the TTL has elapsed', () => {
    const cache = new CacheService();

    cache.set('key', 'value', 1000);
    jest.advanceTimersByTime(1001);

    expect(cache.get('key')).toBeUndefined();
  });
});
