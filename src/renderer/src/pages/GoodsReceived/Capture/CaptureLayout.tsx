import { Outlet } from "react-router-dom";

export function CaptureLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-[var(--content-tint)]">
      <div className="container mx-auto flex min-h-0 flex-1 flex-col px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
}
