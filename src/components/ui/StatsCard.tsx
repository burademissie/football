'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'warning';
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-[var(--bg-secondary)]',
      iconColor: 'text-[var(--text-secondary)]',
    },
    primary: {
      iconBg: 'bg-[var(--accent-primary)]/10',
      iconColor: 'text-[var(--accent-primary)]',
    },
    secondary: {
      iconBg: 'bg-[var(--accent-secondary)]/10',
      iconColor: 'text-[var(--accent-secondary)]',
    },
    warning: {
      iconBg: 'bg-[var(--accent-warning)]/10',
      iconColor: 'text-[var(--accent-warning)]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-danger)]'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-[var(--text-muted)]">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${styles.iconBg}`}>
          <Icon className={`w-6 h-6 ${styles.iconColor}`} />
        </div>
      </div>
    </div>
  );
}
