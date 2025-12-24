"use client";

import EditorPage from "../editor/page";

export default function CreateTemplatePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-[#e5e5e5] bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Create Template</h1>
        <p className="text-sm text-gray-600 mt-1">
          Buat automation template baru untuk mengisi form secara otomatis
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditorPage />
      </div>
    </div>
  );
}

