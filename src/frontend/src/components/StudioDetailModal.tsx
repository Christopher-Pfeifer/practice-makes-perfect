import type { StudioDetail } from "@/backend";
import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

interface StudioDetailModalProps {
  userName: string;
  onClose: () => void;
}

const EMPTY: StudioDetail = {
  website: "",
  licenseNumber: "",
  description: "",
  notes: "",
};

export default function StudioDetailModal({
  userName,
  onClose,
}: StudioDetailModalProps) {
  const [form, setForm] = useState<StudioDetail>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActor().getStudioDetail(userName);
        if (data) setForm(data);
      } catch {
        // start with empty form
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userName]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await getActor().saveStudioDetail(userName, form);
      setMessage("Saved successfully.");
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof StudioDetail, label: string, multiline = false) => (
    <div key={key}>
      <label
        htmlFor={`studio-detail-${key}`}
        className="block text-xs font-medium mb-1"
        style={{ color: "#8a9bb5" }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={`studio-detail-${key}`}
          className="w-full rounded-lg px-3 py-2 text-sm resize-none"
          style={{
            background: "#0f1729",
            border: "1px solid rgba(201,168,76,0.25)",
            color: "#f5f0e8",
            minHeight: 72,
          }}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          data-ocid={`studio-detail.${key}`}
        />
      ) : (
        <input
          id={`studio-detail-${key}`}
          type="text"
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{
            background: "#0f1729",
            border: "1px solid rgba(201,168,76,0.25)",
            color: "#f5f0e8",
          }}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          data-ocid={`studio-detail.${key}`}
        />
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="studio-detail.dialog"
    >
      <div
        className="relative rounded-xl w-full mx-4 max-w-lg max-h-[90vh] flex flex-col"
        style={{
          background: "#1a2540",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, #c9a84c, transparent)",
          }}
        />
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
        >
          <h2
            className="text-xl font-display font-bold"
            style={{ color: "#f5f0e8" }}
          >
            Studio Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none transition-smooth"
            style={{ color: "#4a5c75" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#4a5c75";
            }}
            aria-label="Close"
            data-ocid="studio-detail.close_button"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-detail.loading_state"
            >
              Loading…
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {field("website", "Website")}
              {field("licenseNumber", "License Number")}
              {field("description", "Description", true)}
            </div>
          )}
        </div>
        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 gap-3"
          style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
        >
          {message && (
            <p
              className="text-xs flex-1"
              style={{
                color: message.startsWith("Error") ? "#e05c5c" : "#c9a84c",
              }}
              data-ocid={
                message.startsWith("Error")
                  ? "studio-detail.error_state"
                  : "studio-detail.success_state"
              }
            >
              {message}
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm transition-smooth"
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#8a9bb5",
              }}
              data-ocid="studio-detail.cancel_button"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#c9a84c",
                opacity: saving || loading ? 0.5 : 1,
              }}
              data-ocid="studio-detail.save_button"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
