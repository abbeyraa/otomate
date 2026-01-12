"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    language: "id",
    maxTimeoutMs: 5000,
    geoLat: "",
    geoLng: "",
  });
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isMounted) return;
        if (payload?.settings) {
          setSettings(payload.settings);
        }
      } catch {
        // Ignore settings load failures.
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveSettings = async (nextSettings) => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: nextSettings }),
      });
    } catch {
      // Ignore save errors to keep UI responsive.
    }
  };

  const handleToggle = (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetData = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      try {
        await fetch("/api/data", { method: "DELETE" });
      } catch {
        // Ignore delete errors to avoid blocking reset.
      }
      localStorage.clear();
      sessionStorage.clear();

      if (typeof indexedDB?.databases === "function") {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map((db) => {
            if (!db?.name) return null;
            return new Promise((resolve) => {
              const request = indexedDB.deleteDatabase(db.name);
              request.onsuccess = () => resolve();
              request.onerror = () => resolve();
              request.onblocked = () => resolve();
            });
          })
        );
      }

      if (typeof caches?.keys === "function") {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  const settingSections = [
    {
      title: "General",
      icon: SettingsIcon,
      settings: [
        {
          key: "language",
          label: "Language",
          description: "Pilih bahasa antarmuka",
          type: "select",
          options: [
            { value: "id", label: "Bahasa Indonesia" },
            { value: "en", label: "English" },
          ],
        },
        {
          key: "maxTimeoutMs",
          label: "Max Timeout (ms)",
          description: "Batas waktu maksimum untuk setiap langkah",
          type: "input",
          inputType: "number",
          min: 1000,
        },
        {
          key: "geoLat",
          label: "Geo Latitude",
          description: "Koordinat latitude untuk lokasi browser",
          type: "input",
          inputType: "text",
          placeholder: "-6.200000",
        },
        {
          key: "geoLng",
          label: "Geo Longitude",
          description: "Koordinat longitude untuk lokasi browser",
          type: "input",
          inputType: "text",
          placeholder: "106.816666",
        },
        {
          key: "reset-data",
          label: isResetting ? "Resetting..." : "Reset Data",
          description: "Hapus cache, storage, dan data template tersimpan",
          type: "button",
          action: () => setShowResetConfirm(true),
          disabled: isResetting,
        },
      ],
    },
  ];

  const visibleSections = settingSections.filter(
    (section) => section.settings.length > 0
  );

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="home-reveal bg-white border border-[#e5e5e5] rounded-lg p-6"
                style={{ "--delay": "120ms" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-4 border-b border-[#e5e5e5] last:border-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {setting.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {setting.description}
                        </p>
                      </div>

                      <div className="ml-4">
                        {setting.type === "toggle" && (
                          <button
                            onClick={() => handleToggle(setting.key)}
                            disabled={setting.disabled}
                            className={`
                              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                              ${
                                settings[setting.key]
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }
                              ${
                                setting.disabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                            `}
                          >
                            <span
                              className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${
                                  settings[setting.key]
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }
                              `}
                            />
                          </button>
                        )}

                        {setting.type === "select" && (
                          <select
                            value={settings[setting.key]}
                            onChange={(e) =>
                              handleChange(setting.key, e.target.value)
                            }
                            className="px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {setting.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {setting.type === "input" && (
                          <input
                            type={setting.inputType || "text"}
                            min={setting.min}
                            placeholder={setting.placeholder}
                            value={settings[setting.key] ?? ""}
                            onChange={(event) => {
                              const raw = event.target.value;
                              const nextValue =
                                setting.inputType === "number"
                                  ? Number.isFinite(Number.parseInt(raw, 10))
                                    ? Number.parseInt(raw, 10)
                                    : settings[setting.key]
                                  : raw;
                              handleChange(setting.key, nextValue);
                            }}
                            className="px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {setting.type === "button" && (
                          <button
                            onClick={setting.action}
                            disabled={setting.disabled}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                              setting.disabled
                                ? "bg-blue-200 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {setting.label}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 text-sm font-semibold text-gray-500">
          Loading settings...
        </div>
      )}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Reset Data
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Semua cache, storage, dan data template akan dihapus permanen.
              </p>
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#e5e5e5] rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  handleResetData();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
