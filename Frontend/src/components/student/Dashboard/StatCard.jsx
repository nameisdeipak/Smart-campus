function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

        <div className="rounded-xl bg-slate-100 p-3">

          <Icon size={22} />

        </div>

      </div>

    </div>
  );
}

export default StatCard;