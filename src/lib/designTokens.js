/**
 * Design token system for consistent gradients and styling across the application
 */

// Core gradient definitions
export const gradients = {
  // Background gradients for modals and surfaces
  modalBackground: 'bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95',
  cardBackground: 'bg-gradient-to-br from-slate-800/50 to-slate-700/50',
  errorBackground: 'bg-gradient-to-r from-red-900/80 to-red-800/80',
  warningBackground: 'bg-gradient-to-r from-amber-500 to-orange-600',
  
  // Button gradients
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-600',
  primaryHover: 'hover:from-indigo-400 hover:to-purple-500',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-700',
  successHover: 'hover:from-emerald-500 hover:to-teal-600',
  secondary: 'bg-gradient-to-r from-slate-700/70 to-slate-600/70',
  secondaryHover: 'hover:from-slate-600/80 hover:to-slate-500/80',
  
  // Form field gradients
  input: 'bg-gradient-to-r from-slate-700/80 to-slate-600/80',
  
  // Table header gradients
  tableHeader: 'bg-gradient-to-r from-slate-800/70 to-slate-700/70',
  tableHeaderSecondary: 'bg-gradient-to-r from-slate-700/60 to-slate-600/60',
  
  // Special state gradients
  todayHighlight: 'bg-gradient-to-b from-blue-500/10 to-blue-600/10',
  selected: 'bg-gradient-to-r from-emerald-500 to-teal-600',
  selectedHover: 'hover:from-emerald-400 hover:to-teal-500',
  
  // Text gradients
  titleText: 'bg-gradient-to-r from-white to-slate-200',
  
  // Icon backgrounds
  iconBackground: 'bg-gradient-to-r from-slate-600/80 to-slate-700/80',
  iconBackgroundHover: 'hover:from-slate-500/90 hover:to-slate-600/90',
  errorIcon: 'bg-gradient-to-r from-red-500 to-red-600'
};

// Shadow tokens that pair with gradients
export const shadows = {
  primary: 'shadow-indigo-500/25',
  primaryHover: 'hover:shadow-indigo-500/40',
  success: 'shadow-emerald-500/25',
  successHover: 'hover:shadow-emerald-500/40',
  warning: 'shadow-amber-500/25',
  warningHover: 'hover:shadow-amber-500/40',
  error: 'shadow-red-900/25',
  slate: 'shadow-slate-500/25',
  slateHover: 'hover:shadow-slate-500/40'
};

// Combined gradient + shadow tokens for common patterns
export const buttonStyles = {
  primary: `${gradients.primary} ${shadows.primary} ${gradients.primaryHover} ${shadows.primaryHover}`,
  success: `${gradients.success} ${shadows.success} ${gradients.successHover} ${shadows.successHover}`,
  secondary: `${gradients.secondary} ${gradients.secondaryHover}`,
  warning: `${gradients.warningBackground} ${shadows.warning} ${shadows.warningHover}`
};

// Utility function to get gradient classes
export function getGradient(name) {
  return gradients[name] || '';
}

// Utility function to get shadow classes
export function getShadow(name) {
  return shadows[name] || '';
}

// Button variant system for consistent sizing and styling
export const buttonVariants = {
  // Size variants
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
  
  // Shape variants
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  square: 'rounded-none',
  
  // Base interactive styles
  interactive: 'transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Complete button styles (combining size + style + interactive)
  primarySmall: 'px-3 py-1.5 text-sm rounded-lg transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  primaryMedium: 'px-4 py-2 text-base rounded-lg transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  primaryLarge: 'px-6 py-3 text-lg rounded-lg transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  
  secondarySmall: 'px-3 py-1.5 text-sm rounded-lg backdrop-blur-sm transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  secondaryMedium: 'px-4 py-2 text-base rounded-lg backdrop-blur-sm transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  
  tag: 'px-3 py-1.5 text-sm rounded-full transition-all duration-300 focus:outline-none',
  iconButton: 'p-2 rounded-full transition-all duration-300 focus:outline-none'
};

// Input field variants
export const inputVariants = {
  default: 'px-3 py-2 rounded-lg border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2',
  large: 'px-4 py-3 rounded-lg border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2'
};

// Complete styled button combinations
export const styledButtons = {
  // Primary buttons with full styling
  primary: `${buttonVariants.primaryMedium} text-white ${buttonStyles.primary} shadow-lg focus:ring-2 focus:ring-indigo-500/50`,
  primarySmall: `${buttonVariants.primarySmall} text-white ${buttonStyles.primary} shadow-lg focus:ring-2 focus:ring-indigo-500/50`,
  
  // Success buttons
  success: `${buttonVariants.primaryMedium} text-white ${buttonStyles.success} shadow-lg focus:ring-2 focus:ring-emerald-500/50 border border-emerald-500/30`,
  successSmall: `${buttonVariants.primarySmall} text-white ${buttonStyles.success} shadow-lg focus:ring-2 focus:ring-emerald-500/50 border border-emerald-500/30`,
  
  // Secondary buttons
  secondary: `${buttonVariants.secondaryMedium} text-slate-200 hover:text-white ${buttonStyles.secondary} border border-slate-500/40`,
  secondarySmall: `${buttonVariants.secondarySmall} text-slate-200 hover:text-white ${buttonStyles.secondary} border border-slate-500/40`,
  
  // Danger buttons
  danger: `${buttonVariants.primaryMedium} text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:ring-2 focus:ring-red-500/50 border border-red-500/30`
};

// Utility function to get complete button style
export function getButtonStyle(variant) {
  return styledButtons[variant] || buttonStyles.primary;
}

// Utility function to get button variant classes
export function getButtonVariant(size = 'medium', style = 'primary') {
  const key = `${style}${size.charAt(0).toUpperCase() + size.slice(1)}`;
  return styledButtons[key] || styledButtons[style] || styledButtons.primary;
}