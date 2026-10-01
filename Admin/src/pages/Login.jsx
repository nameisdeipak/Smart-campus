import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

import { ROLE_ROUTES } from "../config/roleRoutes";

import axiosClient from "../services/axiosClient";
import useAuthStore from "../store/authStore";

function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      const user = response.data.user;

      login(user);


      const redirectPath = ROLE_ROUTES[user.role];

      if (!redirectPath) {
        throw new Error(
          "This account does not have a dashboard configured."
        );
      }

      navigate(redirectPath);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      if (user.role === "student") {
        navigate("/student/dashboard");

        return;
      }

      alert(
        "This account does not have dashboard access."
      );

    } catch (error) {
      console.error("Login failed:", error);

      alert(
        error.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="flex min-h-screen">


        <div className="relative hidden w-1/2 overflow-hidden lg:flex">

          {/* Background */}
          <div className="absolute inset-0 bg-black" />

          {/* Decorative circles */}
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 backdrop-blur">

                <GraduationCap
                  size={25}
                  className="text-blue-400"
                />

              </div>

              <div>
                <h1 className="text-lg font-bold text-white">
                  Unified Campus
                </h1>

                <p className="text-xs text-slate-400">
                  Digital University Platform
                </p>
              </div>

            </div>


            {/* Main Content */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2">

                <ShieldCheck
                  size={16}
                  className="text-blue-400"
                />

                <span className="text-sm font-medium text-blue-300">
                  Secure Digital Campus
                </span>

              </div>


              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">

                One platform for
                <span className="block text-blue-400">
                  smarter education.
                </span>

              </h2>


              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">

                Manage students, faculty, attendance, academic
                performance and intelligent campus services from
                one unified platform.

              </p>


              {/* Features */}

              <div className="mt-10 grid grid-cols-2 gap-4">

                <Feature
                  title="Student Management"
                  text="Complete student lifecycle"
                />

                <Feature
                  title="AI Insights"
                  text="Performance & risk prediction"
                />

                <Feature
                  title="Digital Services"
                  text="Unified campus services"
                />

                <Feature
                  title="Secure Access"
                  text="Role-based authentication"
                />

              </div>

            </div>


            {/* Footer */}

            <p className="text-sm text-slate-500">
              © 2026 Unified Campus
            </p>

          </div>

        </div>



        <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}

            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">

                <GraduationCap
                  size={24}
                  className="text-blue-400"
                />

              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  Unified Campus
                </h1>

                <p className="text-xs text-slate-500">
                  Digital University Platform
                </p>
              </div>

            </div>


            {/* Login Card */}

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">

              {/* Heading */}

              <div className="mb-8">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <ShieldCheck
                    size={24}
                    className="text-blue-600"
                  />

                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access the Unified Campus
                  administration portal.
                </p>

              </div>


              {/* Form */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="admin@smartcampus.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>


                {/* Password */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>

                </div>


                {/* Remember / Security */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <div className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs text-slate-500">
                      Secure connection
                    </span>

                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Admin Portal
                  </span>

                </div>


                {/* Login Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-600 hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to Dashboard

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>


              {/* Bottom Info */}

              <div className="mt-8 border-t border-slate-100 pt-6">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    Your account is protected with secure
                    authentication. Only authorized university
                    administrators can access this portal.
                  </p>

                </div>

              </div>

            </div>


            {/* Bottom */}

            <p className="mt-6 text-center text-xs text-slate-400">
              Unified Campus • Administration Portal
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}



function Feature({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">

      <div className="mb-2 h-2 w-2 rounded-full bg-blue-400" />

      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

export default Login;

