import { CalendarDays } from "lucide-react";

const classes = [
  {
    time: "09:00 AM",
    subject: "Database Management",
    room: "Room 204",
  },
  {
    time: "11:00 AM",
    subject: "Machine Learning",
    room: "Lab 3",
  },
  {
    time: "02:00 PM",
    subject: "Computer Networks",
    room: "Room 108",
  },
];

function TimetableCard() {

  return (

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-slate-100 p-3">

          <CalendarDays size={21} />

        </div>

        <div>

          <h2 className="font-bold">
            Today's Schedule
          </h2>

          <p className="text-xs text-slate-500">
            Upcoming classes
          </p>

        </div>

      </div>


      <div className="mt-5 grid gap-3 md:grid-cols-3">

        {classes.map((item) => (

          <div
            key={item.time}
            className="rounded-xl bg-slate-50 p-4"
          >

            <p className="text-xs text-slate-500">
              {item.time}
            </p>

            <p className="mt-2 font-semibold">
              {item.subject}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {item.room}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default TimetableCard;