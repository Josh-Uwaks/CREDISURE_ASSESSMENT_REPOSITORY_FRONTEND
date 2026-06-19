// context/CacheContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, expiresIn?: number) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
  isStale: (key: string) => boolean;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

const DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, CacheItem<unknown>>>({});

  const get = useCallback(<T,>(key: string): T | null => {
    const item = cache[key] as CacheItem<T> | undefined;
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.expiresIn) {
      // Expired - remove it
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      return null;
    }
    
    return item.data;
  }, [cache]);

  const set = useCallback(<T,>(key: string, data: T, expiresIn: number = DEFAULT_EXPIRY) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
        expiresIn,
      },
    }));
  }, []);

  const invalidate = useCallback((key: string) => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
  }, []);

  const invalidateAll = useCallback(() => {
    setCache({});
  }, []);

  const isStale = useCallback((key: string): boolean => {
    const item = cache[key];
    if (!item) return true;
    return Date.now() - item.timestamp > item.expiresIn;
  }, [cache]);

  const value: CacheContextType = {
    get,
    set,
    invalidate,
    invalidateAll,
    isStale,
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}