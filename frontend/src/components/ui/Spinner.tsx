import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };
  return (
    <div
      className={`spinner ${sizeClasses[size]} border-cyan-500 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Add to global.css (or modify existing spinner if you prefer one source of truth)
// @keyframes spin {
//   to {
//     transform: rotate(360deg);
//   }
// }
// .animate-spin {
//   animation: spin 1s linear infinite;
// }

export { Spinner };