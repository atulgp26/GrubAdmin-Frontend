import { create } from 'zustand';

const STALE_TIME = 60_000;

export const useEmployeeStore = create((set, get) => ({
  cachedEmployees: null,
  cachedTotalCount: 0,
  cachedParamsKey: null,
  cacheTimestamp: null,

  setCache: (employees, totalCount, paramsKey) =>
    set({
      cachedEmployees: employees,
      cachedTotalCount: totalCount,
      cachedParamsKey: paramsKey,
      cacheTimestamp: Date.now(),
    }),

  clearCache: () =>
    set({
      cachedEmployees: null,
      cachedTotalCount: 0,
      cachedParamsKey: null,
      cacheTimestamp: null,
    }),

  getCache: () => {
    const { cachedEmployees, cachedTotalCount, cachedParamsKey, cacheTimestamp } = get();
    if (!cachedEmployees || !cacheTimestamp) return null;
    return { employees: cachedEmployees, totalCount: cachedTotalCount, paramsKey: cachedParamsKey, timestamp: cacheTimestamp };
  },

  isStale: () => {
    const { cacheTimestamp } = get();
    if (!cacheTimestamp) return true;
    return Date.now() - cacheTimestamp > STALE_TIME;
  },
}));
