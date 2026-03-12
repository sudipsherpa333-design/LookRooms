import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  PlusCircle,
  User,
  Map as MapIcon,
  LayoutGrid,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  FileText,
  MessageSquare,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

import { ChatNotificationBadge } from "./chat/ChatNotificationBadge";

export default function Layout() {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navLinks = [
    {
      to: "/",
      icon: Search,
      label: "Explore",
      roles: ["user", "homeowner", "admin", "guest"],
    },
    { to: "/saved", icon: Heart, label: "Saved", roles: ["user"] },
    { to: "/chat", icon: ChatNotificationBadge, label: "Messages", roles: ["user", "homeowner"] },
    {
      to: "/applications",
      icon: FileText,
      label: "Applications",
      roles: ["user", "homeowner"],
    },
    {
      to: "/add-listing",
      icon: PlusCircle,
      label: "Add Room",
      roles: ["homeowner", "admin"],
    },
    {
      to: "/dashboard",
      icon: LayoutGrid,
      label: "Dashboard",
      roles: ["homeowner"],
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile",
      roles: ["user", "homeowner"],
    },
    { to: "/admin", icon: ShieldAlert, label: "Admin", roles: ["admin"] },
    { to: "/support", icon: LifeBuoy, label: "Support", roles: ["user", "homeowner", "admin", "guest"] },
  ];

  const currentRole = user?.role || "guest";
  const visibleLinks = navLinks.filter((link) =>
    link.roles.includes(currentRole),
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans text-stone-900">
      {/* Desktop Sidebar / Topbar */}
      <header className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 h-screen sticky top-0 p-4 shrink-0 z-50">
        <Link
          to="/"
          className="text-2xl font-bold text-emerald-600 mb-8 flex items-center gap-2 px-2"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="/LookRooms logo design with magnifying glass.png" 
              alt="LookRooms" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).style.display = 'none';
                (e.target as any).nextSibling.style.display = 'block';
              }}
            />
            <Search className="w-6 h-6 hidden" />
          </div>
          <span className="tracking-tight">LookRooms</span>
        </Link>
        <nav className="flex flex-col gap-2 flex-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? "bg-emerald-50 text-emerald-700 font-medium" : "text-stone-600 hover:bg-stone-100"}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t border-stone-200 relative">
          {user ? (
            <>
              {showRoleSwitcher && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-stone-200 rounded-xl shadow-lg p-2 z-50">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-3 p-3 w-full rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <div className="relative">
                  <User className="w-5 h-5" />
                  {user.verificationLevel === "verified" && (
                    <ShieldCheck className="w-3 h-3 text-emerald-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium flex items-center gap-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 p-3 w-full rounded-xl text-stone-600 hover:bg-stone-100 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 p-3 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Topbar */}
      <header className="md:hidden bg-white border-b border-stone-200 p-4 sticky top-0 z-40 flex justify-between items-center relative">
        <Link
          to="/"
          className="text-xl font-bold text-emerald-600 flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="/LookRooms logo design with magnifying glass.png" 
              alt="LookRooms" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).style.display = 'none';
                (e.target as any).nextSibling.style.display = 'block';
              }}
            />
            <Search className="w-5 h-5 hidden" />
          </div>
          <span>LookRooms</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link 
            to="/support" 
            className="p-2 text-stone-600 bg-stone-100 rounded-full"
            title="Contact Support"
          >
            <LifeBuoy className="w-5 h-5" />
          </Link>
          {user ? (
          <>
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="p-2 text-stone-600 bg-stone-100 rounded-full relative"
            >
              <User className="w-5 h-5" />
              {user.verificationLevel === "verified" && (
                <ShieldCheck className="w-3 h-3 text-emerald-500 absolute bottom-0 right-0 bg-white rounded-full" />
              )}
            </button>
            {showRoleSwitcher && (
              <div className="absolute top-full mt-2 right-4 w-48 bg-white border border-stone-200 rounded-xl shadow-lg p-2 z-50">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full"
          >
            Sign In
          </Link>
        )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative w-full flex flex-col h-[calc(100vh-73px)] md:h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-stone-200 flex justify-around p-3 pb-safe z-50">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-emerald-600" : "text-stone-400 hover:text-stone-600"}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
