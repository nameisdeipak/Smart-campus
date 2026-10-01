import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

function AIAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const response = await axiosClient.get("/admin/ai-analytics/complete");
      setAnalytics(response.data?.analytics || null);
    } catch (error) {
      console.error("FETCH AI ANALYTICS ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to load AI analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const risk = analytics?.risk || { totalStudents: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
  const locations = analytics?.location?.locations || [];
  const courses = analytics?.courses || [];
  const branches = analytics?.branches || [];
  const insights = analytics?.insights || [];
  const highRiskStudents = analytics?.highRiskStudents || [];

  console.log(highRiskStudents)

  const maxLocation = useMemo(() => Math.max(...locations.map((x) => x.students), 1), [locations]);

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Brain size={15} /> AI Monitoring
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">AI Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            AI-powered academic risk analysis and administrative insights generated from Unified Campus data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh Analysis
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={15} /> AI Service Connected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total Students" value={risk.totalStudents} description="Students analyzed" icon={Users} loading={loading} />
        <Stat title="High Risk" value={risk.highRisk} description="Requires attention" icon={ShieldAlert} iconClass="bg-red-50 text-red-600" loading={loading} />
        <Stat title="Medium Risk" value={risk.mediumRisk} description="Needs monitoring" icon={AlertTriangle} iconClass="bg-amber-50 text-amber-600" loading={loading} />
        <Stat title="Low Risk" value={risk.lowRisk} description="Currently stable" icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-600" loading={loading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel icon={ShieldAlert} title="Risk Distribution" description="Current AI classification of students">
          <div className="space-y-5">
            <RiskBar label="High Risk" value={risk.highRisk} total={risk.totalStudents} color="bg-red-500" text="text-red-600" loading={loading} />
            <RiskBar label="Medium Risk" value={risk.mediumRisk} total={risk.totalStudents} color="bg-amber-400" text="text-amber-600" loading={loading} />
            <RiskBar label="Low Risk" value={risk.lowRisk} total={risk.totalStudents} color="bg-emerald-500" text="text-emerald-600" loading={loading} />
          </div>
        </Panel>

        <Panel icon={MapPin} title="Student Distribution" description="Student concentration by location">
          {loading ? <Skeleton count={5} /> : locations.length === 0 ? <Empty title="No location data" text="Student address data is not available for analysis." /> : (
            <div className="space-y-4">
              {locations.slice(0, 7).map((item) => (
                <div key={item.location}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-700">{item.location}</span>
                    <span className="font-semibold text-slate-900">{item.students}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-800" style={{ width: `${(item.students / maxLocation) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel icon={GraduationCap} title="Course Analytics" description="Enrollment and academic-risk distribution by course" noPadding>
          {loading ? <div className="p-6"><Skeleton count={5} /></div> : courses.length === 0 ? <div className="p-6"><Empty title="No course data" text="Course analytics will appear when student records are available." /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Course</th><th className="px-5 py-3 text-center">Students</th><th className="px-5 py-3 text-center">High</th><th className="px-5 py-3 text-center">Medium</th><th className="px-5 py-3 text-center">Low</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => <tr key={course.course} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-800">{course.course}</td><td className="px-5 py-4 text-center font-semibold">{course.students}</td><td className="px-5 py-4 text-center font-semibold text-red-600">{course.highRisk}</td><td className="px-5 py-4 text-center font-semibold text-amber-600">{course.mediumRisk}</td><td className="px-5 py-4 text-center font-semibold text-emerald-600">{course.lowRisk}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel icon={Building2} title="Branch Analytics" description="Student and risk distribution by branch" noPadding>
          {loading ? <div className="p-6"><Skeleton count={5} /></div> : branches.length === 0 ? <div className="p-6"><Empty title="No branch data" text="Branch analytics will appear when student records are available." /></div> : (
            <div className="divide-y divide-slate-100">
              {branches.slice(0, 7).map((branch) => (
                <div key={branch.branch} className="p-5">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{branch.branch}</p><p className="mt-1 text-xs text-slate-500">{branch.students} students</p></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{branch.highRisk} high risk</span></div>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100"><div className="bg-red-500" style={{ width: `${branch.students ? (branch.highRisk / branch.students) * 100 : 0}%` }} /><div className="bg-amber-400" style={{ width: `${branch.students ? (branch.mediumRisk / branch.students) * 100 : 0}%` }} /><div className="bg-emerald-500" style={{ width: `${branch.students ? (branch.lowRisk / branch.students) * 100 : 0}%` }} /></div>
                  <div className="mt-2 flex gap-4 text-[11px] text-slate-500"><span><b className="text-red-600">{branch.highRisk}</b> High</span><span><b className="text-amber-600">{branch.mediumRisk}</b> Medium</span><span><b className="text-emerald-600">{branch.lowRisk}</b> Low</span></div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel icon={Sparkles} title="AI Generated Insights" description="Actionable observations from current campus data" className="mt-6">
        {loading ? <Skeleton count={3} /> : insights.length === 0 ? <Empty title="No insights available" text="AI insights will appear when enough academic data is available." /> : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((item, index) => <Insight key={`${item.title}-${index}`} item={item} />)}
          </div>
        )}
      </Panel>

      <Panel icon={ShieldAlert} title="Students Requiring Attention" description="Students currently classified as high academic risk" className="mt-6" noPadding>
        {loading ? <div className="p-6"><Skeleton count={5} /></div> : highRiskStudents.length === 0 ? <div className="p-8"><Empty title="No high-risk students" text="No students are currently classified as high academic risk." /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Student</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Internal</th><th className="px-5 py-3">Assignment</th><th className="px-5 py-3">Risk</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {highRiskStudents.slice(0, 10).map((student) => <tr key={String(student.studentId)} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{student.studentName || "Unknown Student"}</p><p className="mt-1 text-xs text-slate-500">{student.enrollmentNumber || "-"}</p></td><td className="px-5 py-4 text-sm text-slate-600">{student.course || "-"}</td><td className="px-5 py-4 text-sm font-semibold">{student.attendance}%</td><td className="px-5 py-4 text-sm">{student.internalMarks}</td><td className="px-5 py-4 text-sm">{student.assignmentScore}</td><td className="px-5 py-4"><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">{student.risk}</span></td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Brain size={19} /></div><div><p className="font-bold text-slate-900">Unified Campus AI Assistant</p><p className="text-sm text-slate-500">Voice assistant will use the same analytics engine in the next step.</p></div></div>
      </div>
    </div>
  );
}

function Stat({ title, value, description, icon: Icon, iconClass = "bg-slate-100 text-slate-700", loading }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : value}</p><p className="mt-1 text-xs text-slate-400">{description}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}><Icon size={21} /></div></div></div>;
}

function Panel({ icon: Icon, title, description, children, className = "", noPadding = false }) {
  return <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}><div className="border-b border-slate-200 p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19} /></div><div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div></div><div className={noPadding ? "" : "p-5 sm:p-6"}>{children}</div></section>;
}

function RiskBar({ label, value, total, color, text, loading }) {
  const percent = total ? (value / total) * 100 : 0;
  return <div><div className="mb-2 flex justify-between"><span className="text-sm font-medium text-slate-600">{label}</span><span className={`text-sm font-bold ${text}`}>{loading ? "..." : value}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${loading ? 0 : percent}%` }} /></div><p className="mt-1 text-right text-[11px] text-slate-400">{loading ? "Calculating..." : `${percent.toFixed(1)}% of students`}</p></div>;
}

function Insight({ item }) {
  const warning = item.type === "WARNING";
  const success = item.type === "SUCCESS";
  const Icon = warning ? AlertTriangle : success ? CheckCircle2 : Sparkles;
  const classes = warning ? "border-amber-200 bg-amber-50 text-amber-700" : success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600";
  return <div className={`rounded-2xl border p-4 ${classes}`}><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80"><Icon size={18} /></div><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 opacity-80">{item.message}</p></div></div></div>;
}

function Skeleton({ count = 3 }) {
  return <div className="space-y-3">{Array.from({ length: count }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}</div>;
}

function Empty({ title, text }) {
  return <div className="flex flex-col items-center justify-center py-6 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Sparkles size={20} /></div><p className="mt-3 font-semibold text-slate-800">{title}</p><p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{text}</p></div>;
}

export default AIAnalytics;