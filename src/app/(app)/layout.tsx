import { auth } from '@/auth';
import { signOutAction } from '@/server/actions/auth';
import AppSidebar from '@/components/ui/app-sidebar';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import { LogOut } from 'lucide-react';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const username = session?.user?.name;
  const initials = username
    ? username
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <header className="fixed inset-x-0 top-0 z-30 h-12 border-b border-sidebar-border bg-sidebar">
        <div className="flex h-full items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-tight shadow-sm">
              T
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
              Taskify
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {username && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden text-xs font-medium text-sidebar-foreground/70 sm:block">
                  {username}
                </span>
              </div>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-12">
        <AppSidebar />
        <main className="min-w-0 flex-1 px-6 py-7 lg:px-8">
          <div className="w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <Toaster closeButton />
    </div>
  );
}
