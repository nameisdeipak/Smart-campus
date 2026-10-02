import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

const categories = ["Academic", "Fees", "Attendance", "Examination", "Technical", "Hostel", "Transport", "Certificate", "Library", "Other"];

function Helpdesk() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ category: "Academic", subject: "", description: "", priority: "Medium" });
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    try {
      const response = await axiosClient.get("/student/helpdesk");
      setTickets(response.data.tickets || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tickets");
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await axiosClient.post("/student/helpdesk", form);
      setForm({ category: "Academic", subject: "", description: "", priority: "Medium" });
      toast.success("Support request submitted");
      loadTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Helpdesk</h1>
      <p className="mt-2 text-sm text-slate-500">Create and track your university support requests.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Raise a Request</h2>
          <div className="mt-5 space-y-4">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">{categories.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="Subject" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={6} placeholder="Describe your issue..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <button disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Submitting..." : "Submit Request"}</button>
          </div>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">My Tickets</h2>
          <div className="mt-4 space-y-3">{tickets.length ? tickets.map((ticket) => <div key={ticket._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{ticket.ticketNumber}</p><span className="rounded-full bg-white px-3 py-1 text-xs">{ticket.status}</span></div><p className="mt-2 text-sm font-medium">{ticket.subject}</p><p className="mt-1 text-xs text-slate-500">{ticket.category} · {ticket.priority}</p><p className="mt-3 text-sm text-slate-600">{ticket.description}</p>{ticket.response && <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-600"><b>Response:</b> {ticket.response}</p>}</div>) : <p className="text-sm text-slate-500">No support tickets yet.</p>}</div>
        </section>
      </div>
    </PageLayout>
  );
}

export default Helpdesk;
