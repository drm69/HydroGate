"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatusCard from "./components/StatusCard";
import WaterLevelChart from "./components/WaterLevelChart";
import GateControlPanel from "./components/GateControlPanel";
import ActivityLog from "./components/ActivityLog";
import { Lock, RefreshCw } from "lucide-react";

type DynamoItem = {
  device_id?: string;
  jarak_cm?: number | string;
  led_status?: string;
  servo_angle?: number | string;
  buzzer?: boolean | string;
  button_pressed?: boolean | string;
  system_on?: boolean | string;
  source?: string;
  timestamp?: string | number;
  createdAt?: string | number;
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  const [items, setItems] = useState<DynamoItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  async function fetchDynamoData() {
    try {
      setFetching(true);
      setError("");

      const res = await fetch("/api/dynamodb", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || json.error || "Gagal mengambil data");
      }

      setItems(json.items || []);
    } catch (err: any) {
      console.error("Fetch DynamoDB error:", err);
      setError(err.message || "Gagal mengambil data DynamoDB");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchDynamoData();
    }
  }, [user]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = Number(a.timestamp || a.createdAt || 0);
      const dateB = Number(b.timestamp || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [items]);

  const latest = sortedItems[0] || {};

  const jarakCm = Number(latest.jarak_cm ?? 0);
  const servoAngle = Number(latest.servo_angle ?? 0);

  const isSystemOn =
    latest.system_on === true || latest.system_on === "true";

  const isBuzzerOn =
    latest.buzzer === true || latest.buzzer === "true";

  const isButtonPressed =
    latest.button_pressed === true || latest.button_pressed === "true";

  const isHighWater = jarakCm <= 10;
  const isWarningWater = jarakCm > 10 && jarakCm <= 20;

  const lastUpdate =
    latest.timestamp || latest.createdAt || "Belum ada data";

  const activeAlerts = [
    ...(isHighWater
      ? [
        {
          title: "Critical: Water Level High",
          desc: `Jarak air ${jarakCm} cm, level air sangat tinggi`,
        },
      ]
      : []),
    ...(isWarningWater
      ? [
        {
          title: "Warning: Water Level Rising",
          desc: `Jarak air ${jarakCm} cm, level air mulai naik`,
        },
      ]
      : []),
    ...(isBuzzerOn
      ? [
        {
          title: "Buzzer Active",
          desc: "Buzzer sedang menyala",
        },
      ]
      : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-3 text-lg font-semibold text-slate-700">
            Memuat dashboard...
          </div>
          <p className="text-sm text-slate-500">
            Mengecek autentikasi pengguna
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Navbar />

        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Dashboard Overview
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Selamat datang, {user.displayName || user.email}
              </p>
            </div>

            <button
              onClick={fetchDynamoData}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold transition"
            >
              <RefreshCw size={16} className={fetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <b>Error:</b> {error}
            </div>
          )}

          {fetching && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              Mengambil data terbaru dari DynamoDB...
            </div>
          )}

          {!fetching && items.length === 0 && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
              Data DynamoDB masih kosong.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatusCard
              title="Jarak Air"
              value={jarakCm}
              unit="cm"
              icon="💧"
              status={
                isHighWater ? "critical" : isWarningWater ? "warning" : "normal"
              }
              trend={isHighWater ? "up" : "down"}
              trendValue={`${jarakCm} cm`}
            />

            <StatusCard
              title="Servo Gate"
              value={servoAngle}
              unit="degree"
              icon="🚪"
              status="normal"
              trend="down"
              trendValue={`${servoAngle}°`}
            />

            <StatusCard
              title="LED Status"
              value={latest.led_status || "Unknown"}
              unit=""
              icon="💡"
              status={isSystemOn ? "normal" : "warning"}
              trend={isSystemOn ? "up" : "down"}
              trendValue={isSystemOn ? "System ON" : "System OFF"}
            />

            <StatusCard
              title="Buzzer"
              value={isBuzzerOn ? "ON" : "OFF"}
              unit=""
              icon="🔊"
              status={isBuzzerOn ? "warning" : "normal"}
              trend={isBuzzerOn ? "up" : "down"}
              trendValue={isButtonPressed ? "Button pressed" : "Normal"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <WaterLevelChart />
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Latest DynamoDB Data
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">Device ID</span>
                    <span className="font-bold text-blue-600">
                      {latest.device_id || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">Jarak Air</span>
                    <span className="font-bold text-blue-600">
                      {jarakCm} cm
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">LED Status</span>
                    <span className="font-bold text-green-600">
                      {latest.led_status || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">Servo Angle</span>
                    <span className="font-bold text-green-600">
                      {servoAngle}°
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">Buzzer</span>
                    <span className="font-bold text-red-600">
                      {isBuzzerOn ? "ON" : "OFF"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">Button</span>
                    <span className="font-bold text-orange-600">
                      {isButtonPressed ? "Pressed" : "Not pressed"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">System</span>
                    <span className="font-bold text-slate-700">
                      {isSystemOn ? "ON" : "OFF"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-slate-700">Source</span>
                    <span className="font-bold text-slate-600">
                      {latest.source || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700">
                      Last Update
                    </span>
                    <span className="font-bold text-slate-600 text-right">
                      {String(lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl border-2 p-6 shadow-sm ${activeAlerts.length > 0
                    ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                    : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  }`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  ⚠️ Active Alerts
                </h3>

                {activeAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {activeAlerts.map((alert, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-semibold text-red-700">
                          {alert.title}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {alert.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-green-700">
                    Tidak ada alert aktif. Sistem dalam kondisi aman.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <GateControlPanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ActivityLog />
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                    <Lock size={18} />
                    Emergency Close All
                  </button>

                  <button className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition">
                    📊 Generate Report
                  </button>

                  <button className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition">
                    🔧 System Settings
                  </button>

                  <button className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition">
                    📞 Contact Support
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  ℹ️ Key Information
                </h3>

                <div className="text-xs text-slate-700 space-y-2">
                  <p>
                    <span className="font-semibold">Sensor:</span> Ultrasonic
                  </p>
                  <p>
                    <span className="font-semibold">Gate:</span> Servo Motor
                  </p>
                  <p>
                    <span className="font-semibold">Last Update:</span>{" "}
                    {String(lastUpdate)}
                  </p>
                  <p>
                    <span className="font-semibold">Data Source:</span>{" "}
                    DynamoDB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>
              HydroGate © 2024 | Dam Gate Monitoring System | Status:{" "}
              <span className="text-green-600 font-semibold">● Online</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}