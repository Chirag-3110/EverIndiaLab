import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Detect mobile viewport (simple approach)
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamically compute sidebar width
  const sidebarWidth = React.useMemo(() => {
    if (isMobile) {
      // On mobile, sidebar when open overlays and does not push content
      return isMobileOpen ? 0 : 0; // content full width if sidebar closed
    }
    // Desktop logic: expanded or hovered sidebar width, otherwise collapsed width
    if (isExpanded || isHovered) return 290;
    return 90;
  }, [isExpanded, isHovered, isMobileOpen, isMobile]);

  // Content styles, adjusted for mobile full width when sidebar closed
  const contentStyle: React.CSSProperties = {
    width:
      isMobile && !isMobileOpen ? "100%" : `calc(100% - ${sidebarWidth}px)`,
    marginLeft: isMobile && !isMobileOpen ? 0 : `${sidebarWidth}px`,
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
