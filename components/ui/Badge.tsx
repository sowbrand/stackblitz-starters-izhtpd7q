
import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
}

export const Badge: React.FC<BadgeProps> = ({ className, icon: Icon, children, ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-transparent bg-brand-green px-2.5 py-0.5 text-xs font-semibold text-white',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="mr-1.5 h-3 w-3" />}
      {children}
    </div>
  );
};
