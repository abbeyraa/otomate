"use client";

import { useEffect, useMemo, useState } from "react";
import {
  extractAllRows,
  getXlsxSheets,
  extractInputsFromHtml,
} from "@/lib/api";
import DataSourceSection from "./components/DataSourceSection";
import VariablesPreviewSection from "./components/VariablesPreviewSection";
import MappingScriptSection from "./components/MappingScriptSection";

const defaultTemplate = `Instruksi pengisian form:
- Isi email dengan {{email}}
- Username gunakan {{username}}
- Amount isi angka {{amount}}

Placeholder {{nama_kolom}} akan otomatis digantikan dengan nilai dari file.`;

export default function AutomateInputFormPage() {
  const [rows, setRows] = useState([]);
  const [uploadedRows, setUploadedRows] = useState([]);
  const [dataSource, setDataSource] = useState("upload");
  const [manualColumns, setManualColumns] = useState(["field1"]);
  const [manualRows, setManualRows] = useState([{ field1: "" }]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [xlsxSheets, setXlsxSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState(defaultTemplate);
  const [mappings, setMappings] = useState([{ selector: "", variable: "" }]);
  const [targetUrl] = useState("");
  const [targetHtml, setTargetHtml] = useState("");
  const [formInputs, setFormInputs] = useState([]);
  const [fileName, setFileName] = useState("");
  const [automationResult, setAutomationResult] = useState(null);
  const [inputAllRows, setInputAllRows] = useState(false);
  const [postMode, setPostMode] = useState(false);
  const [needOpenButton, setNeedOpenButton] = useState(false);
  const [openButtonSelector, setOpenButtonSelector] = useState("");

  const effectiveRows = dataSource === "manual" ? manualRows : rows;
  const columns = useMemo(() => {
    if (dataSource === "manual") return manualColumns;
    if (!effectiveRows.length) return [];
    return Object.keys(effectiveRows[0] || {});
  }, [effectiveRows, manualColumns, dataSource]);

  useEffect(() => {
    if (selectedRowIndex > effectiveRows.length - 1) {
      setSelectedRowIndex(0);
    }
  }, [effectiveRows.length, selectedRowIndex]);

  useEffect(() => {
    if (!formInputs.length || !columns.length) return;
    const hasFilled = mappings.some(
      (m) => m.selector.trim() || m.variable.trim()
    );
    if (hasFilled) return;
    const auto = formInputs.map((input, idx) => ({
      selector: input.selector || "",
      variable: columns[idx % columns.length] || "",
    }));
    if (auto.length) {
      setMappings(auto);
    }
  }, [formInputs, columns, mappings]);

  const handleFileSelect = async (file) => {
    setDataSource("upload");
    setError("");
    setLoading(true);
    setFileName(file.name);
    setRows([]);
    setUploadedRows([]);
    setSelectedRowIndex(0);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx"].includes(ext)) {
      setLoading(false);
      setError("Hanya file CSV atau XLSX yang didukung pada tahap ini.");
      return;
    }
    try {
      if (ext === "xlsx") {
        const sheets = await getXlsxSheets(file);
        setXlsxSheets(sheets);
        const firstSheet = sheets[0] || "";
        setSelectedSheet(firstSheet);
        await loadRows(file, firstSheet);
      } else {
        setXlsxSheets([]);
        setSelectedSheet("");
        await loadRows(file, null);
      }
    } catch (err) {
      setError(err.message || "Gagal memproses file.");
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async (file, sheetName) => {
    const data = await extractAllRows(file, sheetName || null);
    setRows(data);
    setUploadedRows(data);
    setSelectedRowIndex(0);
  };

  const handleSheetChange = async (sheetName) => {
    setSelectedSheet(sheetName);
    const input = document.getElementById("automate-file-input");
    const file = input?.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await loadRows(file, sheetName);
    } catch (err) {
      setError(err.message || "Gagal memuat sheet.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index) => {
    setSelectedRowIndex(index);
  };

  // Design Improvement: Grouped manual columns/rows actions with icon
  const addManualColumn = () => {
    const nextName = `field${manualColumns.length + 1}`;
    setManualColumns([...manualColumns, nextName]);
    setManualRows(
      manualRows.map((row) => ({
        ...row,
        [nextName]: "",
      }))
    );
  };

  const removeManualColumn = (idx) => {
    if (manualColumns.length === 1) return;
    const target = manualColumns[idx];
    const nextColumns = manualColumns.filter((_, i) => i !== idx);
    const nextRows = manualRows.map((row) => {
      const { [target]: _, ...rest } = row;
      return rest;
    });
    setManualColumns(nextColumns);
    setManualRows(nextRows);
  };

  const renameManualColumn = (idx, name) => {
    const trimmed = name.trim();
    const current = manualColumns[idx];
    if (!trimmed || (manualColumns.includes(trimmed) && trimmed !== current)) {
      return;
    }
    const nextColumns = [...manualColumns];
    nextColumns[idx] = trimmed;
    const nextRows = manualRows.map((row) => {
      const { [current]: value, ...rest } = row;
      return { ...rest, [trimmed]: value ?? "" };
    });
    setManualColumns(nextColumns);
    setManualRows(nextRows);
  };

  const addManualRow = () => {
    const baseRow = manualColumns.reduce(
      (acc, col) => ({ ...acc, [col]: "" }),
      {}
    );
    setManualRows([...manualRows, baseRow]);
  };

  const removeManualRow = (rowIdx) => {
    if (manualRows.length === 1) return;
    const next = manualRows.filter((_, idx) => idx !== rowIdx);
    setManualRows(next);
    if (selectedRowIndex >= next.length) {
      setSelectedRowIndex(Math.max(0, next.length - 1));
    }
  };

  const handleManualCellChange = (rowIdx, col, value) => {
    const next = manualRows.map((row, idx) =>
      idx === rowIdx ? { ...row, [col]: value } : row
    );
    setManualRows(next);
  };

  const addMapping = () => {
    setMappings([...mappings, { selector: "", variable: "" }]);
  };

  const updateMapping = (idx, field, value) => {
    const next = [...mappings];
    next[idx][field] = value;
    setMappings(next);
  };

  const removeMapping = (idx) => {
    setMappings(mappings.filter((_, index) => index !== idx));
  };

  const handleExtractInputs = async () => {
    if (!targetHtml.trim()) {
      setError("Tempelkan HTML target terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const inputs = await extractInputsFromHtml(targetHtml);
      setFormInputs(inputs);

      if (inputs.length && mappings.length === 1 && !mappings[0].selector) {
        const first = inputs[0];
        setMappings([
          { selector: first.selector, variable: mappings[0].variable || "" },
        ]);
      }
    } catch (err) {
      setError(err.message || "Gagal mengekstrak input form dari HTML.");
    } finally {
      setLoading(false);
    }
  };

  const generateScript = async () => {
    if (!effectiveRows.length) {
      setError("Tambahkan data (unggah file atau isi manual) terlebih dahulu.");
      return;
    }

    const activeMappings = mappings.filter(
      (m) => m.selector.trim() && m.variable.trim()
    );

    if (!activeMappings.length) {
      setError("Tambahkan minimal satu pemetaan variabel → selector.");
      return;
    }

    setError("");

    const sampleRow =
      effectiveRows[
        inputAllRows ? 0 : Math.min(selectedRowIndex, effectiveRows.length - 1)
      ] || {};

    const cfg = {
      openButton: needOpenButton
        ? {
            selector: openButtonSelector.trim() || "",
            text: openButtonSelector.trim() || "",
          }
        : null,
      mappings: activeMappings.map((m) => ({
        variable: m.variable.trim(),
        selector: m.selector.trim(),
      })),
      data: sampleRow,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
      setError("");
      alert(
        "Config extension tersalin! Simpan sebagai config.json di folder extension."
      );
    } catch (err) {
      console.error(err);
      setError("Gagal menyalin config. Silakan salin manual.");
    }
  };

  const handleNextRow = () => {
    if (selectedRowIndex < effectiveRows.length - 1) {
      setSelectedRowIndex(selectedRowIndex + 1);
      setAutomationResult(null);
    }
  };

  const previewRows = effectiveRows.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#f7faff] via-[#ecf2ff] to-[#fafafb]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 text-center">
          <p className="text-base font-medium text-[#3b82f6] uppercase tracking-wide">
            Automate Input Form
          </p>
          <h1 className="mt-1 text-4xl font-bold text-[#1a1a1a] drop-shadow-sm">
            Bangun Template Otomatisasi dari Excel/CSV
          </h1>
          <p className="mt-3 text-lg text-[#586581] max-w-2xl mx-auto">
            Unggah data terstruktur, pratinjau kolom/baris, dan petakan variabel
            ke elemen form target. Template dengan placeholder{" "}
            <span className="font-mono bg-[#eef2ff] px-1 py-0.5 rounded">{`{{var}}`}</span>{" "}
            akan otomatis terisi.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DataSourceSection
              dataSource={dataSource}
              setDataSource={setDataSource}
              fileName={fileName}
              handleFileSelect={handleFileSelect}
              xlsxSheets={xlsxSheets}
              selectedSheet={selectedSheet}
              handleSheetChange={handleSheetChange}
              loading={loading}
              error={error}
              manualColumns={manualColumns}
              manualRows={manualRows}
              addManualColumn={addManualColumn}
              removeManualColumn={removeManualColumn}
              renameManualColumn={renameManualColumn}
              addManualRow={addManualRow}
              removeManualRow={removeManualRow}
              handleManualCellChange={handleManualCellChange}
              effectiveRows={effectiveRows}
              selectedRowIndex={selectedRowIndex}
              handleRowChange={handleRowChange}
            />
            <VariablesPreviewSection
              columns={columns}
              previewRows={previewRows}
              effectiveRowsLength={effectiveRows.length}
            />
          </div>
          <div>
            <MappingScriptSection
              targetHtml={targetHtml}
              setTargetHtml={setTargetHtml}
              handleExtractInputs={handleExtractInputs}
              formInputs={formInputs}
              needOpenButton={needOpenButton}
              setNeedOpenButton={setNeedOpenButton}
              openButtonSelector={openButtonSelector}
              setOpenButtonSelector={setOpenButtonSelector}
              mappings={mappings}
              updateMapping={updateMapping}
              removeMapping={removeMapping}
              addMapping={addMapping}
              columns={columns}
              postMode={postMode}
              setPostMode={setPostMode}
              inputAllRows={inputAllRows}
              setInputAllRows={setInputAllRows}
              generateScript={generateScript}
              automationResult={automationResult}
              handleNextRow={handleNextRow}
              effectiveRowsLength={effectiveRows.length}
              selectedRowIndex={selectedRowIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
