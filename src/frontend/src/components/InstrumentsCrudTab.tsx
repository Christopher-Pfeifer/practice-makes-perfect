import { getActor } from "@/lib/actor";
import { useCallback, useEffect, useState } from "react";

const GOLD = "#c9a84c";

const INPUT_STYLE = {
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.25)",
  color: "#f5f0e8",
  borderRadius: "6px",
  padding: "7px 10px",
  fontSize: "13px",
  outline: "none",
};

const CARD_STYLE = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: "8px",
};

export default function InstrumentsCrudTab() {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getActor().getInstruments();
      setInstruments(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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
      const ok = await getActor().addInstrument(
        name,
        BigInt(Number(addSort) || 0),
      );
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

  const startEdit = (name: string, idx: number) => {
    setEditingName(name);
    setEditName(name);
    setEditSort(String(idx));
    setEditStatus(null);
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
      const ok = await getActor().updateInstrument(
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
      await getActor().deleteInstrument(name);
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setDeleteStatus(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="flex flex-col gap-5" data-ocid="portal.instruments.panel">
      {/* Add Form */}
      <div className="rounded-lg p-4 flex flex-col gap-3" style={CARD_STYLE}>
        <h3 className="text-sm font-bold" style={{ color: GOLD }}>
          Add Instrument
        </h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="instruments-add-name"
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
              id="instruments-add-name"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. Guitar"
              style={INPUT_STYLE}
              data-ocid="portal.instruments.add_name.input"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div style={{ width: 100 }}>
            <label
              htmlFor="instruments-add-sort"
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
              id="instruments-add-sort"
              type="number"
              value={addSort}
              onChange={(e) => setAddSort(e.target.value)}
              style={{ ...INPUT_STYLE, width: "100%" }}
              data-ocid="portal.instruments.add_sort.input"
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
            data-ocid="portal.instruments.add_button"
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
            data-ocid={`portal.instruments.add_${addStatus.type}_state`}
          >
            {addStatus.msg}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: GOLD }}>
          Instruments List
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
          data-ocid="portal.instruments.refresh_button"
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid="portal.instruments.loading_state"
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
          data-ocid="portal.instruments.error_state"
        >
          {error}
        </div>
      )}
      {!loading && !error && instruments.length === 0 && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid="portal.instruments.empty_state"
        >
          No instruments yet. Add one above.
        </div>
      )}

      {!loading && !error && instruments.length > 0 && (
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
                {["#", "Name", "Actions"].map((h) => (
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
              {instruments.map((name, idx) => (
                <tr
                  key={name}
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
                  data-ocid={`portal.instruments.item.${idx + 1}`}
                >
                  {editingName === name ? (
                    <>
                      <td
                        className="px-4 py-2"
                        style={{ color: "#8a9bb5", fontSize: "12px" }}
                      >
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2" colSpan={1}>
                        <div className="flex items-center gap-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              ...INPUT_STYLE,
                              width: 160,
                              padding: "5px 8px",
                            }}
                            data-ocid="portal.instruments.edit_name.input"
                          />
                          <input
                            type="number"
                            value={editSort}
                            onChange={(e) => setEditSort(e.target.value)}
                            style={{
                              ...INPUT_STYLE,
                              width: 70,
                              padding: "5px 8px",
                            }}
                            placeholder="Sort"
                            data-ocid="portal.instruments.edit_sort.input"
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
                            data-ocid={`portal.instruments.save_button.${idx + 1}`}
                          >
                            {editSaving ? "…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingName(null)}
                            className="rounded px-3 py-1 text-xs"
                            style={{
                              background: "transparent",
                              color: "#8a9bb5",
                              border: "1px solid rgba(138,155,181,0.3)",
                              cursor: "pointer",
                            }}
                            data-ocid={`portal.instruments.cancel_button.${idx + 1}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : confirmDelete === name ? (
                    <>
                      <td
                        className="px-4 py-2"
                        style={{ color: "#8a9bb5", fontSize: "12px" }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        className="px-4 py-2"
                        style={{ color: "#fca5a5", fontSize: "13px" }}
                      >
                        Delete "{name}"?
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(name)}
                            className="rounded px-3 py-1 text-xs font-semibold"
                            style={{
                              background: "rgba(220,38,38,0.2)",
                              color: "#fca5a5",
                              border: "1px solid rgba(220,38,38,0.4)",
                              cursor: "pointer",
                            }}
                            data-ocid={`portal.instruments.confirm_button.${idx + 1}`}
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
                            data-ocid={`portal.instruments.cancel_button.${idx + 1}`}
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
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2" style={{ color: "#f5f0e8" }}>
                        {name}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(name, idx)}
                            className="rounded px-3 py-1 text-xs font-medium"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: GOLD,
                              border: "1px solid rgba(201,168,76,0.3)",
                              cursor: "pointer",
                            }}
                            data-ocid={`portal.instruments.edit_button.${idx + 1}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDelete(name);
                              setDeleteStatus("");
                            }}
                            className="rounded px-3 py-1 text-xs font-medium"
                            style={{
                              background: "rgba(220,38,38,0.12)",
                              color: "#fca5a5",
                              border: "1px solid rgba(220,38,38,0.3)",
                              cursor: "pointer",
                            }}
                            data-ocid={`portal.instruments.delete_button.${idx + 1}`}
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
          {deleteStatus && (
            <div className="px-4 py-2 text-xs" style={{ color: "#fca5a5" }}>
              {deleteStatus}
            </div>
          )}
        </div>
      )}

      <div style={{ color: "#8a9bb5", fontSize: "12px" }}>
        {instruments.length} instrument{instruments.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
