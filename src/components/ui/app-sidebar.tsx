'use client';

import { NavLink } from '@/components/ui/nav-link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '/projects', label: 'Projects' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-background md:block">
        <nav className="px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile burger button */}
      <button
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-xl md:hidden">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <p className="text-sm font-semibold">Navigation</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="px-3 py-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.href} onClick={() => setOpen(false)}>
                    <NavLink href={item.href} label={item.label} />
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
