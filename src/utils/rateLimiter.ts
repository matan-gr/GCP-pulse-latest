export const checkRateLimit = (key: string, limit: number, windowMinutes: number): boolean => {
  try {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const stored = localStorage.getItem(`rate_limit_${key}`);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];
    
    timestamps = timestamps.filter(ts => now - ts < windowMs);
    
    return timestamps.length < limit;
  } catch (e) {
    console.error("Rate limiter error", e);
    return true; // fail open
  }
};

export const recordUsage = (key: string, windowMinutes: number) => {
  try {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const stored = localStorage.getItem(`rate_limit_${key}`);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];
    
    timestamps = timestamps.filter(ts => now - ts < windowMs);
    timestamps.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(timestamps));
  } catch (e) {
    console.error("Rate limiter error", e);
  }
};

export const getRemainingTime = (key: string, limit: number, windowMinutes: number): number => {
  try {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const stored = localStorage.getItem(`rate_limit_${key}`);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];
    
    timestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      return Math.ceil((oldest + windowMs - now) / 60000); // minutes remaining
    }
    return 0;
  } catch (e) {
    return 0;
  }
};
