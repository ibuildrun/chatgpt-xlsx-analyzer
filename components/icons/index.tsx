import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const LoadingIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <rect x="8" y="8" width="32" height="32" strokeLinecap="square" />
    <line x1="16" y1="20" x2="32" y2="20" />
    <line x1="16" y1="28" x2="24" y2="28" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ className = '', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="square"
    className={className}
  >
    <rect x="8" y="8" width="48" height="48" />
    <line x1="16" y1="48" x2="48" y2="48" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    className={className}
  >
    <line x1="8" y1="2" x2="8" y2="14" />
    <line x1="2" y1="8" x2="14" y2="8" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
    className={className}
  >
    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M4 4l1 10h6l1-10" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
  >
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5" />
  </svg>
);

export const TableIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
    className={className}
  >
    <rect x="1" y="1" width="14" height="14" />
    <line x1="1" y1="5" x2="15" y2="5" />
    <line x1="1" y1="10" x2="15" y2="10" />
    <line x1="6" y1="1" x2="6" y2="15" />
    <line x1="11" y1="1" x2="11" y2="15" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
    className={className}
  >
    <path d="M1 8h14M10 3l5 5-5 5" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    className={className}
  >
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    className={className}
  >
    <path d="M2 8l4 4 8-8" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
  >
    <circle cx="5" cy="8" r="3" />
    <path d="M8 8h7M12 6v4M15 6v4" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    className={className}
  >
    <line x1="2" y1="4" x2="14" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="14" y2="12" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    className={className}
  >
    <path d="M10 3L5 8l5 5" />
  </svg>
);

export const KeyboardIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
    className={className}
  >
    <rect x="1" y="3" width="14" height="10" />
    <line x1="4" y1="6" x2="5" y2="6" />
    <line x1="7" y1="6" x2="9" y2="6" />
    <line x1="11" y1="6" x2="12" y2="6" />
    <line x1="4" y1="9" x2="12" y2="9" />
  </svg>
);
