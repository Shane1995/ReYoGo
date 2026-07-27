import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { AppStatusBar } from '@/components/AppStatusBar';
import { EntityTopBar } from '@/components/EntityTopBar';
import UpdateToast from '@/components/UpdateToast';

const AppLayout = () => (
  <div className="flex h-screen flex-col overflow-hidden print:h-auto print:overflow-visible print:bg-white">
    <div className="print:hidden">
      <EntityTopBar />
    </div>
    <div className="flex min-h-0 flex-1 flex-row overflow-hidden print:block print:overflow-visible">
      <div className="print:hidden">
        <AppSidebar />
      </div>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--content-tint)] print:overflow-visible print:bg-white print:text-black">
        <Outlet />
      </main>
    </div>
    <div className="print:hidden">
      <AppStatusBar />
    </div>
    <UpdateToast />
  </div>
);

export default AppLayout;
