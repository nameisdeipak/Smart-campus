import {
  ArrowRight,
  BookOpen,
  CreditCard,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axiosClient from "../services/axiosClient";

import { ROLE_ROUTES } from "../config/roleRoutes";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axiosClient.get("/auth/me");

        setUser(response.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    if (!user?.role) {
      navigate("/login");
      return;
    }

    const dashboard =
      ROLE_ROUTES[user.role];

    if (dashboard) {
      navigate(dashboard);
      return;
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">

          {/* Logo */}

          <button
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3"
          >
            <img
              src="/Ulogo.png"
              alt="Unified Campus"
              className="h-11 w-11 rounded-xl object-contain"
            />

            <div className="text-left">

              <h1 className="font-bold leading-tight text-slate-900">
                Unified Campus
              </h1>

              <p className="text-xs text-slate-500">
                Digital University Platform
              </p>

            </div>
          </button>

          {/* Common Authentication */}

          <div className="flex items-center gap-3">

            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
            ) : user ? (
              <button
                onClick={handleDashboard}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Dashboard
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="cursor-pointer rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign In
              </button>
            )}

          </div>

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left */}

          <div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Smart University Digital Campus

            </div>


            <h2 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">

              Your University,

              <span className="block text-slate-500">
                all in one place.
              </span>

            </h2>


            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">

              Unified Campus connects students, administrators,
              faculty and university services through one secure
              digital campus platform.

            </p>


            {/* Buttons */}

            <div className="mt-8 flex flex-wrap gap-4">

              {!user ? (
                <button
                  onClick={handleLogin}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Sign In

                  <ArrowRight size={18} />

                </button>
              ) : (
                <button
                  onClick={handleDashboard}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to Dashboard

                  <ArrowRight size={18} />

                </button>
              )}


              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Explore Features
              </button>

            </div>

          </div>


          {/* Right */}

          <div className="relative">

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

              <img
                src="/students.jpg"
                alt="Students at university"
                className="h-[320px] w-full object-cover sm:h-[380px] md:h-[420px]"
              />

            </div>


            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:block">

              <p className="text-xs text-slate-500">
                Unified Campus
              </p>

              <p className="mt-1 font-bold text-slate-900">
                Learn • Manage • Grow
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="border-y border-slate-200 bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-20">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold text-slate-500">
              ONE DIGITAL CAMPUS
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Everything in one platform.
            </h2>

            <p className="mt-3 text-slate-500">
              A connected digital ecosystem for academic,
              administrative and student services.
            </p>

          </div>


          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <FeatureCard
              icon={BookOpen}
              title="Academic Performance"
              description="Track marks, attendance, performance and personalized learning insights."
            />

            <FeatureCard
              icon={CreditCard}
              title="Fee Management"
              description="View fee details, payment records and university financial information."
            />

            <FeatureCard
              icon={ShieldCheck}
              title="Student Services"
              description="Access attendance, timetable, certificates and helpdesk services."
            />

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-20">

        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center text-white md:px-12">

          <h2 className="text-3xl font-bold">
            Ready to access your campus?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">

            Sign in to access your personalized dashboard
            and university services.

          </p>


          <button
            onClick={
              user
                ? handleDashboard
                : handleLogin
            }
            className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >

            {user
              ? "Go to Dashboard"
              : "Sign In"}

            <ArrowRight size={18} />

          </button>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 Unified Campus
          </p>

          <p>
            Digital Campus • University Services
          </p>

        </div>

      </footer>

    </div>
  );
}


function FeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">

        <Icon size={22} />

      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default Home;