import { useEffect, useState } from "react";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get("/student/certificates").then((res) => setCertificates(res.data.certificates || [])).catch((err) => setError(err.response?.data?.message || "Failed to load certificates"));
  }, []);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Certificates</h1>
      <p className="mt-2 text-sm text-slate-500">View certificates issued for your account.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">{certificates.length ? certificates.map((certificate) => <div key={certificate._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold capitalize">{certificate.certificateType}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{certificate.status}</span></div>{certificate.issuedAt && <p className="mt-2 text-sm text-slate-500">Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>}{certificate.certificateUrl && <a className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline" href={certificate.certificateUrl} target="_blank" rel="noreferrer">View certificate</a>}</div>) : <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-10 text-center"><p className="text-lg font-semibold text-slate-800">No certificates available</p><p className="mt-2 text-sm text-slate-500">Issued certificates will appear here.</p></div>}</div>
    </PageLayout>
  );
}

export default Certificates;
