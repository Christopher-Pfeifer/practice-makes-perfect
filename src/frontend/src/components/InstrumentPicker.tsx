import { getActor } from "@/lib/actor";
import { useEffect, useRef, useState } from "react";

const GOLD = "#c9a84c";

const INPUT_STYLE = {
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.25)",
  color: "#f5f0e8",
  borderRadius: "6px",
  padding: "8px 12px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};

interface InstrumentPickerProps {
  value: string; // pipe-separated e.g. "Guitar|Piano"
  onChange: (value: string) => void;
  label?: string;
  ocidPrefix?: string;
  id?: string;
}

export default function InstrumentPicker({
  value,
  onChange,
  label = "Instrument(s)",
  ocidPrefix = "instrument-picker",
  id = "instrument-picker-dropdown",
}: InstrumentPickerProps) {
  const [allInstruments, setAllInstruments] = useState<string[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse pipe-separated value into an array
  const selected = value
    ? value
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    getActor()
      .getInstruments()
      .then((list) => {
        // Ensure Unassigned is present
        const withUnassigned = list.includes("Unassigned")
          ? list
          : ["Unassigned", ...list];
        setAllInstruments(withUnassigned);
      })
      .catch(() => {
        setAllInstruments(["Unassigned"]);
      })
      .finally(() => setLoadingInstruments(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleInstrument = (instrument: string) => {
    const next = selected.includes(instrument)
      ? selected.filter((i) => i !== instrument)
      : [...selected, instrument];
    onChange(next.join("|"));
  };

  const removeInstrument = (instrument: string) => {
    const next = selected.filter((i) => i !== instrument);
    onChange(next.join("|"));
  };

  // Instruments not yet selected, for dropdown list
  const available = allInstruments.filter((i) => !selected.includes(i));

  return (
    <div>
      <label
        className="block text-xs font-medium mb-1"
        style={{ color: "#8a9bb5" }}
        htmlFor={id}
      >
        {label}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((inst) => (
            <span
              key={inst}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold"
              style={{
                background: "rgba(201,168,76,0.18)",
                color: GOLD,
                border: "1px solid rgba(201,168,76,0.35)",
              }}
              data-ocid={`${ocidPrefix}.chip`}
            >
              {inst}
              <button
                type="button"
                aria-label={`Remove ${inst}`}
                onClick={() => removeInstrument(inst)}
                style={{
                  color: GOLD,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "0 1px",
                  fontSize: "11px",
                  opacity: 0.8,
                }}
                data-ocid={`${ocidPrefix}.remove_chip`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          id={id}
          onClick={() => setDropdownOpen((o) => !o)}
          style={{
            ...INPUT_STYLE,
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: dropdownOpen
              ? "1px solid rgba(201,168,76,0.6)"
              : INPUT_STYLE.border,
          }}
          data-ocid={`${ocidPrefix}.select`}
        >
          <span
            style={{ color: available.length === 0 ? "#8a9bb5" : "#f5f0e8" }}
          >
            {loadingInstruments
              ? "Loading instruments…"
              : available.length === 0
                ? "All instruments selected"
                : "— Add instrument —"}
          </span>
          <span style={{ color: "#8a9bb5", fontSize: "10px" }}>
            {dropdownOpen ? "▲" : "▼"}
          </span>
        </button>

        {dropdownOpen && !loadingInstruments && available.length > 0 && (
          <div
            className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden"
            style={{
              top: "calc(100% + 4px)",
              background: "#1a2540",
              border: "1px solid rgba(201,168,76,0.35)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              maxHeight: "220px",
              overflowY: "auto",
            }}
            data-ocid={`${ocidPrefix}.dropdown_menu`}
          >
            {available.map((inst) => (
              <button
                key={inst}
                type="button"
                onClick={() => {
                  toggleInstrument(inst);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm transition-colors"
                style={{
                  color: "#f5f0e8",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(201,168,76,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(201,168,76,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
                data-ocid={`${ocidPrefix}.option`}
              >
                {inst}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
