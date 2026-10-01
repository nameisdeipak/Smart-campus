import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  ChevronDown,
  User,
  Settings,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import useAuthStore from "../store/authStore";

function AdminHeader({
  activePage,
  collapsed,
  setCollapsed,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const [profileOpen, setProfileOpen] =
    useState(false);

  const adminInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    "A";

  const handleProfile = () => {
    setProfileOpen(false);
    navigate("/admin/profile");
  };

  const handleSettings = () => {
    setProfileOpen(false);
    navigate("/admin/settings");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 lg:flex"
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <ChevronRight size={19} />
            ) : (
              <ChevronLeft size={19} />
            )}
          </button>

          <div className="min-w-0">
            <p className="hidden text-xs font-medium uppercase tracking-wider text-slate-400 sm:block">
              Unified Campus
            </p>

            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
              {activePage}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
          </button>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) => !previous
                )
              }
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 sm:gap-3 sm:px-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {adminInitial}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-900">
                  {user?.name ||
                    "Administrator"}
                </p>

                <p className="text-[11px] text-slate-500">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
                      {adminInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {user?.name ||
                          "Administrator"}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user?.email || "Admin"}
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        ADMIN
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    <User
                      size={18}
                      className="text-slate-500"
                    />

                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSettings}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    <Settings
                      size={18}
                      className="text-slate-500"
                    />

                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="w-full rounded-xl px-3 py-2 text-left text-xs text-slate-400 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;