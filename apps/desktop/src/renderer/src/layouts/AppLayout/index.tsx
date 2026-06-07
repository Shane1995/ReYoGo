import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { AppStatusBar } from '@/components/AppStatusBar';
import { EntityTopBar } from '@/components/EntityTopBar';
import UpdateToast from '@/components/UpdateToast';

const AppLayout = () => (
  <div className="flex h-screen flex-col overflow-hidden">
    <EntityTopBar />
    <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
      <AppSidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--content-tint)]">
        <Outlet />
      </main>
    </div>
    <AppStatusBar />
    <UpdateToast />
  </div>
);

export default AppLayout;
