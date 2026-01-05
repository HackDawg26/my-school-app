
'use client';

import {Link, useLocation} from 'react-router-dom';
import {
  Sidebar,
  SidebarBody,
  SidebarContent,
  SidebarHeader,
  SidebarHeading,
  SidebarInset,
} from './sidebar';
import {
  LayoutGrid,
  Book,
  ClipboardCheck,
  FileQuestion,
  Library,
  GraduationCap,
} from 'lucide-react/dist/lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/subjects', label: 'Subjects', icon: Book },
  { href: '/tasks', label: 'Tasks', icon: ClipboardCheck },
  { href: '/activities', label: 'Activities', icon: FileQuestion },
  { href: '/materials', label: 'Materials', icon: Library },
  { href: '/grades', label: 'Grades', icon: GraduationCap },
];

const SchoolLogo = () => (
    <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <svg
                className="h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        </div>
        <SidebarHeading>ClaroEd</SidebarHeading>
    </div>
);


const NavLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) => {
  const location = useLocation();
  const isActive = location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));

  return (
    <Link
      to={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate">{label}</span>
    </Link>
  );
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <SchoolLogo />
        </SidebarHeader>
        <SidebarBody className="flex flex-col">
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <SidebarInset key={item.label}>
                <NavLink {...item} />
              </SidebarInset>
            ))}
          </nav>
        </SidebarBody>
      </SidebarContent>
    </Sidebar>
  );
}
