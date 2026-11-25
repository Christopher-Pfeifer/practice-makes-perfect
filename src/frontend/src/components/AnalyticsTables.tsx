import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

const GOLD = "#c9a84c";
const CARD_STYLE = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
};
const TH_STYLE = {
  background: "rgba(201,168,76,0.18)",
  color: GOLD,
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  padding: "10px 14px",
  textAlign: "left" as const,
  fontWeight: 700,
  cursor: "pointer",
  userSelect: "none" as const,
  whiteSpace: "nowrap" as const,
};
const TD_STYLE = {
  padding: "9px 14px",
  fontSize: "13px",
  color: "#f5f0e8",
  borderBottom: "1px solid rgba(201,168,76,0.08)",
};

type SortDir = "asc" | "desc";

interface KVRow {
  label: string;
  count: number;
}

function SortableKVTable({
  title,
  rows,
  col1,
  col2,
  ocidPrefix,
}: {
  title: string;
  rows: KVRow[];
  col1: string;
  col2: string;
  ocidPrefix: string;
}) {
  const [sortCol, setSortCol] = useState<"label" | "count">("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...rows].sort((a, b) => {
    const aVal = sortCol === "count" ? a.count : a.label.toLowerCase();
    const bVal = sortCol === "count" ? b.count : b.label.toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (col: "label" | "count") => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const indicator = (col: "label" | "count") =>
    sortCol === col ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div data-ocid={`${ocidPrefix}.section`}>
      <h3 className="text-sm font-bold mb-2 font-mono" style={{ color: GOLD }}>
        {title}
      </h3>
      <div className="rounded-lg overflow-hidden" style={CARD_STYLE}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={TH_STYLE}
                onClick={() => toggleSort("label")}
                scope="col"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSort("label");
                  }
                }}
                data-ocid={`${ocidPrefix}.col1_sort`}
              >
                {col1}
                {indicator("label")}
              </th>
              <th
                style={{ ...TH_STYLE, textAlign: "right" as const }}
                onClick={() => toggleSort("count")}
                scope="col"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSort("count");
                  }
                }}
                data-ocid={`${ocidPrefix}.col2_sort`}
              >
                {col2}
                {indicator("count")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ ...TD_STYLE, color: "#8a9bb5", textAlign: "center" }}
                  data-ocid={`${ocidPrefix}.empty_state`}
                >
                  No data yet
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.label}
                  style={{
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                  data-ocid={`${ocidPrefix}.item.${i + 1}`}
                >
                  <td style={TD_STYLE}>{row.label}</td>
                  <td
                    style={{
                      ...TD_STYLE,
                      textAlign: "right",
                      color: GOLD,
                      fontWeight: 600,
                    }}
                  >
                    {row.count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TeacherRow {
  username: string;
  fullName: string;
  studentCount: number;
}

interface StudioRow {
  userName: string;
  fullName: string;
  teacherCount: number;
  studentCount: number;
}

interface ParentRow {
  username: string;
  fullName: string;
  studentCount: number;
}

type TeacherSortCol = "fullName" | "studentCount";
type StudioSortCol = "userName" | "fullName" | "teacherCount" | "studentCount";
type ParentSortCol = "username" | "fullName" | "studentCount";

function SortableTeachersTable({
  rows,
  ocidPrefix,
}: {
  rows: TeacherRow[];
  ocidPrefix: string;
}) {
  const [sortCol, setSortCol] = useState<TeacherSortCol>("studentCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...rows].sort((a, b) => {
    const aVal =
      sortCol === "studentCount" ? a.studentCount : a[sortCol].toLowerCase();
    const bVal =
      sortCol === "studentCount" ? b.studentCount : b[sortCol].toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggle = (col: TeacherSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };
  const ind = (col: TeacherSortCol) =>
    sortCol === col ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div data-ocid={`${ocidPrefix}.section`}>
      <h3 className="text-sm font-bold mb-2 font-mono" style={{ color: GOLD }}>
        Teachers by Student Count
      </h3>
      <div className="rounded-lg overflow-hidden" style={CARD_STYLE}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {(["Full Name", "Students"] as const).map((h, i) => {
                const cols: TeacherSortCol[] = ["fullName", "studentCount"];
                const col = cols[i];
                return (
                  <th
                    key={h}
                    style={{
                      ...TH_STYLE,
                      textAlign: i === 1 ? "right" : "left",
                    }}
                    onClick={() => toggle(col)}
                    scope="col"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(col);
                      }
                    }}
                    data-ocid={`${ocidPrefix}.col${i + 1}_sort`}
                  >
                    {h}
                    {ind(col)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ ...TD_STYLE, color: "#8a9bb5", textAlign: "center" }}
                  data-ocid={`${ocidPrefix}.empty_state`}
                >
                  No data yet
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.username}
                  style={{
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                  data-ocid={`${ocidPrefix}.item.${i + 1}`}
                >
                  <td style={TD_STYLE}>{row.fullName || "—"}</td>
                  <td
                    style={{
                      ...TD_STYLE,
                      textAlign: "right",
                      color: GOLD,
                      fontWeight: 600,
                    }}
                  >
                    {row.studentCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableStudiosTable({
  rows,
  ocidPrefix,
}: {
  rows: StudioRow[];
  ocidPrefix: string;
}) {
  const [sortCol, setSortCol] = useState<StudioSortCol>("studentCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...rows].sort((a, b) => {
    const aVal =
      sortCol === "teacherCount" || sortCol === "studentCount"
        ? a[sortCol]
        : a[sortCol].toLowerCase();
    const bVal =
      sortCol === "teacherCount" || sortCol === "studentCount"
        ? b[sortCol]
        : b[sortCol].toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggle = (col: StudioSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };
  const ind = (col: StudioSortCol) =>
    sortCol === col ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div data-ocid={`${ocidPrefix}.section`}>
      <h3 className="text-sm font-bold mb-2 font-mono" style={{ color: GOLD }}>
        Studios
      </h3>
      <div className="rounded-lg overflow-hidden" style={CARD_STYLE}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {(
                ["userName", "Studio Name", "Teachers", "Students"] as const
              ).map((h, i) => {
                const cols: StudioSortCol[] = [
                  "userName",
                  "fullName",
                  "teacherCount",
                  "studentCount",
                ];
                return (
                  <th
                    key={h}
                    style={{
                      ...TH_STYLE,
                      textAlign: i >= 2 ? "right" : "left",
                    }}
                    onClick={() => toggle(cols[i])}
                    scope="col"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(cols[i]);
                      }
                    }}
                    data-ocid={`${ocidPrefix}.col${i + 1}_sort`}
                  >
                    {h}
                    {ind(cols[i])}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ ...TD_STYLE, color: "#8a9bb5", textAlign: "center" }}
                  data-ocid={`${ocidPrefix}.empty_state`}
                >
                  No data yet
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.userName}
                  style={{
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                  data-ocid={`${ocidPrefix}.item.${i + 1}`}
                >
                  <td
                    style={{
                      ...TD_STYLE,
                      color: GOLD,
                      fontFamily: "monospace",
                    }}
                  >
                    {row.userName}
                  </td>
                  <td style={TD_STYLE}>{row.fullName || "—"}</td>
                  <td
                    style={{
                      ...TD_STYLE,
                      textAlign: "right",
                      color: GOLD,
                      fontWeight: 600,
                    }}
                  >
                    {row.teacherCount}
                  </td>
                  <td
                    style={{
                      ...TD_STYLE,
                      textAlign: "right",
                      color: GOLD,
                      fontWeight: 600,
                    }}
                  >
                    {row.studentCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableParentsTable({
  rows,
  ocidPrefix,
}: {
  rows: ParentRow[];
  ocidPrefix: string;
}) {
  const [sortCol, setSortCol] = useState<ParentSortCol>("studentCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...rows].sort((a, b) => {
    const aVal =
      sortCol === "studentCount" ? a.studentCount : a[sortCol].toLowerCase();
    const bVal =
      sortCol === "studentCount" ? b.studentCount : b[sortCol].toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggle = (col: ParentSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };
  const ind = (col: ParentSortCol) =>
    sortCol === col ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div data-ocid={`${ocidPrefix}.section`}>
      <h3 className="text-sm font-bold mb-2 font-mono" style={{ color: GOLD }}>
        Parents by Student Count
      </h3>
      <div className="rounded-lg overflow-hidden" style={CARD_STYLE}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {(["username", "Full Name", "Students"] as const).map((h, i) => {
                const cols: ParentSortCol[] = [
                  "username",
                  "fullName",
                  "studentCount",
                ];
                return (
                  <th
                    key={h}
                    style={{
                      ...TH_STYLE,
                      textAlign: i === 2 ? "right" : "left",
                    }}
                    onClick={() => toggle(cols[i])}
                    scope="col"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(cols[i]);
                      }
                    }}
                    data-ocid={`${ocidPrefix}.col${i + 1}_sort`}
                  >
                    {h}
                    {ind(cols[i])}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{ ...TD_STYLE, color: "#8a9bb5", textAlign: "center" }}
                  data-ocid={`${ocidPrefix}.empty_state`}
                >
                  No data yet
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.username}
                  style={{
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                  data-ocid={`${ocidPrefix}.item.${i + 1}`}
                >
                  <td
                    style={{
                      ...TD_STYLE,
                      color: GOLD,
                      fontFamily: "monospace",
                    }}
                  >
                    {row.username}
                  </td>
                  <td style={TD_STYLE}>{row.fullName || "—"}</td>
                  <td
                    style={{
                      ...TD_STYLE,
                      textAlign: "right",
                      color: GOLD,
                      fontWeight: 600,
                    }}
                  >
                    {row.studentCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Studio Analytics Section ────────────────────────────────────────────────

export function StudioAnalytics({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(true);
  const [teacherRows, setTeacherRows] = useState<TeacherRow[]>([]);
  const [instrumentRows, setInstrumentRows] = useState<KVRow[]>([]);
  const [skillRows, setSkillRows] = useState<KVRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const actor = getActor();
        const [
          allProfiles,
          allStudentDetails,
          allTeacherDetails,
          allEnrollments,
        ] = await Promise.all([
          actor.getAllProfiles(),
          actor.getAllStudentDetails(),
          actor.getAllTeacherDetails(),
          actor.getAllEnrollments(),
        ]);

        if (cancelled) return;

        const profileMap = new Map(allProfiles.map(([u, p]) => [u, p]));
        const _teacherDetailMap = new Map(
          allTeacherDetails.map(([u, d]) => [u, d]),
        );

        // Teachers affiliated with this studio via teacherStudioAffiliations
        const allAffiliations = await actor.getAllTeacherStudioAffiliations();
        const myTeacherUsernames = new Set(
          allAffiliations
            .filter((a) => a.studioUserName === profile.username)
            .map((a) => a.teacherUserName),
        );
        const myTeachers = allProfiles.filter(
          ([u, p]) => p.role === "Teacher" && myTeacherUsernames.has(u),
        );
        const myTeacherSet = new Set(myTeachers.map(([u]) => u));

        // Students affiliated with this studio's teachers via enrollments
        const myStudentUsernames = new Set(
          allEnrollments
            .filter((e) => myTeacherSet.has(e.teacherUserName))
            .map((e) => e.studentUserName),
        );

        // Teacher rows with student counts from enrollments
        const tRows: TeacherRow[] = myTeachers.map(([u, p]) => ({
          username: u,
          fullName: p.fullName,
          studentCount: allEnrollments.filter((e) => e.teacherUserName === u)
            .length,
        }));

        // Student detail breakdowns via enrollments (only studio's students)
        const myEnrollments = allEnrollments.filter((e) =>
          myStudentUsernames.has(e.studentUserName),
        );

        const instrMap = new Map<string, number>();
        const skillMap = new Map<string, number>();
        for (const e of myEnrollments) {
          if (e.instrument) {
            for (const instr of e.instrument
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)) {
              instrMap.set(instr, (instrMap.get(instr) ?? 0) + 1);
            }
          }
          if (e.skillLevel)
            skillMap.set(e.skillLevel, (skillMap.get(e.skillLevel) ?? 0) + 1);
        }

        // suppress unused var warning
        void allStudentDetails;

        // suppress unused var warning
        void profileMap;

        setTeacherRows(tRows);
        setInstrumentRows(
          [...instrMap.entries()].map(([label, count]) => ({ label, count })),
        );
        setSkillRows(
          [...skillMap.entries()].map(([label, count]) => ({ label, count })),
        );
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile.username]);

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 py-3 text-sm"
        style={{ color: "#8a9bb5" }}
        data-ocid="dashboard.studio.analytics.loading_state"
      >
        <span className="animate-spin inline-block">⟳</span> Loading analytics…
      </div>
    );
  }

  return (
    <div
      className="mt-8 flex flex-col gap-6"
      data-ocid="dashboard.studio.analytics.section"
    >
      <h2
        className="text-base font-bold font-mono"
        style={{
          color: GOLD,
          borderBottom: "1px solid rgba(201,168,76,0.25)",
          paddingBottom: "8px",
        }}
      >
        Studio Analytics
      </h2>
      <SortableTeachersTable
        rows={teacherRows}
        ocidPrefix="dashboard.studio.teachers_table"
      />
      <SortableKVTable
        title="Students by Instrument"
        rows={instrumentRows}
        col1="Instrument"
        col2="Count"
        ocidPrefix="dashboard.studio.instrument_table"
      />
      <SortableKVTable
        title="Students by Skill Level"
        rows={skillRows}
        col1="Skill Level"
        col2="Count"
        ocidPrefix="dashboard.studio.skill_table"
      />
    </div>
  );
}

// ─── Teacher Analytics Section ───────────────────────────────────────────────

export function TeacherAnalytics({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(true);
  const [instrumentRows, setInstrumentRows] = useState<KVRow[]>([]);
  const [skillRows, setSkillRows] = useState<KVRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const actor = getActor();
        const allEnrollments = await actor.getAllEnrollments();

        if (cancelled) return;

        const myEnrollments = allEnrollments.filter(
          (e) => e.teacherUserName === profile.username,
        );

        const instrMap = new Map<string, number>();
        const skillMap = new Map<string, number>();
        for (const e of myEnrollments) {
          if (e.instrument) {
            for (const instr of e.instrument
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)) {
              instrMap.set(instr, (instrMap.get(instr) ?? 0) + 1);
            }
          }
          if (e.skillLevel)
            skillMap.set(e.skillLevel, (skillMap.get(e.skillLevel) ?? 0) + 1);
        }

        setInstrumentRows(
          [...instrMap.entries()].map(([label, count]) => ({ label, count })),
        );
        setSkillRows(
          [...skillMap.entries()].map(([label, count]) => ({ label, count })),
        );
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile.username]);

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 py-3 text-sm"
        style={{ color: "#8a9bb5" }}
        data-ocid="dashboard.teacher.analytics.loading_state"
      >
        <span className="animate-spin inline-block">⟳</span> Loading analytics…
      </div>
    );
  }

  return (
    <div
      className="mt-8 flex flex-col gap-6"
      data-ocid="dashboard.teacher.analytics.section"
    >
      <h2
        className="text-base font-bold font-mono"
        style={{
          color: GOLD,
          borderBottom: "1px solid rgba(201,168,76,0.25)",
          paddingBottom: "8px",
        }}
      >
        My Student Analytics
      </h2>
      <SortableKVTable
        title="Students by Instrument"
        rows={instrumentRows}
        col1="Instrument"
        col2="Count"
        ocidPrefix="dashboard.teacher.instrument_table"
      />
      <SortableKVTable
        title="Students by Skill Level"
        rows={skillRows}
        col1="Skill Level"
        col2="Count"
        ocidPrefix="dashboard.teacher.skill_table"
      />
    </div>
  );
}

// ─── Admin Analytics Section ─────────────────────────────────────────────────

interface AdminCounts {
  totalStudios: number;
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
}

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<AdminCounts>({
    totalStudios: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
  });
  const [studioRows, setStudioRows] = useState<StudioRow[]>([]);
  const [teacherRows, setTeacherRows] = useState<TeacherRow[]>([]);
  const [parentRows, setParentRows] = useState<ParentRow[]>([]);
  const [instrumentRows, setInstrumentRows] = useState<KVRow[]>([]);
  const [skillRows, setSkillRows] = useState<KVRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const actor = getActor();
        const [allProfiles, allStudentDetails, _allStudioDetails] =
          await Promise.all([
            actor.getAllProfiles(),
            actor.getAllStudentDetails(),
            actor.getAllStudioDetails(),
          ]);

        if (cancelled) return;

        const profileMap = new Map(allProfiles.map(([u, p]) => [u, p]));

        const studios = allProfiles.filter(([, p]) => p.role === "Studio");
        const teachers = allProfiles.filter(([, p]) => p.role === "Teacher");
        const students = allProfiles.filter(([, p]) => p.role === "Student");
        const parents = allProfiles.filter(([, p]) => p.role === "Parent");

        setCounts({
          totalStudios: studios.length,
          totalTeachers: teachers.length,
          totalStudents: students.length,
          totalParents: parents.length,
        });

        // Studios table
        const allEnrollments = await actor.getAllEnrollments();
        const parentStudents = await actor.getAllParentStudents();

        const allAffiliations = await actor.getAllTeacherStudioAffiliations();
        const sRows: StudioRow[] = studios.map(([u]) => {
          const teacherUnames = new Set(
            allAffiliations
              .filter((a) => a.studioUserName === u)
              .map((a) => a.teacherUserName),
          );
          const teacherCount = teacherUnames.size;
          const studentCount = new Set(
            allEnrollments
              .filter((e) => teacherUnames.has(e.teacherUserName))
              .map((e) => e.studentUserName),
          ).size;
          return {
            userName: u,
            fullName: profileMap.get(u)?.fullName ?? "",
            teacherCount,
            studentCount,
          };
        });

        // Teachers table
        const _teacherDetailMap = new Map(
          (await actor.getAllTeacherDetails()).map(([u, d]) => [u, d]),
        );
        const tRows: TeacherRow[] = teachers.map(([u, p]) => ({
          username: u,
          fullName: p.fullName,
          studentCount: allEnrollments.filter((e) => e.teacherUserName === u)
            .length,
        }));

        // Parents table
        const pRows: ParentRow[] = parents.map(([u, p]) => {
          const studentCount = parentStudents.filter(
            (ps) => ps.parentUserName === u,
          ).length;
          return { username: u, fullName: p.fullName, studentCount };
        });

        // Instrument breakdown via enrollments
        const instrMap = new Map<string, number>();
        const skillMap = new Map<string, number>();
        for (const e of allEnrollments) {
          if (e.instrument) {
            for (const instr of e.instrument
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)) {
              instrMap.set(instr, (instrMap.get(instr) ?? 0) + 1);
            }
          }
          if (e.skillLevel)
            skillMap.set(e.skillLevel, (skillMap.get(e.skillLevel) ?? 0) + 1);
        }
        void allStudentDetails;

        setStudioRows(sRows);
        setTeacherRows(tRows);
        setParentRows(pRows);
        setInstrumentRows(
          [...instrMap.entries()].map(([label, count]) => ({ label, count })),
        );
        setSkillRows(
          [...skillMap.entries()].map(([label, count]) => ({ label, count })),
        );
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    { label: "Total Studios", value: counts.totalStudios, icon: "🏛" },
    { label: "Total Teachers", value: counts.totalTeachers, icon: "🎓" },
    { label: "Total Students", value: counts.totalStudents, icon: "📚" },
    { label: "Total Parents", value: counts.totalParents, icon: "👨‍👩‍👦" },
  ];

  return (
    <div
      className="w-full flex flex-col gap-6"
      data-ocid="dashboard.admin.analytics.section"
    >
      <h2
        className="text-base font-bold font-mono"
        style={{
          color: GOLD,
          borderBottom: "1px solid rgba(201,168,76,0.25)",
          paddingBottom: "8px",
        }}
      >
        System Analytics
      </h2>

      {loading ? (
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "#8a9bb5" }}
          data-ocid="dashboard.admin.analytics.loading_state"
        >
          <span className="animate-spin inline-block">⟳</span> Loading
          analytics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((c) => (
              <div
                key={c.label}
                className="rounded-xl p-4 flex flex-col gap-1"
                style={CARD_STYLE}
                data-ocid={`dashboard.admin.stat.${c.label.replace(/ /g, "_").toLowerCase()}`}
              >
                <div className="text-xl">{c.icon}</div>
                <div className="text-2xl font-bold" style={{ color: GOLD }}>
                  {c.value}
                </div>
                <div className="text-xs" style={{ color: "#8a9bb5" }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
          <SortableStudiosTable
            rows={studioRows}
            ocidPrefix="dashboard.admin.studios_table"
          />
          <SortableTeachersTable
            rows={teacherRows}
            ocidPrefix="dashboard.admin.teachers_table"
          />
          <SortableKVTable
            title="Students by Instrument"
            rows={instrumentRows}
            col1="Instrument"
            col2="Count"
            ocidPrefix="dashboard.admin.instrument_table"
          />
          <SortableKVTable
            title="Students by Skill Level"
            rows={skillRows}
            col1="Skill Level"
            col2="Count"
            ocidPrefix="dashboard.admin.skill_table"
          />
          <SortableParentsTable
            rows={parentRows}
            ocidPrefix="dashboard.admin.parents_table"
          />
        </>
      )}
    </div>
  );
}
