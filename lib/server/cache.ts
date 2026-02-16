type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

export class TtlCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly ttlMs: number) {}

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, {
      expiresAt: Date.now() + this.ttlMs,
      value,
    });
  }

  getOrSet<T>(key: string, valueFactory: () => Promise<T>): Promise<T> {
    const cachedValue = this.get<T>(key);
    if (cachedValue !== null) {
      return Promise.resolve(cachedValue);
    }

    return valueFactory().then((value) => {
      this.set(key, value);
      return value;
    });
  }

  clear(): void {
    this.store.clear();
  }
}

export const TEN_MINUTES_MS = 10 * 60 * 1000;
export const sharedCache = new TtlCache(TEN_MINUTES_MS);
