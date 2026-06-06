'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type Props = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export function NavLink({ href, label, icon: Icon }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/40'
          )}
        />
      )}
      {label}
    </Link>
  );
}
