import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
  Bookmark,
  User as UserIcon,
  ChevronLeft,
  ShieldAlert,
  Sparkles,
  Lock,
  Unlock,
  ArrowUpDown,
  Trash2,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';

// 1. Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'white' | 'orange' | 'text' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-2xl min-h-[48px] px-5 py-3 text-base';

  const variants = {
    primary:
      'bg-[#0e5a52] hover:bg-[#14786c] text-white shadow-sm hover:shadow-md dark:bg-[#5cc4b6] dark:text-[#0f1614] dark:hover:bg-[#48a699]',
    white:
      'bg-white text-[#0e5a52] hover:bg-white/90 shadow-sm font-semibold dark:bg-[#172220] dark:text-white',
    orange:
      'bg-[#e8731f] hover:bg-[#d66515] text-white shadow-sm font-semibold dark:bg-[#f28b40] dark:text-gray-900',
    outline:
      'border-2 border-[#0e5a52] text-[#0e5a52] hover:bg-[#ddefea] dark:border-[#5cc4b6] dark:text-[#5cc4b6] dark:hover:bg-[#1a332f]',
    text:
      'text-[#0e5a52] hover:text-[#14786c] bg-transparent hover:bg-black/5 dark:text-[#5cc4b6] dark:hover:bg-white/5'
  };

  const sizes = {
    sm: 'min-h-[40px] px-4 py-2 text-sm rounded-xl',
    md: 'min-h-[48px] px-5 py-3 text-base rounded-2xl',
    lg: 'min-h-[54px] px-6 py-4 text-lg rounded-2xl'
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// 2. Chip
export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-base font-medium min-h-[48px] transition-all active:scale-[0.98] ${
        selected
          ? 'bg-[#0e5a52] text-white shadow-sm dark:bg-[#5cc4b6] dark:text-[#0f1614]'
          : 'bg-white text-[#15231f] border border-[#dce5e1] hover:border-[#0e5a52]/40 dark:bg-[#172220] dark:text-[#e8f0ed] dark:border-[#2b3c38]'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

// 3. SegmentedControl
export interface SegmentedControlProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange
}) => {
  return (
    <div className="flex bg-[#e9f1ec] dark:bg-[#141f1c] p-1 rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            value === opt.value
              ? 'bg-white dark:bg-[#172220] text-[#0e5a52] dark:text-[#5cc4b6] shadow-sm'
              : 'text-[#5b6c66] dark:text-[#9cb0aa] hover:text-[#15231f] dark:hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// 4. Switch
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, ariaLabel }) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none min-h-[48px]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || 'Toggle switch'}
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
          checked ? 'bg-[#0e5a52] dark:bg-[#5cc4b6]' : 'bg-[#dce5e1] dark:bg-[#2b3c38]'
        }`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-base font-medium text-[#15231f] dark:text-[#e8f0ed]">{label}</span>}
    </label>
  );
};

// 5. TopBar
export interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction
}) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-[#f4f7f3]/95 dark:bg-[#0f1614]/95 backdrop-blur-md border-b border-[#dce5e1] dark:border-[#2b3c38] px-4 py-3 flex items-center justify-between min-h-[56px]">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={onBack || (() => navigate(-1))}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-xl text-[#0e5a52] dark:text-[#5cc4b6] hover:bg-[#ddefea] dark:hover:bg-[#1a332f] min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-[#15231f] dark:text-[#e8f0ed] font-heading leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#5b6c66] dark:text-[#9cb0aa] leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  );
};

// 6. TabBar
export const TabBar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTripId = useAppStore((s) => s.activeTripId);

  const tabs = [
    { label: t('nav.home') || 'Home', icon: Home, path: '/home' },
    { label: t('nav.plan') || 'Plan', icon: Compass, path: activeTripId ? `/trip/${activeTripId}` : '/onboarding' },
    { label: t('nav.saved') || 'Saved', icon: Bookmark, path: '/saved' },
    { label: t('nav.profile') || 'Profile', icon: UserIcon, path: '/profile' }
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto z-40 bg-white/95 dark:bg-[#102924]/95 backdrop-blur-md border-t border-[#E2DFD3] dark:border-[#1D3B34] px-2 py-1 flex items-center justify-around min-h-[60px] shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location.pathname === tab.path ||
          (tab.path.includes('onboarding') && location.pathname === '/onboarding') ||
          (location.pathname.startsWith('/trip') && tab.path.startsWith('/trip'));

        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#103F38] dark:text-[#F4B63E] font-bold'
                : 'text-[#60736E] dark:text-[#9BB0AA] hover:text-[#18312D]'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F4B63E] rounded-full" />
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// 7. Notice
export interface NoticeProps {
  variant?: 'info' | 'warning' | 'alert' | 'sample';
  text: string;
  lastChecked?: string;
  className?: string;
}

export const Notice: React.FC<NoticeProps> = ({
  variant = 'sample',
  text,
  lastChecked,
  className = ''
}) => {
  const bgStyles = {
    sample: 'bg-[#fff1c9] border-[#f2b300]/40 text-[#543b00] dark:bg-[#383015] dark:text-[#f5c038]',
    info: 'bg-[#ddefea] border-[#0e5a52]/30 text-[#0e5a52] dark:bg-[#1a332f] dark:text-[#5cc4b6]',
    warning: 'bg-[#fde9d6] border-[#e8731f]/40 text-[#7a3400] dark:bg-[#3b2516] dark:text-[#f28b40]',
    alert: 'bg-[#fde8e8] border-[#b3261e]/40 text-[#b3261e] dark:bg-[#381919] dark:text-[#e04b43]'
  };

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-sm ${bgStyles[variant]} ${className}`}
    >
      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium leading-snug">{text}</p>
        {lastChecked && (
          <span className="text-xs opacity-75 mt-0.5 block">
            Last checked: {lastChecked}
          </span>
        )}
      </div>
    </div>
  );
};

// 8. Card
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#172220] rounded-2xl p-4 border border-[#dce5e1] dark:border-[#2b3c38] shadow-sm ${
        onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// 9. StatTile
export const StatTile: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}> = ({ label, value, sub, icon }) => {
  return (
    <div className="bg-[#e9f1ec] dark:bg-[#141f1c] rounded-2xl p-3 border border-[#dce5e1] dark:border-[#2b3c38] flex flex-col justify-between">
      <div className="flex items-center justify-between text-[#5b6c66] dark:text-[#9cb0aa] text-xs">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-1">
        <span className="text-lg font-bold text-[#15231f] dark:text-[#e8f0ed] font-heading">
          {value}
        </span>
        {sub && <span className="text-xs text-[#5b6c66] dark:text-[#9cb0aa] ml-1">{sub}</span>}
      </div>
    </div>
  );
};

// 10. ProgressBar
export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full bg-[#dce5e1] dark:bg-[#2b3c38] h-2 rounded-full overflow-hidden">
      <div
        className="bg-[#0e5a52] dark:bg-[#5cc4b6] h-full transition-all duration-300 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// 11. Toast
export const Toast: React.FC = () => {
  const toastMessage = useAppStore((s) => s.toastMessage);
  const clearToast = useAppStore((s) => s.clearToast);

  if (!toastMessage) return null;

  return (
    <div
      role="alert"
      onClick={clearToast}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#15231f] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 cursor-pointer max-w-[350px]"
    >
      <CheckCircle2 size={18} className="text-[#5cc4b6] shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};

// 12. Skeleton
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-24' }) => {
  return (
    <div className={`bg-[#dce5e1]/60 dark:bg-[#2b3c38]/60 animate-pulse rounded-2xl ${className}`} />
  );
};

// 13. EmptyState
export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ title, description, actionText, onAction }) => {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ddefea] dark:bg-[#1a332f] flex items-center justify-center text-[#0e5a52] dark:text-[#5cc4b6]">
        <Compass size={32} />
      </div>
      <h3 className="text-lg font-bold text-[#15231f] dark:text-[#e8f0ed] mb-1">{title}</h3>
      <p className="text-sm text-[#5b6c66] dark:text-[#9cb0aa] max-w-xs mx-auto mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
