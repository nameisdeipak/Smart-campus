import { useEffect, useState } from "react";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

function Fees() {
  const [data, setData] = useState({ fees: [], payments: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get("/student/fees").then((res) => setData(res.data)).catch((err) => setError(err.response?.data?.message || "Failed to load fees"));
  }, []);

  const totalDue = data.fees.reduce((sum, fee) => sum + Number(fee.dueAmount || 0), 0);
  const totalPaid = data.fees.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Fees & Payments</h1>
      <p className="mt-2 text-sm text-slate-500">View assigned fees, balances and payment history.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total Paid</p><p className="mt-2 text-3xl font-bold text-slate-900">₹{totalPaid.toLocaleString()}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total Due</p><p className="mt-2 text-3xl font-bold text-slate-900">₹{totalDue.toLocaleString()}</p></div></div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-4">Fee</th><th>Academic Year</th><th>Payable</th><th>Paid</th><th>Due</th><th>Status</th><th>Due Date</th></tr></thead><tbody>{data.fees.map((fee) => <tr key={fee._id} className="border-b last:border-0"><td className="p-4 font-medium">{fee.feeStructureId?.name || "University Fee"}</td><td>{fee.academicYear}</td><td>₹{Number(fee.payableAmount || 0).toLocaleString()}</td><td>₹{Number(fee.paidAmount || 0).toLocaleString()}</td><td>₹{Number(fee.dueAmount || 0).toLocaleString()}</td><td>{fee.status}</td><td>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}</td></tr>)}</tbody></table></div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">Payment History</h2><div className="mt-4 space-y-3">{data.payments.length ? data.payments.map((payment) => <div key={payment._id} className="flex flex-col justify-between gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row"><div><p className="font-medium">Receipt: {payment.receiptNumber}</p><p className="text-xs text-slate-500">{new Date(payment.paymentDate).toLocaleDateString()} · {payment.paymentMethod}</p></div><p className="font-semibold text-emerald-600">₹{Number(payment.amount || 0).toLocaleString()}</p></div>) : <p className="text-sm text-slate-500">No payments recorded.</p>}</div></div>
    </PageLayout>
  );
}

export default Fees;
