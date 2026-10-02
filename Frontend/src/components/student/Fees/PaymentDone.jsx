import React from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { useLocation } from "react-router-dom";

const PaymentDone = () => {
  const query = new URLSearchParams(useLocation().search);
  const reference = query.get("reference");

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2
              size={36}
              className="text-emerald-600"
            />
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Payment Successful
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your fee payment has been successfully processed.
            Please keep the payment reference ID for your records.
          </p>

          {/* Reference ID */}
          <div className="mt-6 w-full max-w-md rounded-xl bg-slate-50 p-4 text-left">
            <p className="text-xs font-medium text-slate-500">
              Payment Reference ID
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="break-all font-mono text-sm font-semibold text-slate-900">
                {reference || "XYZ1234"}
              </p>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(reference || "XYZ1234")
                }
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                title="Copy reference ID"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mt-5 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Payment Verified
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDone;