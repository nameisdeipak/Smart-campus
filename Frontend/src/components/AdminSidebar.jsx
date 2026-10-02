import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  CreditCard,
  Brain,
  LogOut,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import axiosClient from "../services/axiosClient";
import useAuthStore from "../store/authStore";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    path: "/admin/students",
    icon: Users,
  },
  {
    label: "Students Subjects",
    path: "/admin/student-subject-enrollment",
    icon: Users,
  },
  {
    label: "Academic Structure",
    path: "/admin/academic-structure",
    icon: GraduationCap,
  },
  {
    label: "Faculty",
    path: "/admin/faculty",
    icon: GraduationCap,
  },
  {
    label: "Parents",
    path: "/admin/parents",
    icon: UserRound,
  },
  {
    label: "Fees",
    path: "/admin/fees",
    icon: CreditCard,
  },
  {
    label: "AI Analytics",
    path: "/admin/ai-analytics",
    icon: Brain,
  },
];

function AdminSidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const user = useAuthStore(
    (state) => state.user
  );

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleMenuClick = (item) => {
    setMobileOpen(false);
    navigate(item.path);
  };

  const isMenuActive = (item) => {
    if (item.path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard";
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  const adminInitial =
    user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-white
          border-r border-slate-200
          shadow-xl

          transition-all duration-300 ease-in-out

          w-[280px]

          lg:sticky
          lg:top-0
          lg:h-screen
          lg:self-start
          lg:z-auto
          lg:shadow-none

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }

          ${collapsed
            ? "lg:w-[82px]"
            : "lg:w-[270px]"
          }
        `}
      >

        {/* =========================================
            HEADER / LOGO
        ========================================== */}
        <div
          className={`
            relative
            flex h-[82px] shrink-0
            items-center
            border-b border-slate-200
            bg-white

            ${collapsed
              ? "justify-center px-3"
              : "justify-between px-5"
            }
          `}
        >

          {/* BRAND */}
          <div
            className={`
              flex items-center
              ${collapsed
                ? "justify-center"
                : "gap-3"
              }
            `}
          >

            {/* LOGO */}
            <div
              className={`
                flex shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                bg-white

                ${collapsed
                  ? "h-11 w-11"
                  : "h-12 w-12"
                }
              `}
            >
              <img
                src="/Ulogo.png"
                alt="Unified Campus Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  console.error(
                    "Logo could not be loaded:",
                    e.currentTarget.src
                  );
                }}
              />
            </div>

            {/* BRAND TEXT */}
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-[17px] font-bold tracking-tight text-slate-900">
                  Unified Campus
                </h1>

                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                  University Digital Campus
                </p>
              </div>
            )}
          </div>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              lg:hidden
            "
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav
          className={`
            flex-1
            overflow-y-auto
            py-5

            ${collapsed
              ? "px-3"
              : "px-4"
            }
          `}
        >

          {/* MENU LABEL */}
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>
          )}

          <div className="space-y-1.5">

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isMenuActive(item);

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    handleMenuClick(item)
                  }
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  className={`
                    group
                    relative
                    flex
                    w-full
                    items-center
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${collapsed
                      ? "justify-center px-3 py-3"
                      : "gap-3 px-3.5 py-3"
                    }

                    ${active
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >

                  {/* ACTIVE INDICATOR */}
                  {active && !collapsed && (
                    <span
                      className="
                        absolute
                        -left-1
                        h-6
                        w-1
                        rounded-full
                        bg-slate-900
                      "
                    />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={
                      active ? 2.4 : 2
                    }
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}

                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}

          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-200 bg-white p-3">

          {/* ADMIN PROFILE */}
          {!collapsed && (
            <div
              className="
                mb-3
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-3
              "
            >

              {/* AVATAR */}
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-900
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {adminInitial}
              </div>

              {/* USER INFO */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || "Administrator"}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  Administrator
                </p>
              </div>
            </div>
          )}

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
            className={`
              flex
              w-full
              items-center
              rounded-xl
              py-3
              text-sm
              font-medium
              text-red-600
              transition

              hover:bg-red-50
              hover:text-red-700

              ${collapsed
                ? "justify-center px-3"
                : "gap-3 px-4"
              }
            `}
          >

            <LogOut
              size={19}
              className="shrink-0"
            />

            {!collapsed && (
              <span>Logout</span>
            )}

          </button>

        </div>

      </aside>
    </>
  );
}

export default AdminSidebar;
