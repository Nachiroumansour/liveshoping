import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = ({ className = '', size = 'sm' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={`transition-all duration-200 ${className}`}
      title={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500 " />
      ) : (
        <Moon className="w-4 h-4 text-gray-600 " />
      )}
    </Button>
  );
};

export default ThemeToggle; 