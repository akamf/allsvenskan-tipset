import { useState } from 'react'
import { Activity, ChartNoAxesCombined, Copyright, Menu, ShieldHalf, ShieldPlus, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import logoUrl from '@/assets/logo.png'
import { cn } from '@/lib/utils'

const navigation = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/predictions', label: 'Predictions', icon: ShieldHalf },
  { to: '/rules', label: 'Rules', icon: ShieldPlus },
  { to: '/history', label: 'History', icon: ChartNoAxesCombined },
]

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen text-foreground">
      <div className="relative container mx-auto w-full max-w-[calc(100vw-1.5rem)] py-6 sm:py-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-[#826a4b]/25 bg-[#f6f0e4]/90 px-4 py-4 shadow-[0_16px_40px_rgba(120,101,69,0.08)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#826a4b]/35 bg-[#f7f0e4]">
                <img
                  alt="Allsvenskan Tipset logo"
                  className="h-full w-full object-contain p-1"
                  src={logoUrl}
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-semibold tracking-[0.12em] text-[#293124] sm:text-2xl">
                  ALLSVENSKAN BEER BET 2026
                </h1>
              </div>
            </div>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#826a4b]/35 bg-[#f3ecdf] text-[#46513d] transition hover:bg-[#ebe0cd] sm:hidden"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              type="button"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          <nav className="hidden flex-wrap gap-2 sm:flex">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'border-[#6f845e] bg-[#6f845e] text-[#f7f0e4]'
                      : 'border-[#a68d6b]/35 bg-[#f3ecdf] text-[#46513d] hover:bg-[#ebe0cd]'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          {isMobileMenuOpen ? (
            <nav
              id="mobile-navigation"
              className="grid gap-2 rounded-[24px] border border-[#826a4b]/20 bg-[#f3ecdf] p-2 shadow-[0_12px_28px_rgba(120,101,69,0.12)] sm:hidden"
            >
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'border-[#6f845e] bg-[#6f845e] text-[#f7f0e4]'
                        : 'border-[#a68d6b]/25 bg-[#f7f0e4] text-[#46513d] hover:bg-[#ebe0cd]'
                    )
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </header>
        <Outlet />
        <footer className="mt-10 flex flex-col items-center gap-3 border-t border-[#a68d6b]/25 py-5 text-center text-xs text-[#655640] sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span className="inline-flex items-center gap-2 font-bold">Powered by API-FOOTBALL</span>
          <span className="inline-flex items-center gap-2">
            <Copyright className="h-3.5 w-3.5" />
            Andreas Kamf
          </span>
          <a
            aria-label="GitHub"
            className="inline-flex items-center text-[#655640] transition hover:text-[#2d3527]"
            href="https://github.com/akamf/allsvenskan-tipset"
            rel="noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.69-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.27 1.17-3.07-.12-.29-.5-1.46.11-3.04 0 0 .95-.3 3.11 1.17a10.86 10.86 0 0 1 5.66 0c2.16-1.47 3.11-1.17 3.11-1.17.61 1.58.23 2.75.11 3.04.73.8 1.17 1.82 1.17 3.07 0 4.41-2.69 5.38-5.26 5.67.41.35.77 1.05.77 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>
        </footer>
      </div>
    </div>
  )
}
