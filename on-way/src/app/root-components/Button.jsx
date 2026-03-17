import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {

  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none';

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white hover:opacity-90',
    secondary:
      'bg-[var(--color-secondary)] text-black hover:brightness-95',
    outline:
      'border border-gray-300 text-[var(--color-primary)] hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
