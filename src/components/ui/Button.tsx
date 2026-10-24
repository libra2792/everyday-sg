import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-canvas hover:bg-sage-900 border border-ink',
  secondary: 'bg-stone-50 text-ink border border-stone-300 hover:border-sage-500 hover:bg-sage-50',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-stone-200 border border-transparent',
  danger: 'bg-stone-50 text-clay-700 border border-stone-300 hover:border-clay-500 hover:bg-clay-100',
};
const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-2.5 py-1.5',
  md: 'text-sm px-3.5 py-2',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'secondary', size = 'md', icon, iconRight, className = '', children, type = 'button', ...rest }, ref) {
  return (
    <button ref={ref} type={type} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 16} />}
    </button>
  );
});

interface LinkButtonProps {
  to: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  className?: string;
  children: ReactNode;
  external?: boolean;
}

export function LinkButton({ to, variant = 'secondary', size = 'md', icon, iconRight, className = '', children, external }: LinkButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        {icon && <Icon name={icon} size={16} />}
        {children}
        <Icon name="external-link" size={14} />
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </Link>
  );
}
