'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import {
  Activity,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

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

interface MonitoringData {
  gateId: string;
  waterLevel: number;
  status: 'open' | 'closed';
  flowRate: number;
  lastUpdate: string;
}

export default function Monitoring() {
  const [items, setItems] = useState<DynamoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDynamoData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/dynamodb', {
        cache: 'no-store',
      });

      const json: {
        items?: DynamoItem[];
        error?: string;
        detail?: string;
      } = await res.json();

      if (!res.ok) {
        throw new Error(
          json.detail || json.error || 'Gagal mengambil data'
        );
      }

      setItems(json.items || []);
    } catch (err: unknown) {
      console.error('Fetch DynamoDB error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal mengambil data DynamoDB');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDynamoData();

    // realtime refresh tiap 5 detik
    const interval = setInterval(() => {
      void fetchDynamoData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchDynamoData]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(
        String(a.timestamp || a.createdAt || 0)
      ).getTime();

      const dateB = new Date(
        String(b.timestamp || b.createdAt || 0)
      ).getTime();

      return dateB - dateA;
    });
  }, [items]);

  const monitoringData: MonitoringData[] = sortedItems.map(
    (item, index) => {
      const jarakCm =
        parseFloat(String(item.jarak_cm ?? 0)) || 0;

      const servoAngle =
        parseFloat(String(item.servo_angle ?? 0)) || 0;

      return {
        gateId: item.device_id || `Gate-${index + 1}`,

        // konversi cm ke meter
        waterLevel: Number((jarakCm / 100).toFixed(2)),

        status: servoAngle > 0 ? 'open' : 'closed',

        // simulasi flow rate berdasarkan servo
        flowRate: servoAngle * 10,

        lastUpdate: item.timestamp || item.createdAt
          ? new Date(
              String(item.timestamp || item.createdAt)
            ).toLocaleTimeString('id-ID')
          : '-',
      };
    }
  );

  const latest = monitoringData[0];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Navbar />

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Monitoring Real-time
            </h1>

            <p className="text-gray-600">
              Status terkini semua pintu air dan sistem
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <b>Error:</b> {error}
            </div>
          )}

          {loading && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              Mengambil data terbaru dari DynamoDB...
            </div>
          )}

          {!loading && monitoringData.length === 0 && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
              Data monitoring masih kosong.
            </div>
          )}

          {latest && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Status Pintu
                    </p>

                    <p
                      className={`text-3xl font-bold mt-1 ${
                        latest.status === 'open'
                          ? 'text-emerald-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {latest.status === 'open'
                        ? 'Terbuka'
                        : 'Tertutup'}
                    </p>
                  </div>

                  <Activity className="w-10 h-10 text-cyan-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Ketinggian Air
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {latest.waterLevel}m
                    </p>
                  </div>

                  <TrendingUp className="w-10 h-10 text-emerald-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Flow Rate
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {latest.flowRate} m³/s
                    </p>
                  </div>

                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Status Sistem
                    </p>

                    <p className="text-3xl font-bold text-emerald-600 mt-1">
                      Normal
                    </p>
                  </div>

                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Monitoring Pintu Air
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Pintu
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Ketinggian Air
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status Operasi
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Flow Rate
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Update Terakhir
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {monitoringData.map((gate) => (
                    <tr
                      key={gate.gateId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {gate.gateId}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {gate.waterLevel.toFixed(2)}m
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            gate.status === 'open'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              gate.status === 'open'
                                ? 'bg-emerald-500'
                                : 'bg-gray-400'
                            }`}
                          />

                          {gate.status === 'open'
                            ? 'Terbuka'
                            : 'Tertutup'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {gate.flowRate} m³/s
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {gate.lastUpdate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}