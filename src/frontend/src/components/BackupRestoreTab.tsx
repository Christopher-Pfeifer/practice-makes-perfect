import { useRef, useState } from "react";
import { getActor } from "../lib/actor";

const BG = "#0f1729";
const CARD = "#1a2540";
const GOLD = "#c9a84c";
const TEXT = "#ffffff";
const MUTED = "#8a9bb5";
const BORDER = "1px solid #2d3f5e";
const DANGER = "#e05252";

interface Props {
  mode: "full" | "teacher";
  currentUsername: string;
  currentPassword: string;
}

type DumpField =
  | "profiles"
  | "studioDetails"
  | "teacherDetails"
  | "studentDetails"
  | "masterInstruments"
  | "lessons"
  | "teacherSchedule"
  | "teacherRecitals"
  | "teacherExamplePerformances"
  | "studentLessons"
  | "studentPractices"
  | "studentAssignments"
  | "studentProgress"
  | "studentRepertoire"
  | "studentMessages"
  | "studentBilling"
  | "studentCollaboration";

const DUMP_FIELDS: DumpField[] = [
  "profiles",
  "studioDetails",
  "teacherDetails",
  "studentDetails",
  "masterInstruments",
  "lessons",
  "teacherSchedule",
  "teacherRecitals",
  "teacherExamplePerformances",
  "studentLessons",
  "studentPractices",
  "studentAssignments",
  "studentProgress",
  "studentRepertoire",
  "studentMessages",
  "studentBilling",
  "studentCollaboration",
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function showToast(msg: string, isError = false) {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: isError ? DANGER : GOLD,
    color: "#0f1729",
    fontWeight: 700,
    padding: "12px 20px",
    borderRadius: "8px",
    zIndex: "9999",
    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    fontSize: "14px",
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

export function BackupRestoreTab({
  mode,
  currentUsername,
  currentPassword,
}: Props) {
  const [exportLoading, setExportLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedDump, setParsedDump] = useState<Record<
    string,
    [string, unknown][]
  > | null>(null);
  const [parsedFileName, setParsedFileName] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonLabel =
    mode === "full" ? "Download Full Backup" : "Download My Data Backup";
  const exportTitle = "Export Data Backup";
  const restoreTitle = "Restore From Backup";

  async function handleExport() {
    setExportLoading(true);
    try {
      let result: { ok?: unknown; err?: string; __kind__?: string } | undefined;
      if (mode === "full") {
        result = await getActor().fullDump();
      } else {
        result = await getActor().teacherDump(currentUsername, currentPassword);
      }
      if ("ok" in result) {
        const json = JSON.stringify(result.ok, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          mode === "full"
            ? `backup-full-${today()}.json`
            : `backup-teacher-${currentUsername}-${today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Backup downloaded");
      } else {
        showToast(
          `Export failed: ${"err" in result ? result.err : "Unknown error"}`,
          true,
        );
      }
    } catch (e) {
      showToast(
        `Export error: ${e instanceof Error ? e.message : String(e)}`,
        true,
      );
    } finally {
      setExportLoading(false);
    }
  }

  function processFile(file: File) {
    setFileError(null);
    setParsedDump(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as Record<string, unknown>;
        if (!("profiles" in data) || !Array.isArray(data.profiles)) {
          setFileError("Invalid backup file: missing 'profiles' array.");
          return;
        }
        setParsedDump(data as Record<string, [string, unknown][]>);
        setParsedFileName(file.name);
        setShowConfirm(true);
      } catch {
        setFileError(
          "Failed to parse JSON. Please select a valid backup file.",
        );
      }
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleRestore() {
    if (!parsedDump) return;
    setRestoreLoading(true);
    try {
      let result: { ok?: unknown; err?: string; __kind__?: string } | undefined;
      const a = getActor();
      if (mode === "full") {
        result = await a.fullRestore(
          parsedDump as unknown as Parameters<typeof a.fullRestore>[0],
          currentUsername,
          currentPassword,
        );
      } else {
        result = await a.teacherRestore(
          parsedDump as unknown as Parameters<typeof a.teacherRestore>[0],
          currentUsername,
          currentPassword,
        );
      }
      if ("ok" in result) {
        showToast("Restore complete");
        setShowConfirm(false);
        setParsedDump(null);
      } else {
        showToast(
          `Restore failed: ${"err" in result ? result.err : "Unknown error"}`,
          true,
        );
      }
    } catch (e) {
      showToast(
        `Restore error: ${e instanceof Error ? e.message : String(e)}`,
        true,
      );
    } finally {
      setRestoreLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: CARD,
    border: BORDER,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  };

  const headerStyle: React.CSSProperties = {
    color: GOLD,
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "12px",
    letterSpacing: "0.03em",
  };

  const btnStyle = (
    disabled: boolean,
    variant: "primary" | "danger" | "ghost" = "primary",
  ): React.CSSProperties => ({
    padding: "10px 22px",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    border: "none",
    background:
      variant === "primary"
        ? GOLD
        : variant === "danger"
          ? DANGER
          : "transparent",
    color: variant === "ghost" ? MUTED : "#0f1729",
    transition: "opacity 0.2s",
  });

  return (
    <div style={{ padding: "8px 0", maxWidth: "720px" }}>
      {/* Export Card */}
      <div style={cardStyle}>
        <div style={headerStyle}>{exportTitle}</div>
        <p
          style={{
            color: MUTED,
            fontSize: "13px",
            marginBottom: "16px",
            lineHeight: 1.5,
          }}
        >
          {mode === "full"
            ? "Download a complete snapshot of all 18 data tables as a JSON file. Use this for disaster recovery or to migrate the canister state."
            : "Download all of your teaching data including your profile, schedule, recitals, and all associated student records as a portable JSON file."}
        </p>
        <button
          type="button"
          style={btnStyle(exportLoading)}
          onClick={handleExport}
          disabled={exportLoading}
          data-ocid="backup.export_button"
        >
          {exportLoading ? "Preparing..." : buttonLabel}
        </button>
      </div>

      {/* Restore Card */}
      <div style={cardStyle}>
        <div style={headerStyle}>{restoreTitle}</div>
        <p
          style={{
            color: MUTED,
            fontSize: "13px",
            marginBottom: "16px",
            lineHeight: 1.5,
          }}
        >
          Upload a previously downloaded backup JSON file to restore data.
          {mode === "full"
            ? " This will overwrite ALL existing records across all tables."
            : " This will restore your teacher and student records from the backup."}
        </p>

        {/* Drop zone */}
        <button
          type="button"
          tabIndex={0}
          onKeyDown={() => {}}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-ocid="backup.dropzone"
          style={{
            border: `2px dashed ${dragOver ? GOLD : "#2d3f5e"}`,
            borderRadius: "10px",
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "rgba(201,168,76,0.06)" : BG,
            transition: "all 0.2s",
            marginBottom: "12px",
            width: "100%",
            outline: "none",
          }}
        >
          <div style={{ color: GOLD, fontSize: "28px", marginBottom: "8px" }}>
            📂
          </div>
          <div style={{ color: TEXT, fontSize: "14px", fontWeight: 600 }}>
            Drop backup file here or click to browse
          </div>
          <div style={{ color: MUTED, fontSize: "12px", marginTop: "4px" }}>
            Accepts .json backup files
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileChange}
          data-ocid="backup.upload_button"
        />

        {fileError && (
          <div
            data-ocid="backup.error_state"
            style={{
              color: DANGER,
              fontSize: "13px",
              padding: "10px 14px",
              background: "rgba(224,82,82,0.1)",
              borderRadius: "6px",
              border: "1px solid rgba(224,82,82,0.3)",
              marginTop: "8px",
            }}
          >
            {fileError}
          </div>
        )}
      </div>

      {/* Confirm Restore Modal */}
      {showConfirm && parsedDump && (
        <div
          data-ocid="backup.dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,14,26,0.85)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: CARD,
              border: BORDER,
              borderRadius: "14px",
              padding: "28px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                color: GOLD,
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Restore Preview
            </div>

            <div
              style={{
                background: "rgba(224,82,82,0.12)",
                border: "1px solid rgba(224,82,82,0.4)",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "20px",
                color: "#f28b8b",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              ⚠️{" "}
              <strong>
                WARNING: This will overwrite existing data and cannot be undone.
              </strong>
            </div>

            <div
              style={{ color: MUTED, fontSize: "12px", marginBottom: "12px" }}
            >
              File: <span style={{ color: TEXT }}>{parsedFileName}</span>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "24px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      color: MUTED,
                      fontWeight: 600,
                      padding: "6px 10px",
                      borderBottom: BORDER,
                    }}
                  >
                    Table
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      color: MUTED,
                      fontWeight: 600,
                      padding: "6px 10px",
                      borderBottom: BORDER,
                    }}
                  >
                    Records
                  </th>
                </tr>
              </thead>
              <tbody>
                {DUMP_FIELDS.map((field, i) => {
                  const arr = parsedDump[field];
                  const count = Array.isArray(arr) ? arr.length : 0;
                  return (
                    <tr
                      key={field}
                      style={{
                        background:
                          i % 2 === 0
                            ? "transparent"
                            : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td style={{ padding: "6px 10px", color: TEXT }}>
                        {field}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          textAlign: "right",
                          color: count > 0 ? GOLD : MUTED,
                          fontWeight: count > 0 ? 600 : 400,
                        }}
                      >
                        {count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                style={btnStyle(restoreLoading, "ghost")}
                onClick={() => {
                  setShowConfirm(false);
                  setParsedDump(null);
                }}
                disabled={restoreLoading}
                data-ocid="backup.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                style={btnStyle(restoreLoading, "danger")}
                onClick={handleRestore}
                disabled={restoreLoading}
                data-ocid="backup.confirm_button"
              >
                {restoreLoading ? "Restoring..." : "Proceed with Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
