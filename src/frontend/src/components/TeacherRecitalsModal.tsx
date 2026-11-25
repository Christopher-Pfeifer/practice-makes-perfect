import { useEffect, useState } from "react";
import type { TeacherRecital } from "../backend";
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
  TeacherRecital,
  "recitalId" | "teacherUsername"
> => ({
  recitalName: "",
  date: "",
  venue: "",
  studentAssignments: "",
  notes: "",
});

export default function TeacherRecitalsModal({ profile, onClose }: Props) {
  const [records, setRecords] = useState<TeacherRecital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<TeacherRecital | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const actor = await getActor();
        const result = await actor.getRecitalsByTeacher(profile.username);
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

  function startEdit(r: TeacherRecital) {
    setEditing(r);
    setForm({
      recitalName: r.recitalName,
      date: r.date,
      venue: r.venue,
      studentAssignments: r.studentAssignments,
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
      const id = editing ? editing.recitalId : crypto.randomUUID();
      const record: TeacherRecital = {
        recitalId: id,
        teacherUsername: profile.username,
        recitalName: form.recitalName,
        date: form.date,
        venue: form.venue,
        studentAssignments: form.studentAssignments,
        notes: form.notes,
      };
      await actor.saveTeacherRecital(id, record);
      // Reload after save
      const updated = await actor.getRecitalsByTeacher(profile.username);
      setRecords(updated.map(([, r]) => r));
      cancelForm();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recitalId: string) {
    if (!confirm("Delete this recital?")) return;
    try {
      const actor = await getActor();
      await actor.deleteTeacherRecital(recitalId);
      const actor2 = await getActor();
      const updated = await actor2.getRecitalsByTeacher(profile.username);
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
      data-ocid="teacher-recitals.dialog"
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
            My Recitals
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={BTN_GOLD}
              onClick={startAdd}
              data-ocid="teacher-recitals.open_modal_button"
            >
              + Add Recital
            </button>
            <button
              type="button"
              style={BTN_SECONDARY}
              onClick={onClose}
              data-ocid="teacher-recitals.close_button"
            >
              Close
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{ color: "#f87171", marginBottom: 12, fontSize: 13 }}
            data-ocid="teacher-recitals.error_state"
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
              {editing ? "Edit Recital" : "New Recital"}
            </h3>
            <div style={LABEL_STYLE}>Recital Name</div>
            <input
              style={INPUT_STYLE}
              value={form.recitalName}
              onChange={(e) =>
                setForm((f) => ({ ...f, recitalName: e.target.value }))
              }
              data-ocid="teacher-recitals.input"
            />
            <div style={LABEL_STYLE}>Date</div>
            <input
              type="date"
              style={INPUT_STYLE}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <div style={LABEL_STYLE}>Venue</div>
            <input
              style={INPUT_STYLE}
              value={form.venue}
              onChange={(e) =>
                setForm((f) => ({ ...f, venue: e.target.value }))
              }
            />
            <div style={LABEL_STYLE}>
              Student Assignments (student:piece:readiness, pipe-separated)
            </div>
            <textarea
              style={{ ...INPUT_STYLE, height: 70, resize: "vertical" }}
              value={form.studentAssignments}
              onChange={(e) =>
                setForm((f) => ({ ...f, studentAssignments: e.target.value }))
              }
            />
            <div style={LABEL_STYLE}>Notes</div>
            <textarea
              style={{ ...INPUT_STYLE, height: 60, resize: "vertical" }}
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
                data-ocid="teacher-recitals.save_button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                style={BTN_SECONDARY}
                onClick={cancelForm}
                data-ocid="teacher-recitals.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
            data-ocid="teacher-recitals.loading_state"
          >
            Loading...
          </div>
        ) : records.length === 0 ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
            data-ocid="teacher-recitals.empty_state"
          >
            No recitals on record. Add your first recital above.
          </div>
        ) : (
          records.map((r, i) => (
            <div
              key={r.recitalId}
              style={CARD}
              data-ocid={`teacher-recitals.item.${i + 1}`}
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
                    {r.recitalName || "(untitled)"}
                  </div>
                  <div style={{ color: "#8a9bb5", fontSize: 13 }}>
                    {r.date} {r.venue && `· ${r.venue}`}
                  </div>
                  {r.studentAssignments && (
                    <div
                      style={{ color: "#a0aec0", fontSize: 12, marginTop: 4 }}
                    >
                      Assignments: {r.studentAssignments}
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
                    data-ocid={`teacher-recitals.edit_button.${i + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={BTN_DANGER}
                    onClick={() => handleDelete(r.recitalId)}
                    data-ocid={`teacher-recitals.delete_button.${i + 1}`}
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
