import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

function AdminLayout() {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const getActivePage = () => {
    const path = location.pathname;

    if (path === "/admin/dashboard") return "Dashboard";
    if (path.startsWith("/admin/students")) return "Students";
    if (path.startsWith("/admin/faculty")) return "Faculty";
    if (path.startsWith("/admin/parents")) return "Parents";
    if (path.startsWith("/admin/attendance")) return "Attendance";
    if (path.startsWith("/admin/performance")) return "Performance";
    if (path.startsWith("/admin/timetable")) return "Timetable";
    if (path.startsWith("/admin/fees")) return "Fees";
    if (path.startsWith("/admin/certificates")) return "Certificates";
    if (path.startsWith("/admin/helpdesk")) return "Helpdesk";
    if (path.startsWith("/admin/ai-analytics")) return "AI Analytics";

    return "Dashboard";
  };

  const activePage = getActivePage();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <AdminSidebar
          activePage={activePage}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            activePage={activePage}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            setMobileOpen={setMobileOpen}
          />

          <main className="min-w-0 flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;