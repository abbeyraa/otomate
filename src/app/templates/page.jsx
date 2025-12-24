"use client";

import { FolderOpen, FileText, Calendar, Search } from "lucide-react";
import { useState } from "react";

// Mock data untuk templates
const mockTemplates = [
  {
    id: 1,
    name: "Form Pendaftaran Karyawan",
    description: "Template untuk mengisi form pendaftaran karyawan baru",
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
  },
  {
    id: 2,
    name: "Form Survey Pelanggan",
    description: "Template untuk mengisi form survey kepuasan pelanggan",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-18",
  },
  {
    id: 3,
    name: "Form Registrasi Event",
    description: "Template untuk registrasi peserta event",
    createdAt: "2024-01-05",
    lastUsed: "2024-01-12",
  },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = mockTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#e5e5e5] bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola dan gunakan template automation yang sudah dibuat
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Create New
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada template ditemukan
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {searchQuery
                ? "Coba gunakan kata kunci lain untuk mencari"
                : "Mulai dengan membuat template pertama Anda"}
            </p>
            {!searchQuery && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Create Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {template.name}
                      </h3>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {template.createdAt}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#e5e5e5] flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    Use
                  </button>
                  <button className="px-3 py-2 border border-[#e5e5e5] rounded-md hover:bg-gray-50 transition-colors text-sm">
                    Edit
                  </button>
                  <button className="px-3 py-2 border border-[#e5e5e5] rounded-md hover:bg-gray-50 transition-colors text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

