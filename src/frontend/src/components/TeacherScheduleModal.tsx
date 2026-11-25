import type { TeacherSchedule } from "@/backend";
import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

interface Props {
  profile: UserProfile;
  onClose: () => void;
}

const CARD: React.CSSProperties = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.18)",
  borderRadius: 8,
  padding: "14px 16px",
  marginBottom: 10,
};
const LABEL: React.CSSProperties = {
  color: "#8a9bb5",
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 3,
  marginTop: 8,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const INPUT: React.CSSProperties = {
  width: "100%",
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 6,
  padding: "7px 10px",
  color: "#f5f0e8",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
const BTN_GOLD: React.CSSProperties = {
  background: "rgba(201,168,76,0.18)",
  border: "1px solid rgba(201,168,76,0.5)",
  color: "#c9a84c",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  cursor: "pointer",
  marginRight: 6,
};
const BTN_DANGER: React.CSSProperties = {
  background: "rgba(248,113,113,0.12)",
  border: "1px solid rgba(248,113,113,0.4)",
  color: "#f87171",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  cursor: "pointer",
};
const BTN_SECONDARY: React.CSSProperties = {
  background: "rgba(138,155,181,0.1)",
  border: "1px solid rgba(138,155,181,0.3)",
  color: "#8a9bb5",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  cursor: "pointer",
  marginLeft: 6,
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const STATUSES = ["Available", "Booked", "Cancelled", "Hold"];

type FormState = {
  dayOfWeek: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  studentUsername: string;
  status: string;
  notes: string;
};

function emptyForm(): FormState {
  return {
    dayOfWeek: "Monday",
    lessonDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    studentUsername: "",
    status: "Available",
    notes: "",
  };
}

export default function TeacherScheduleModal({ profile, onClose }: Props) {
  const [records, setRecords] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<TeacherSchedule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const actor = getActor();
      const result = await actor.getSchedulesByTeacher(profile.username);
      setRecords(result.map(([, r]) => r));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function startAdd() {
    setForm(emptyForm());
    setEditing(null);
    setIsAdding(true);
  }

  function startEdit(r: TeacherSchedule) {
    setEditing(r);
    setForm({
      dayOfWeek: r.dayOfWeek,
      lessonDate: r.lessonDate,
      startTime: r.startTime,
      endTime: r.endTime,
      duration: String(r.duration),
      studentUsername: r.studentUsername,
      status: r.status,
      notes: r.notes,
    });
    setIsAdding(true);
  }

  function cancelForm() {
    setIsAdding(false);
    setEditing(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const actor = getActor();
      const id = editing ? editing.scheduleId : crypto.randomUUID();
      const record: TeacherSchedule = {
        scheduleId: id,
        teacherUsername: profile.username,
        dayOfWeek: form.dayOfWeek,
        lessonDate: form.lessonDate,
        startTime: form.startTime,
        endTime: form.endTime,
        duration: BigInt(Number(form.duration) || 0),
        studentUsername: form.studentUsername,
        status: form.status,
        notes: form.notes,
      };
      await actor.saveTeacherSchedule(id, record);
      await load();
      cancelForm();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm("Delete this schedule entry?")) return;
    try {
      const actor = getActor();
      await actor.deleteTeacherSchedule(scheduleId);
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  const filtered = search.trim()
    ? records.filter((r) =>
        [r.dayOfWeek, r.lessonDate, r.studentUsername, r.status, r.notes]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : records;

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
      data-ocid="teacher-schedule.dialog"
    >
      <div
        style={{
          background: "#0f1729",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 720,
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 28,
          position: "relative",
        }}
      >
        {/* Header */}
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
            My Schedule
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={BTN_GOLD}
              onClick={startAdd}
              data-ocid="teacher-schedule.open_modal_button"
            >
              + Add Entry
            </button>
            <button
              type="button"
              style={BTN_SECONDARY}
              onClick={onClose}
              data-ocid="teacher-schedule.close_button"
            >
              Close
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          style={{ ...INPUT, marginBottom: 16 }}
          placeholder="Search by day, date, student, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="teacher-schedule.search_input"
        />

        {error && (
          <div
            style={{ color: "#f87171", marginBottom: 12, fontSize: 13 }}
            data-ocid="teacher-schedule.error_state"
          >
            {error}
          </div>
        )}

        {/* Add / Edit form */}
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
              {editing ? "Edit Schedule Entry" : "New Schedule Entry"}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 16px",
              }}
            >
              <div>
                <div style={LABEL}>Day of Week</div>
                <select
                  style={INPUT}
                  value={form.dayOfWeek}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dayOfWeek: e.target.value }))
                  }
                  data-ocid="teacher-schedule.select"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={LABEL}>Lesson Date</div>
                <input
                  type="date"
                  style={INPUT}
                  value={form.lessonDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lessonDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={LABEL}>Start Time</div>
                <input
                  type="time"
                  style={INPUT}
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={LABEL}>End Time</div>
                <input
                  type="time"
                  style={INPUT}
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={LABEL}>Duration (min)</div>
                <input
                  type="number"
                  style={INPUT}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="30"
                />
              </div>
              <div>
                <div style={LABEL}>Student Username</div>
                <input
                  style={INPUT}
                  value={form.studentUsername}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentUsername: e.target.value }))
                  }
                  placeholder="student_username"
                />
              </div>
              <div>
                <div style={LABEL}>Status</div>
                <select
                  style={INPUT}
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={LABEL}>Notes</div>
            <textarea
              style={{ ...INPUT, height: 60, resize: "vertical" }}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                style={BTN_GOLD}
                onClick={handleSave}
                disabled={saving}
                data-ocid="teacher-schedule.save_button"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                style={BTN_SECONDARY}
                onClick={cancelForm}
                data-ocid="teacher-schedule.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
            data-ocid="teacher-schedule.loading_state"
          >
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
            data-ocid="teacher-schedule.empty_state"
          >
            {search
              ? "No entries match your search."
              : "No schedule entries yet. Add your first entry above."}
          </div>
        ) : (
          filtered.map((r, i) => (
            <div
              key={r.scheduleId}
              style={CARD}
              data-ocid={`teacher-schedule.item.${i + 1}`}
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
                    {r.dayOfWeek}
                    {r.lessonDate ? ` · ${r.lessonDate}` : ""}
                  </div>
                  <div style={{ color: "#8a9bb5", fontSize: 13 }}>
                    {r.startTime && r.endTime
                      ? `${r.startTime} – ${r.endTime}`
                      : r.startTime || ""}
                    {r.duration ? ` (${r.duration} min)` : ""}
                    {r.studentUsername
                      ? ` · Student: ${r.studentUsername}`
                      : ""}
                  </div>
                  <div style={{ color: "#a0aec0", fontSize: 12, marginTop: 3 }}>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          r.status === "Booked"
                            ? "#4ade80"
                            : r.status === "Cancelled"
                              ? "#f87171"
                              : "#c9a84c",
                      }}
                    >
                      {r.status}
                    </span>
                    {r.notes ? ` · ${r.notes}` : ""}
                  </div>
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
                    data-ocid={`teacher-schedule.edit_button.${i + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={BTN_DANGER}
                    onClick={() => handleDelete(r.scheduleId)}
                    data-ocid={`teacher-schedule.delete_button.${i + 1}`}
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
