import { auth } from '@/auth';
import { signOutAction } from '@/server/actions/auth';
import AppSidebar from '@/components/ui/app-sidebar';
import Link from 'next/link';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const username = session?.user?.name;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="h-14 border-b bg-background">
        <div className="flex h-full items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold">
              T
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none">Taskify</p>
              <p className="text-xs text-muted-foreground mt-1">Workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {username && (
              <span className="hidden text-sm text-muted-foreground sm:block">
                {username}
              </span>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <AppSidebar />
        <main className="min-w-0 flex-1 px-8 py-8 lg:px-10">
          <div className="w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
