import { useCallback, useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import PageLayout from "../../components/student/PageLayout";
import axiosClient from "../../services/axiosClient";

let razorpayScriptPromise;

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const loadRazorpayCheckout = () => {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
          return;
        }

        razorpayScriptPromise = null;
        reject(new Error("Razorpay Checkout failed to initialize"));
      };
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error("Could not load Razorpay Checkout"));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

function Fees() {
  const [data, setData] = useState({ fees: [], payments: [] });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [payingFeeId, setPayingFeeId] = useState("");

  const refreshFees = useCallback(async () => {
    const response = await axiosClient.get("/student/fees");
    setData({
      fees: response.data?.fees || [],
      payments: response.data?.payments || [],
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    axiosClient
      .get("/student/fees")
      .then((response) => {
        if (cancelled) return;
        setData({
          fees: response.data?.fees || [],
          payments: response.data?.payments || [],
        });
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(
          requestError.response?.data?.message || "Failed to load fees"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalDue = data.fees.reduce(
    (sum, fee) => sum + Number(fee.dueAmount || 0),
    0
  );
  const totalPaid = data.fees.reduce(
    (sum, fee) => sum + Number(fee.paidAmount || 0),
    0
  );

  const startPayment = async (fee) => {
    if (payingFeeId) return;

    setPayingFeeId(fee._id);
    setError("");
    setNotice("");

    let orderId;
    let paymentReportedSuccessful = false;
    let cancelRequest;

    const markOrderCancelled = async () => {
      if (!orderId || paymentReportedSuccessful) return;
      if (cancelRequest) return cancelRequest;

      cancelRequest = axiosClient
        .post("/student/fees/cancel-order", { orderId })
        .catch((cancelError) => {
          console.error("Failed to update dismissed Razorpay order", cancelError);
        });
      return cancelRequest;
    };

    try {
      const { data: orderData } = await axiosClient.post(
        `/student/fees/${fee._id}/payment-order`
      );
      orderId = orderData.order.id;

      const RazorpayCheckout = await loadRazorpayCheckout();
      const checkout = new RazorpayCheckout({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Unified Campus",
        description: "Student fee payment",
        order_id: orderData.order.id,
        prefill: orderData.prefill,
        theme: { color: "#0f172a" },
        modal: {
          ondismiss: () => {
            void markOrderCancelled().finally(() => setPayingFeeId(""));
          },
        },
        handler: async (paymentResponse) => {
          paymentReportedSuccessful = true;
          setError("");

          try {
            await axiosClient.post("/student/fees/verify-payment", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            setNotice("Payment successful. Your fee balance has been updated.");
            try {
              await refreshFees();
            } catch (refreshError) {
              console.error("Failed to refresh fees after payment", refreshError);
              setError(
                "Payment verified successfully, but the latest fee details could not be loaded. Refresh the page to see them."
              );
            }
          } catch (verificationError) {
            console.error("Razorpay payment verification failed", verificationError);
            setError(
              verificationError.response?.data?.message ||
                "Razorpay reported success, but payment verification did not finish. Please contact the administrator before trying again."
            );
          } finally {
            setPayingFeeId("");
          }
        },
      });

      checkout.on("payment.failed", (event) => {
        void markOrderCancelled().finally(() => {
          setError(
            event.error?.description ||
              "Payment failed. Your fee balance has not been changed."
          );
          setPayingFeeId("");
        });
      });

      checkout.open();
    } catch (paymentError) {
      await markOrderCancelled();
      setError(
        paymentError.response?.data?.message ||
          paymentError.message ||
          "Could not start Razorpay checkout"
      );
      setPayingFeeId("");
    }
  };

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Fees &amp; Payments
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        View assigned fees, balances and payment history.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Due</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(totalDue)}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="p-4">Fee</th>
              <th>Academic Year</th>
              <th>Payable</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Loading fees...
                </td>
              </tr>
            ) : data.fees.length ? (
              data.fees.map((fee) => (
                <tr key={fee._id} className="border-b last:border-0">
                  <td className="p-4 font-medium">
                    {fee.feeStructureId?.feeItems
                      ?.map((item) => item.feeType)
                      .join(", ") || "University Fee"}
                  </td>
                  <td>{fee.academicYear}</td>
                  <td>{formatCurrency(fee.payableAmount)}</td>
                  <td>{formatCurrency(fee.paidAmount)}</td>
                  <td>{formatCurrency(fee.dueAmount)}</td>
                  <td>{fee.status}</td>
                  <td>
                    {fee.dueDate
                      ? new Date(fee.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="pr-4">
                    {Number(fee.dueAmount) > 0 && (
                      <button
                        type="button"
                        onClick={() => startPayment(fee)}
                        disabled={Boolean(payingFeeId)}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                      >
                        <CreditCard size={15} />
                        {payingFeeId === fee._id
                          ? "Opening checkout..."
                          : `Pay ${formatCurrency(fee.dueAmount)}`}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  No fee records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Payment History</h2>
        <div className="mt-4 space-y-3">
          {data.payments.length ? (
            data.payments.map((payment) => (
              <div
                key={payment._id}
                className="flex flex-col justify-between gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row"
              >
                <div>
                  <p className="font-medium">
                    Receipt: {payment.receiptNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(payment.paymentDate).toLocaleDateString()} ·{" "}
                    {payment.paymentMethod} · {payment.status}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    payment.status === "Success"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No payments recorded.</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default Fees;
