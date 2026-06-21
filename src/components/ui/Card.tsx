import React from 'react';
import { cn } from '../../lib/cn';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }> = ({
  className,
  hover,
  ...props
}) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200 bg-white shadow-card',
      hover && 'transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:border-brand-200',
      className
    )}
    {...props}
  />
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-between gap-4 border-b border-slate-100 p-6', className)} {...props} />
);
