/**
 * ExtendedDetailTables — CRUD panels for the 10 new data tables:
 * teacherSchedule, teacherRecitals, teacherExamplePerformances,
 * studentLessons, studentPractices, studentAssignments, studentProgress,
 * studentRepertoire, studentMessages, studentBilling, studentCollaboration
 */
import type {
  StudentAssignment,
  StudentBilling,
  StudentCollaboration,
  StudentLesson,
  StudentMessage,
  StudentPractice,
  StudentProgress,
  StudentRepertoire,
  TeacherExamplePerformance,
  TeacherRecital,
  TeacherSchedule,
} from "@/backend";
import { getActor } from "@/lib/actor";
import { useCallback, useEffect, useState } from "react";

const GOLD = "#c9a84c";

const CARD_STYLE = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
};

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

const LABEL_STYLE = {
  color: "#8a9bb5",
  fontSize: "12px",
  fontWeight: 600 as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "4px",
};

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={LABEL_STYLE}>{label}</div>
      {children}
    </div>
  );
}

type FieldSpec<T> = {
  key: keyof T;
  label: string;
  type?: "textarea" | "checkbox" | "number";
  options?: string[];
};

function RecordValue({
  value,
  type,
}: { value: unknown; type?: "textarea" | "checkbox" | "number" }) {
  if (type === "checkbox") {
    return (
      <span className="text-sm" style={{ color: GOLD }}>
        {value ? "Yes" : "No"}
      </span>
    );
  }
  const str = String(value ?? "");
  return (
    <span
      className="text-sm"
      style={{ color: str ? "#f5f0e8" : "#8a9bb5", wordBreak: "break-word" }}
    >
      {str || "—"}
    </span>
  );
}

function DraftInput<T extends object>({
  field,
  draft,
  onChange,
  ocidPrefix,
  idx,
}: {
  field: FieldSpec<T>;
  draft: T;
  onChange: (key: keyof T, val: unknown) => void;
  ocidPrefix: string;
  idx: number;
}) {
  const key = field.key as string;
  const rawVal = draft[field.key];

  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(rawVal)}
        onChange={(e) => onChange(field.key, e.target.checked)}
        style={{ width: 20, height: 20, cursor: "pointer" }}
        data-ocid={`${ocidPrefix}.${key}.input.${idx + 1}`}
      />
    );
  }
  if (field.options) {
    return (
      <select
        value={String(rawVal ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        style={INPUT_STYLE}
        data-ocid={`${ocidPrefix}.${key}.select.${idx + 1}`}
      >
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        value={String(rawVal ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={2}
        style={{ ...INPUT_STYLE, resize: "vertical" }}
        data-ocid={`${ocidPrefix}.${key}.textarea.${idx + 1}`}
      />
    );
  }
  if (field.type === "number") {
    return (
      <input
        type="number"
        value={String(rawVal ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        style={INPUT_STYLE}
        data-ocid={`${ocidPrefix}.${key}.input.${idx + 1}`}
      />
    );
  }
  return (
    <input
      value={String(rawVal ?? "")}
      onChange={(e) => onChange(field.key, e.target.value)}
      style={INPUT_STYLE}
      data-ocid={`${ocidPrefix}.${key}.input.${idx + 1}`}
    />
  );
}

/** Generic CRUD panel for any keyed record table. */
function CrudPanel<T extends object>({
  title,
  ocidPrefix,
  records,
  loading,
  error,
  fields,
  idField,
  blankRecord,
  saveFn,
  deleteFn,
  onRefresh,
  search,
}: {
  title: string;
  ocidPrefix: string;
  records: T[];
  loading: boolean;
  error: string;
  fields: FieldSpec<T>[];
  idField: keyof T;
  blankRecord: T;
  saveFn: (id: string, record: T) => Promise<void>;
  deleteFn: (id: string) => Promise<void>;
  onRefresh: () => void;
  search: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<T>(blankRecord);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const filtered = search
    ? records.filter((r) =>
        Object.values(r).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : records;

  const setDraftField = (key: keyof T, val: unknown) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  const openCreate = () => {
    setDraft({ ...blankRecord });
    setIsEdit(false);
    setShowForm(true);
    setStatus(null);
  };

  const openEdit = (record: T) => {
    setDraft({ ...record });
    setIsEdit(true);
    setShowForm(true);
    setStatus(null);
  };

  const handleSave = async () => {
    const id = String(draft[idField]);
    if (!id.trim()) {
      setStatus({ type: "error", msg: "ID field is required." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      // coerce number/bigint fields before saving
      const coerced = { ...draft };
      for (const f of fields) {
        if (f.type === "number") {
          const num = Number(coerced[f.key]);
          // backend expects bigint for integer numeric fields
          (coerced as Record<string, unknown>)[f.key as string] = BigInt(
            Number.isNaN(num) ? 0 : Math.round(num),
          );
        }
      }
      await saveFn(id, coerced as unknown as T);
      setStatus({ type: "success", msg: "Saved." });
      setTimeout(() => {
        setShowForm(false);
        setStatus(null);
        onRefresh();
      }, 700);
    } catch (e) {
      setStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFn(id);
      setConfirmDelete(null);
      onRefresh();
    } catch (e) {
      setStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <div className="flex flex-col gap-3" data-ocid={`${ocidPrefix}.section`}>
      {/* Title + Add button */}
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.25)" }}
      >
        <h2 className="text-base font-bold font-mono" style={{ color: GOLD }}>
          {title}
        </h2>
        <button
          type="button"
          className="rounded px-3 py-1.5 text-xs font-semibold"
          style={{
            background: "rgba(201,168,76,0.15)",
            color: GOLD,
            border: "1px solid rgba(201,168,76,0.35)",
            cursor: "pointer",
          }}
          onClick={openCreate}
          data-ocid={`${ocidPrefix}.add_button`}
        >
          + Add New
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{ ...CARD_STYLE, border: "1px solid rgba(201,168,76,0.5)" }}
          data-ocid={`${ocidPrefix}.form`}
        >
          <div
            className="text-xs font-semibold"
            style={{ color: GOLD, marginBottom: 2 }}
          >
            {isEdit ? "Edit Record" : "New Record"}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {fields.map((f) => (
              <FG key={String(f.key)} label={f.label}>
                <DraftInput
                  field={f}
                  draft={draft}
                  onChange={setDraftField}
                  ocidPrefix={ocidPrefix}
                  idx={0}
                />
              </FG>
            ))}
          </div>
          {status && (
            <div
              className="rounded p-2 text-xs"
              style={{
                background:
                  status.type === "success"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(220,38,38,0.15)",
                color: status.type === "success" ? "#86efac" : "#fca5a5",
                border: `1px solid ${
                  status.type === "success"
                    ? "rgba(34,197,94,0.3)"
                    : "rgba(220,38,38,0.3)"
                }`,
              }}
              data-ocid={`${ocidPrefix}.form.${status.type}_state`}
            >
              {status.msg}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              className="rounded px-4 py-1.5 text-xs font-bold"
              style={{
                background: GOLD,
                color: "#0f1729",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
              onClick={handleSave}
              data-ocid={`${ocidPrefix}.form.save_button`}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="rounded px-4 py-1.5 text-xs"
              style={{
                background: "transparent",
                color: "#8a9bb5",
                border: "1px solid rgba(138,155,181,0.3)",
                cursor: "pointer",
              }}
              onClick={() => {
                setShowForm(false);
                setStatus(null);
              }}
              data-ocid={`${ocidPrefix}.form.cancel_button`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* States */}
      {loading && (
        <div
          style={{ color: "#8a9bb5", fontSize: 13 }}
          data-ocid={`${ocidPrefix}.loading_state`}
        >
          Loading…
        </div>
      )}
      {!loading && error && (
        <div
          className="rounded p-2 text-xs"
          style={{
            background: "rgba(220,38,38,0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.3)",
          }}
          data-ocid={`${ocidPrefix}.error_state`}
        >
          {error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <div
          style={{ color: "#8a9bb5", fontSize: 13 }}
          data-ocid={`${ocidPrefix}.empty_state`}
        >
          No records yet.
        </div>
      )}

      {/* Records table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-auto rounded-lg" style={CARD_STYLE}>
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr
                style={{
                  background: "rgba(201,168,76,0.05)",
                  borderBottom: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                {fields.map((f) => (
                  <th
                    key={String(f.key)}
                    className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                    style={{
                      color: GOLD,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {f.label}
                  </th>
                ))}
                <th
                  className="px-3 py-2 text-left"
                  style={{ color: GOLD, fontSize: 11 }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, idx) => {
                const id = String(record[idField]);
                return (
                  <tr
                    key={id || idx}
                    style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
                    data-ocid={`${ocidPrefix}.item.${idx + 1}`}
                  >
                    {fields.map((f) => (
                      <td
                        key={String(f.key)}
                        className="px-3 py-2 max-w-[160px] truncate"
                        style={{ color: "#f5f0e8" }}
                      >
                        <RecordValue value={record[f.key]} type={f.type} />
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {confirmDelete === id ? (
                        <div className="flex items-center gap-1">
                          <span style={{ color: "#fca5a5", fontSize: 11 }}>
                            Delete?
                          </span>
                          <button
                            type="button"
                            className="rounded px-2 py-0.5 text-xs font-semibold"
                            style={{
                              background: "rgba(220,38,38,0.2)",
                              color: "#fca5a5",
                              border: "1px solid rgba(220,38,38,0.4)",
                              cursor: "pointer",
                            }}
                            onClick={() => handleDelete(id)}
                            data-ocid={`${ocidPrefix}.confirm_button.${idx + 1}`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              background: "rgba(138,155,181,0.15)",
                              color: "#8a9bb5",
                              border: "1px solid rgba(138,155,181,0.3)",
                              cursor: "pointer",
                            }}
                            onClick={() => setConfirmDelete(null)}
                            data-ocid={`${ocidPrefix}.cancel_button.${idx + 1}`}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: GOLD,
                              border: "1px solid rgba(201,168,76,0.3)",
                              cursor: "pointer",
                            }}
                            onClick={() => openEdit(record)}
                            data-ocid={`${ocidPrefix}.edit_button.${idx + 1}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              background: "rgba(220,38,38,0.12)",
                              color: "#fca5a5",
                              border: "1px solid rgba(220,38,38,0.3)",
                              cursor: "pointer",
                            }}
                            onClick={() => setConfirmDelete(id)}
                            data-ocid={`${ocidPrefix}.delete_button.${idx + 1}`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ color: "#8a9bb5", fontSize: 12 }}>
        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ─── Field specs ──────────────────────────────────────────────────────────────

const TEACHER_SCHEDULE_FIELDS: FieldSpec<TeacherSchedule>[] = [
  { key: "scheduleId", label: "Schedule ID" },
  { key: "teacherUsername", label: "Teacher" },
  { key: "dayOfWeek", label: "Day of Week" },
  { key: "lessonDate", label: "Lesson Date" },
  { key: "studentUsername", label: "Student" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "duration", label: "Duration (min)", type: "number" },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notes" },
];

const TEACHER_RECITAL_FIELDS: FieldSpec<TeacherRecital>[] = [
  { key: "recitalId", label: "Recital ID" },
  { key: "teacherUsername", label: "Teacher" },
  { key: "recitalName", label: "Recital Name" },
  { key: "date", label: "Date" },
  { key: "venue", label: "Venue" },
  { key: "studentAssignments", label: "Student Assignments (pipe-sep)" },
  { key: "notes", label: "Notes" },
];

const TEACHER_PERF_FIELDS: FieldSpec<TeacherExamplePerformance>[] = [
  { key: "performanceId", label: "Performance ID" },
  { key: "teacherUsername", label: "Teacher" },
  { key: "title", label: "Title" },
  { key: "mediaUrl", label: "Media URL" },
  { key: "description", label: "Description" },
  { key: "commentary", label: "Commentary" },
  { key: "attachedToAssignmentId", label: "Assignment ID" },
  { key: "notes", label: "Notes" },
];

const STUDENT_LESSON_FIELDS: FieldSpec<StudentLesson>[] = [
  { key: "lessonEntryId", label: "Lesson Entry ID" },
  { key: "studentUsername", label: "Student" },
  { key: "teacherUsername", label: "Teacher" },
  { key: "lessonDate", label: "Date" },
  { key: "duration", label: "Duration (min)", type: "number" },
  { key: "topics", label: "Topics" },
  { key: "teacherNotes", label: "Teacher Notes" },
  { key: "homeworkAssigned", label: "Homework" },
];

const STUDENT_PRACTICE_FIELDS: FieldSpec<StudentPractice>[] = [
  { key: "practiceId", label: "Practice ID" },
  { key: "studentUsername", label: "Student" },
  { key: "teacherUsername", label: "Teacher" },
  { key: "practiceDate", label: "Date" },
  { key: "duration", label: "Duration (min)", type: "number" },
  { key: "pieceWorkedOn", label: "Piece" },
  { key: "studentNotes", label: "Student Notes" },
  { key: "teacherFeedback", label: "Teacher Feedback" },
  { key: "rating", label: "Rating (0–10)", type: "number" },
];

// ─── Blank records ────────────────────────────────────────────────────────────

const BLANK_SCHEDULE: TeacherSchedule = {
  scheduleId: "",
  teacherUsername: "",
  dayOfWeek: "",
  lessonDate: "",
  studentUsername: "",
  startTime: "",
  endTime: "",
  duration: BigInt(0),
  status: "",
  notes: "",
};

const BLANK_RECITAL: TeacherRecital = {
  recitalId: "",
  teacherUsername: "",
  recitalName: "",
  date: "",
  venue: "",
  studentAssignments: "",
  notes: "",
};

const BLANK_PERF: TeacherExamplePerformance = {
  performanceId: "",
  teacherUsername: "",
  title: "",
  mediaUrl: "",
  description: "",
  commentary: "",
  attachedToAssignmentId: "",
  notes: "",
};

const BLANK_LESSON: StudentLesson = {
  lessonEntryId: "",
  studentUsername: "",
  teacherUsername: "",
  lessonDate: "",
  duration: BigInt(0),
  topics: "",
  teacherNotes: "",
  homeworkAssigned: "",
};

const BLANK_PRACTICE: StudentPractice = {
  practiceId: "",
  studentUsername: "",
  teacherUsername: "",
  practiceDate: "",
  duration: BigInt(0),
  pieceWorkedOn: "",
  studentNotes: "",
  teacherFeedback: "",
  rating: BigInt(0),
};

const BLANK_ASSIGNMENT: StudentAssignment = {
  assignmentId: "",
  studentUsername: "",
  teacherUsername: "",
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
  teacherFeedback: "",
  attachedExampleUrl: "",
};

const BLANK_PROGRESS: StudentProgress = {
  progressId: "",
  studentUsername: "",
  teacherUsername: "",
  date: "",
  skillCategory: "",
  score: BigInt(0),
  notes: "",
  goalSet: "",
  goalMet: false,
};

const BLANK_REPERTOIRE: StudentRepertoire = {
  repertoireId: "",
  studentUsername: "",
  teacherUsername: "",
  title: "",
  composer: "",
  genre: "",
  startDate: "",
  performanceDate: "",
  status: "Learning",
  notes: "",
};

const BLANK_MESSAGE: StudentMessage = {
  messageId: "",
  studentUsername: "",
  teacherUsername: "",
  fromUsername: "",
  toUsername: "",
  timestamp: "",
  subject: "",
  body: "",
  isRead: false,
  isPinned: false,
};

const BLANK_BILLING: StudentBilling = {
  billingId: "",
  studentUsername: "",
  teacherUsername: "",
  billingMonth: "",
  tuitionAmount: 0,
  amountPaid: 0,
  paymentDate: "",
  status: "Unpaid",
  notes: "",
};

const BLANK_COLLAB: StudentCollaboration = {
  collaborationId: "",
  studentUsername: "",
  teacherUsername: "",
  groupName: "",
  groupType: "",
  members: "",
  sharedRepertoire: "",
  rehearsalDates: "",
};

// ─── Per-table async load/save/delete ─────────────────────────────────────────

type TableKey =
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

export type { TableKey };

// ─── Main panel router ───────────────────────────────────────────────────────

export function ExtendedCrudPanel({
  tableKey,
  search,
}: {
  tableKey: TableKey;
  search: string;
}) {
  // Generic state for any record type
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FACT table option states
  const [assignmentStatuses, setAssignmentStatuses] = useState<string[]>([]);
  const [billingStatuses, setBillingStatuses] = useState<string[]>([]);
  const [repertoireStatuses, setRepertoireStatuses] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [skillCategories, setSkillCategories] = useState<string[]>([]);
  const [groupTypes, setGroupTypes] = useState<string[]>([]);

  // Field specs that depend on FACT state (must be inside component)
  const STUDENT_ASSIGNMENT_FIELDS: FieldSpec<StudentAssignment>[] = [
    { key: "assignmentId", label: "Assignment ID" },
    { key: "studentUsername", label: "Student" },
    { key: "teacherUsername", label: "Teacher" },
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "dueDate", label: "Due Date" },
    {
      key: "priority",
      label: "Priority",
      options: ["", ...priorities],
    },
    {
      key: "status",
      label: "Status",
      options: ["", ...assignmentStatuses],
    },
    { key: "teacherFeedback", label: "Teacher Feedback" },
    { key: "attachedExampleUrl", label: "Example URL" },
  ];

  const STUDENT_PROGRESS_FIELDS: FieldSpec<StudentProgress>[] = [
    { key: "progressId", label: "Progress ID" },
    { key: "studentUsername", label: "Student" },
    { key: "teacherUsername", label: "Teacher" },
    { key: "date", label: "Date" },
    {
      key: "skillCategory",
      label: "Skill Category",
      options: ["", ...skillCategories],
    },
    { key: "score", label: "Score (0–100)", type: "number" },
    { key: "notes", label: "Notes" },
    { key: "goalSet", label: "Goal Set" },
    { key: "goalMet", label: "Goal Met", type: "checkbox" },
  ];

  const STUDENT_REPERTOIRE_FIELDS: FieldSpec<StudentRepertoire>[] = [
    { key: "repertoireId", label: "Repertoire ID" },
    { key: "studentUsername", label: "Student" },
    { key: "teacherUsername", label: "Teacher" },
    { key: "title", label: "Title" },
    { key: "composer", label: "Composer" },
    { key: "genre", label: "Genre", options: ["", ...genres] },
    { key: "startDate", label: "Start Date" },
    { key: "performanceDate", label: "Performance Date" },
    {
      key: "status",
      label: "Status",
      options: ["", ...repertoireStatuses],
    },
    { key: "notes", label: "Notes" },
  ];

  const STUDENT_BILLING_FIELDS: FieldSpec<StudentBilling>[] = [
    { key: "billingId", label: "Billing ID" },
    { key: "studentUsername", label: "Student" },
    { key: "teacherUsername", label: "Teacher" },
    { key: "billingMonth", label: "Billing Month" },
    { key: "tuitionAmount", label: "Tuition Amount", type: "number" },
    { key: "amountPaid", label: "Amount Paid", type: "number" },
    { key: "paymentDate", label: "Payment Date" },
    {
      key: "status",
      label: "Status",
      options: ["", ...billingStatuses],
    },
    { key: "notes", label: "Notes" },
  ];

  const STUDENT_MESSAGE_FIELDS: FieldSpec<StudentMessage>[] = [
    { key: "messageId", label: "Message ID" },
    { key: "studentUsername", label: "Student" },
    { key: "teacherUsername", label: "Teacher" },
    { key: "fromUsername", label: "From" },
    { key: "toUsername", label: "To" },
    { key: "timestamp", label: "Timestamp" },
    { key: "subject", label: "Subject" },
    { key: "body", label: "Body" },
    { key: "isRead", label: "Read", type: "checkbox" },
    { key: "isPinned", label: "Pinned", type: "checkbox" },
  ];

  const STUDENT_COLLAB_FIELDS: FieldSpec<StudentCollaboration>[] = [
    { key: "collaborationId", label: "Collaboration ID" },
    { key: "studentUsername", label: "Student" },
    { key: "teacherUsername", label: "Teacher" },
    { key: "groupName", label: "Group Name" },
    { key: "groupType", label: "Group Type", options: ["", ...groupTypes] },
    { key: "members", label: "Members (pipe-sep)" },
    { key: "sharedRepertoire", label: "Shared Repertoire (pipe-sep)" },
    { key: "rehearsalDates", label: "Rehearsal Dates (pipe-sep)" },
  ];

  // Fetch FACT table options once on mount
  useEffect(() => {
    const actor = getActor();
    Promise.all([
      actor
        .getAssignmentStatuses()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setAssignmentStatuses(arr.map(([, v]) => v.name));
        })
        .catch(() => setAssignmentStatuses([])),
      actor
        .getBillingStatuses()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setBillingStatuses(arr.map(([, v]) => v.name));
        })
        .catch(() => setBillingStatuses([])),
      actor
        .getRepertoireStatuses()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setRepertoireStatuses(arr.map(([, v]) => v.name));
        })
        .catch(() => setRepertoireStatuses([])),
      actor
        .getPriorities()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setPriorities(arr.map(([, v]) => v.name));
        })
        .catch(() => setPriorities([])),
      actor
        .getGenres()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setGenres(arr.map(([, v]) => v.name));
        })
        .catch(() => setGenres([])),
      actor
        .getSkillCategories()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setSkillCategories(arr.map(([, v]) => v.name));
        })
        .catch(() => setSkillCategories([])),
      actor
        .getGroupTypes()
        .then((r: unknown) => {
          const arr = (r as { ok?: [string, { name: string }][] }).ok ?? [];
          setGroupTypes(arr.map(([, v]) => v.name));
        })
        .catch(() => setGroupTypes([])),
    ]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const actor = getActor();
    try {
      let raw: [string, Record<string, unknown>][] = [];
      if (tableKey === "teacherSchedule")
        raw = (await actor.getAllTeacherSchedules()) as unknown as typeof raw;
      else if (tableKey === "teacherRecitals")
        raw = (await actor.getAllTeacherRecitals()) as unknown as typeof raw;
      else if (tableKey === "teacherExamplePerformances")
        raw =
          (await actor.getAllTeacherExamplePerformances()) as unknown as typeof raw;
      else if (tableKey === "studentLessons")
        raw = (await actor.getAllStudentLessons()) as unknown as typeof raw;
      else if (tableKey === "studentPractices")
        raw = (await actor.getAllStudentPractices()) as unknown as typeof raw;
      else if (tableKey === "studentAssignments")
        raw = (await actor.getAllStudentAssignments()) as unknown as typeof raw;
      else if (tableKey === "studentProgress")
        raw = (await actor.getAllStudentProgress()) as unknown as typeof raw;
      else if (tableKey === "studentRepertoire")
        raw = (await actor.getAllStudentRepertoire()) as unknown as typeof raw;
      else if (tableKey === "studentMessages")
        raw = (await actor.getAllStudentMessages()) as unknown as typeof raw;
      else if (tableKey === "studentBilling")
        raw = (await actor.getAllStudentBillings()) as unknown as typeof raw;
      else if (tableKey === "studentCollaboration")
        raw =
          (await actor.getAllStudentCollaborations()) as unknown as typeof raw;
      setRecords(raw.map(([, v]) => v));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [tableKey]);

  useEffect(() => {
    load();
  }, [load]);

  const saveFn = async (id: string, record: Record<string, unknown>) => {
    const actor = getActor();
    if (tableKey === "teacherSchedule")
      await actor.saveTeacherSchedule(id, record as unknown as TeacherSchedule);
    else if (tableKey === "teacherRecitals")
      await actor.saveTeacherRecital(id, record as unknown as TeacherRecital);
    else if (tableKey === "teacherExamplePerformances")
      await actor.saveTeacherExamplePerformance(
        id,
        record as unknown as TeacherExamplePerformance,
      );
    else if (tableKey === "studentLessons")
      await actor.saveStudentLesson(id, record as unknown as StudentLesson);
    else if (tableKey === "studentPractices")
      await actor.saveStudentPractice(id, record as unknown as StudentPractice);
    else if (tableKey === "studentAssignments")
      await actor.saveStudentAssignment(
        id,
        record as unknown as StudentAssignment,
      );
    else if (tableKey === "studentProgress")
      await actor.saveStudentProgress(id, record as unknown as StudentProgress);
    else if (tableKey === "studentRepertoire")
      await actor.saveStudentRepertoire(
        id,
        record as unknown as StudentRepertoire,
      );
    else if (tableKey === "studentMessages")
      await actor.saveStudentMessage(id, record as unknown as StudentMessage);
    else if (tableKey === "studentBilling")
      await actor.saveStudentBilling(id, record as unknown as StudentBilling);
    else if (tableKey === "studentCollaboration")
      await actor.saveStudentCollaboration(
        id,
        record as unknown as StudentCollaboration,
      );
  };

  const deleteFn = async (id: string) => {
    const actor = getActor();
    if (tableKey === "teacherSchedule") await actor.deleteTeacherSchedule(id);
    else if (tableKey === "teacherRecitals")
      await actor.deleteTeacherRecital(id);
    else if (tableKey === "teacherExamplePerformances")
      await actor.deleteTeacherExamplePerformance(id);
    else if (tableKey === "studentLessons") await actor.deleteStudentLesson(id);
    else if (tableKey === "studentPractices")
      await actor.deleteStudentPractice(id);
    else if (tableKey === "studentAssignments")
      await actor.deleteStudentAssignment(id);
    else if (tableKey === "studentProgress")
      await actor.deleteStudentProgress(id);
    else if (tableKey === "studentRepertoire")
      await actor.deleteStudentRepertoire(id);
    else if (tableKey === "studentMessages")
      await actor.deleteStudentMessage(id);
    else if (tableKey === "studentBilling")
      await actor.deleteStudentBilling(id);
    else if (tableKey === "studentCollaboration")
      await actor.deleteStudentCollaboration(id);
  };

  // Route to the correctly-typed CrudPanel
  if (tableKey === "teacherSchedule")
    return (
      <CrudPanel
        title="teacherSchedule"
        ocidPrefix="portal.details.schedule"
        records={records as unknown as TeacherSchedule[]}
        loading={loading}
        error={error}
        fields={TEACHER_SCHEDULE_FIELDS}
        idField="scheduleId"
        blankRecord={BLANK_SCHEDULE}
        saveFn={
          saveFn as unknown as (id: string, r: TeacherSchedule) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "teacherRecitals")
    return (
      <CrudPanel
        title="teacherRecitals"
        ocidPrefix="portal.details.recitals"
        records={records as unknown as TeacherRecital[]}
        loading={loading}
        error={error}
        fields={TEACHER_RECITAL_FIELDS}
        idField="recitalId"
        blankRecord={BLANK_RECITAL}
        saveFn={
          saveFn as unknown as (id: string, r: TeacherRecital) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "teacherExamplePerformances")
    return (
      <CrudPanel
        title="teacherExamplePerformances"
        ocidPrefix="portal.details.performances"
        records={records as unknown as TeacherExamplePerformance[]}
        loading={loading}
        error={error}
        fields={TEACHER_PERF_FIELDS}
        idField="performanceId"
        blankRecord={BLANK_PERF}
        saveFn={
          saveFn as unknown as (
            id: string,
            r: TeacherExamplePerformance,
          ) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentLessons")
    return (
      <CrudPanel
        title="studentLessons"
        ocidPrefix="portal.details.studentlessons"
        records={records as unknown as StudentLesson[]}
        loading={loading}
        error={error}
        fields={STUDENT_LESSON_FIELDS}
        idField="lessonEntryId"
        blankRecord={BLANK_LESSON}
        saveFn={
          saveFn as unknown as (id: string, r: StudentLesson) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentPractices")
    return (
      <CrudPanel
        title="studentPractices"
        ocidPrefix="portal.details.practices"
        records={records as unknown as StudentPractice[]}
        loading={loading}
        error={error}
        fields={STUDENT_PRACTICE_FIELDS}
        idField="practiceId"
        blankRecord={BLANK_PRACTICE}
        saveFn={
          saveFn as unknown as (id: string, r: StudentPractice) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentAssignments")
    return (
      <CrudPanel
        title="studentAssignments"
        ocidPrefix="portal.details.assignments"
        records={records as unknown as StudentAssignment[]}
        loading={loading}
        error={error}
        fields={STUDENT_ASSIGNMENT_FIELDS}
        idField="assignmentId"
        blankRecord={BLANK_ASSIGNMENT}
        saveFn={
          saveFn as unknown as (
            id: string,
            r: StudentAssignment,
          ) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentProgress")
    return (
      <CrudPanel
        title="studentProgress"
        ocidPrefix="portal.details.progress"
        records={records as unknown as StudentProgress[]}
        loading={loading}
        error={error}
        fields={STUDENT_PROGRESS_FIELDS}
        idField="progressId"
        blankRecord={BLANK_PROGRESS}
        saveFn={
          saveFn as unknown as (id: string, r: StudentProgress) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentRepertoire")
    return (
      <CrudPanel
        title="studentRepertoire"
        ocidPrefix="portal.details.repertoire"
        records={records as unknown as StudentRepertoire[]}
        loading={loading}
        error={error}
        fields={STUDENT_REPERTOIRE_FIELDS}
        idField="repertoireId"
        blankRecord={BLANK_REPERTOIRE}
        saveFn={
          saveFn as unknown as (
            id: string,
            r: StudentRepertoire,
          ) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentMessages")
    return (
      <CrudPanel
        title="studentMessages"
        ocidPrefix="portal.details.messages"
        records={records as unknown as StudentMessage[]}
        loading={loading}
        error={error}
        fields={STUDENT_MESSAGE_FIELDS}
        idField="messageId"
        blankRecord={BLANK_MESSAGE}
        saveFn={
          saveFn as unknown as (id: string, r: StudentMessage) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  if (tableKey === "studentBilling")
    return (
      <CrudPanel
        title="studentBilling"
        ocidPrefix="portal.details.billing"
        records={records as unknown as StudentBilling[]}
        loading={loading}
        error={error}
        fields={STUDENT_BILLING_FIELDS}
        idField="billingId"
        blankRecord={BLANK_BILLING}
        saveFn={
          saveFn as unknown as (id: string, r: StudentBilling) => Promise<void>
        }
        deleteFn={deleteFn}
        onRefresh={load}
        search={search}
      />
    );
  // studentCollaboration
  return (
    <CrudPanel
      title="studentCollaboration"
      ocidPrefix="portal.details.collab"
      records={records as unknown as StudentCollaboration[]}
      loading={loading}
      error={error}
      fields={STUDENT_COLLAB_FIELDS}
      idField="collaborationId"
      blankRecord={BLANK_COLLAB}
      saveFn={
        saveFn as unknown as (
          id: string,
          r: StudentCollaboration,
        ) => Promise<void>
      }
      deleteFn={deleteFn}
      onRefresh={load}
      search={search}
    />
  );
}
