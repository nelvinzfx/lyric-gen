import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function ThemeController() {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}
