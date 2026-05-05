import { NavLink } from "@/components/ui/nav-link";

const navItems = [{ href: '/projects', label: 'Projects' }];

export default function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-background md:block">
      <nav className="px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
