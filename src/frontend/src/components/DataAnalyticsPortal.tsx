import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

// Re-export reusable tables from AnalyticsTables — import them directly
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

function KVTable({
  title,
  rows,
  col1,
  col2,
  ocid,
}: {
  title: string;
  rows: { label: string; count: number }[];
  col1: string;
  col2: string;
  ocid: string;
}) {
  const [sortCol, setSortCol] = useState<"label" | "count">("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...rows].sort((a, b) => {
    const av = sortCol === "count" ? a.count : a.label.toLowerCase();
    const bv = sortCol === "count" ? b.count : b.label.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  const toggle = (col: "label" | "count") => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };
  const ind = (col: "label" | "count") =>
    sortCol === col ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div data-ocid={`${ocid}.section`}>
      <h3
        style={{
          color: GOLD,
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 8,
          fontFamily: "monospace",
        }}
      >
        {title}
      </h3>
      <div className="rounded-lg overflow-hidden" style={CARD_STYLE}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={TH_STYLE}
                onClick={() => toggle("label")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggle("label");
                }}
                scope="col"
                data-ocid={`${ocid}.col1_sort`}
              >
                {col1}
                {ind("label")}
              </th>
              <th
                style={{ ...TH_STYLE, textAlign: "right" }}
                onClick={() => toggle("count")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggle("count");
                }}
                scope="col"
                data-ocid={`${ocid}.col2_sort`}
              >
                {col2}
                {ind("count")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ ...TD_STYLE, color: "#8a9bb5", textAlign: "center" }}
                  data-ocid={`${ocid}.empty_state`}
                >
                  No data
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
                  data-ocid={`${ocid}.item.${i + 1}`}
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

function SectionHeader({ children }: { children: string }) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(201,168,76,0.25)",
        marginBottom: 16,
        paddingBottom: 6,
      }}
    >
      <h2
        style={{
          color: GOLD,
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        📊 {children}
      </h2>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        background: "#1a2540",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: 10,
        padding: "16px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: GOLD,
          fontSize: 28,
          fontWeight: 800,
          fontFamily: "monospace",
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "#8a9bb5",
          fontSize: 11,
          marginTop: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

interface AnalyticsData {
  // Totals
  totalStudios: number;
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  unaffiliatedTeachers: number;
  studentsWithParent: number;
  studentsWithoutParent: number;
  // Averages
  avgStudentsPerTeacher: string;
  avgTeachersPerStudio: string;
  // Breakdown tables
  teachersByStudio: { label: string; count: number }[];
  studentsByTeacher: { label: string; count: number }[];
  studentsByStudio: { label: string; count: number }[];
  instrumentDist: { label: string; count: number }[];
  ensembleDist: { label: string; count: number }[];
  skillLevelDist: { label: string; count: number }[];
  theoryLevelDist: { label: string; count: number }[];
  voiceTypeDist: { label: string; count: number }[];
}

async function loadAnalytics(): Promise<AnalyticsData> {
  const actor = getActor();
  const [profiles, studentDetails, teacherDetails, _studioDetails] =
    await Promise.all([
      actor.getAllProfiles(),
      actor.getAllStudentDetails(),
      actor.getAllTeacherDetails(),
      actor.getAllStudioDetails(),
    ]);

  const studios = profiles.filter(([, p]) => p.role === "Studio");
  const teachers = profiles.filter(([, p]) => p.role === "Teacher");
  const students = profiles.filter(([, p]) => p.role === "Student");
  const parents = profiles.filter(([, p]) => p.role === "Parent");

  const profileMap = new Map(profiles.map(([u, p]) => [u, p]));
  const teacherDetailMap = new Map(teacherDetails.map(([u, d]) => [u, d]));
  const studentDetailMap = new Map(studentDetails.map(([u, d]) => [u, d]));

  // Fetch affiliations and enrollments
  const [allEnrollments, allAffiliations] = await Promise.all([
    actor.getAllEnrollments(),
    actor.getAllTeacherStudioAffiliations(),
  ]);

  // Teachers per studio (via affiliations — one teacher can have multiple studios)
  const teachersByStudioMap = new Map<string, number>();
  for (const a of allAffiliations) {
    const key = a.studioName || a.studioUserName || "Unaffiliated";
    teachersByStudioMap.set(key, (teachersByStudioMap.get(key) ?? 0) + 1);
  }
  const teachersByStudio = Array.from(teachersByStudioMap.entries()).map(
    ([k, v]) => ({ label: k, count: v }),
  );

  // Students per teacher (via enrollments)
  const studentsByTeacherMap = new Map<string, number>();
  for (const e of allEnrollments) {
    if (e.teacherUserName) {
      studentsByTeacherMap.set(
        e.teacherUserName,
        (studentsByTeacherMap.get(e.teacherUserName) ?? 0) + 1,
      );
    }
  }
  const studentsByTeacher = Array.from(studentsByTeacherMap.entries()).map(
    ([k, v]) => {
      const teacherName = profileMap.get(k)?.fullName || k;
      return {
        label: teacherName,
        count: v,
      };
    },
  );

  // Students per studio (via enrollment.studioName)
  const studentsByStudioMap = new Map<string, number>();
  for (const e of allEnrollments) {
    const studio = e.studioName || "Independent";
    studentsByStudioMap.set(studio, (studentsByStudioMap.get(studio) ?? 0) + 1);
  }
  const studentsByStudio = Array.from(studentsByStudioMap.entries()).map(
    ([k, v]) => ({ label: k, count: v }),
  );

  // Instrument distribution via enrollments
  const instrMap = new Map<string, number>();
  for (const e of allEnrollments) {
    if (e.instrument) {
      for (const instr of e.instrument
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)) {
        instrMap.set(instr, (instrMap.get(instr) ?? 0) + 1);
      }
    }
  }
  const instrumentDist = Array.from(instrMap.entries()).map(
    ([label, count]) => ({ label, count }),
  );

  // Ensemble distribution via enrollments
  const ensMap = new Map<string, number>();
  for (const e of allEnrollments) {
    if (e.ensembleParticipation) {
      for (const ens of e.ensembleParticipation
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)) {
        ensMap.set(ens, (ensMap.get(ens) ?? 0) + 1);
      }
    }
  }
  const ensembleDist = Array.from(ensMap.entries()).map(([label, count]) => ({
    label,
    count,
  }));

  // Skill level distribution via enrollments
  const skillMap = new Map<string, number>();
  for (const e of allEnrollments) {
    const skill = e.skillLevel?.trim() || "Unknown";
    skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1);
  }
  const skillLevelDist = Array.from(skillMap.entries()).map(
    ([label, count]) => ({ label, count }),
  );

  // Theory level distribution via enrollments
  const theoryMap = new Map<string, number>();
  for (const e of allEnrollments) {
    const theory = e.theoryLevel?.trim() || "Unknown";
    theoryMap.set(theory, (theoryMap.get(theory) ?? 0) + 1);
  }
  const theoryLevelDist = Array.from(theoryMap.entries()).map(
    ([label, count]) => ({ label, count }),
  );

  // Voice type distribution via enrollments (non-empty only)
  const voiceMap = new Map<string, number>();
  for (const e of allEnrollments) {
    if (e.voiceType?.trim()) {
      voiceMap.set(
        e.voiceType.trim(),
        (voiceMap.get(e.voiceType.trim()) ?? 0) + 1,
      );
    }
  }
  const voiceTypeDist = Array.from(voiceMap.entries()).map(
    ([label, count]) => ({ label, count }),
  );

  void studentDetailMap;
  void teacherDetailMap;

  // Unaffiliated teachers = teachers with zero affiliations
  const affiliatedTeacherSet = new Set(
    allAffiliations.map((a) => a.teacherUserName),
  );
  const unaffiliatedTeachers = teachers.filter(
    ([u]) => !affiliatedTeacherSet.has(u),
  ).length;

  // Parent coverage (via relationship table)
  const parentStudents = await actor.getAllParentStudents();
  const studentsWithParentSet = new Set<string>();
  for (const ps of parentStudents) {
    if (ps.studentUserName) {
      studentsWithParentSet.add(ps.studentUserName);
    }
  }
  const studentsWithParent = students.filter(([u]) =>
    studentsWithParentSet.has(u),
  ).length;
  const studentsWithoutParent = students.length - studentsWithParent;

  const tCount = teachers.length;
  const sCount = students.length;
  const stCount = studios.length;

  return {
    totalStudios: stCount,
    totalTeachers: tCount,
    totalStudents: sCount,
    totalParents: parents.length,
    unaffiliatedTeachers,
    studentsWithParent,
    studentsWithoutParent,
    avgStudentsPerTeacher: tCount > 0 ? (sCount / tCount).toFixed(1) : "0",
    avgTeachersPerStudio: stCount > 0 ? (tCount / stCount).toFixed(1) : "0",
    teachersByStudio,
    studentsByTeacher,
    studentsByStudio,
    instrumentDist,
    ensembleDist,
    skillLevelDist,
    theoryLevelDist,
    voiceTypeDist,
  };
}

interface DataAnalyticsPortalProps {
  onClose: () => void;
}

export default function DataAnalyticsPortal({
  onClose,
}: DataAnalyticsPortalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [textFilter, setTextFilter] = useState("");
  const [nameRoleMap, setNameRoleMap] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    async function load() {
      try {
        const actor = getActor();
        const profiles = await actor.getAllProfiles();
        const map = new Map<string, string>();
        for (const [, p] of profiles) {
          map.set(p.username, p.role);
          map.set(p.fullName, p.role);
        }
        setNameRoleMap(map);
        const analytics = await loadAnalytics();
        setData(analytics);
      } catch {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function filterRows(rows: { label: string; count: number }[]) {
    let filtered = rows;
    if (roleFilter !== "All") {
      filtered = filtered.filter((r) => {
        const role = nameRoleMap.get(r.label);
        if (!role) return true;
        return role === roleFilter;
      });
    }
    if (textFilter.trim()) {
      const q = textFilter.toLowerCase();
      filtered = filtered.filter((r) => r.label.toLowerCase().includes(q));
    }
    return filtered;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,22,40,0.92)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="data-analytics.dialog"
    >
      <div
        className="relative rounded-xl w-full mx-4 max-h-[92vh] flex flex-col"
        style={{
          maxWidth: 900,
          background: "#0f1729",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 12px 60px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Gold top bar */}
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
          <div className="flex items-center gap-3">
            <span style={{ color: GOLD, fontSize: 20 }}>📊</span>
            <h2
              className="text-xl font-bold"
              style={{ color: "#f5f0e8", fontFamily: "monospace" }}
            >
              Data Analytics
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none transition-smooth"
            style={{ color: "#4a5c75" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = GOLD;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#4a5c75";
            }}
            aria-label="Close"
            data-ocid="data-analytics.close_button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5" style={{ gap: 0 }}>
          {/* Filters */}
          <div
            className="flex items-center gap-3 mb-5"
            style={{
              background: "#1a2540",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
            }}
            data-ocid="data-analytics.filters"
          >
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md px-2 py-1.5 text-sm"
              style={{
                background: "#0f1729",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#f5f0e8",
              }}
              data-ocid="data-analytics.role_filter"
            >
              <option value="All">All Roles</option>
              <option value="Studio">Studio</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
            </select>
            <input
              type="text"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Filter rows…"
              className="flex-1 rounded-md px-3 py-1.5 text-sm"
              style={{
                background: "#0f1729",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#f5f0e8",
                outline: "none",
              }}
              data-ocid="data-analytics.text_filter"
            />
            {textFilter && (
              <button
                type="button"
                onClick={() => setTextFilter("")}
                className="text-xs"
                style={{ color: "#8a9bb5" }}
                data-ocid="data-analytics.clear_filter"
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div
              className="text-center py-16"
              style={{ color: "#8a9bb5" }}
              data-ocid="data-analytics.loading_state"
            >
              Loading analytics…
            </div>
          ) : error ? (
            <div
              className="text-center py-16"
              style={{ color: "#c0cedf" }}
              data-ocid="data-analytics.error_state"
            >
              {error}
            </div>
          ) : data ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* ── Overview stats ── */}
              <div>
                <SectionHeader>Overview</SectionHeader>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <StatCard label="Studios" value={data.totalStudios} />
                  <StatCard label="Teachers" value={data.totalTeachers} />
                  <StatCard label="Students" value={data.totalStudents} />
                  <StatCard label="Parents" value={data.totalParents} />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                  }}
                >
                  <StatCard
                    label="Avg Students / Teacher"
                    value={data.avgStudentsPerTeacher}
                  />
                  <StatCard
                    label="Avg Teachers / Studio"
                    value={data.avgTeachersPerStudio}
                  />
                  <StatCard
                    label="Unaffiliated Teachers"
                    value={data.unaffiliatedTeachers}
                  />
                </div>
              </div>

              {/* ── Affiliation tables ── */}
              <div>
                <SectionHeader>Affiliations</SectionHeader>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <KVTable
                    title="Teachers per Studio"
                    rows={filterRows(data.teachersByStudio)}
                    col1="Studio"
                    col2="Teachers"
                    ocid="analytics.teachers-per-studio"
                  />
                  <KVTable
                    title="Students per Studio"
                    rows={filterRows(data.studentsByStudio)}
                    col1="Studio"
                    col2="Students"
                    ocid="analytics.students-per-studio"
                  />
                </div>
              </div>

              {/* ── Students per teacher ── */}
              <div>
                <SectionHeader>Students per Teacher</SectionHeader>
                <KVTable
                  title=""
                  rows={filterRows(data.studentsByTeacher)}
                  col1="Teacher"
                  col2="Students"
                  ocid="analytics.students-per-teacher"
                />
              </div>

              {/* ── Parent coverage ── */}
              <div>
                <SectionHeader>Parent Coverage</SectionHeader>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <StatCard
                    label="Students with Parent"
                    value={data.studentsWithParent}
                  />
                  <StatCard
                    label="Students without Parent"
                    value={data.studentsWithoutParent}
                  />
                </div>
              </div>

              {/* ── Instrument distribution ── */}
              <div>
                <SectionHeader>Instrument Distribution</SectionHeader>
                <KVTable
                  title=""
                  rows={filterRows(data.instrumentDist)}
                  col1="Instrument"
                  col2="Students"
                  ocid="analytics.instruments"
                />
              </div>

              {/* ── Ensemble participation ── */}
              <div>
                <SectionHeader>Ensemble Participation</SectionHeader>
                <KVTable
                  title=""
                  rows={filterRows(data.ensembleDist)}
                  col1="Ensemble"
                  col2="Students"
                  ocid="analytics.ensembles"
                />
              </div>

              {/* ── Skill & Theory levels ── */}
              <div>
                <SectionHeader>Skill &amp; Theory Levels</SectionHeader>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <KVTable
                    title="Skill Level"
                    rows={filterRows(data.skillLevelDist)}
                    col1="Level"
                    col2="Students"
                    ocid="analytics.skill-level"
                  />
                  <KVTable
                    title="Theory Level"
                    rows={filterRows(data.theoryLevelDist)}
                    col1="Level"
                    col2="Students"
                    ocid="analytics.theory-level"
                  />
                </div>
              </div>

              {/* ── Voice type ── */}
              {data.voiceTypeDist.length > 0 && (
                <div>
                  <SectionHeader>Voice Type Distribution</SectionHeader>
                  <KVTable
                    title=""
                    rows={filterRows(data.voiceTypeDist)}
                    col1="Voice Type"
                    col2="Students"
                    ocid="analytics.voice-type"
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-smooth"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: GOLD,
            }}
            data-ocid="data-analytics.cancel_button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
