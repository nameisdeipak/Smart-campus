import {
  AlertTriangle,
  MessageCircle,
} from "lucide-react";

function RiskCard({ student }) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-amber-50 p-3">

          <AlertTriangle
            size={22}
            className="text-amber-600"
          />

        </div>

        <div>

          <h2 className="font-bold">
            Early Support
          </h2>

          <p className="text-xs text-slate-500">
            AI risk analysis
          </p>

        </div>

      </div>


      <div className="mt-6 rounded-xl bg-amber-50 p-5">

        <p className="text-sm text-amber-700">
          Current Risk Level
        </p>

        <p className="mt-1 text-3xl font-bold text-amber-800">
          {student.risk}
        </p>

        <p className="mt-2 text-xs leading-5 text-amber-700">

          This is an early-support signal based
          on academic indicators.

        </p>

      </div>


      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800">

        <MessageCircle size={17} />

        Get Academic Support

      </button>

    </div>
  );
}

export default RiskCard;