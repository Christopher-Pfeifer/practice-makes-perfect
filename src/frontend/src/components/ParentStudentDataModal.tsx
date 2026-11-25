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
  | "billing";

interface ParentStudentDataModalProps {
  profile: UserProfile;
  tableType: TableType;
  title: string;
  onClose: () => void;
}

const ModalShell = ({
  title,
  onClose,
  children,
  ocidPrefix,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  ocidPrefix: string;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(15,23,41,0.85)" }}
    onClick={onClose}
    onKeyDown={(e) => e.key === "Escape" && onClose()}
    role="presentation"
    data-ocid={`${ocidPrefix}.dialog`}
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
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, #c9a84c, transparent)",
        }}
      />
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
      >
        <h2
          className="text-xl font-display font-bold"
          style={{ color: "#f5f0e8" }}
        >
          {title}
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
          data-ocid={`${ocidPrefix}.close_button`}
        >
          ✕
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      <div
        className="flex justify-end px-6 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm transition-smooth"
          style={{
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.4)",
            color: "#c9a84c",
          }}
          data-ocid={`${ocidPrefix}.cancel_button`}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const Field = ({
  label,
  value,
}: { label: string; value: string | number | boolean | undefined }) => {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div className="flex flex-wrap gap-1">
      <span className="text-xs" style={{ color: "#4a5c75" }}>
        {label}:
      </span>
      <span className="text-xs" style={{ color: "#8a9bb5" }}>
        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
      </span>
    </div>
  );
};

const RecordCard = ({
  children,
  ocid,
}: {
  children: React.ReactNode;
  ocid: string;
}) => (
  <div
    className="rounded-lg px-4 py-3 flex flex-col gap-1"
    style={{ background: "#0f1729", border: "1px solid rgba(201,168,76,0.15)" }}
    data-ocid={ocid}
  >
    {children}
  </div>
);

function renderRecords(
  tableType: TableType,
  records: Array<[string, any]>,
  ocidPrefix: string,
) {
  if (records.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {records.map(([id, r]: [string, any], idx: number) => {
        const ocid = `${ocidPrefix}.item.${idx + 1}`;
        if (tableType === "lessons") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.lessonDate}
              </div>
              <Field label="Duration" value={`${r.duration} min`} />
              <Field label="Topics" value={r.topics} />
              <Field label="Teacher Notes" value={r.teacherNotes} />
              <Field label="Homework" value={r.homeworkAssigned} />
              <Field label="Teacher" value={r.teacherUsername} />
            </RecordCard>
          );
        }
        if (tableType === "practices") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.practiceDate}
              </div>
              <Field label="Duration" value={`${r.duration} min`} />
              <Field label="Piece" value={r.pieceWorkedOn} />
              <Field label="Student Notes" value={r.studentNotes} />
              <Field label="Teacher Feedback" value={r.teacherFeedback} />
              <Field
                label="Rating"
                value={r.rating ? `${r.rating}/10` : undefined}
              />
            </RecordCard>
          );
        }
        if (tableType === "assignments") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.title}
              </div>
              <Field label="Due" value={r.dueDate} />
              <Field label="Priority" value={r.priority} />
              <Field label="Status" value={r.status} />
              <Field label="Description" value={r.description} />
              <Field label="Teacher Feedback" value={r.teacherFeedback} />
            </RecordCard>
          );
        }
        if (tableType === "progress") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.date}
              </div>
              <Field label="Skill Category" value={r.skillCategory} />
              <Field label="Score" value={r.score} />
              <Field label="Goal Set" value={r.goalSet} />
              <Field label="Goal Met" value={r.goalMet} />
              <Field label="Notes" value={r.notes} />
            </RecordCard>
          );
        }
        if (tableType === "repertoire") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.title}
              </div>
              <Field label="Composer" value={r.composer} />
              <Field label="Genre" value={r.genre} />
              <Field label="Status" value={r.status} />
              <Field label="Start Date" value={r.startDate} />
              <Field label="Performance Date" value={r.performanceDate} />
              <Field label="Notes" value={r.notes} />
            </RecordCard>
          );
        }
        if (tableType === "messages") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.subject}
              </div>
              <Field label="Date" value={r.timestamp} />
              <Field label="From" value={r.fromUsername} />
              <Field label="To" value={r.toUsername} />
              <Field label="Read" value={r.isRead} />
              <Field label="Pinned" value={r.isPinned} />
              {r.body && (
                <div
                  className="mt-1 text-xs rounded p-2"
                  style={{
                    background: "rgba(201,168,76,0.05)",
                    color: "#8a9bb5",
                    border: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  {r.body}
                </div>
              )}
            </RecordCard>
          );
        }
        if (tableType === "billing") {
          return (
            <RecordCard key={id} ocid={ocid}>
              <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                {r.billingMonth}
              </div>
              <Field label="Tuition" value={`$${r.tuitionAmount}`} />
              <Field label="Paid" value={`$${r.amountPaid}`} />
              <Field label="Payment Date" value={r.paymentDate} />
              <Field label="Status" value={r.status} />
              <Field label="Notes" value={r.notes} />
            </RecordCard>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function ParentStudentDataModal({
  profile,
  tableType,
  title,
  onClose,
}: ParentStudentDataModalProps) {
  const ocidPrefix = `parent-${tableType}`;
  const [students, setStudents] = useState<
    Array<{
      username: string;
      fullName: string;
      instrument: string;
      skillLevel: string;
    }>
  >([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [records, setRecords] = useState<Array<[string, any]>>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Fetch parent's students via getParentStudents API
  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const [affiliations, allProfiles, allStudentDetails] =
          await Promise.all([
            actor.getParentStudents(profile.username),
            actor.getAllProfiles(),
            actor.getAllStudentDetails(),
          ]);

        const profileMap = new Map(allProfiles.map(([u, p]) => [u, p]));
        const _studentDetailMap = new Map(
          allStudentDetails.map(([u, d]) => [u, d]),
        );

        const rows = affiliations.map((a) => {
          const studentUserName = a.studentUserName;
          const studentProfile = profileMap.get(studentUserName);
          return {
            username: studentUserName,
            fullName: studentProfile?.fullName ?? studentUserName,
            instrument: "",
            skillLevel: "",
          };
        });

        setStudents(rows);
        if (rows.length > 0) setSelectedStudent(rows[0].username);
      } catch {
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, [profile.username]);

  // Fetch records for selected student
  useEffect(() => {
    if (!selectedStudent) return;
    setLoadingRecords(true);
    const load = async () => {
      try {
        const actor = getActor();
        let data: Array<[string, unknown]> = [];
        if (tableType === "lessons")
          data = await actor.getLessonEntriesByStudent(selectedStudent);
        else if (tableType === "practices")
          data = await actor.getPracticesByStudent(selectedStudent);
        else if (tableType === "assignments")
          data = await actor.getAssignmentsByStudent(selectedStudent);
        else if (tableType === "progress")
          data = await actor.getProgressByStudent(selectedStudent);
        else if (tableType === "repertoire")
          data = await actor.getRepertoireByStudent(selectedStudent);
        else if (tableType === "messages")
          data = await actor.getMessagesByStudent(selectedStudent);
        else if (tableType === "billing")
          data = await actor.getBillingsByStudent(selectedStudent);
        setRecords(data as Array<[string, never]>);
      } catch {
        setRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    };
    load();
  }, [selectedStudent, tableType]);

  return (
    <ModalShell title={title} onClose={onClose} ocidPrefix={ocidPrefix}>
      {loadingStudents ? (
        <div
          className="text-sm py-8 text-center"
          style={{ color: "#8a9bb5" }}
          data-ocid={`${ocidPrefix}.loading_state`}
        >
          Loading…
        </div>
      ) : students.length === 0 ? (
        <div
          className="text-sm py-8 text-center"
          style={{ color: "#8a9bb5" }}
          data-ocid={`${ocidPrefix}.empty_state`}
        >
          No students affiliated with your account.
        </div>
      ) : (
        <>
          {/* Student picker */}
          <div className="mb-4">
            <label
              htmlFor="parent-student-select"
              className="block text-xs mb-1"
              style={{ color: "#8a9bb5" }}
            >
              Select Student
            </label>
            <select
              id="parent-student-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{
                background: "#0f1729",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#f5f0e8",
                outline: "none",
              }}
              data-ocid={`${ocidPrefix}.select`}
            >
              {students.map((s) => (
                <option key={s.username} value={s.username}>
                  {s.fullName}
                  {s.instrument ? ` — ${s.instrument}` : ""}
                  {s.skillLevel ? ` (${s.skillLevel})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Records */}
          {loadingRecords ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid={`${ocidPrefix}.loading_state`}
            >
              Loading records…
            </div>
          ) : records.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid={`${ocidPrefix}.empty_state`}
            >
              No {tableType} records found for this student.
            </div>
          ) : (
            renderRecords(tableType, records, ocidPrefix)
          )}
        </>
      )}
    </ModalShell>
  );
}
