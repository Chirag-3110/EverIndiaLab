import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import React from "react";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamically compute sidebar width
  const sidebarWidth = React.useMemo(() => {
    if (isMobileOpen) return 0; // overlay on mobile
    if (isExpanded || isHovered) return 290; // expanded sidebar
    return 90; // collapsed sidebar
  }, [isExpanded, isHovered, isMobileOpen]);

  // Inline style ensures dynamic width works perfectly across zoom levels
  const contentStyle: React.CSSProperties = {
    width: `calc(100% - ${sidebarWidth}px)`,
    marginLeft: `${sidebarWidth}px`,
    transition: "all 0.3s ease-in-out",
    minHeight: "100vh",
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50">
      {/* Sidebar + Backdrop */}
      <div className="fixed top-0 left-0 h-full z-40">
        <AppSidebar />
        <Backdrop />
      </div>

      {/* Main content */}
      <div style={contentStyle} className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-screen-2xl mx-auto transition-all duration-300 ease-in-out">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
