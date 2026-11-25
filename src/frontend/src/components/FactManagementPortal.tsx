import { getActor } from "@/lib/actor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GOLD = "#c9a84c";

const INPUT_STYLE = {
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.25)",
  color: "#f5f0e8",
  borderRadius: "6px",
  padding: "7px 10px",
  fontSize: "13px",
  outline: "none",
} as const;

const CARD_STYLE = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: "8px",
} as const;

type FactEntry = { name: string; sortOrder: number };

type FactTableKey =
  | "skillLevels"
  | "theoryLevels"
  | "voiceTypes"
  | "factRoles"
  | "assignmentStatuses"
  | "billingStatuses"
  | "repertoireStatuses"
  | "priorities"
  | "genres"
  | "skillCategories"
  | "groupTypes"
  | "certifications"
  | "ensembleTypes"
  | "instruments"
  | "states";

interface FactTableMeta {
  key: FactTableKey;
  label: string;
  get: () => Promise<string[]>;
  add: (name: string, sortOrder: bigint) => Promise<boolean>;
  update: (
    oldName: string,
    newName: string,
    sortOrder: bigint,
  ) => Promise<boolean>;
  del: (name: string) => Promise<boolean | undefined>;
}

function buildMeta(): FactTableMeta[] {
  const a = getActor() as unknown as Record<
    string,
    (...args: unknown[]) => Promise<unknown>
  >;
  function g(method: string) {
    return () => a[method]() as Promise<string[]>;
  }
  function add(method: string) {
    return (name: string, sort: bigint) =>
      a[method](name, sort) as Promise<boolean>;
  }
  function upd(method: string) {
    return (old: string, n: string, sort: bigint) =>
      a[method](old, n, sort) as Promise<boolean>;
  }
  function del(method: string) {
    return (name: string) => a[method](name) as Promise<boolean | undefined>;
  }

  return [
    {
      key: "skillLevels",
      label: "Skill Levels",
      get: g("getSkillLevels"),
      add: add("addSkillLevel"),
      update: upd("updateSkillLevel"),
      del: del("deleteSkillLevel"),
    },
    {
      key: "theoryLevels",
      label: "Theory Levels",
      get: g("getTheoryLevels"),
      add: add("addTheoryLevel"),
      update: upd("updateTheoryLevel"),
      del: del("deleteTheoryLevel"),
    },
    {
      key: "voiceTypes",
      label: "Voice Types",
      get: g("getVoiceTypes"),
      add: add("addVoiceType"),
      update: upd("updateVoiceType"),
      del: del("deleteVoiceType"),
    },
    {
      key: "factRoles",
      label: "Roles",
      get: g("getFactRoles"),
      add: add("addFactRole"),
      update: upd("updateFactRole"),
      del: del("deleteFactRole"),
    },
    {
      key: "assignmentStatuses",
      label: "Assignment Statuses",
      get: g("getAssignmentStatuses"),
      add: add("addAssignmentStatus"),
      update: upd("updateAssignmentStatus"),
      del: del("deleteAssignmentStatus"),
    },
    {
      key: "billingStatuses",
      label: "Billing Statuses",
      get: g("getBillingStatuses"),
      add: add("addBillingStatus"),
      update: upd("updateBillingStatus"),
      del: del("deleteBillingStatus"),
    },
    {
      key: "repertoireStatuses",
      label: "Repertoire Statuses",
      get: g("getRepertoireStatuses"),
      add: add("addRepertoireStatus"),
      update: upd("updateRepertoireStatus"),
      del: del("deleteRepertoireStatus"),
    },
    {
      key: "priorities",
      label: "Priorities",
      get: g("getPriorities"),
      add: add("addPriority"),
      update: upd("updatePriority"),
      del: del("deletePriority"),
    },
    {
      key: "genres",
      label: "Genres",
      get: g("getGenres"),
      add: add("addGenre"),
      update: upd("updateGenre"),
      del: del("deleteGenre"),
    },
    {
      key: "skillCategories",
      label: "Skill Categories",
      get: g("getSkillCategories"),
      add: add("addSkillCategory"),
      update: upd("updateSkillCategory"),
      del: del("deleteSkillCategory"),
    },
    {
      key: "groupTypes",
      label: "Group Types",
      get: g("getGroupTypes"),
      add: add("addGroupType"),
      update: upd("updateGroupType"),
      del: del("deleteGroupType"),
    },
    {
      key: "certifications",
      label: "Certifications",
      get: g("getCertifications"),
      add: add("addCertification"),
      update: upd("updateCertification"),
      del: del("deleteCertification"),
    },
    {
      key: "ensembleTypes",
      label: "Ensemble Types",
      get: g("getEnsembleTypes"),
      add: add("addEnsembleType"),
      update: upd("updateEnsembleType"),
      del: del("deleteEnsembleType"),
    },
    {
      key: "instruments",
      label: "Instruments",
      get: g("getInstruments"),
      add: add("addInstrument"),
      update: upd("updateInstrument"),
      del: del("deleteInstrument"),
    },
    {
      key: "states",
      label: "States",
      get: g("getFactStates"),
      add: add("addFactState"),
      update: upd("updateFactState"),
      del: del("deleteFactState"),
    },
  ];
}

// ─── Single FACT table CRUD panel ─────────────────────────────────────────────

function FactTablePanel({ meta }: { meta: FactTableMeta }) {
  const [entries, setEntries] = useState<FactEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  // Add form
  const [addName, setAddName] = useState("");
  const [addSort, setAddSort] = useState("0");
  const [addStatus, setAddStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSort, setEditSort] = useState("0");
  const [editStatus, setEditStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState("");

  const tableKey = meta.key;
  const loadingRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional stable ref pattern
  const load = useCallback(async () => {
    if (loadingRef.current) return; // guard against concurrent loads
    loadingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const list = await meta.get();
      setEntries(list.map((name, idx) => ({ name, sortOrder: idx })));
      hasLoadedRef.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [tableKey]);

  useEffect(() => {
    // Only auto-load once per table mount
    if (!hasLoadedRef.current) {
      load();
    }
    // Reset edit/delete state when switching tables
    setEditingName(null);
    setConfirmDelete(null);
    setAddName("");
    setAddSort("0");
    setAddStatus(null);
    setDeleteStatus("");
    return () => {
      hasLoadedRef.current = false;
    };
  }, [load]);

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) {
      setAddStatus({ type: "error", msg: "Name is required." });
      return;
    }
    setAdding(true);
    setAddStatus(null);
    try {
      const ok = await meta.add(name, BigInt(Number(addSort) || 0));
      if (ok) {
        setAddStatus({ type: "success", msg: `"${name}" added.` });
        setAddName("");
        setAddSort("0");
        await load();
      } else {
        setAddStatus({ type: "error", msg: `"${name}" already exists.` });
      }
    } catch (e) {
      setAddStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (entry: FactEntry) => {
    setEditingName(entry.name);
    setEditName(entry.name);
    setEditSort(String(entry.sortOrder));
    setEditStatus(null);
    setConfirmDelete(null);
  };

  const handleEdit = async () => {
    if (!editingName) return;
    const newName = editName.trim();
    if (!newName) {
      setEditStatus({ type: "error", msg: "Name cannot be empty." });
      return;
    }
    setEditSaving(true);
    setEditStatus(null);
    try {
      const ok = await meta.update(
        editingName,
        newName,
        BigInt(Number(editSort) || 0),
      );
      if (ok) {
        setEditStatus({ type: "success", msg: "Updated." });
        setTimeout(() => {
          setEditingName(null);
          setEditStatus(null);
        }, 700);
        await load();
      } else {
        setEditStatus({
          type: "error",
          msg: "Update failed — name may already exist.",
        });
      }
    } catch (e) {
      setEditStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    setDeleteStatus("");
    try {
      await meta.del(name);
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setDeleteStatus(e instanceof Error ? e.message : String(e));
    }
  };

  const prefix = `fact.${tableKey}`;

  return (
    <div className="flex flex-col gap-5" data-ocid={`${prefix}.panel`}>
      {/* Add Form */}
      <div className="rounded-lg p-4 flex flex-col gap-3" style={CARD_STYLE}>
        <h3 className="text-sm font-bold" style={{ color: GOLD }}>
          Add {meta.label} Entry
        </h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor={`${prefix}-add-name`}
              className="block text-xs mb-1"
              style={{
                color: "#8a9bb5",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              Name *
            </label>
            <input
              id={`${prefix}-add-name`}
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder={`e.g. ${meta.label.replace(/ Levels| Types| Statuses| Categories/, "").trim()}`}
              style={INPUT_STYLE}
              data-ocid={`${prefix}.add_name.input`}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div style={{ width: 100 }}>
            <label
              htmlFor={`${prefix}-add-sort`}
              className="block text-xs mb-1"
              style={{
                color: "#8a9bb5",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              Sort Order
            </label>
            <input
              id={`${prefix}-add-sort`}
              type="number"
              value={addSort}
              onChange={(e) => setAddSort(e.target.value)}
              style={{ ...INPUT_STYLE, width: "100%" }}
              data-ocid={`${prefix}.add_sort.input`}
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="rounded px-4 py-1.5 text-sm font-bold"
            style={{
              background: GOLD,
              color: "#0f1729",
              border: "none",
              cursor: adding ? "not-allowed" : "pointer",
              opacity: adding ? 0.6 : 1,
              height: "34px",
              flexShrink: 0,
            }}
            data-ocid={`${prefix}.add_button`}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
        {addStatus && (
          <div
            className="rounded p-2 text-xs"
            style={{
              background:
                addStatus.type === "success"
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(220,38,38,0.15)",
              color: addStatus.type === "success" ? "#86efac" : "#fca5a5",
              border: `1px solid ${addStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)"}`,
            }}
            data-ocid={`${prefix}.add_${addStatus.type}_state`}
          >
            {addStatus.msg}
          </div>
        )}
      </div>

      {/* Table header + refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: GOLD }}>
          {meta.label} ({entries.length})
        </h3>
        <button
          type="button"
          onClick={load}
          className="text-xs rounded px-3 py-1"
          style={{
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.4)",
            color: GOLD,
            cursor: "pointer",
          }}
          data-ocid={`${prefix}.refresh_button`}
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid={`${prefix}.loading_state`}
        >
          Loading…
        </div>
      )}
      {error && (
        <div
          className="rounded p-2 text-sm"
          style={{
            background: "rgba(220,38,38,0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.3)",
          }}
          data-ocid={`${prefix}.error_state`}
        >
          {error}
        </div>
      )}
      {deleteStatus && (
        <div
          className="rounded p-2 text-sm"
          style={{
            background: "rgba(220,38,38,0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.3)",
          }}
        >
          {deleteStatus}
        </div>
      )}
      {!loading && !error && entries.length === 0 && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid={`${prefix}.empty_state`}
        >
          No entries yet. Add one above.
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={CARD_STYLE}>
          <table
            className="w-full text-sm"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(201,168,76,0.2)",
                  background: "rgba(201,168,76,0.05)",
                }}
              >
                {["Sort Order", "Name", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold"
                    style={{
                      color: GOLD,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.name}
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
                  data-ocid={`${prefix}.item.${idx + 1}`}
                >
                  {editingName === entry.name ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editSort}
                          onChange={(e) => setEditSort(e.target.value)}
                          style={{
                            ...INPUT_STYLE,
                            width: 70,
                            padding: "5px 8px",
                          }}
                          data-ocid={`${prefix}.edit_sort.input`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              ...INPUT_STYLE,
                              width: 200,
                              padding: "5px 8px",
                            }}
                            data-ocid={`${prefix}.edit_name.input`}
                          />
                          {editStatus && (
                            <span
                              className="text-xs"
                              style={{
                                color:
                                  editStatus.type === "success"
                                    ? "#86efac"
                                    : "#fca5a5",
                              }}
                            >
                              {editStatus.msg}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={editSaving}
                            onClick={handleEdit}
                            className="rounded px-3 py-1 text-xs font-bold"
                            style={{
                              background: GOLD,
                              color: "#0f1729",
                              border: "none",
                              cursor: editSaving ? "not-allowed" : "pointer",
                              opacity: editSaving ? 0.6 : 1,
                            }}
                            data-ocid={`${prefix}.save_button.${idx + 1}`}
                          >
                            {editSaving ? "…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingName(null);
                              setEditStatus(null);
                            }}
                            className="rounded px-3 py-1 text-xs"
                            style={{
                              background: "transparent",
                              color: "#8a9bb5",
                              border: "1px solid rgba(138,155,181,0.3)",
                              cursor: "pointer",
                            }}
                            data-ocid={`${prefix}.cancel_button.${idx + 1}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : confirmDelete === entry.name ? (
                    <>
                      <td
                        className="px-4 py-2"
                        style={{ color: "#8a9bb5", fontSize: "12px" }}
                      >
                        {entry.sortOrder}
                      </td>
                      <td
                        className="px-4 py-2"
                        style={{ color: "#fca5a5", fontSize: "13px" }}
                      >
                        Delete "{entry.name}"?
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.name)}
                            className="rounded px-3 py-1 text-xs font-semibold"
                            style={{
                              background: "rgba(220,38,38,0.2)",
                              color: "#fca5a5",
                              border: "1px solid rgba(220,38,38,0.4)",
                              cursor: "pointer",
                            }}
                            data-ocid={`${prefix}.confirm_button.${idx + 1}`}
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDelete(null);
                              setDeleteStatus("");
                            }}
                            className="rounded px-3 py-1 text-xs"
                            style={{
                              background: "transparent",
                              color: "#8a9bb5",
                              border: "1px solid rgba(138,155,181,0.3)",
                              cursor: "pointer",
                            }}
                            data-ocid={`${prefix}.cancel_button.${idx + 1}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className="px-4 py-2"
                        style={{ color: "#8a9bb5", fontSize: "12px" }}
                      >
                        {entry.sortOrder}
                      </td>
                      <td className="px-4 py-2" style={{ color: "#f5f0e8" }}>
                        {entry.name}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            className="rounded px-3 py-1 text-xs font-semibold"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: GOLD,
                              border: "1px solid rgba(201,168,76,0.35)",
                              cursor: "pointer",
                            }}
                            data-ocid={`${prefix}.edit_button.${idx + 1}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDelete(entry.name);
                              setDeleteStatus("");
                              setEditingName(null);
                            }}
                            className="rounded px-3 py-1 text-xs font-semibold"
                            style={{
                              background: "rgba(220,38,38,0.12)",
                              color: "#fca5a5",
                              border: "1px solid rgba(220,38,38,0.3)",
                              cursor: "pointer",
                            }}
                            data-ocid={`${prefix}.delete_button.${idx + 1}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar entry ─────────────────────────────────────────────────────────────

function SidebarItem({
  meta,
  count,
  active,
  onClick,
}: {
  meta: FactTableMeta;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded flex items-center justify-between gap-2 text-sm transition-colors"
      style={{
        background: active ? "rgba(201,168,76,0.15)" : "transparent",
        border: active
          ? "1px solid rgba(201,168,76,0.4)"
          : "1px solid transparent",
        color: active ? GOLD : "#8a9bb5",
        cursor: "pointer",
      }}
      data-ocid={`fact.sidebar.${meta.key}.tab`}
    >
      <span className="truncate min-w-0 font-medium">{meta.label}</span>
      <span
        className="flex-shrink-0 text-xs rounded-full px-1.5 py-0.5 font-bold"
        style={{
          background: active
            ? "rgba(201,168,76,0.25)"
            : "rgba(138,155,181,0.15)",
          color: active ? GOLD : "#4a5c75",
          minWidth: 20,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Portal container ──────────────────────────────────────────────────────────

interface FactManagementPortalProps {
  onClose: () => void;
}

export default function FactManagementPortal({
  onClose,
}: FactManagementPortalProps) {
  const [tables] = useState<FactTableMeta[]>(() => buildMeta());
  const [selectedKey, setSelectedKey] = useState<FactTableKey>("skillLevels");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const selectedMeta = tables.find((t) => t.key === selectedKey) ?? tables[0];

  // Load entry counts for all tables for the sidebar badges
  const refreshCount = useCallback(
    async (key: FactTableKey, meta: FactTableMeta) => {
      try {
        const list = await meta.get();
        setCounts((prev) => ({ ...prev, [key]: list.length }));
      } catch {
        // silent — badge stays at 0
      }
    },
    [],
  );

  useEffect(() => {
    for (const meta of tables) {
      refreshCount(meta.key, meta);
    }
  }, [tables, refreshCount]);

  // Re-fetch count for the active table when it may have changed
  const handleTableChange = useCallback((key: FactTableKey) => {
    setSelectedKey(key);
  }, []);

  // Intercept panel loads to refresh count
  const handleCountUpdate = useCallback(
    (key: FactTableKey, newCount: number) => {
      setCounts((prev) => ({ ...prev, [key]: newCount }));
    },
    [],
  );

  // Escape key closes portal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "stretch",
      }}
      data-ocid="fact.dialog"
    >
      <div
        style={{
          background: "#0f1729",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Portal header */}
        <div
          style={{
            background: "#1a2540",
            borderBottom: "1px solid rgba(201,168,76,0.25)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-sm"
              style={{ background: "rgba(201,168,76,0.2)", color: GOLD }}
            >
              ⊞
            </div>
            <div>
              <h1
                className="font-bold text-base"
                style={{ color: GOLD, margin: 0 }}
              >
                FACT Management Portal
              </h1>
              <p className="text-xs" style={{ color: "#4a5c75", margin: 0 }}>
                Manage lookup table values for all FACT tables
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-1.5 text-sm font-semibold"
            style={{
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.4)",
              color: GOLD,
              cursor: "pointer",
            }}
            data-ocid="fact.close_button"
          >
            ✕ Close
          </button>
        </div>

        {/* Body: sidebar + main */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              background: "#131e33",
              borderRight: "1px solid rgba(201,168,76,0.15)",
              padding: "16px 10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
            data-ocid="fact.sidebar.panel"
          >
            <p
              className="text-xs font-bold uppercase px-2 mb-2"
              style={{ color: "#3a4b60", letterSpacing: "0.08em" }}
            >
              FACT Tables
            </p>
            {tables.map((meta) => (
              <SidebarItem
                key={meta.key}
                meta={meta}
                count={counts[meta.key] ?? 0}
                active={selectedKey === meta.key}
                onClick={() => {
                  handleTableChange(meta.key);
                  refreshCount(meta.key, meta);
                }}
              />
            ))}
          </aside>

          {/* Main panel */}
          <main
            style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}
            data-ocid="fact.main.panel"
          >
            <div className="mb-4">
              <h2
                className="font-bold text-base"
                style={{ color: "#f5f0e8", margin: 0 }}
              >
                {selectedMeta.label}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#4a5c75" }}>
                Add, edit, or remove {selectedMeta.label.toLowerCase()} entries
              </p>
            </div>
            <CountingPanel
              key={selectedKey}
              meta={selectedMeta}
              onCountChange={(n) => handleCountUpdate(selectedKey, n)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

// Thin wrapper that notifies parent of count changes
function CountingPanel({
  meta,
  onCountChange,
}: {
  meta: FactTableMeta;
  onCountChange: (count: number) => void;
}) {
  // Memoize wrapped meta so FactTablePanel doesn't see a new object every render
  const wrappedMeta = useMemo<FactTableMeta>(
    () => ({
      ...meta,
      get: async () => {
        const list = await meta.get();
        onCountChange(list.length);
        return list;
      },
    }),
    [meta, onCountChange],
  );
  return <FactTablePanel meta={wrappedMeta} />;
}
