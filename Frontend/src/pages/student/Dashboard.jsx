import { useEffect } from "react";
import { AlertTriangle, ClipboardCheck, Clock3, TrendingUp } from "lucide-react";
import PageLayout from "../../components/student/PageLayout";
import useStudentStore from "../../store/studentStore";

function Dashboard() {
  const { student, loading, error, fetchStudent } = useStudentStore();

  useEffect(() => {
    if (!student) fetchStudent();
  }, [student, fetchStudent]);

  if (loading || !student) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          {error ? <p className="text-sm text-red-500">{error}</p> : <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />}
        </div>
      </PageLayout>
    );
  }

  const profile = student.profile || student;
  const attendance = student.attendance || {};
  const performance = student.performance || [];
  const risk = student.risk || "LOW";
  const recommendations = student.recommendations || [];

  const stats = [
    ["Attendance", `${attendance.overall || 0}%`, ClipboardCheck],
    ["Predicted Score", `${student.predictedMarks || 0}%`, TrendingUp],
    ["Support Risk", risk, AlertTriangle],
    ["Study Hours", `${student.studyHours || 0} hrs`, Clock3],
  ];

  return (
    <PageLayout>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Student Overview</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Welcome, {profile.userId?.name || "Student"}</h1>
          <p className="mt-2 text-sm text-slate-500">{profile.enrollmentNumber} · {profile.branch} · Semester {profile.semester} · Section {profile.section || "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Unified Campus</div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([title, value, Icon]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{title}</p>
              <Icon size={20} className="text-slate-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Academic Performance</h2>
              <p className="mt-1 text-sm text-slate-500">Current marks and AI prediction</p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="pb-3">Subject</th><th className="pb-3">Internal</th><th className="pb-3">Assignment</th><th className="pb-3">Prediction</th></tr></thead>
              <tbody>{performance.map((item) => <tr key={item.subject} className="border-b last:border-0"><td className="py-3 font-medium text-slate-800">{item.subject}</td><td>{item.internalMarks}</td><td>{item.assignmentScore}</td><td className="font-semibold">{item.predictedMarks}%</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">AI Support</h2>
          <div className={`mt-4 rounded-xl p-4 ${risk === "HIGH" ? "bg-red-50 text-red-700" : risk === "MEDIUM" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
            <p className="text-xs font-semibold uppercase">Current risk</p>
            <p className="mt-1 text-2xl font-bold">{risk}</p>
          </div>
          <div className="mt-5 space-y-3">
            {recommendations.map((item) => <p key={item} className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{item}</p>)}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default Dashboard;
