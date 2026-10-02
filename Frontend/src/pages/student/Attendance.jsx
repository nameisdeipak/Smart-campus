import { useEffect, useState } from "react";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

function Attendance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get("/student/attendance").then((res) => setData(res.data)).catch((err) => setError(err.response?.data?.message || "Failed to load attendance"));
  }, []);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Attendance</h1>
      <p className="mt-2 text-sm text-slate-500">Monitor your attendance subject by subject.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[['Overall', `${data?.overall ?? 0}%`], ['Present', data?.records?.filter((r) => r.status === 'present').length ?? 0], ['Absent', data?.records?.filter((r) => r.status === 'absent').length ?? 0]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div>)}
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-4">Subject</th><th>Classes</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance</th></tr></thead><tbody>{(data?.subjects || []).map((item) => <tr key={item.subject} className="border-b last:border-0"><td className="p-4 font-medium">{item.subject}</td><td>{item.total}</td><td>{item.present}</td><td>{item.absent}</td><td>{item.late}</td><td className="font-semibold">{item.percentage}%</td></tr>)}</tbody></table>
      </div>
    </PageLayout>
  );
}

export default Attendance;
