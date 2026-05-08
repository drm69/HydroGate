"use client";

import { Bell, User, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";

interface UserData {
  username?: string;
  role?: string;
}

export default function Navbar() {
  const router = useRouter();

  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const { user } = useAuthContext();

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      } catch (error) {
        console.error("Gagal ambil user:", error);
      }
    };

    fetchUser();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Dam Gate Monitoring System
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time monitoring and control dashboard
          </p>
        </div>

        <div className="flex items-center gap-6 relative">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif((prev) => !prev);
                setShowUserMenu(false);
              }}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell size={24} />
              <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
            </button>

            {showNotif && (
              <div className="absolute right-0 top-12 min-w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg z-50">
                <p className="mb-2 text-xs font-semibold text-slate-700">
                  Notifications
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>⚠️ Water level high (Alert)</p>
                  <p>✓ Gate A maintenance done</p>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div className="relative">
            <div
              onClick={() => {
                setShowUserMenu((prev) => !prev);
                setShowNotif(false);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-sm font-bold text-white">
                {userData?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {userData?.username || user?.email}
                </p>
                <p className="text-xs text-slate-500">
                  {userData?.role || "User"}
                </p>
              </div>
            </div>

            {showUserMenu && (
              <div className="absolute right-0 top-16 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-t border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}