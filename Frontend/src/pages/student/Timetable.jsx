import { useEffect, useState } from "react";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Timetable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axiosClient.get("/student/timetable").then((res) => setItems(res.data.timetable || [])).catch(() => setItems([]));
  }, []);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Timetable</h1>
      <p className="mt-2 text-sm text-slate-500">Your current section timetable.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => {
          const classes = items.filter((item) => item.day === day);
          return <div key={day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">{day}</h2><div className="mt-4 space-y-3">{classes.length ? classes.map((item) => <div key={item._id} className="rounded-xl bg-slate-50 p-3"><p className="font-semibold">{item.subjectId?.name || item.subjectId?.code || "Subject"}</p><p className="mt-1 text-xs text-slate-500">{item.startTime} - {item.endTime} · {item.room || "Room TBA"}</p></div>) : <p className="text-sm text-slate-400">No class scheduled.</p>}</div></div>;
        })}
      </div>
    </PageLayout>
  );
}

export default Timetable;
