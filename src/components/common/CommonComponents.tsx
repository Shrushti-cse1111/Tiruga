import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Bookmark,
  User as UserIcon,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Check,
  Calendar
} from 'lucide-react';
import { Destination } from '../../data/seedDestinations';

// 1. Image with Guaranteed Deep Teal to Terracotta Fallback
export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string; // e.g. 'aspect-[16/10]', 'aspect-[4/3]', 'aspect-[16/9]'
  fallbackTitle?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  className = '',
  aspectRatio = 'aspect-[16/10]',
  fallbackTitle,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden w-full ${aspectRatio} ${
        hasError ? 'image-fallback-gradient' : 'bg-mint/40'
      }`}
    >
      {!hasError && src && (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}

      {/* Fallback Display if Image Fails or is Loading */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white image-fallback-gradient select-none">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center mb-2">
            <MapPin size={20} className="text-gold" />
          </div>
          <span className="text-sm font-semibold tracking-wide drop-shadow-xs">
            {fallbackTitle || alt || 'Karnataka'}
          </span>
          <span className="text-[11px] text-white/80 mt-0.5 font-kannada">ಕರ್ನಾಟಕ</span>
        </div>
      )}
    </div>
  );
};

// 2. Button (Pill Primary, Secondary, Ghost, White)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-full min-h-[48px] px-6 py-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-teal';

  const variants = {
    primary:
      'bg-deep-teal hover:bg-primary-teal text-white shadow-sm hover:shadow-md border border-deep-teal/20',
    secondary:
      'bg-white hover:bg-mint text-deep-teal border border-deep-teal/20 shadow-xs hover:border-deep-teal/40',
    ghost:
      'bg-transparent hover:bg-deep-teal/10 text-deep-teal min-h-[44px]',
    white:
      'bg-white text-deep-teal hover:bg-mint hover:text-deep-teal shadow-md hover:shadow-lg',
    gold:
      'bg-gold text-deep-teal hover:bg-white hover:text-deep-teal shadow-md font-bold'
  };

  const sizes = {
    sm: 'min-h-[40px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[54px] px-8 py-3.5 text-lg'
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`} {...props}>
      {children}
    </button>
  );
};

// 3. Card (18-24px Radius with Soft Shadow & Cream Surface)
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'deep' | 'cream' | 'flat';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const styles = {
    default: 'bg-white dark:bg-[#102924] border border-[#E2DFD3] dark:border-[#1D3B34] shadow-xs',
    cream: 'bg-cream text-text-main border border-[#E2DFD3] shadow-xs',
    deep: 'bg-deep-teal text-white border border-deep-teal/40 shadow-md',
    flat: 'bg-mint/40 border border-mint text-text-main'
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-5 transition-shadow ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 4. Selectable Chip (min 44px-56px touch target)
export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  kannadaLabel?: string;
  large?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  kannadaLabel,
  large = false,
  className = ''
}) => {
  if (large) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`w-full min-h-[58px] p-4 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.99] border text-left ${
          selected
            ? 'bg-mint border-primary-teal border-2 text-deep-teal shadow-xs'
            : 'bg-white hover:bg-cream border-[#E2DFD3] text-text-main'
        } ${className}`}
      >
        <div className="flex items-center gap-3.5">
          {icon && (
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                selected ? 'bg-primary-teal text-white' : 'bg-mint text-deep-teal'
              }`}
            >
              {icon}
            </div>
          )}
          <div>
            <div className="font-semibold text-base leading-snug">{label}</div>
            {kannadaLabel && (
              <div className="text-xs text-muted-text font-kannada mt-0.5">{kannadaLabel}</div>
            )}
          </div>
        </div>

        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${
            selected
              ? 'bg-primary-teal border-primary-teal text-white'
              : 'border-[#CBD5D1] bg-white'
          }`}
        >
          {selected && <Check size={14} strokeWidth={3} />}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] border ${
        selected
          ? 'bg-deep-teal text-white border-deep-teal shadow-xs'
          : 'bg-white text-text-main border-[#E2DFD3] hover:border-primary-teal/40'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
      {kannadaLabel && <span className="text-xs font-kannada opacity-80">({kannadaLabel})</span>}
    </button>
  );
};

// 5. Section Header
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  kannadaTitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  kannadaTitle,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex items-end justify-between mb-3.5 ${className}`}>
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-bold text-text-main tracking-tight">{title}</h2>
          {kannadaTitle && (
            <span className="text-xs font-kannada font-medium text-primary-teal">
              {kannadaTitle}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-text mt-0.5">{subtitle}</p>}
      </div>

      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-primary-teal hover:text-deep-teal flex items-center gap-0.5 min-h-[36px] cursor-pointer"
        >
          <span>{actionText}</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

// 6. Destination Card with fixed aspect ratio, tag chips, and fallback
export interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  className?: string;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2DFD3] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-teal ${className}`}
    >
      <div className="relative">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          aspectRatio="aspect-[16/10]"
          fallbackTitle={destination.name}
        />

        {/* Deep Teal Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/90 via-deep-teal/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-deep-teal shadow-xs">
            <Clock size={12} className="text-primary-teal" />
            <span>{destination.recommendedDays} Days</span>
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gold text-deep-teal shadow-xs">
            {destination.budgetLevel}
          </span>
        </div>

        {/* Bottom Destination Title Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-baseline justify-between">
            <h3 className="font-bold text-lg leading-tight tracking-tight drop-shadow-xs">
              {destination.name}
            </h3>
            <span className="text-xs font-kannada text-gold font-medium">
              {destination.kannadaName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white/90 text-xs mt-0.5">
            <MapPin size={12} className="text-mint shrink-0" />
            <span>{destination.district} District</span>
          </div>
        </div>
      </div>

      {/* Card Content & Categories */}
      <div className="p-3.5 bg-white">
        <p className="text-xs text-muted-text line-clamp-2 leading-relaxed mb-2.5">
          {destination.description}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap">
          {destination.categories.slice(0, 3).map((cat: string) => (
            <span
              key={cat}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-mint text-deep-teal"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. Loading Skeleton
export const LoadingSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl border border-[#E2DFD3] bg-white p-4 shadow-xs animate-pulse"
        >
          <div className="w-full aspect-[16/10] bg-mint/50 rounded-xl mb-3" />
          <div className="h-5 bg-mint/60 rounded-md w-3/4 mb-2" />
          <div className="h-3.5 bg-mint/40 rounded-md w-1/2 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 bg-mint/40 rounded-md w-16" />
            <div className="h-5 bg-mint/40 rounded-md w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 8. Empty State
export interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="text-center p-6 rounded-2xl bg-cream border border-[#E2DFD3]">
      <div className="w-12 h-12 rounded-full bg-mint text-deep-teal flex items-center justify-center mx-auto mb-3">
        {icon || <Compass size={22} />}
      </div>
      <h3 className="font-bold text-base text-text-main">{title}</h3>
      <p className="text-xs text-muted-text max-w-xs mx-auto mt-1 leading-relaxed">{subtitle}</p>
      {actionText && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

// 9. Bottom Navigation (Home, Plan, Saved, Profile)
export const BottomNav: React.FC = () => {
  const tabs = [
    { to: '/home', label: 'Home', kannada: 'ಮುಖಪುಟ', icon: Home },
    { to: '/plan', label: 'Plan', kannada: 'ಯೋಜನೆ', icon: Compass },
    { to: '/saved', label: 'Saved', kannada: 'ಉಳಿಸಿದವು', icon: Bookmark },
    { to: '/profile', label: 'Profile', kannada: 'ಪ್ರೊಫೈಲ್', icon: UserIcon }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="sticky bottom-0 z-40 w-full max-w-[430px] mx-auto bg-white/95 backdrop-blur-md border-t border-[#E2DFD3] px-3 py-2 flex items-center justify-around shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-deep-teal font-bold'
                  : 'text-muted-text hover:text-text-main'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold rounded-full" />
                  )}
                </div>
                <span className="text-[11px] mt-1 leading-none">{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export const ErrorBanner: React.FC<{
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}> = ({
  message,
  onDismiss,
  onRetry,
  className = ''
}) => (
  <div
    role="alert"
    className={`p-3.5 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 rounded-2xl text-xs flex items-center justify-between gap-2 animate-fade-in ${className}`}
  >
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-2 py-1 rounded-md bg-red-700 text-white dark:bg-red-600 font-bold text-[11px] cursor-pointer hover:opacity-90"
      >
        Retry
      </button>
    )}
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="ml-1 font-bold cursor-pointer hover:opacity-75"
      >
        ✕
      </button>
    )}
  </div>
);

