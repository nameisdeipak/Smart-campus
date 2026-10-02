import {
  BookOpen,
  CheckCircle2,
} from "lucide-react";

function RecommendationCard({
  recommendations,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-slate-100 p-3">

          <BookOpen size={21} />

        </div>

        <div>

          <h2 className="font-bold">
            Personalized Learning
          </h2>

          <p className="text-xs text-slate-500">
            AI-generated recommendations
          </p>

        </div>

      </div>


      <div className="mt-5 space-y-3">

        {recommendations.map(
          (recommendation, index) => (

            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
            >

              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-sm text-slate-600">
                {recommendation}
              </p>

            </div>

          )
        )}

      </div>

    </div>
  );
}

export default RecommendationCard;