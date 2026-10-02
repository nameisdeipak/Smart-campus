import { Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import axiosClient from "../../services/axiosClient";
import useAuthStore from "../../store/authStore";
import useStudentStore from "../../store/studentStore";

function Header({ setSidebarOpen }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const clearStudent = useStudentStore((state) => state.clearStudent);

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      logoutStore();
      clearStudent();
      navigate("/login", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="hidden md:block">
          <p className="text-sm text-slate-500">Unified Campus Student Portal</p>
          <p className="text-xs text-slate-400">Academic and digital campus services</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 hover:bg-slate-100" title="Notifications">
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">{user?.name || "Student"}</p>
          <p className="text-xs text-slate-500">Student</p>
        </div>
        <button onClick={logout} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;
