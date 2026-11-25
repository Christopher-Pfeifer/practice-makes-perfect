import type {
  StudentAssignment,
  StudentBilling,
  StudentCollaboration,
  StudentLesson,
  StudentMessage,
  StudentPractice,
  StudentProgress,
  StudentRepertoire,
} from "@/backend";
import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

type TableType =
  | "lessons"
  | "practices"
  | "assignments"
  | "progress"
  | "repertoire"
  | "messages"
  | "billing"
  | "collaboration";

type AnyRecord =
  | StudentLesson
  | StudentPractice
  | StudentAssignment
  | StudentProgress
  | StudentRepertoire
  | StudentMessage
  | StudentBilling
  | StudentCollaboration;

interface StudentSelfDataModalProps {
  profile: UserProfile;
  tableType: TableType;
  title: string;
  onClose: () => void;
}

// ------------------------------------------------------------------
// Empty record factories
// ------------------------------------------------------------------
function emptyPractice(username: string): StudentPractice {
  return {
    practiceId: "",
    studentUsername: username,
    teacherUsername: "",
    practiceDate: "",
    duration: BigInt(0),
    pieceWorkedOn: "",
    studentNotes: "",
    teacherFeedback: "",
    rating: BigInt(0),
  };
}

function emptyRepertoire(username: string): StudentRepertoire {
  return {
    repertoireId: "",
    studentUsername: username,
    teacherUsername: "",
    title: "",
    composer: "",
    genre: "",
    startDate: "",
    performanceDate: "",
    status: "",
    notes: "",
  };
}

function emptyMessage(username: string): StudentMessage {
  return {
    messageId: "",
    studentUsername: username,
    teacherUsername: "",
    timestamp: new Date().toISOString().slice(0, 10),
    fromUsername: username,
    toUsername: "",
    subject: "",
    body: "",
    isRead: false,
    isPinned: false,
  };
}

function emptyCollaboration(username: string): StudentCollaboration {
  return {
    collaborationId: "",
    studentUsername: username,
    teacherUsername: "",
    groupName: "",
    groupType: "",
    members: "",
    sharedRepertoire: "",
    rehearsalDates: "",
  };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const READ_ONLY_TABLES: TableType[] = [
  "lessons",
  "assignments",
  "progress",
  "billing",
];

function isReadOnly(t: TableType) {
  return READ_ONLY_TABLES.includes(t);
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ------------------------------------------------------------------
// Field display helpers
// ------------------------------------------------------------------
function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | bigint;
}) {
  const display =
    typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : typeof value === "bigint"
        ? value.toString()
        : String(value ?? "");
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium" style={{ color: "#8a9bb5" }}>
        {label}
      </span>
      <span
        className="text-sm break-words"
        style={{ color: display ? "#f5f0e8" : "#4a5c75" }}
      >
        {display || "—"}
      </span>
    </div>
  );
}

function RecordCard({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{
        background: "#0f1729",
        border: "1px solid rgba(201,168,76,0.18)",
      }}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
      {actions && (
        <div
          className="flex gap-2 pt-2"
          style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Row renderers for each table type
// ------------------------------------------------------------------
function LessonRow({ rec }: { rec: StudentLesson }) {
  return (
    <RecordCard>
      <FieldRow label="Date" value={rec.lessonDate} />
      <FieldRow label="Duration (min)" value={rec.duration} />
      <FieldRow label="Topics" value={rec.topics} />
      <FieldRow label="Homework" value={rec.homeworkAssigned} />
      <div className="col-span-2">
        <FieldRow label="Teacher Notes" value={rec.teacherNotes} />
      </div>
    </RecordCard>
  );
}

function AssignmentRow({ rec }: { rec: StudentAssignment }) {
  return (
    <RecordCard>
      <FieldRow label="Title" value={rec.title} />
      <FieldRow label="Due Date" value={rec.dueDate} />
      <FieldRow label="Priority" value={rec.priority} />
      <FieldRow label="Status" value={rec.status} />
      <div className="col-span-2">
        <FieldRow label="Description" value={rec.description} />
      </div>
      <div className="col-span-2">
        <FieldRow label="Teacher Feedback" value={rec.teacherFeedback} />
      </div>
    </RecordCard>
  );
}

function ProgressRow({ rec }: { rec: StudentProgress }) {
  return (
    <RecordCard>
      <FieldRow label="Date" value={rec.date} />
      <FieldRow label="Skill Category" value={rec.skillCategory} />
      <FieldRow label="Score" value={rec.score} />
      <FieldRow label="Goal Met" value={rec.goalMet} />
      <div className="col-span-2">
        <FieldRow label="Goal Set" value={rec.goalSet} />
      </div>
      <div className="col-span-2">
        <FieldRow label="Notes" value={rec.notes} />
      </div>
    </RecordCard>
  );
}

function BillingRow({ rec }: { rec: StudentBilling }) {
  return (
    <RecordCard>
      <FieldRow label="Billing Month" value={rec.billingMonth} />
      <FieldRow label="Status" value={rec.status} />
      <FieldRow
        label="Tuition Amount"
        value={`$${rec.tuitionAmount.toFixed(2)}`}
      />
      <FieldRow label="Amount Paid" value={`$${rec.amountPaid.toFixed(2)}`} />
      <FieldRow label="Payment Date" value={rec.paymentDate} />
      <div className="col-span-2">
        <FieldRow label="Notes" value={rec.notes} />
      </div>
    </RecordCard>
  );
}

// ------------------------------------------------------------------
// Editable rows (practices, repertoire, messages, collaboration)
// ------------------------------------------------------------------
function EditableInput({
  label,
  value,
  onChange,
  multiline,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  const inputId = `edit-input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const shared = {
    id: inputId,
    className: "w-full rounded-lg px-3 py-2 text-sm",
    style: {
      background: "#0f1729",
      border: "1px solid rgba(201,168,76,0.25)",
      color: "#f5f0e8",
    } as React.CSSProperties,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
  };
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs font-medium mb-1"
        style={{ color: "#8a9bb5" }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={2}
          style={{ ...shared.style, resize: "none" }}
        />
      ) : (
        <input type={type ?? "text"} {...shared} />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
export default function StudentSelfDataModal({
  profile,
  tableType,
  title,
  onClose,
}: StudentSelfDataModalProps) {
  const [records, setRecords] = useState<[string, AnyRecord][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Draft state for new/edit records
  const [draftPractice, setDraftPractice] = useState<StudentPractice>(
    emptyPractice(profile.username),
  );
  const [draftRepertoire, setDraftRepertoire] = useState<StudentRepertoire>(
    emptyRepertoire(profile.username),
  );
  const [draftMessage, setDraftMessage] = useState<StudentMessage>(
    emptyMessage(profile.username),
  );
  const [draftCollab, setDraftCollab] = useState<StudentCollaboration>(
    emptyCollaboration(profile.username),
  );

  const readOnly = isReadOnly(tableType);

  // ------------------------------------------------------------------
  // Load records
  // ------------------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const actor = getActor();
        const u = profile.username;
        let rows: [string, AnyRecord][] = [];
        if (tableType === "lessons")
          rows = (await actor.getLessonEntriesByStudent(u)) as [
            string,
            AnyRecord,
          ][];
        else if (tableType === "practices")
          rows = (await actor.getPracticesByStudent(u)) as [
            string,
            AnyRecord,
          ][];
        else if (tableType === "assignments")
          rows = (await actor.getAssignmentsByStudent(u)) as [
            string,
            AnyRecord,
          ][];
        else if (tableType === "progress")
          rows = (await actor.getProgressByStudent(u)) as [string, AnyRecord][];
        else if (tableType === "repertoire")
          rows = (await actor.getRepertoireByStudent(u)) as [
            string,
            AnyRecord,
          ][];
        else if (tableType === "messages")
          rows = (await actor.getMessagesByStudent(u)) as [string, AnyRecord][];
        else if (tableType === "billing")
          rows = (await actor.getBillingsByStudent(u)) as [string, AnyRecord][];
        else if (tableType === "collaboration")
          rows = (await actor.getCollaborationsByStudent(u)) as [
            string,
            AnyRecord,
          ][];
        setRecords(rows);
      } catch {
        setMessage("Failed to load records.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username, tableType]);

  // ------------------------------------------------------------------
  // Save handlers
  // ------------------------------------------------------------------
  async function savePractice() {
    const id = draftPractice.practiceId || genId();
    const rec = { ...draftPractice, practiceId: id };
    setSaving(id);
    try {
      await getActor().saveStudentPractice(id, rec);
      setRecords((prev) => {
        const idx = prev.findIndex(([k]) => k === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = [id, rec];
          return next;
        }
        return [...prev, [id, rec]];
      });
      setDraftPractice(emptyPractice(profile.username));
      setShowForm(false);
      setMessage("Saved.");
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(null);
    }
  }

  async function saveRepertoire() {
    const id = draftRepertoire.repertoireId || genId();
    const rec = { ...draftRepertoire, repertoireId: id };
    setSaving(id);
    try {
      await getActor().saveStudentRepertoire(id, rec);
      setRecords((prev) => {
        const idx = prev.findIndex(([k]) => k === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = [id, rec];
          return next;
        }
        return [...prev, [id, rec]];
      });
      setDraftRepertoire(emptyRepertoire(profile.username));
      setShowForm(false);
      setMessage("Saved.");
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(null);
    }
  }

  async function saveMessage() {
    const id = draftMessage.messageId || genId();
    const rec = { ...draftMessage, messageId: id };
    setSaving(id);
    try {
      await getActor().saveStudentMessage(id, rec);
      setRecords((prev) => {
        const idx = prev.findIndex(([k]) => k === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = [id, rec];
          return next;
        }
        return [...prev, [id, rec]];
      });
      setDraftMessage(emptyMessage(profile.username));
      setShowForm(false);
      setMessage("Sent.");
    } catch {
      setMessage("Send failed.");
    } finally {
      setSaving(null);
    }
  }

  async function saveCollab() {
    const id = draftCollab.collaborationId || genId();
    const rec = { ...draftCollab, collaborationId: id };
    setSaving(id);
    try {
      await getActor().saveStudentCollaboration(id, rec);
      setRecords((prev) => {
        const idx = prev.findIndex(([k]) => k === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = [id, rec];
          return next;
        }
        return [...prev, [id, rec]];
      });
      setDraftCollab(emptyCollaboration(profile.username));
      setShowForm(false);
      setMessage("Saved.");
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(null);
    }
  }

  // Toggle read/pin on message
  async function toggleMessageFlag(
    id: string,
    rec: StudentMessage,
    flag: "isRead" | "isPinned",
  ) {
    const updated = { ...rec, [flag]: !rec[flag] };
    setSaving(id);
    try {
      await getActor().saveStudentMessage(id, updated);
      setRecords((prev) =>
        prev.map(([k, v]) => (k === id ? [k, updated] : [k, v])),
      );
    } catch {
      setMessage("Update failed.");
    } finally {
      setSaving(null);
    }
  }

  async function deleteRecord(id: string) {
    setDeleting(id);
    try {
      const actor = getActor();
      if (tableType === "practices") await actor.deleteStudentPractice(id);
      else if (tableType === "repertoire")
        await actor.deleteStudentRepertoire(id);
      else if (tableType === "messages") await actor.deleteStudentMessage(id);
      else if (tableType === "collaboration")
        await actor.deleteStudentCollaboration(id);
      setRecords((prev) => prev.filter(([k]) => k !== id));
      setMessage("Deleted.");
    } catch {
      setMessage("Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  // ------------------------------------------------------------------
  // Edit record (load into draft)
  // ------------------------------------------------------------------
  function editRecord(id: string, rec: AnyRecord) {
    if (tableType === "practices")
      setDraftPractice({ ...(rec as StudentPractice), practiceId: id });
    else if (tableType === "repertoire")
      setDraftRepertoire({ ...(rec as StudentRepertoire), repertoireId: id });
    else if (tableType === "messages")
      setDraftMessage({ ...(rec as StudentMessage), messageId: id });
    else if (tableType === "collaboration")
      setDraftCollab({ ...(rec as StudentCollaboration), collaborationId: id });
    setShowForm(true);
  }

  // ------------------------------------------------------------------
  // Render records
  // ------------------------------------------------------------------
  function renderRecord(id: string, rec: AnyRecord, idx: number) {
    const editActions = !readOnly && (
      <>
        <button
          type="button"
          className="px-3 py-1 rounded text-xs transition-smooth"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#c9a84c",
          }}
          onClick={() => editRecord(id, rec)}
          data-ocid={`student-self.edit_button.${idx + 1}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded text-xs transition-smooth"
          style={{
            background: "rgba(224,92,92,0.1)",
            border: "1px solid rgba(224,92,92,0.3)",
            color: "#e05c5c",
            opacity: deleting === id ? 0.5 : 1,
          }}
          disabled={deleting === id}
          onClick={() => deleteRecord(id)}
          data-ocid={`student-self.delete_button.${idx + 1}`}
        >
          {deleting === id ? "Deleting…" : "Delete"}
        </button>
      </>
    );

    if (tableType === "lessons")
      return <LessonRow key={id} rec={rec as StudentLesson} />;
    if (tableType === "assignments")
      return <AssignmentRow key={id} rec={rec as StudentAssignment} />;
    if (tableType === "progress")
      return <ProgressRow key={id} rec={rec as StudentProgress} />;
    if (tableType === "billing")
      return <BillingRow key={id} rec={rec as StudentBilling} />;

    if (tableType === "practices") {
      const r = rec as StudentPractice;
      return (
        <RecordCard key={id} actions={editActions}>
          <FieldRow label="Date" value={r.practiceDate} />
          <FieldRow label="Duration (min)" value={r.duration} />
          <FieldRow label="Piece" value={r.pieceWorkedOn} />
          <FieldRow label="Rating" value={`${r.rating}/10`} />
          <div className="col-span-2">
            <FieldRow label="My Notes" value={r.studentNotes} />
          </div>
          <div className="col-span-2">
            <FieldRow label="Teacher Feedback" value={r.teacherFeedback} />
          </div>
        </RecordCard>
      );
    }

    if (tableType === "repertoire") {
      const r = rec as StudentRepertoire;
      return (
        <RecordCard key={id} actions={editActions}>
          <FieldRow label="Title" value={r.title} />
          <FieldRow label="Composer" value={r.composer} />
          <FieldRow label="Genre" value={r.genre} />
          <FieldRow label="Status" value={r.status} />
          <FieldRow label="Start Date" value={r.startDate} />
          <FieldRow label="Performance Date" value={r.performanceDate} />
        </RecordCard>
      );
    }

    if (tableType === "messages") {
      const r = rec as StudentMessage;
      return (
        <RecordCard
          key={id}
          actions={
            <>
              <button
                type="button"
                className="px-3 py-1 rounded text-xs transition-smooth"
                style={{
                  background: r.isRead
                    ? "rgba(201,168,76,0.15)"
                    : "rgba(15,23,41,0.5)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#c9a84c",
                  opacity: saving === id ? 0.5 : 1,
                }}
                disabled={saving === id}
                onClick={() => toggleMessageFlag(id, r, "isRead")}
                data-ocid={`student-self.read_toggle.${idx + 1}`}
              >
                {r.isRead ? "Mark Unread" : "Mark Read"}
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded text-xs transition-smooth"
                style={{
                  background: r.isPinned
                    ? "rgba(201,168,76,0.15)"
                    : "rgba(15,23,41,0.5)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#c9a84c",
                  opacity: saving === id ? 0.5 : 1,
                }}
                disabled={saving === id}
                onClick={() => toggleMessageFlag(id, r, "isPinned")}
                data-ocid={`student-self.pin_toggle.${idx + 1}`}
              >
                {r.isPinned ? "Unpin" : "Pin"}
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded text-xs transition-smooth"
                style={{
                  background: "rgba(224,92,92,0.1)",
                  border: "1px solid rgba(224,92,92,0.3)",
                  color: "#e05c5c",
                  opacity: deleting === id ? 0.5 : 1,
                }}
                disabled={deleting === id}
                onClick={() => deleteRecord(id)}
                data-ocid={`student-self.delete_button.${idx + 1}`}
              >
                Delete
              </button>
            </>
          }
        >
          <FieldRow label="Subject" value={r.subject} />
          <FieldRow
            label="Status"
            value={`${r.isRead ? "Read" : "Unread"}${r.isPinned ? " · Pinned" : ""}`}
          />
          <FieldRow label="From" value={r.fromUsername} />
          <FieldRow label="To" value={r.toUsername} />
          <FieldRow label="Date" value={r.timestamp} />
          <div className="col-span-2">
            <FieldRow label="Body" value={r.body} />
          </div>
        </RecordCard>
      );
    }

    if (tableType === "collaboration") {
      const r = rec as StudentCollaboration;
      return (
        <RecordCard key={id} actions={editActions}>
          <FieldRow label="Group Name" value={r.groupName} />
          <FieldRow label="Group Type" value={r.groupType} />
          <FieldRow label="Members" value={r.members} />
          <FieldRow label="Rehearsal Dates" value={r.rehearsalDates} />
          <div className="col-span-2">
            <FieldRow label="Shared Repertoire" value={r.sharedRepertoire} />
          </div>
        </RecordCard>
      );
    }

    return null;
  }

  // ------------------------------------------------------------------
  // Add/Edit forms
  // ------------------------------------------------------------------
  function renderForm() {
    const btnStyle = {
      background: "rgba(201,168,76,0.15)",
      border: "1px solid rgba(201,168,76,0.4)",
      color: "#c9a84c",
    } as React.CSSProperties;
    const cancelStyle = {
      background: "transparent",
      border: "1px solid rgba(201,168,76,0.2)",
      color: "#8a9bb5",
    } as React.CSSProperties;

    if (tableType === "practices") {
      return (
        <div
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{
            background: "#111e35",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
          data-ocid="student-self.form"
        >
          <h3 className="text-sm font-semibold" style={{ color: "#c9a84c" }}>
            {draftPractice.practiceId
              ? "Edit Practice"
              : "Log Practice Session"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <EditableInput
              label="Date"
              type="date"
              value={draftPractice.practiceDate}
              onChange={(v) =>
                setDraftPractice((p) => ({ ...p, practiceDate: v }))
              }
            />
            <EditableInput
              label="Duration (min)"
              type="number"
              value={draftPractice.duration.toString()}
              onChange={(v) =>
                setDraftPractice((p) => ({ ...p, duration: BigInt(v || 0) }))
              }
            />
            <EditableInput
              label="Piece Worked On"
              value={draftPractice.pieceWorkedOn}
              onChange={(v) =>
                setDraftPractice((p) => ({ ...p, pieceWorkedOn: v }))
              }
            />
            <EditableInput
              label="Rating (0-10)"
              type="number"
              value={draftPractice.rating.toString()}
              onChange={(v) =>
                setDraftPractice((p) => ({
                  ...p,
                  rating: BigInt(Math.min(10, Math.max(0, Number(v || 0)))),
                }))
              }
            />
            <div className="col-span-2">
              <EditableInput
                label="My Notes"
                value={draftPractice.studentNotes}
                onChange={(v) =>
                  setDraftPractice((p) => ({ ...p, studentNotes: v }))
                }
                multiline
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={savePractice}
              disabled={saving !== null}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
              style={{ ...btnStyle, opacity: saving !== null ? 0.5 : 1 }}
              data-ocid="student-self.save_button"
            >
              {saving !== null ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftPractice(emptyPractice(profile.username));
                setShowForm(false);
              }}
              className="px-4 py-2 rounded-lg text-sm transition-smooth"
              style={cancelStyle}
              data-ocid="student-self.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (tableType === "repertoire") {
      return (
        <div
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{
            background: "#111e35",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
          data-ocid="student-self.form"
        >
          <h3 className="text-sm font-semibold" style={{ color: "#c9a84c" }}>
            {draftRepertoire.repertoireId ? "Edit Piece" : "Add to Repertoire"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <EditableInput
              label="Title"
              value={draftRepertoire.title}
              onChange={(v) => setDraftRepertoire((p) => ({ ...p, title: v }))}
            />
            <EditableInput
              label="Composer"
              value={draftRepertoire.composer}
              onChange={(v) =>
                setDraftRepertoire((p) => ({ ...p, composer: v }))
              }
            />
            <EditableInput
              label="Genre"
              value={draftRepertoire.genre}
              onChange={(v) => setDraftRepertoire((p) => ({ ...p, genre: v }))}
            />
            <EditableInput
              label="Status"
              value={draftRepertoire.status}
              onChange={(v) => setDraftRepertoire((p) => ({ ...p, status: v }))}
            />
            <EditableInput
              label="Start Date"
              type="date"
              value={draftRepertoire.startDate}
              onChange={(v) =>
                setDraftRepertoire((p) => ({ ...p, startDate: v }))
              }
            />
            <EditableInput
              label="Performance Date"
              type="date"
              value={draftRepertoire.performanceDate}
              onChange={(v) =>
                setDraftRepertoire((p) => ({ ...p, performanceDate: v }))
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveRepertoire}
              disabled={saving !== null}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
              style={{ ...btnStyle, opacity: saving !== null ? 0.5 : 1 }}
              data-ocid="student-self.save_button"
            >
              {saving !== null ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftRepertoire(emptyRepertoire(profile.username));
                setShowForm(false);
              }}
              className="px-4 py-2 rounded-lg text-sm transition-smooth"
              style={cancelStyle}
              data-ocid="student-self.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (tableType === "messages") {
      return (
        <div
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{
            background: "#111e35",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
          data-ocid="student-self.form"
        >
          <h3 className="text-sm font-semibold" style={{ color: "#c9a84c" }}>
            Compose Message
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <EditableInput
              label="To Username"
              value={draftMessage.toUsername}
              onChange={(v) =>
                setDraftMessage((p) => ({ ...p, toUsername: v }))
              }
            />
            <EditableInput
              label="Subject"
              value={draftMessage.subject}
              onChange={(v) => setDraftMessage((p) => ({ ...p, subject: v }))}
            />
            <div className="col-span-2">
              <EditableInput
                label="Message Body"
                value={draftMessage.body}
                onChange={(v) => setDraftMessage((p) => ({ ...p, body: v }))}
                multiline
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveMessage}
              disabled={saving !== null}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
              style={{ ...btnStyle, opacity: saving !== null ? 0.5 : 1 }}
              data-ocid="student-self.save_button"
            >
              {saving !== null ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftMessage(emptyMessage(profile.username));
                setShowForm(false);
              }}
              className="px-4 py-2 rounded-lg text-sm transition-smooth"
              style={cancelStyle}
              data-ocid="student-self.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (tableType === "collaboration") {
      return (
        <div
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{
            background: "#111e35",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
          data-ocid="student-self.form"
        >
          <h3 className="text-sm font-semibold" style={{ color: "#c9a84c" }}>
            {draftCollab.collaborationId ? "Edit Group" : "Add Collaboration"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <EditableInput
              label="Group Name"
              value={draftCollab.groupName}
              onChange={(v) => setDraftCollab((p) => ({ ...p, groupName: v }))}
            />
            <EditableInput
              label="Group Type"
              value={draftCollab.groupType}
              onChange={(v) => setDraftCollab((p) => ({ ...p, groupType: v }))}
            />
            <EditableInput
              label="Members (comma-separated)"
              value={draftCollab.members}
              onChange={(v) => setDraftCollab((p) => ({ ...p, members: v }))}
            />
            <EditableInput
              label="Rehearsal Dates"
              value={draftCollab.rehearsalDates}
              onChange={(v) =>
                setDraftCollab((p) => ({ ...p, rehearsalDates: v }))
              }
            />
            <div className="col-span-2">
              <EditableInput
                label="Shared Repertoire"
                value={draftCollab.sharedRepertoire}
                onChange={(v) =>
                  setDraftCollab((p) => ({ ...p, sharedRepertoire: v }))
                }
                multiline
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveCollab}
              disabled={saving !== null}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
              style={{ ...btnStyle, opacity: saving !== null ? 0.5 : 1 }}
              data-ocid="student-self.save_button"
            >
              {saving !== null ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftCollab(emptyCollaboration(profile.username));
                setShowForm(false);
              }}
              className="px-4 py-2 rounded-lg text-sm transition-smooth"
              style={cancelStyle}
              data-ocid="student-self.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  // ------------------------------------------------------------------
  // Modal shell
  // ------------------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="student-self.dialog"
    >
      <div
        className="relative rounded-xl w-full mx-4 max-w-2xl max-h-[90vh] flex flex-col"
        style={{
          background: "#1a2540",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Gold accent bar */}
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
          <div>
            <h2
              className="text-xl font-display font-bold"
              style={{ color: "#f5f0e8" }}
            >
              {title}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8a9bb5" }}>
              {profile.username}
              {readOnly && " · Read-only"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && !showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-smooth"
                style={{
                  background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.4)",
                  color: "#c9a84c",
                }}
                data-ocid="student-self.open_modal_button"
              >
                + Add New
              </button>
            )}
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
              data-ocid="student-self.close_button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-12 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="student-self.loading_state"
            >
              Loading…
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {showForm && renderForm()}

              {records.length === 0 && !showForm ? (
                <div
                  className="text-sm py-12 text-center rounded-lg"
                  style={{
                    color: "#4a5c75",
                    border: "1px dashed rgba(201,168,76,0.15)",
                  }}
                  data-ocid="student-self.empty_state"
                >
                  No records found.
                  {!readOnly && (
                    <>
                      <br />
                      <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="mt-3 px-4 py-2 rounded-lg text-sm transition-smooth"
                        style={{
                          background: "rgba(201,168,76,0.1)",
                          border: "1px solid rgba(201,168,76,0.25)",
                          color: "#c9a84c",
                        }}
                        data-ocid="student-self.primary_button"
                      >
                        Add your first entry
                      </button>
                    </>
                  )}
                </div>
              ) : (
                records.map(([id, rec], idx) => renderRecord(id, rec, idx))
              )}
            </div>
          )}
        </div>

        {/* Footer status */}
        {message && (
          <div
            className="px-6 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}
          >
            <p
              className="text-xs"
              style={{
                color:
                  message.toLowerCase().includes("fail") ||
                  message.toLowerCase().includes("error")
                    ? "#e05c5c"
                    : "#c9a84c",
              }}
              data-ocid={
                message.toLowerCase().includes("fail") ||
                message.toLowerCase().includes("error")
                  ? "student-self.error_state"
                  : "student-self.success_state"
              }
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
