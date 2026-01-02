
import { SidebarProvider } from '../../../components/components/sidebar';
import { AppSidebar } from '../../../components/components/app-sidebar';
import { Header } from '../../../components/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col sm:pl-64">
          <Header />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
