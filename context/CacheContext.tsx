// context/CacheContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiresIn: number;
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
const CACHE_PREFIX = 'credisure_cache_';

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, CacheItem>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cache from localStorage on mount
  useEffect(() => {
    const loadCache = () => {
      try {
        const stored: Record<string, CacheItem> = {};
        const keys = Object.keys(localStorage);
        
        for (const key of keys) {
          if (key.startsWith(CACHE_PREFIX)) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const item = JSON.parse(raw) as CacheItem;
                if (Date.now() - item.timestamp < item.expiresIn) {
                  const cacheKey = key.replace(CACHE_PREFIX, '');
                  stored[cacheKey] = item;
                } else {
                  localStorage.removeItem(key);
                }
              }
            } catch {
              // Skip invalid items
            }
          }
        }
        
        setCache(stored);
      } catch (error) {
        console.error('Error loading cache:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCache();
  }, []);

  // Save cache to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      for (const [key, item] of Object.entries(cache)) {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
      }
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }, [cache, isInitialized]);

  const get = useCallback(<T,>(key: string): T | null => {
    const item = cache[key] as CacheItem<T> | undefined;
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.expiresIn) {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return item.data;
  }, [cache]);

  const set = useCallback(<T,>(key: string, data: T, expiresIn: number = DEFAULT_EXPIRY) => {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    
    setCache(prev => ({
      ...prev,
      [key]: item as CacheItem,
    }));
  }, []);

  const invalidate = useCallback((key: string) => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  }, []);

  const invalidateAll = useCallback(() => {
    setCache({});
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
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