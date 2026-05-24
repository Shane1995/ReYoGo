import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import UpdateToast from '@/components/UpdateToast';
import VersionBar from '@/components/VersionBar';

const AppLayout = () => (
  <div className="flex h-screen flex-col overflow-hidden">
    <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
      <AppSidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--content-tint)]">
        <Outlet />
      </main>
    </div>
    <VersionBar />
    <UpdateToast />
  </div>
);

export default AppLayout;
