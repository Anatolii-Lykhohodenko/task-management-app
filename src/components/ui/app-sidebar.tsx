'use client';

import { NavLink } from '@/components/ui/nav-link';
import { useState } from 'react';
import { Menu, X, LayoutGrid, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/projects', label: 'Projects', icon: LayoutGrid },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

// ← вынесено за пределы AppSidebar
function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-0.5">
      {navItems.map((item) => (
        <div key={item.href} onClick={onNavigate}>
          <NavLink href={item.href} label={item.label} icon={item.icon} />
        </div>
      ))}
    </div>
  );
}

export default function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <nav className="flex-1 px-2 py-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Menu
          </p>
          <NavItems />
        </nav>
      </aside>

      {/* Mobile burger */}
      <button
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/30 md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 bg-sidebar shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <p className="text-sm font-semibold text-sidebar-foreground">
                Navigation
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="px-2 py-3">
              <NavItems onNavigate={() => setOpen(false)} />
            </nav>
          </div>
        </>
      )}
    </>
  );
}
