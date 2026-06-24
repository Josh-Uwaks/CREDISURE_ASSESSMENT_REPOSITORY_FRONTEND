// context/CacheContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';

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
  getSize: () => number;
  clearExpired: () => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

const DEFAULT_EXPIRY = 5 * 60 * 1000;
const CACHE_PREFIX = 'credisure_cache_';
const MAX_CACHE_ITEMS = 50;
const CLEANUP_INTERVAL = 60 * 1000;

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, CacheItem>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isClearingRef = useRef(false);
  const cacheRef = useRef(cache);
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  useEffect(() => {
    const loadCache = () => {
      try {
        const stored: Record<string, CacheItem> = {};
        const keys = Object.keys(localStorage);
        let validCount = 0;
        
        for (const key of keys) {
          if (key.startsWith(CACHE_PREFIX)) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const item = JSON.parse(raw) as CacheItem;
                const isValid = Date.now() - item.timestamp < item.expiresIn;
                
                if (isValid && validCount < MAX_CACHE_ITEMS) {
                  const cacheKey = key.replace(CACHE_PREFIX, '');
                  stored[cacheKey] = item;
                  validCount++;
                } else {
                  localStorage.removeItem(key);
                }
              }
            } catch {
              localStorage.removeItem(key);
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

  useEffect(() => {
    if (!isInitialized) return;

    const cacheKeys = Object.keys(cache);
    if (cacheKeys.length === 0) {
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
      return;
    }

    try {
      for (const [key, item] of Object.entries(cache)) {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
      }
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }, [cache, isInitialized]);

  const get = useCallback(<T,>(key: string): T | null => {
    const currentCache = cacheRef.current;
    const item = currentCache[key] as CacheItem<T> | undefined;
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
  }, []);

  const set = useCallback(<T,>(key: string, data: T, expiresIn: number = DEFAULT_EXPIRY) => {
    const currentCache = cacheRef.current;
    
    const currentKeys = Object.keys(currentCache);
    if (currentKeys.length >= MAX_CACHE_ITEMS && !currentCache[key]) {
      const oldestKey = currentKeys.reduce((a, b) => {
        return currentCache[a].timestamp < currentCache[b].timestamp ? a : b;
      });
      
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[oldestKey];
        return newCache;
      });
      localStorage.removeItem(`${CACHE_PREFIX}${oldestKey}`);
    }

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

  const clearExpired = useCallback(() => {
    if (isClearingRef.current) return;
    isClearingRef.current = true;

    try {
      const now = Date.now();
      let hasChanges = false;
      const keysToRemove: string[] = [];
      const currentCache = cacheRef.current;

      for (const [key, item] of Object.entries(currentCache)) {
        if (now - item.timestamp > item.expiresIn) {
          keysToRemove.push(key);
          localStorage.removeItem(`${CACHE_PREFIX}${key}`);
          hasChanges = true;
        }
      }

      if (hasChanges && keysToRemove.length > 0) {
        setCache(prev => {
          const newCache = { ...prev };
          for (const key of keysToRemove) {
            delete newCache[key];
          }
          return newCache;
        });
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    } finally {
      isClearingRef.current = false;
    }
  }, []);

  const isStale = useCallback((key: string): boolean => {
    const currentCache = cacheRef.current;
    const item = currentCache[key];
    if (!item) return true;
    return Date.now() - item.timestamp > item.expiresIn;
  }, []);

  const getSize = useCallback((): number => {
    return Object.keys(cacheRef.current).length;
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

  useEffect(() => {
    if (!isInitialized) return;

    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
      cleanupIntervalRef.current = null;
    }

    cleanupIntervalRef.current = setInterval(() => {
      clearExpired();
    }, CLEANUP_INTERVAL);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, [isInitialized, clearExpired]);

  const value = useMemo((): CacheContextType => ({
    get,
    set,
    invalidate,
    invalidateAll,
    isStale,
    getSize,
    clearExpired,
  }), [get, set, invalidate, invalidateAll, isStale, getSize, clearExpired]);

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