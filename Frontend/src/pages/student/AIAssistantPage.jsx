import { useEffect, useState } from "react";
import PageLayout from "../../components/student/PageLayout";
import AIAssistant from "../../components/student/Dashboard/AIAssistant";
import axiosClient from "../../services/axiosClient";

function AIAssistantPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/student/ai").then((res) => setData(res.data)).catch(() => setData(null));
  }, []);

  return (
    <PageLayout>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">AI Academic Assistant</h1>
        <p className="mt-2 text-sm text-slate-500">Ask questions and get answers based on your current campus data.</p>
      </div>
      <div className="mt-6">
        <AIAssistant />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Support Risk</p><p className="mt-2 text-4xl font-bold text-slate-900">{data?.risk || "-"}</p><p className="mt-3 text-sm text-slate-500">Prediction source: {data?.source || "loading"}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Predicted Score</p><p className="mt-2 text-4xl font-bold text-slate-900">{data?.prediction?.toFixed?.(1) || data?.prediction || 0}%</p></div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Recommendations</h2><div className="mt-4 space-y-3">{(data?.recommendations || ["Keep your attendance and assignments up to date."]).map((item) => <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{item}</div>)}</div></div>
    </PageLayout>
  );
}

export default AIAssistantPage;
