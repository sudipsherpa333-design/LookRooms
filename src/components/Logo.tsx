import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 'md', 
  showTagline = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', text: 'text-lg', tagline: 'text-[8px]', icon: 'w-4 h-4' },
    md: { container: 'w-10 h-10', text: 'text-xl', tagline: 'text-[9px]', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12', text: 'text-2xl', tagline: 'text-[10px]', icon: 'w-6 h-6' },
    xl: { container: 'w-16 h-16', text: 'text-4xl', tagline: 'text-[12px]', icon: 'w-8 h-8' },
  };

  const currentSize = sizeClasses[size];

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 group ${className}`}
    >
      <div className={`${currentSize.container} ${variant === 'white' ? 'bg-white/20' : 'bg-emerald-100'} rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg ${variant === 'white' ? 'shadow-white/10' : 'shadow-emerald-100'} group-hover:scale-105 transition-transform duration-300 relative`}>
        <img 
          src="/lookrooms-logo.png" 
          alt="LookRooms" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as any).style.display = 'none';
            (e.target as any).nextSibling.style.display = 'block';
          }}
        />
        <Search className={`${currentSize.icon} hidden ${variant === 'white' ? 'text-white' : 'text-emerald-600'}`} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tighter uppercase ${currentSize.text} ${variant === 'white' ? 'text-white' : 'text-stone-900'}`}>
          LookRooms
        </span>
        {showTagline && (
          <span className={`font-bold tracking-widest uppercase ${currentSize.tagline} ${variant === 'white' ? 'text-white/60' : 'text-stone-400'}`}>
            Premium Stays
          </span>
        )}
      </div>
    </Link>
  );
};
