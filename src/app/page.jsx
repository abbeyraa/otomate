"use client";

import { Home as HomeIcon, FileText, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const quickActions = [
    {
      title: "Create Template",
      description: "Buat automation template baru",
      href: "/create-template",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "View Templates",
      description: "Lihat semua template yang tersedia",
      href: "/templates",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Quick Start",
      description: "Mulai automation dengan cepat",
      href: "/create-template",
      icon: Zap,
      color: "bg-yellow-500",
    },
  ];

  const stats = [
    { label: "Total Templates", value: "12", icon: FileText },
    { label: "Automations Run", value: "48", icon: Zap },
    { label: "Success Rate", value: "94%", icon: TrendingUp },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#e5e5e5] bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <HomeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
            <p className="text-sm text-gray-600 mt-1">
              Dashboard dan ringkasan aktivitas automation Anda
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white border border-[#e5e5e5] rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada aktivitas terbaru</p>
                <p className="text-sm text-gray-500 mt-1">
                  Mulai dengan membuat template pertama Anda
                </p>
                <Link
                  href="/create-template"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create Template
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
