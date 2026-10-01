function PerformanceCard({ student }) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

      <h2 className="text-lg font-bold text-slate-900">
        Academic Performance
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Powered by Python Machine Learning
      </p>


      {/* Progress */}

      <div className="mt-8">

        <div className="mb-2 flex justify-between">

          <span className="text-sm text-slate-600">
            Predicted Final Performance
          </span>

          <span className="font-bold">
            {student.predictedMarks}%
          </span>

        </div>


        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-1000"
            style={{
              width: `${student.predictedMarks}%`,
            }}
          />

        </div>

      </div>


      {/* Academic Stats */}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Internal Marks
          </p>

          <p className="mt-1 text-2xl font-bold">
            {student.internalMarks}
          </p>

        </div>


        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Assignment Score
          </p>

          <p className="mt-1 text-2xl font-bold">
            {student.assignmentScore}
          </p>

        </div>


        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Previous Marks
          </p>

          <p className="mt-1 text-2xl font-bold">
            {student.previousMarks}
          </p>

        </div>

      </div>

    </div>
  );
}

export default PerformanceCard;