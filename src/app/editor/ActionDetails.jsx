"use client";

const actionTypes = ["Click", "Input", "Wait", "Navigate"];

export function ActionDetails({ selectedStepData, onChange }) {
  if (!selectedStepData) {
    return (
      <div className="rounded-lg border border-dashed border-[#e5e5e5] p-4 text-sm text-gray-500">
        Pilih step untuk melihat detail.
      </div>
    );
  }

  const labelValue = selectedStepData.label || "";
  const inputKind = selectedStepData.inputKind || "text";

  const inputKindOptions = [
    { value: "text", label: "Text / Textarea" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio" },
    { value: "toggle", label: "Toggle" },
    { value: "select", label: "Select / Dropdown" },
  ];

  const inputValueLabel = (() => {
    switch (inputKind) {
      case "checkbox":
      case "toggle":
        return "Value (true/false)";
      case "select":
        return "Option Value";
      case "radio":
        return "Option Value (optional)";
      default:
        return "Nilai Input";
    }
  })();

  const inputValuePlaceholder = (() => {
    switch (inputKind) {
      case "number":
        return "100";
      case "date":
        return "2025-01-31";
      case "checkbox":
      case "toggle":
        return "true";
      case "select":
        return "option-value";
      case "radio":
        return "option-value";
      default:
        return "Masukkan nilai";
    }
  })();

  switch (selectedStepData.type) {
    case "Click":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Label / Text
            </label>
            <input
              type="text"
              placeholder="Simpan"
              value={labelValue}
              onChange={(event) => onChange("label", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Scope Selector (optional)
            </label>
            <input
              type="text"
              placeholder="form#checkout"
              value={selectedStepData.scopeSelector || ""}
              onChange={(event) =>
                onChange("scopeSelector", event.target.value)
              }
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={selectedStepData.timeoutMs}
              onChange={(event) => onChange("timeoutMs", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    case "Input":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Jenis Input
            </label>
            <select
              value={inputKind}
              onChange={(event) => onChange("inputKind", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {inputKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Label / Text
            </label>
            <input
              type="text"
              placeholder="Email"
              value={labelValue}
              onChange={(event) => onChange("label", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Scope Selector (optional)
            </label>
            <input
              type="text"
              placeholder="form#checkout"
              value={selectedStepData.scopeSelector || ""}
              onChange={(event) =>
                onChange("scopeSelector", event.target.value)
              }
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {inputValueLabel}
            </label>
            <input
              type="text"
              placeholder={inputValuePlaceholder}
              value={selectedStepData.value}
              onChange={(event) => onChange("value", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {inputKind === "date" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Date Format (optional)
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={selectedStepData.dateFormat || ""}
                onChange={(event) =>
                  onChange("dateFormat", event.target.value)
                }
                className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={selectedStepData.timeoutMs}
              onChange={(event) => onChange("timeoutMs", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    case "Wait":
      return (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Durasi (ms)
          </label>
          <input
            type="number"
            placeholder="1000"
            value={selectedStepData.waitMs}
            onChange={(event) => onChange("waitMs", event.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    case "Navigate":
      return (
        <div className="space-y-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            URL Tujuan
          </label>
          <input
            type="text"
            placeholder="https://contoh.app"
            value={selectedStepData.url}
            onChange={(event) => onChange("url", event.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={selectedStepData.timeoutMs}
              onChange={(event) => onChange("timeoutMs", event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export { actionTypes };
