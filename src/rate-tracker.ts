type RateLimitEntry = { count: number; firstRequestTime: number };
const map = new Map<string, RateLimitEntry>();

export const trackLoginAttempts = (ip: string, windowMs: number): number => {
  const now = Date.now();
  const record = map.get(ip);

  if (record && now - record.firstRequestTime < windowMs) {
    record.count += 1;

    return record.count;
  } else {
    map.set(ip, { count: 1, firstRequestTime: now });
    return 1;
  }
};
