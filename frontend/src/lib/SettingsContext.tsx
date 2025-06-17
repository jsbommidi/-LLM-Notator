'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, SettingsContextType } from '@/types';
import { loadSettings, saveSettings, resetSettings as resetStoredSettings, defaultSettings } from './settings';
import { useTheme } from './useTheme';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme
  useTheme(settings.theme);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    setIsLoading(false);
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveSettings(settings);
    }
  }, [settings, isLoading]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettingsValues = resetStoredSettings();
    setSettings(defaultSettingsValues);
  }, []);

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
} 