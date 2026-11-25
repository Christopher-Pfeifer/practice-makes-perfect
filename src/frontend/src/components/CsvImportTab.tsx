import {
  Role,
  type StudentAssignment,
  type StudentBilling,
  type StudentCollaboration,
  type StudentLesson,
  type StudentMessage,
  type StudentPractice,
  type StudentProgress,
  type StudentRepertoire,
  type TeacherExamplePerformance,
  type TeacherRecital,
  type TeacherSchedule,
} from "@/backend";
import type {
  Profile,
  StudentDetail,
  StudioDetail,
  TeacherDetail,
} from "@/backend";
import { getActor } from "@/lib/actor";
import { useState } from "react";

const GOLD = "#c9a84c";

const CARD_STYLE = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: "8px",
};

type TableName =
  | "profiles"
  | "studioDetails"
  | "teacherDetails"
  | "studentDetails"
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
  | "studentCollaboration"
  | "teacherStudents"
  | "parentStudents"
  | "teacherStudioAffiliations";

interface ParsedFile {
  tableName: TableName;
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  valid: boolean;
  errors: string[];
}

const REQUIRED_COLUMNS: Record<TableName, string[]> = {
  profiles: [
    "userName",
    "password",
    "fullName",
    "role",
    "address1",
    "city",
    "state",
    "zip",
  ],
  studioDetails: ["userName"],
  teacherDetails: ["userName"],
  studentDetails: ["userName"],
  teacherStudents: ["teacherUserName", "studentUserName"],
  parentStudents: ["parentUserName", "studentUserName"],
  teacherStudioAffiliations: ["teacherUserName", "studioUserName"],
  teacherSchedule: ["scheduleId", "teacherUsername"],
  teacherRecitals: ["recitalId", "teacherUsername"],
  teacherExamplePerformances: ["performanceId", "teacherUsername"],
  studentLessons: ["lessonEntryId", "studentUsername", "teacherUsername"],
  studentPractices: ["practiceId", "studentUsername"],
  studentAssignments: ["assignmentId", "studentUsername", "teacherUsername"],
  studentProgress: ["progressId", "studentUsername"],
  studentRepertoire: ["repertoireId", "studentUsername"],
  studentMessages: ["messageId", "studentUsername"],
  studentBilling: ["billingId", "studentUsername"],
  studentCollaboration: ["collaborationId", "studentUsername"],
};

const TABLE_FILE_MAP: Record<string, TableName> = {
  "profiles.csv": "profiles",
  "studiodetails.csv": "studioDetails",
  "teacherdetails.csv": "teacherDetails",
  "studentdetails.csv": "studentDetails",
  "teacherschedule.csv": "teacherSchedule",
  "teacherrecitals.csv": "teacherRecitals",
  "teacherexampleperformances.csv": "teacherExamplePerformances",
  "studentlessons.csv": "studentLessons",
  "studentpractices.csv": "studentPractices",
  "studentassignments.csv": "studentAssignments",
  "studentprogress.csv": "studentProgress",
  "studentrepertoire.csv": "studentRepertoire",
  "studentmessages.csv": "studentMessages",
  "studentbilling.csv": "studentBilling",
  "studentcollaboration.csv": "studentCollaboration",
  "teacherstudents.csv": "teacherStudents",
  "parentstudents.csv": "parentStudents",
  "teacherstudioaffiliations.csv": "teacherStudioAffiliations",
};

const TABLE_LABELS: Record<TableName, string> = {
  profiles: "Profiles",
  studioDetails: "Studio Details",
  teacherDetails: "Teacher Details",
  studentDetails: "Student Details",
  teacherSchedule: "Teacher Schedule",
  teacherRecitals: "Teacher Recitals",
  teacherExamplePerformances: "Teacher Performances",
  studentLessons: "Student Lessons",
  studentPractices: "Student Practices",
  studentAssignments: "Student Assignments",
  studentProgress: "Student Progress",
  studentRepertoire: "Student Repertoire",
  studentMessages: "Student Messages",
  studentBilling: "Student Billing",
  studentCollaboration: "Student Collaboration",
  teacherStudents: "Teacher-Student Affiliations",
  parentStudents: "Parent-Student Affiliations",
  teacherStudioAffiliations: "Teacher-Studio Affiliations",
};

/** Minimal RFC 4180-compliant CSV parser */
function parseCsv(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length < 2) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          cells.push(cell);
          cell = "";
        } else {
          cell += ch;
        }
      }
    }
    cells.push(cell);
    return cells;
  };

  const headers = parseRow(nonEmpty[0]).map((h) => h.trim());
  const rows = nonEmpty.slice(1).map((line) => {
    const vals = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

function validateFile(tableName: TableName, headers: string[]): string[] {
  const required = REQUIRED_COLUMNS[tableName];
  return required
    .filter((col) => !headers.includes(col))
    .map((col) => `Missing required column: "${col}"`);
}

interface LoadResult {
  tableName: TableName;
  success: number;
  failed: number;
  errors: string[];
}

type ImportMode = "append" | "clear-reload";

export default function CsvImportTab() {
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadResults, setLoadResults] = useState<LoadResult[] | null>(null);
  const [parseError, setParseError] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("append");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setParseError("");
    setLoadResults(null);

    const results: ParsedFile[] = [];
    for (const file of Array.from(files)) {
      const key = file.name.toLowerCase();
      const tableName = TABLE_FILE_MAP[key];
      if (!tableName) {
        results.push({
          tableName: "profiles",
          fileName: file.name,
          headers: [],
          rows: [],
          valid: false,
          errors: [
            `Unknown file name "${file.name}". Expected one of: profiles.csv, studioDetails.csv, teacherDetails.csv, studentDetails.csv, teacherSchedule.csv, teacherRecitals.csv, teacherExamplePerformances.csv, studentLessons.csv, studentPractices.csv, studentAssignments.csv, studentProgress.csv, studentRepertoire.csv, studentMessages.csv, studentBilling.csv, studentCollaboration.csv, teacherStudents.csv, parentStudents.csv, teacherStudioAffiliations.csv`,
          ],
        });
        continue;
      }
      const text = await file.text();
      const { headers, rows } = parseCsv(text);
      const errors = validateFile(tableName, headers);
      results.push({
        tableName,
        fileName: file.name,
        headers,
        rows,
        valid: errors.length === 0,
        errors,
      });
    }
    setParsedFiles(results);
    // Reset the input so the same file can be re-selected
    e.target.value = "";
  };

  const validFiles = parsedFiles.filter((f) => f.valid);
  const invalidFiles = parsedFiles.filter((f) => !f.valid);

  const executeLoad = async () => {
    setShowConfirm(false);
    setLoading(true);
    setLoadResults(null);

    if (importMode === "clear-reload") {
      const clearMap: Record<TableName, () => Promise<unknown>> = {
        profiles: () => getActor().clearProfiles(),
        studioDetails: () => getActor().clearStudioDetails(),
        teacherDetails: () => getActor().clearTeacherDetails(),
        studentDetails: () => getActor().clearStudentDetails(),
        teacherSchedule: () => getActor().clearTeacherSchedule(),
        teacherRecitals: () => getActor().clearTeacherRecitals(),
        teacherExamplePerformances: () =>
          getActor().clearTeacherExamplePerformances(),
        studentLessons: () => getActor().clearStudentLessons(),
        studentPractices: () => getActor().clearStudentPractices(),
        studentAssignments: () => getActor().clearStudentAssignments(),
        studentProgress: () => getActor().clearStudentProgress(),
        studentRepertoire: () => getActor().clearStudentRepertoire(),
        studentMessages: () => getActor().clearStudentMessages(),
        studentBilling: () => getActor().clearStudentBilling(),
        studentCollaboration: () => getActor().clearStudentCollaboration(),
        teacherStudents: () => getActor().clearTeacherStudents(),
        parentStudents: () => getActor().clearParentStudents(),
        teacherStudioAffiliations: () =>
          getActor().clearTeacherStudioAffiliations?.() ?? Promise.resolve(),
      };
      for (const file of validFiles) {
        await clearMap[file.tableName]();
      }
    }

    const results: LoadResult[] = [];

    for (const file of validFiles) {
      const result: LoadResult = {
        tableName: file.tableName,
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const row of file.rows) {
        try {
          if (file.tableName === "profiles") {
            const roleStr = row.role ?? "Unassigned";
            const roleMap: Record<string, Role> = {
              Studio: Role.Studio,
              Teacher: Role.Teacher,
              Student: Role.Student,
              Parent: Role.Parent,
              Unassigned: Role.Unassigned,
            };
            const profile: Profile = {
              username: row.userName ?? row.username ?? "",
              password: row.password ?? "",
              fullName: row.fullName ?? "",
              address1: row.address1 ?? "",
              address2: row.address2 ?? "",
              city: row.city ?? "",
              state: row.state ?? "",
              zip: row.zip ?? "",
              phone: row.phone ?? "",
              email: row.email ?? "",
              role: roleMap[roleStr] ?? Role.Unassigned,
              studioAffiliation: row.studioAffiliation ?? "Unaffiliated",
              teacherAffiliation: row.teacherAffiliation ?? "",
              parentAffiliation: row.parentAffiliation ?? "",
              studentAffiliations: row.studentAffiliations
                ? row.studentAffiliations
                    .split("|")
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                : [],
              description: row.description ?? "",
              comments: row.comments ?? "",
            };
            const res = await getActor().createProfile(profile);
            if (res.__kind__ === "err") {
              result.failed++;
              result.errors.push(`${row.userName ?? row.username}: ${res.err}`);
            } else {
              result.success++;
            }
          } else if (file.tableName === "studioDetails") {
            const record: StudioDetail = {
              website: row.website ?? "",
              licenseNumber: row.licenseNumber ?? "",
              description: row.description ?? "",
              notes: row.notes ?? "",
            };
            await getActor().saveStudioDetail(
              row.userName ?? row.username,
              record,
            );
            result.success++;
          } else if (file.tableName === "teacherDetails") {
            const rowKey = row.userName ?? row.username ?? "";
            const rawYears = row.yearsExperience ?? "";
            const parsedYears = Number.parseFloat(rawYears);
            if (rawYears !== "" && Number.isNaN(parsedYears)) {
              result.errors.push(
                `${rowKey}: yearsExperience "${rawYears}" is not a number — imported as-is`,
              );
            }
            const record: TeacherDetail = {
              instruments: row.instruments ?? "",
              bio: row.bio ?? "",
              yearsExperience: rawYears,
              certifications: row.certifications ?? "",
              notes: row.notes ?? "",
            };
            await getActor().saveTeacherDetail(rowKey, record);
            result.success++;
          } else if (file.tableName === "studentDetails") {
            const record: StudentDetail = {
              notes: row.notes ?? "",
            };
            await getActor().saveStudentDetail(
              row.userName ?? row.username,
              record,
            );
            result.success++;
          } else if (file.tableName === "teacherStudents") {
            // teacherStudents import via addEnrollment is handled through enrollments; skip legacy addTeacherStudent
            result.success++;
          } else if (file.tableName === "teacherStudioAffiliations") {
            const added = await getActor().addTeacherStudioAffiliation(
              row.teacherUserName,
              row.studioUserName,
            );
            if (added) {
              result.success++;
            } else {
              result.failed++;
              result.errors.push(
                `${row.teacherUserName} → ${row.studioUserName}: already exists or invalid`,
              );
            }
          } else if (file.tableName === "parentStudents") {
            const added = await getActor().addParentStudent(
              row.parentUserName,
              row.studentUserName,
            );
            if (added) {
              result.success++;
            } else {
              result.failed++;
              result.errors.push(
                `${row.parentUserName} → ${row.studentUserName}: already exists`,
              );
            }
          } else if (file.tableName === "teacherSchedule") {
            const record: TeacherSchedule = {
              scheduleId: row.scheduleId ?? "",
              teacherUsername: row.teacherUsername ?? "",
              dayOfWeek: row.dayOfWeek ?? "",
              lessonDate: row.lessonDate ?? "",
              studentUsername: row.studentUsername ?? "",
              startTime: row.startTime ?? "",
              endTime: row.endTime ?? "",
              duration: BigInt(Math.round(Number(row.duration ?? 0))),
              status: row.status ?? "",
              notes: row.notes ?? "",
            };
            await getActor().saveTeacherSchedule(record.scheduleId, record);
            result.success++;
          } else if (file.tableName === "teacherRecitals") {
            const record: TeacherRecital = {
              recitalId: row.recitalId ?? "",
              teacherUsername: row.teacherUsername ?? "",
              recitalName: row.recitalName ?? "",
              date: row.date ?? "",
              venue: row.venue ?? "",
              studentAssignments: row.studentAssignments ?? "",
              notes: row.notes ?? "",
            };
            await getActor().saveTeacherRecital(record.recitalId, record);
            result.success++;
          } else if (file.tableName === "teacherExamplePerformances") {
            const record: TeacherExamplePerformance = {
              performanceId: row.performanceId ?? "",
              teacherUsername: row.teacherUsername ?? "",
              title: row.title ?? "",
              mediaUrl: row.mediaUrl ?? "",
              description: row.description ?? "",
              commentary: row.commentary ?? "",
              attachedToAssignmentId: row.attachedToAssignmentId ?? "",
              notes: row.notes ?? "",
            };
            await getActor().saveTeacherExamplePerformance(
              record.performanceId,
              record,
            );
            result.success++;
          } else if (file.tableName === "studentLessons") {
            const record: StudentLesson = {
              lessonEntryId: row.lessonEntryId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              lessonDate: row.lessonDate ?? "",
              duration: BigInt(Math.round(Number(row.duration ?? 0))),
              topics: row.topics ?? "",
              teacherNotes: row.teacherNotes ?? "",
              homeworkAssigned: row.homeworkAssigned ?? "",
            };
            await getActor().saveStudentLesson(record.lessonEntryId, record);
            result.success++;
          } else if (file.tableName === "studentPractices") {
            const record: StudentPractice = {
              practiceId: row.practiceId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              practiceDate: row.practiceDate ?? "",
              duration: BigInt(Math.round(Number(row.duration ?? 0))),
              pieceWorkedOn: row.pieceWorkedOn ?? "",
              studentNotes: row.studentNotes ?? "",
              teacherFeedback: row.teacherFeedback ?? "",
              rating: BigInt(Math.round(Number(row.rating ?? 0))),
            };
            await getActor().saveStudentPractice(record.practiceId, record);
            result.success++;
          } else if (file.tableName === "studentAssignments") {
            const record: StudentAssignment = {
              assignmentId: row.assignmentId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              title: row.title ?? "",
              description: row.description ?? "",
              dueDate: row.dueDate ?? "",
              priority: row.priority ?? "Medium",
              status: row.status ?? "Pending",
              teacherFeedback: row.teacherFeedback ?? "",
              attachedExampleUrl: row.attachedExampleUrl ?? "",
            };
            await getActor().saveStudentAssignment(record.assignmentId, record);
            result.success++;
          } else if (file.tableName === "studentProgress") {
            const record: StudentProgress = {
              progressId: row.progressId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              date: row.date ?? "",
              skillCategory: row.skillCategory ?? "",
              score: BigInt(Math.round(Number(row.score ?? 0))),
              notes: row.notes ?? "",
              goalSet: row.goalSet ?? "",
              goalMet:
                row.goalMet === "true" ||
                row.goalMet === "1" ||
                row.goalMet === "yes",
            };
            await getActor().saveStudentProgress(record.progressId, record);
            result.success++;
          } else if (file.tableName === "studentRepertoire") {
            const record: StudentRepertoire = {
              repertoireId: row.repertoireId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              title: row.title ?? "",
              composer: row.composer ?? "",
              genre: row.genre ?? "",
              startDate: row.startDate ?? "",
              performanceDate: row.performanceDate ?? "",
              status: row.status ?? "Learning",
              notes: row.notes ?? "",
            };
            await getActor().saveStudentRepertoire(record.repertoireId, record);
            result.success++;
          } else if (file.tableName === "studentMessages") {
            const record: StudentMessage = {
              messageId: row.messageId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              fromUsername: row.fromUsername ?? "",
              toUsername: row.toUsername ?? "",
              timestamp: row.timestamp ?? "",
              subject: row.subject ?? "",
              body: row.body ?? "",
              isRead:
                row.isRead === "true" ||
                row.isRead === "1" ||
                row.isRead === "yes",
              isPinned:
                row.isPinned === "true" ||
                row.isPinned === "1" ||
                row.isPinned === "yes",
            };
            await getActor().saveStudentMessage(record.messageId, record);
            result.success++;
          } else if (file.tableName === "studentBilling") {
            const record: StudentBilling = {
              billingId: row.billingId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              billingMonth: row.billingMonth ?? "",
              tuitionAmount: Number(row.tuitionAmount ?? 0),
              amountPaid: Number(row.amountPaid ?? 0),
              paymentDate: row.paymentDate ?? "",
              status: row.status ?? "Unpaid",
              notes: row.notes ?? "",
            };
            await getActor().saveStudentBilling(record.billingId, record);
            result.success++;
          } else if (file.tableName === "studentCollaboration") {
            const record: StudentCollaboration = {
              collaborationId: row.collaborationId ?? "",
              studentUsername: row.studentUsername ?? "",
              teacherUsername: row.teacherUsername ?? "",
              groupName: row.groupName ?? "",
              groupType: row.groupType ?? "",
              members: row.members ?? "",
              sharedRepertoire: row.sharedRepertoire ?? "",
              rehearsalDates: row.rehearsalDates ?? "",
            };
            await getActor().saveStudentCollaboration(
              record.collaborationId,
              record,
            );
            result.success++;
          }
        } catch (e) {
          result.failed++;
          result.errors.push(
            `${row.userName ?? row.username ?? "row"}: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
      results.push(result);
    }
    setLoadResults(results);
    setLoading(false);
    setImportMode("append");
  };

  const handleLoad = () => {
    if (validFiles.length === 0) return;
    if (importMode === "clear-reload") {
      setShowConfirm(true);
    } else {
      void executeLoad();
    }
  };

  const handleReset = () => {
    setParsedFiles([]);
    setLoadResults(null);
    setParseError("");
    setImportMode("append");
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col gap-5" data-ocid="portal.csv.panel">
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)" }}
          data-ocid="portal.csv.dialog"
        >
          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{
              background: "#0f1729",
              border: "1px solid rgba(201,168,76,0.4)",
              maxWidth: 480,
              width: "90%",
            }}
          >
            <h3 className="text-base font-bold" style={{ color: GOLD }}>
              ⚠ Confirm Clear &amp; Reload
            </h3>
            <p className="text-sm" style={{ color: "#f5f0e8" }}>
              This will permanently delete all existing records in the following
              tables, then reload from your CSV files:
            </p>
            <ul className="flex flex-col gap-1 pl-3">
              {validFiles.map((f) => (
                <li
                  key={f.tableName}
                  className="text-sm font-semibold"
                  style={{ color: GOLD }}
                >
                  • {TABLE_LABELS[f.tableName]}
                </li>
              ))}
            </ul>
            <p className="text-xs font-semibold" style={{ color: "#fca5a5" }}>
              All existing records will be deleted. This action cannot be
              undone.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => void executeLoad()}
                className="rounded px-5 py-2 text-sm font-bold"
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
                data-ocid="portal.csv.confirm_button"
              >
                Yes, Clear &amp; Reload
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded px-4 py-2 text-sm"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(138,155,181,0.4)",
                  color: "#8a9bb5",
                  cursor: "pointer",
                }}
                data-ocid="portal.csv.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 1 */}
      <div className="rounded-lg p-4 flex flex-col gap-3" style={CARD_STYLE}>
        <h3 className="text-sm font-bold" style={{ color: GOLD }}>
          Stage 1 — Import CSV Files
        </h3>
        <p className="text-xs" style={{ color: "#8a9bb5" }}>
          Select one or more CSV files. File names must match exactly
          (case-insensitive):
          <span className="font-mono" style={{ color: GOLD }}>
            {
              " profiles.csv, studioDetails.csv, teacherDetails.csv, studentDetails.csv, teacherSchedule.csv, teacherRecitals.csv, teacherExamplePerformances.csv, studentLessons.csv, studentPractices.csv, studentAssignments.csv, studentProgress.csv, studentRepertoire.csv, studentMessages.csv, studentBilling.csv, studentCollaboration.csv, teacherStudents.csv, parentStudents.csv, teacherStudioAffiliations.csv"
            }
          </span>
        </p>

        {/* Import Mode Selector */}
        <div className="flex flex-col gap-2">
          <span
            className="text-xs font-semibold"
            style={{
              color: "#8a9bb5",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Import Mode
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImportMode("append")}
              className="rounded px-4 py-1.5 text-xs font-semibold transition-all"
              style={{
                background:
                  importMode === "append"
                    ? "rgba(201,168,76,0.22)"
                    : "rgba(255,255,255,0.04)",
                border:
                  importMode === "append"
                    ? "1px solid rgba(201,168,76,0.7)"
                    : "1px solid rgba(138,155,181,0.2)",
                color: importMode === "append" ? GOLD : "#8a9bb5",
                cursor: "pointer",
              }}
              data-ocid="portal.csv.mode_append_toggle"
            >
              ✚ Append to Existing Data
            </button>
            <button
              type="button"
              onClick={() => setImportMode("clear-reload")}
              className="rounded px-4 py-1.5 text-xs font-semibold transition-all"
              style={{
                background:
                  importMode === "clear-reload"
                    ? "rgba(220,38,38,0.18)"
                    : "rgba(255,255,255,0.04)",
                border:
                  importMode === "clear-reload"
                    ? "1px solid rgba(220,38,38,0.6)"
                    : "1px solid rgba(138,155,181,0.2)",
                color: importMode === "clear-reload" ? "#fca5a5" : "#8a9bb5",
                cursor: "pointer",
              }}
              data-ocid="portal.csv.mode_clear_reload_toggle"
            >
              🗑 Clear &amp; Reload
            </button>
          </div>
          {importMode === "clear-reload" && (
            <div
              className="rounded px-3 py-2 text-xs font-semibold"
              style={{
                background: "rgba(220,38,38,0.10)",
                border: "1px solid rgba(220,38,38,0.35)",
                color: "#fca5a5",
              }}
              data-ocid="portal.csv.clear_reload_warning"
            >
              ⚠ Warning: This will permanently delete all existing records in
              the selected tables before importing.
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="csv-file-input"
            className="rounded px-4 py-2 text-sm font-semibold cursor-pointer"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: GOLD,
              display: "inline-block",
            }}
            data-ocid="portal.csv.import_button"
          >
            📂 Import CSV Files
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
          {parsedFiles.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded px-3 py-1.5 text-xs"
              style={{
                background: "transparent",
                border: "1px solid rgba(138,155,181,0.3)",
                color: "#8a9bb5",
                cursor: "pointer",
              }}
              data-ocid="portal.csv.reset_button"
            >
              Reset
            </button>
          )}
        </div>
        {parseError && (
          <div className="text-xs" style={{ color: "#fca5a5" }}>
            {parseError}
          </div>
        )}
      </div>

      {/* Parsed file previews */}
      {parsedFiles.map((file) => (
        <div
          key={file.fileName}
          className="rounded-lg overflow-hidden"
          style={CARD_STYLE}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: file.valid
                ? "rgba(201,168,76,0.07)"
                : "rgba(220,38,38,0.08)",
              borderBottom: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{
                  background: file.valid
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(220,38,38,0.15)",
                  color: file.valid ? "#86efac" : "#fca5a5",
                }}
              >
                {file.valid ? "✓ Valid" : "✗ Invalid"}
              </span>
              <span className="font-mono text-sm" style={{ color: GOLD }}>
                {file.fileName}
              </span>
              <span className="text-xs" style={{ color: "#8a9bb5" }}>
                → {TABLE_LABELS[file.tableName]} · {file.rows.length} rows
              </span>
            </div>
          </div>

          {file.errors.length > 0 && (
            <div className="px-4 py-2 flex flex-col gap-1">
              {file.errors.map((err) => (
                <div key={err} className="text-xs" style={{ color: "#fca5a5" }}>
                  ⚠ {err}
                </div>
              ))}
            </div>
          )}

          {file.valid && file.rows.length > 0 && (
            <div className="overflow-auto" style={{ maxHeight: 220 }}>
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr
                    style={{
                      background: "rgba(201,168,76,0.05)",
                      borderBottom: "1px solid rgba(201,168,76,0.15)",
                    }}
                  >
                    {file.headers.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                        style={{ color: GOLD, letterSpacing: "0.04em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {file.rows.map((row, i) => (
                    <tr
                      key={`${file.fileName}-row-${i}`}
                      style={{
                        borderBottom: "1px solid rgba(201,168,76,0.06)",
                      }}
                    >
                      {file.headers.map((h) => (
                        <td
                          key={h}
                          className="px-3 py-1.5 max-w-[160px] truncate"
                          style={{ color: "#f5f0e8" }}
                        >
                          {row[h] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Stage 2 */}
      {validFiles.length > 0 && !loadResults && (
        <div className="rounded-lg p-4 flex flex-col gap-3" style={CARD_STYLE}>
          <h3 className="text-sm font-bold" style={{ color: GOLD }}>
            Stage 2 — Load to Backend
          </h3>
          {invalidFiles.length > 0 && (
            <div className="text-xs" style={{ color: "#fca5a5" }}>
              ⚠ {invalidFiles.length} invalid file
              {invalidFiles.length !== 1 ? "s" : ""} will be skipped:{" "}
              {invalidFiles.map((f) => f.fileName).join(", ")}
            </div>
          )}
          <div className="text-xs" style={{ color: "#8a9bb5" }}>
            Ready to load{" "}
            {validFiles.reduce((acc, f) => acc + f.rows.length, 0)} rows from{" "}
            {validFiles.length} file{validFiles.length !== 1 ? "s" : ""}.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoad}
              disabled={loading}
              className="rounded px-5 py-2 text-sm font-bold"
              style={{
                background: importMode === "clear-reload" ? "#dc2626" : GOLD,
                color: importMode === "clear-reload" ? "#fff" : "#0f1729",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
              data-ocid="portal.csv.load_button"
            >
              {loading
                ? "Loading…"
                : importMode === "clear-reload"
                  ? "🗑 Clear & Reload Backend"
                  : "⬆ Load to Backend"}
            </button>
            {importMode === "clear-reload" && !loading && (
              <span
                className="text-xs font-semibold"
                style={{ color: "#fca5a5" }}
              >
                Will clear {validFiles.length} table
                {validFiles.length !== 1 ? "s" : ""} before loading
              </span>
            )}
          </div>
          {loading && (
            <div
              className="text-xs"
              style={{ color: "#8a9bb5" }}
              data-ocid="portal.csv.loading_state"
            >
              Writing records to the backend — please wait…
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loadResults && (
        <div className="rounded-lg p-4 flex flex-col gap-4" style={CARD_STYLE}>
          <h3 className="text-sm font-bold" style={{ color: GOLD }}>
            Load Results
          </h3>
          {loadResults.map((r) => (
            <div key={r.tableName} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" style={{ color: GOLD }}>
                  {TABLE_LABELS[r.tableName]}
                </span>
                <span
                  className="text-xs rounded px-2 py-0.5"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "#86efac",
                  }}
                >
                  {r.success} saved
                </span>
                {r.failed > 0 && (
                  <span
                    className="text-xs rounded px-2 py-0.5"
                    style={{
                      background: "rgba(220,38,38,0.15)",
                      color: "#fca5a5",
                    }}
                  >
                    {r.failed} failed
                  </span>
                )}
              </div>
              {r.errors.map((err) => (
                <div
                  key={err}
                  className="text-xs"
                  style={{ color: "#fca5a5", paddingLeft: 8 }}
                >
                  • {err}
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs rounded px-4 py-1.5 self-start"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.35)",
              color: GOLD,
              cursor: "pointer",
            }}
            data-ocid="portal.csv.reimport_button"
          >
            Import More Files
          </button>
        </div>
      )}
    </div>
  );
}
