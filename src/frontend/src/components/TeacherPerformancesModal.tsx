import { useEffect, useState } from "react";
import type { TeacherExamplePerformance } from "../backend";
import { getActor } from "../lib/actor";
import type { UserProfile } from "../types/auth";

interface Props {
  profile: UserProfile;
  onClose?: () => void;
}

const CARD = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
};
const LABEL_STYLE = { color: "#8a9bb5", fontSize: 12, marginBottom: 4 };
const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.3)",
  borderRadius: 4,
  color: "#f5f0e8",
  padding: "6px 10px",
  fontSize: 14,
  marginBottom: 10,
};
const BTN_GOLD: React.CSSProperties = {
  background: "rgba(201,168,76,0.15)",
  border: "1px solid rgba(201,168,76,0.5)",
  color: "#c9a84c",
  borderRadius: 4,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
  marginRight: 8,
};
const BTN_DANGER: React.CSSProperties = {
  background: "rgba(220,50,50,0.1)",
  border: "1px solid rgba(220,50,50,0.4)",
  color: "#f87171",
  borderRadius: 4,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
};
const BTN_SECONDARY: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(138,155,181,0.3)",
  color: "#8a9bb5",
  borderRadius: 4,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
  marginRight: 8,
};

const EMPTY_FORM = (): Omit<
  TeacherExamplePerformance,
  "performanceId" | "teacherUsername"
> => ({
  title: "",
  mediaUrl: "",
  description: "",
  commentary: "",
  attachedToAssignmentId: "",
  notes: "",
});

export default function TeacherPerformancesModal({ profile, onClose }: Props) {
  const [records, setRecords] = useState<TeacherExamplePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<TeacherExamplePerformance | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const actor = await getActor();
        const result = await actor.getPerformancesByTeacher(profile.username);
        setRecords(result.map(([, r]) => r));
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile.username]);

  function startAdd() {
    setForm(EMPTY_FORM());
    setEditing(null);
    setIsAdding(true);
  }

  function startEdit(r: TeacherExamplePerformance) {
    setEditing(r);
    setForm({
      title: r.title,
      mediaUrl: r.mediaUrl,
      description: r.description,
      commentary: r.commentary,
      attachedToAssignmentId: r.attachedToAssignmentId,
      notes: r.notes,
    });
    setIsAdding(true);
  }

  function cancelForm() {
    setIsAdding(false);
    setEditing(null);
    setForm(EMPTY_FORM());
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const actor = await getActor();
      const id = editing ? editing.performanceId : crypto.randomUUID();
      const record: TeacherExamplePerformance = {
        performanceId: id,
        teacherUsername: profile.username,
        title: form.title,
        mediaUrl: form.mediaUrl,
        description: form.description,
        commentary: form.commentary,
        attachedToAssignmentId: form.attachedToAssignmentId,
        notes: form.notes,
      };
      await actor.saveTeacherExamplePerformance(id, record);
      // Reload after save
      const updated = await actor.getPerformancesByTeacher(profile.username);
      setRecords(updated.map(([, r]) => r));
      cancelForm();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(performanceId: string) {
    if (!confirm("Delete this performance?")) return;
    try {
      const actor = await getActor();
      await actor.deleteTeacherExamplePerformance(performanceId);
      const actor2 = await getActor();
      const updated = await actor2.getPerformancesByTeacher(profile.username);
      setRecords(updated.map(([, r]) => r));
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
      }}
      data-ocid="teacher-performances.dialog"
    >
      <div
        style={{
          background: "#0f1729",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 700,
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 28,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              color: "#c9a84c",
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Example Performances
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={BTN_GOLD}
              onClick={startAdd}
              data-ocid="teacher-performances.open_modal_button"
            >
              + Add Performance
            </button>
            <button
              type="button"
              style={BTN_SECONDARY}
              onClick={onClose}
              data-ocid="teacher-performances.close_button"
            >
              Close
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{ color: "#f87171", marginBottom: 12, fontSize: 13 }}
            data-ocid="teacher-performances.error_state"
          >
            {error}
          </div>
        )}

        {isAdding && (
          <div
            style={{
              ...CARD,
              border: "1px solid rgba(201,168,76,0.4)",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                color: "#f5f0e8",
                fontWeight: 600,
                marginBottom: 14,
                fontSize: 15,
              }}
            >
              {editing ? "Edit Performance" : "New Performance"}
            </h3>
            <div style={LABEL_STYLE}>Title</div>
            <input
              style={INPUT_STYLE}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="teacher-performances.input"
            />
            <div style={LABEL_STYLE}>Media URL</div>
            <input
              style={INPUT_STYLE}
              value={form.mediaUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, mediaUrl: e.target.value }))
              }
              placeholder="https://..."
            />
            <div style={LABEL_STYLE}>Description</div>
            <textarea
              style={{ ...INPUT_STYLE, height: 64, resize: "vertical" }}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <div style={LABEL_STYLE}>Commentary</div>
            <textarea
              style={{ ...INPUT_STYLE, height: 64, resize: "vertical" }}
              value={form.commentary}
              onChange={(e) =>
                setForm((f) => ({ ...f, commentary: e.target.value }))
              }
            />
            <div style={LABEL_STYLE}>Attached Assignment ID</div>
            <input
              style={INPUT_STYLE}
              value={form.attachedToAssignmentId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  attachedToAssignmentId: e.target.value,
                }))
              }
            />
            <div style={LABEL_STYLE}>Notes</div>
            <textarea
              style={{ ...INPUT_STYLE, height: 56, resize: "vertical" }}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                style={BTN_GOLD}
                onClick={handleSave}
                disabled={saving}
                data-ocid="teacher-performances.save_button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                style={BTN_SECONDARY}
                onClick={cancelForm}
                data-ocid="teacher-performances.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
            data-ocid="teacher-performances.loading_state"
          >
            Loading...
          </div>
        ) : records.length === 0 ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
            data-ocid="teacher-performances.empty_state"
          >
            No example performances on record. Add your first one above.
          </div>
        ) : (
          records.map((r, i) => (
            <div
              key={r.performanceId}
              style={CARD}
              data-ocid={`teacher-performances.item.${i + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#c9a84c",
                      fontWeight: 600,
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    {r.title || "(untitled)"}
                  </div>
                  {r.mediaUrl && (
                    <a
                      href={r.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#7db3ff", fontSize: 12 }}
                    >
                      {r.mediaUrl}
                    </a>
                  )}
                  {r.description && (
                    <div
                      style={{ color: "#a0aec0", fontSize: 13, marginTop: 4 }}
                    >
                      {r.description}
                    </div>
                  )}
                  {r.commentary && (
                    <div
                      style={{
                        color: "#8a9bb5",
                        fontSize: 12,
                        marginTop: 4,
                        fontStyle: "italic",
                      }}
                    >
                      {r.commentary}
                    </div>
                  )}
                  {r.attachedToAssignmentId && (
                    <div
                      style={{ color: "#8a9bb5", fontSize: 12, marginTop: 4 }}
                    >
                      Assignment: {r.attachedToAssignmentId}
                    </div>
                  )}
                  {r.notes && (
                    <div
                      style={{ color: "#8a9bb5", fontSize: 12, marginTop: 4 }}
                    >
                      Notes: {r.notes}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginLeft: 12,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    style={BTN_GOLD}
                    onClick={() => startEdit(r)}
                    data-ocid={`teacher-performances.edit_button.${i + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={BTN_DANGER}
                    onClick={() => handleDelete(r.performanceId)}
                    data-ocid={`teacher-performances.delete_button.${i + 1}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
