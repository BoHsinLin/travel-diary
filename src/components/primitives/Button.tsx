import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './objects.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  children: ReactNode;
};

export function Button({ size = 'medium', variant = 'primary', loading = false, children, disabled, className = '', ...props }: ButtonProps) {
  return (
    <button className={`button button--${size} button--${variant} ${className}`} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading ? '儲存中…' : children}
    </button>
  );
}
