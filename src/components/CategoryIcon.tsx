import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  name, 
  className = 'w-5 h-5', 
  size = 20,
  color 
}) => {
  // Fallback map
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>>)[name] || Icons.Folder;

  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
};
