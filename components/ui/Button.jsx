'use client';

import { motion } from 'framer-motion';

/**
 * Button - Premium reusable button with variant styles and micro-interactions.
 *
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows spinner and disables interaction
 * @param {boolean} disabled - Disables the button
 * @param {string} className - Additional classes
 * @param {React.ReactNode} children
 */

// Spinner SVG for loading state
function Spinner({ size }) {
  const dims = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <svg
      className={`animate-spin ${dims}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Style maps for each variant
const variantStyles = {
  primary:
    'bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700',
};

// Size maps for padding and text
const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-md gap-1.5',
  md: 'px-6 py-2.5 text-sm rounded-md gap-2',
  lg: 'px-8 py-3.5 text-base rounded-md gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed saturate-50' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Spinner size={size} />}
      {children}
    </motion.button>
  );
}
