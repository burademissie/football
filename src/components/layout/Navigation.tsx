'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  TrendingUp, 
  Trophy, 
  BarChart3, 
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/fixtures', label: 'Fixtures', icon: Calendar },
  { href: '/value-bets', label: 'Value Bets', icon: Zap },
  { href: '/predictions', label: 'Predictions', icon: TrendingUp },
  { href: '/leagues', label: 'Leagues', icon: Trophy },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[var(--bg-primary)]" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider">
              <span className="text-gradient">FOOTY</span>
              <span className="text-white">EDGE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30' 
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Sync Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span>Live Data</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
