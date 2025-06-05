// src/components/ui/Button.tsx
import React from 'react';
import { cn } from '../../lib/utils'; // Import cn

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean; // For AlertDialog compatibility if using Radix Slot
}

const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

const variantStyles = {
  default: 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm',
  destructive: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm',
  outline: 'border border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-900/20',
  ghost: 'hover:bg-cyan-100 text-cyan-600 dark:hover:bg-cyan-800/30 dark:text-cyan-400',
  link: 'text-cyan-600 underline-offset-4 hover:underline dark:text-cyan-400',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs h-9', // Adjusted for consistent height
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-11',
};

// This is the function AlertDialog can use
export const buttonVariants = ({ variant = 'default', size = 'md', className = '' }: Partial<ButtonProps> & {className?: string}) => {
  return cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'default', size = 'md', isLoading = false, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'; // Simplified, Radix Slot handles this better

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))} // Use the exported variants
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <div className="spinner-xs mr-2"></div>} {/* Ensure spinner-xs is defined */}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };