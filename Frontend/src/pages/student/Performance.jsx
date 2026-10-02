import { useEffect, useState } from "react";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

function Performance() {
  const [performance, setPerformance] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get("/student/performance").then((res) => setPerformance(res.data.performance || [])).catch((err) => setError(err.response?.data?.message || "Failed to load performance"));
  }, []);

  const average = performance.length ? (performance.reduce((sum, item) => sum + item.predictedMarks, 0) / performance.length).toFixed(1) : 0;

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Academic Performance</h1>
      <p className="mt-2 text-sm text-slate-500">Track your marks and predicted performance.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Average predicted score</p><p className="mt-2 text-4xl font-bold text-slate-900">{average}%</p></div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-4">Subject</th><th>Internal</th><th>Assignment</th><th>Previous</th><th>Prediction</th></tr></thead><tbody>{performance.map((item) => <tr key={item.subject} className="border-b last:border-0"><td className="p-4 font-medium">{item.subject}</td><td>{item.internalMarks}</td><td>{item.assignmentScore}</td><td>{item.previousMarks}</td><td className="font-semibold">{item.predictedMarks}%</td></tr>)}</tbody></table></div>
    </PageLayout>
  );
}

export default Performance;
