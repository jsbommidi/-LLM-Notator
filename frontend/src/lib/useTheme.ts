import { useEffect } from 'react';

export function useTheme(theme: 'light' | 'dark' | 'auto') {
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.removeAttribute('data-theme');
    
    // Apply the selected theme
    if (theme === 'auto') {
      // Let CSS handle auto theme with media queries
      root.setAttribute('data-theme', 'auto');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Force a re-render when system theme changes
      if (document.documentElement.getAttribute('data-theme') === 'auto') {
        // Trigger a small re-render to update CSS variables
        document.documentElement.style.setProperty('--theme-transition', 'auto');
        setTimeout(() => {
          document.documentElement.style.removeProperty('--theme-transition');
        }, 10);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
} 