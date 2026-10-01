import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  CreditCard,
  FileBadge,
  MessageCircle,
  Bot,
  GraduationCap,
  X,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import axiosClient from "../../services/axiosClient";
import useAuthStore from "../../store/authStore";
import useStudentStore from "../../store/studentStore";

const menuItems = [
  ["Dashboard", LayoutDashboard, "/student/dashboard"],
  ["Attendance", ClipboardCheck, "/student/attendance"],
  ["Timetable", CalendarDays, "/student/timetable"],
  ["Performance", TrendingUp, "/student/performance"],
  ["Fees", CreditCard, "/student/fees"],
  ["Certificates", FileBadge, "/student/certificates"],
  ["Helpdesk", MessageCircle, "/student/helpdesk"],
  ["AI Assistant", Bot, "/student/ai-assistant"],
];

function Sidebar({ sidebarOpen = false, setSidebarOpen = () => { } }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const clearStudent = useStudentStore((state) => state.clearStudent);

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logoutStore();
      clearStudent();
      navigate("/login", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <div
                className='
                flex shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                bg-white           
                  h-11 w-11'
              >
                <img
                  src="/Ulogo.png"
                  alt="Unified Campus Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    console.error(
                      "Logo could not be loaded:",
                      e.currentTarget.src
                    );
                  }}
                />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Unified Campus</h1>
              <p className="text-xs text-slate-500">Student Portal</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Main Menu</p>
          {menuItems.map(([name, Icon, path]) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={name}
                onClick={() => {
                  navigate(path);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon size={19} />
                {name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {(user?.name || "S").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Student"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || "Student account"}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
