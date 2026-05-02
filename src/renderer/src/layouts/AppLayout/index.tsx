import { TopNav } from "@/components/TopNav";
import VersionBar from "@/components/VersionBar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      <VersionBar />
    </div>
  );
};

export default AppLayout;
