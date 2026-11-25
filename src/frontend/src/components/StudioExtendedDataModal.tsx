import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

type StudioTableType =
  | "recitals"
  | "performances"
  | "student-lessons"
  | "student-practices"
  | "student-assignments"
  | "student-progress"
  | "student-repertoire"
  | "student-messages"
  | "student-billing"
  | "student-collaboration";

interface StudioExtendedDataModalProps {
  profile: UserProfile;
  tableType: StudioTableType;
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
}: { children: React.ReactNode; ocid: string }) => (
  <div
    className="rounded-lg px-4 py-3 flex flex-col gap-1"
    style={{ background: "#0f1729", border: "1px solid rgba(201,168,76,0.15)" }}
    data-ocid={ocid}
  >
    {children}
  </div>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
  ocid,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  ocid: string;
}) => {
  const selectId = `filter-select-${ocid}`;
  return (
    <div className="mb-4">
      <label
        htmlFor={selectId}
        className="block text-xs mb-1"
        style={{ color: "#8a9bb5" }}
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={{
          background: "#0f1729",
          border: "1px solid rgba(201,168,76,0.3)",
          color: "#f5f0e8",
          outline: "none",
        }}
        data-ocid={ocid}
      >
        <option value="">— All —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

type FilterOption = { value: string; label: string };

export default function StudioExtendedDataModal({
  profile,
  tableType,
  title,
  onClose,
}: StudioExtendedDataModalProps) {
  const ocidPrefix = `studio-ext-${tableType}`;
  const isTeacherTable =
    tableType === "recitals" || tableType === "performances";

  const [teachers, setTeachers] = useState<FilterOption[]>([]);
  const [students, setStudents] = useState<FilterOption[]>([]);
  const [filterValue, setFilterValue] = useState<string>("");
  const [allRecords, setAllRecords] = useState<Array<[string, any]>>([]);
  const [loading, setLoading] = useState(true);

  // Build teacher/student sets for the studio
  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const allProfiles = await actor.getAllProfiles();
        const myTeacherUsernames = new Set(
          allProfiles
            .filter(
              ([, p]) =>
                p.role === "Teacher" &&
                p.studioAffiliation === profile.username,
            )
            .map(([u]) => u),
        );
        const teacherOptions: FilterOption[] = allProfiles
          .filter(
            ([, p]) =>
              p.role === "Teacher" && p.studioAffiliation === profile.username,
          )
          .map(([u, p]) => ({ value: u, label: `${p.fullName} (${u})` }));
        setTeachers(teacherOptions);

        const myStudentUsernames = new Set(
          allProfiles
            .filter(
              ([, p]) =>
                p.role === "Student" &&
                myTeacherUsernames.has(p.teacherAffiliation),
            )
            .map(([u]) => u),
        );
        const studentOptions: FilterOption[] = allProfiles
          .filter(
            ([, p]) =>
              p.role === "Student" &&
              myTeacherUsernames.has(p.teacherAffiliation),
          )
          .map(([u, p]) => ({ value: u, label: `${p.fullName} (${u})` }));
        setStudents(studentOptions);

        // Fetch the appropriate table
        let data: Array<[string, any]> = [];
        if (tableType === "recitals") {
          const all = await actor.getAllTeacherRecitals();
          data = all.filter(([, r]) =>
            myTeacherUsernames.has(r.teacherUsername),
          );
        } else if (tableType === "performances") {
          const all = await actor.getAllTeacherExamplePerformances();
          data = all.filter(([, r]) =>
            myTeacherUsernames.has(r.teacherUsername),
          );
        } else if (tableType === "student-lessons") {
          const all = await actor.getAllStudentLessons();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-practices") {
          const all = await actor.getAllStudentPractices();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-assignments") {
          const all = await actor.getAllStudentAssignments();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-progress") {
          const all = await actor.getAllStudentProgress();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-repertoire") {
          const all = await actor.getAllStudentRepertoire();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-messages") {
          const all = await actor.getAllStudentMessages();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-billing") {
          const all = await actor.getAllStudentBillings();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        } else if (tableType === "student-collaboration") {
          const all = await actor.getAllStudentCollaborations();
          data = all.filter(([, r]) =>
            myStudentUsernames.has(r.studentUsername),
          );
        }
        setAllRecords(data);
      } catch {
        setAllRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username, tableType]);

  // Apply filter
  const filteredRecords: Array<[string, any]> = filterValue
    ? allRecords.filter(([, r]) =>
        isTeacherTable
          ? r.teacherUsername === filterValue
          : r.studentUsername === filterValue,
      )
    : allRecords;

  function renderRecord(id: string, r: any, idx: number) {
    const ocid = `${ocidPrefix}.item.${idx + 1}`;
    if (tableType === "recitals") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.recitalName}
          </div>
          <Field label="Date" value={r.date} />
          <Field label="Venue" value={r.venue} />
          <Field label="Teacher" value={r.teacherUsername} />
          <Field label="Student Assignments" value={r.studentAssignments} />
          <Field label="Notes" value={r.notes} />
        </RecordCard>
      );
    }
    if (tableType === "performances") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.title}
          </div>
          <Field label="Teacher" value={r.teacherUsername} />
          <Field label="Media URL" value={r.mediaUrl} />
          <Field label="Description" value={r.description} />
          <Field label="Commentary" value={r.commentary} />
          <Field label="Notes" value={r.notes} />
        </RecordCard>
      );
    }
    if (tableType === "student-lessons") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.lessonDate}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Duration" value={`${r.duration} min`} />
          <Field label="Topics" value={r.topics} />
          <Field label="Teacher Notes" value={r.teacherNotes} />
          <Field label="Homework" value={r.homeworkAssigned} />
        </RecordCard>
      );
    }
    if (tableType === "student-practices") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.practiceDate}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Duration" value={`${r.duration} min`} />
          <Field label="Piece" value={r.pieceWorkedOn} />
          <Field label="Student Notes" value={r.studentNotes} />
          <Field
            label="Rating"
            value={r.rating ? `${r.rating}/10` : undefined}
          />
        </RecordCard>
      );
    }
    if (tableType === "student-assignments") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.title}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Due" value={r.dueDate} />
          <Field label="Priority" value={r.priority} />
          <Field label="Status" value={r.status} />
          <Field label="Description" value={r.description} />
        </RecordCard>
      );
    }
    if (tableType === "student-progress") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.date}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Skill Category" value={r.skillCategory} />
          <Field label="Score" value={r.score} />
          <Field label="Goal Set" value={r.goalSet} />
          <Field label="Goal Met" value={r.goalMet} />
        </RecordCard>
      );
    }
    if (tableType === "student-repertoire") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.title}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Composer" value={r.composer} />
          <Field label="Genre" value={r.genre} />
          <Field label="Status" value={r.status} />
          <Field label="Performance Date" value={r.performanceDate} />
        </RecordCard>
      );
    }
    if (tableType === "student-messages") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.subject}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Date" value={r.timestamp} />
          <Field label="From" value={r.fromUsername} />
          <Field label="To" value={r.toUsername} />
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
    if (tableType === "student-billing") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.billingMonth}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Tuition" value={`$${r.tuitionAmount}`} />
          <Field label="Paid" value={`$${r.amountPaid}`} />
          <Field label="Status" value={r.status} />
        </RecordCard>
      );
    }
    if (tableType === "student-collaboration") {
      return (
        <RecordCard key={id} ocid={ocid}>
          <div className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
            {r.groupName}
          </div>
          <Field label="Student" value={r.studentUsername} />
          <Field label="Group Type" value={r.groupType} />
          <Field label="Members" value={r.members} />
          <Field label="Shared Repertoire" value={r.sharedRepertoire} />
          <Field label="Rehearsal Dates" value={r.rehearsalDates} />
        </RecordCard>
      );
    }
    return null;
  }

  return (
    <ModalShell title={title} onClose={onClose} ocidPrefix={ocidPrefix}>
      {loading ? (
        <div
          className="text-sm py-8 text-center"
          style={{ color: "#8a9bb5" }}
          data-ocid={`${ocidPrefix}.loading_state`}
        >
          Loading…
        </div>
      ) : (
        <>
          {/* Filter dropdown */}
          {isTeacherTable
            ? teachers.length > 0 && (
                <FilterSelect
                  label="Filter by Teacher"
                  value={filterValue}
                  options={teachers}
                  onChange={setFilterValue}
                  ocid={`${ocidPrefix}.select`}
                />
              )
            : students.length > 0 && (
                <FilterSelect
                  label="Filter by Student"
                  value={filterValue}
                  options={students}
                  onChange={setFilterValue}
                  ocid={`${ocidPrefix}.select`}
                />
              )}

          {/* Record count badge */}
          {filteredRecords.length > 0 && (
            <div className="mb-3 text-xs" style={{ color: "#8a9bb5" }}>
              Showing {filteredRecords.length} record
              {filteredRecords.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Records */}
          {filteredRecords.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid={`${ocidPrefix}.empty_state`}
            >
              No records found{filterValue ? " for the selected filter" : ""}.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredRecords.map(([id, r], idx) => renderRecord(id, r, idx))}
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}
