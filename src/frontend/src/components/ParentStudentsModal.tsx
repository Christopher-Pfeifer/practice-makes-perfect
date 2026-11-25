import type { StudentEnrollment } from "@/backend";
import { getActor } from "@/lib/actor";
import { useEffect, useRef, useState } from "react";

interface ParentStudentsModalProps {
  parentUsername: string;
  onClose: () => void;
}

interface StudentRow {
  username: string;
  fullName: string;
}

export default function ParentStudentsModal({
  parentUsername,
  onClose,
}: ParentStudentsModalProps) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState<
    Record<string, boolean>
  >({});
  const [studentEnrollments, setStudentEnrollments] = useState<
    Record<string, StudentEnrollment[]>
  >({});
  const [enrollLoading, setEnrollLoading] = useState<Record<string, boolean>>(
    {},
  );
  const profileMapRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const [allProfiles, parentStudents] = await Promise.all([
          actor.getAllProfiles(),
          actor.getParentStudents(parentUsername),
        ]);
        const pMap = new Map(allProfiles.map(([u, p]) => [u, p.fullName]));
        profileMapRef.current = pMap;
        const students = parentStudents.map((ps) => {
          const su = ps.studentUserName;
          return {
            username: su,
            fullName: pMap.get(su) || su,
          };
        });
        setRows(students);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [parentUsername]);

  const toggleEnrollments = async (studentUserName: string) => {
    // If already expanded, collapse
    if (expandedStudents[studentUserName]) {
      setExpandedStudents((prev) => ({ ...prev, [studentUserName]: false }));
      return;
    }
    // If not yet fetched, load now
    if (!studentEnrollments[studentUserName]) {
      setEnrollLoading((prev) => ({ ...prev, [studentUserName]: true }));
      try {
        const actor = getActor();
        const enrollments =
          await actor.getEnrollmentsByStudent(studentUserName);
        setStudentEnrollments((prev) => ({
          ...prev,
          [studentUserName]: enrollments,
        }));
      } catch {
        setStudentEnrollments((prev) => ({ ...prev, [studentUserName]: [] }));
      } finally {
        setEnrollLoading((prev) => ({ ...prev, [studentUserName]: false }));
      }
    }
    setExpandedStudents((prev) => ({ ...prev, [studentUserName]: true }));
  };

  const getTeacherName = (teacherUserName: string): string => {
    return profileMapRef.current.get(teacherUserName) || teacherUserName;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="parent-students.dialog"
    >
      <div
        className="relative rounded-xl w-full mx-4 max-w-lg max-h-[85vh] flex flex-col"
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
            My Students
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
            data-ocid="parent-students.close_button"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="parent-students.loading_state"
            >
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="parent-students.empty_state"
            >
              No students affiliated with you yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rows.map((row, idx) => (
                <div
                  key={row.username}
                  data-ocid={`parent-students.item.${idx + 1}`}
                >
                  {/* Student card row */}
                  <div
                    className="rounded-lg px-4 py-3 flex items-center gap-3"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.15)",
                      borderBottomLeftRadius: expandedStudents[row.username]
                        ? 0
                        : undefined,
                      borderBottomRightRadius: expandedStudents[row.username]
                        ? 0
                        : undefined,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "rgba(201,168,76,0.15)",
                        color: "#c9a84c",
                      }}
                    >
                      {row.fullName.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium"
                        style={{ color: "#f5f0e8" }}
                      >
                        {row.fullName || "(no name)"}
                      </div>
                      <div
                        className="text-xs font-mono"
                        style={{ color: "#8a9bb5" }}
                      >
                        {row.username}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleEnrollments(row.username)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-smooth flex-shrink-0"
                      style={{
                        background: expandedStudents[row.username]
                          ? "rgba(201,168,76,0.2)"
                          : "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.3)",
                        color: "#c9a84c",
                      }}
                      aria-label={
                        expandedStudents[row.username]
                          ? "Hide enrollments"
                          : "Show enrollments"
                      }
                      data-ocid={`parent-students.toggle.${idx + 1}`}
                    >
                      {enrollLoading[row.username] ? (
                        <span style={{ opacity: 0.6 }}>…</span>
                      ) : (
                        <>
                          <span>Enrollments</span>
                          <span
                            style={{
                              display: "inline-block",
                              transition: "transform 0.2s",
                              transform: expandedStudents[row.username]
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              fontSize: "10px",
                            }}
                          >
                            ▼
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Enrollment expansion panel */}
                  {expandedStudents[row.username] && (
                    <div
                      className="rounded-b-lg px-4 py-3"
                      style={{
                        background: "#111d33",
                        border: "1px solid rgba(201,168,76,0.15)",
                        borderTop: "1px solid rgba(201,168,76,0.08)",
                      }}
                      data-ocid={`parent-students.enrollments.${idx + 1}`}
                    >
                      {enrollLoading[row.username] ? (
                        <div
                          className="text-xs py-2 text-center"
                          style={{ color: "#8a9bb5" }}
                        >
                          Loading enrollments…
                        </div>
                      ) : !studentEnrollments[row.username] ||
                        studentEnrollments[row.username].length === 0 ? (
                        <div
                          className="text-xs py-2 text-center"
                          style={{ color: "#8a9bb5" }}
                        >
                          No enrollments found.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {studentEnrollments[row.username].map((enr, eIdx) => (
                            <div
                              key={enr.enrollmentId || eIdx}
                              className="rounded-md px-3 py-2"
                              style={{
                                background: "rgba(201,168,76,0.04)",
                                border: "1px solid rgba(201,168,76,0.12)",
                              }}
                              data-ocid={`parent-students.enrollment.${idx + 1}.${eIdx + 1}`}
                            >
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                <EnrollmentField
                                  label="Instrument"
                                  value={enr.instrument}
                                />
                                {enr.voiceType &&
                                  enr.voiceType.trim() !== "" && (
                                    <EnrollmentField
                                      label="Voice Type"
                                      value={enr.voiceType}
                                    />
                                  )}
                                {enr.skillLevel &&
                                  enr.skillLevel.trim() !== "" && (
                                    <EnrollmentField
                                      label="Skill Level"
                                      value={enr.skillLevel}
                                    />
                                  )}
                                {enr.theoryLevel &&
                                  enr.theoryLevel.trim() !== "" && (
                                    <EnrollmentField
                                      label="Theory Level"
                                      value={enr.theoryLevel}
                                    />
                                  )}
                                {enr.studioName &&
                                  enr.studioName.trim() !== "" && (
                                    <EnrollmentField
                                      label="Studio"
                                      value={enr.studioName}
                                    />
                                  )}
                                <EnrollmentField
                                  label="Teacher"
                                  value={getTeacherName(enr.teacherUserName)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
            data-ocid="parent-students.cancel_button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EnrollmentField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ minWidth: "80px" }}>
      <span
        className="text-xs"
        style={{
          color: "#4a5c75",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span className="text-xs font-medium" style={{ color: "#c8bea0" }}>
        {value}
      </span>
    </div>
  );
}
