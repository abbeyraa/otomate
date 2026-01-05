"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Search as SearchIcon,
  FilePlus,
  FolderOpen,
  FileText,
  Code,
} from "lucide-react";
import Link from "next/link";
import { getTemplates } from "@/lib/templateStorage";

export default function HomePage() {
  const calculateStats = (templates) => {
    const activeTemplates = templates.filter((t) => t.isActive !== false);
    const totalTemplates = activeTemplates.length;
    const totalSaved = templates.length;
    const inactiveTemplates = Math.max(totalSaved - totalTemplates, 0);

    return {
      totalTemplates,
      totalSaved,
      inactiveTemplates,
    };
  };

  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(() => calculateStats([]));

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("id-ID", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get alerts (template warnings)
  const alerts = [];

  // Add template update warnings (mock for now)
  if (stats.totalTemplates > 0) {
    alerts.push({
      type: "warning",
      title: "Template Perlu Diperbarui",
      message: "Beberapa template belum digunakan dalam 30 hari terakhir",
      timestamp: new Date().toISOString(),
    });
  }

  useEffect(() => {
    const loadTemplates = async () => {
      const storedTemplates = await getTemplates();
      setTemplates(storedTemplates);
      setStats(calculateStats(storedTemplates));
    };

    loadTemplates();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Overview - Status Ringkas */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Templates */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Template Aktif</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalTemplates}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Template tersedia
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Inactive Templates */}
              <div className="bg-white border border-[#e5e5e5] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Template Nonaktif
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.inactiveTemplates}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Dari {stats.totalSaved} template
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Saved Templates
                  </h2>
                  <Link
                    href="/templates"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Lihat Semua
                  </Link>
                </div>
                <div className="bg-white border border-[#e5e5e5] rounded-lg">
                  {templates.length === 0 ? (
                    <div className="p-8 text-center">
                      <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Belum ada template tersimpan
                      </p>
                      <Link
                        href="/editor"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Code className="w-4 h-4" />
                        Mulai dari Editor
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e5e5e5]">
                      {templates.slice(0, 5).map((template, index) => {
                        const name =
                          template.name ||
                          template.templateName ||
                          template.title ||
                          `Template ${index + 1}`;
                        const isActive = template.isActive !== false;
                        const updatedAt =
                          template.updatedAt ||
                          template.updated_at ||
                          template.savedAt ||
                          template.createdAt;

                        return (
                          <div
                            key={`${name}-${index}`}
                            className="flex items-center justify-between gap-4 px-5 py-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {updatedAt
                                  ? `Terakhir disimpan ${formatDate(updatedAt)}`
                                  : "Belum ada waktu penyimpanan"}
                              </p>
                            </div>
                            <span
                              className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                                isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/create-template"
                    className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <FilePlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Buat Template Baru
                        </h3>
                        <p className="text-sm text-gray-600">
                          Rancang automation plan baru untuk proses yang
                          berulang
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/editor"
                    className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <Code className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Buka Editor
                        </h3>
                        <p className="text-sm text-gray-600">
                          Mulai dari draft atau edit template yang ada
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/inspector"
                    className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                        <SearchIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Buka Inspector
                        </h3>
                        <p className="text-sm text-gray-600">
                          Amati dan pahami proses interaksi halaman web
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            </div>

            {/* Alerts & Warnings - Right Column (1/3) */}
            <div className="lg:col-span-1">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Alerts & Warnings
                </h2>
                <div className="bg-white border border-[#e5e5e5] rounded-lg">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-1">
                        Tidak ada peringatan
                      </p>
                      <p className="text-xs text-gray-500">
                        Semua sistem berjalan dengan baik
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e5e5e5]">
                      {alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="p-4 bg-yellow-50 border-l-4 border-yellow-500"
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium mb-1 text-yellow-900">
                                {alert.title}
                              </h4>
                              <p className="text-sm mb-2 text-yellow-700">
                                {alert.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(alert.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
