import { useEffect, useState } from "react";
import { Brain, BookOpen, GraduationCap, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";
import useAuthStore from "../../store/authStore";

function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/admin/dashboard/stats");
      setStats(response.data.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = [
    ["Total Students", stats?.totalStudents ?? 0, Users],
    ["Total Faculty", stats?.totalFaculty ?? 0, GraduationCap],
    ["Total Courses", stats?.totalCourses ?? 0, BookOpen],
    ["AI Support Cases", stats?.openHelpdeskTickets ?? 0, Brain],
  ];

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-slate-500">University Overview</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Unified Campus Dashboard</h1><p className="mt-2 text-sm text-slate-500">Welcome back, {user?.name || "Administrator"}.</p></div>
        <button onClick={load} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value, Icon]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between"><p className="text-sm text-slate-500">{title}</p><Icon size={20} className="text-slate-500" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "..." : value}</p></div>)}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[["Branches", stats?.totalBranches], ["Subjects", stats?.totalSubjects], ["Parents", stats?.totalParents], ["Enrollments", stats?.totalEnrollments], ["Fee Records", stats?.totalStudentFees], ["Payments", stats?.totalPayments]].map(([title, value]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : value ?? 0}</p></div>)}
      </div>
    </div>
  );
}

export default AdminDashboard;
