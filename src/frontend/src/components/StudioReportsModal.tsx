import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

interface Props {
  profile: UserProfile;
  onClose: () => void;
}

const STAT_CARD: React.CSSProperties = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 10,
  padding: "18px 22px",
  minWidth: 140,
  flex: 1,
};

const TABLE_TH: React.CSSProperties = {
  background: "rgba(201,168,76,0.08)",
  color: "#8a9bb5",
  fontSize: 11,
  fontWeight: 700,
  padding: "7px 12px",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid rgba(201,168,76,0.15)",
};

const TABLE_TD: React.CSSProperties = {
  color: "#c0cedf",
  fontSize: 13,
  padding: "7px 12px",
  borderBottom: "1px solid rgba(201,168,76,0.07)",
};

interface ReportData {
  teacherCount: number;
  studentCount: number;
  lessonCount: number;
  billingCount: number;
  teacherRows: { username: string; fullName: string; studentCount: number }[];
  instrumentDist: { instrument: string; count: number }[];
  skillDist: { skill: string; count: number }[];
}

export default function StudioReportsModal({ profile, onClose }: Props) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
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

        const myStudentUsernames = new Set(
          allProfiles
            .filter(
              ([, p]) =>
                p.role === "Student" &&
                myTeacherUsernames.has(p.teacherAffiliation),
            )
            .map(([u]) => u),
        );

        const teacherProfileMap = new Map(
          allProfiles
            .filter(
              ([, p]) =>
                p.role === "Teacher" &&
                p.studioAffiliation === profile.username,
            )
            .map(([u, p]) => [u, p.fullName]),
        );

        // Count students per teacher
        const studentsByTeacher = new Map<string, number>();
        for (const [, p] of allProfiles) {
          if (
            p.role === "Student" &&
            myTeacherUsernames.has(p.teacherAffiliation)
          ) {
            studentsByTeacher.set(
              p.teacherAffiliation,
              (studentsByTeacher.get(p.teacherAffiliation) ?? 0) + 1,
            );
          }
        }

        const teacherRows = Array.from(myTeacherUsernames)
          .map((u) => ({
            username: u,
            fullName: teacherProfileMap.get(u) ?? u,
            studentCount: studentsByTeacher.get(u) ?? 0,
          }))
          .sort((a, b) => b.studentCount - a.studentCount);

        // Instrument distribution from enrollments
        const allEnrollments = await actor.getAllEnrollments();
        const instrumentMap = new Map<string, number>();
        const skillMap = new Map<string, number>();
        for (const e of allEnrollments) {
          if (!myStudentUsernames.has(e.studentUserName)) continue;
          if (e.instrument) {
            for (const inst of e.instrument.split("|")) {
              const key = inst.trim();
              if (key)
                instrumentMap.set(key, (instrumentMap.get(key) ?? 0) + 1);
            }
          }
          if (e.skillLevel) {
            skillMap.set(e.skillLevel, (skillMap.get(e.skillLevel) ?? 0) + 1);
          }
        }

        // Lesson and billing counts
        const allLessons = await actor.getAllStudentLessons();
        const allBillings = await actor.getAllStudentBillings();
        const lessonCount = allLessons.filter(([, l]) =>
          myStudentUsernames.has(l.studentUsername),
        ).length;
        const billingCount = allBillings.filter(([, b]) =>
          myStudentUsernames.has(b.studentUsername),
        ).length;

        setData({
          teacherCount: myTeacherUsernames.size,
          studentCount: myStudentUsernames.size,
          lessonCount,
          billingCount,
          teacherRows,
          instrumentDist: Array.from(instrumentMap.entries())
            .map(([instrument, count]) => ({ instrument, count }))
            .sort((a, b) => b.count - a.count),
          skillDist: Array.from(skillMap.entries())
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count),
        });
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile.username]);

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
      data-ocid="studio-reports.dialog"
    >
      <div
        style={{
          background: "#0f1729",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 760,
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
            marginBottom: 24,
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
            Studio Reports
          </h2>
          <button
            type="button"
            style={{
              background: "rgba(138,155,181,0.1)",
              border: "1px solid rgba(138,155,181,0.3)",
              color: "#8a9bb5",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              cursor: "pointer",
            }}
            onClick={onClose}
            data-ocid="studio-reports.close_button"
          >
            Close
          </button>
        </div>

        {error && (
          <div
            style={{ color: "#f87171", marginBottom: 12, fontSize: 13 }}
            data-ocid="studio-reports.error_state"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{ color: "#8a9bb5", textAlign: "center", padding: 48 }}
            data-ocid="studio-reports.loading_state"
          >
            Loading report…
          </div>
        ) : data ? (
          <>
            {/* Summary stat cards */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 28,
              }}
            >
              {[
                { label: "Teachers", value: data.teacherCount },
                { label: "Students", value: data.studentCount },
                { label: "Lesson Entries", value: data.lessonCount },
                { label: "Billing Records", value: data.billingCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={STAT_CARD}
                  data-ocid="studio-reports.card"
                >
                  <div
                    style={{
                      color: "#c9a84c",
                      fontSize: 28,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: "#8a9bb5", fontSize: 12, marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Teachers ranked by student count */}
            {data.teacherRows.length > 0 && (
              <>
                <h3
                  style={{
                    color: "#f5f0e8",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Teachers by Student Count
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 24,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={TABLE_TH}>Teacher</th>
                      <th style={TABLE_TH}>Username</th>
                      <th style={{ ...TABLE_TH, textAlign: "right" }}>
                        Students
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teacherRows.map((r, i) => (
                      <tr
                        key={r.username}
                        data-ocid={`studio-reports.item.${i + 1}`}
                      >
                        <td style={TABLE_TD}>{r.fullName}</td>
                        <td
                          style={{
                            ...TABLE_TD,
                            color: "#4a5c75",
                            fontFamily: "monospace",
                          }}
                        >
                          {r.username}
                        </td>
                        <td
                          style={{
                            ...TABLE_TD,
                            textAlign: "right",
                            color: "#c9a84c",
                            fontWeight: 600,
                          }}
                        >
                          {r.studentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Instrument distribution */}
            {data.instrumentDist.length > 0 && (
              <>
                <h3
                  style={{
                    color: "#f5f0e8",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Students by Instrument
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 24,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={TABLE_TH}>Instrument</th>
                      <th style={{ ...TABLE_TH, textAlign: "right" }}>
                        Students
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.instrumentDist.map((r, i) => (
                      <tr
                        key={r.instrument}
                        data-ocid={`studio-reports.instrument.${i + 1}`}
                      >
                        <td style={TABLE_TD}>{r.instrument}</td>
                        <td
                          style={{
                            ...TABLE_TD,
                            textAlign: "right",
                            color: "#c9a84c",
                            fontWeight: 600,
                          }}
                        >
                          {r.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Skill level distribution */}
            {data.skillDist.length > 0 && (
              <>
                <h3
                  style={{
                    color: "#f5f0e8",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Students by Skill Level
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={TABLE_TH}>Skill Level</th>
                      <th style={{ ...TABLE_TH, textAlign: "right" }}>
                        Students
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.skillDist.map((r, i) => (
                      <tr
                        key={r.skill}
                        data-ocid={`studio-reports.skill.${i + 1}`}
                      >
                        <td style={TABLE_TD}>{r.skill}</td>
                        <td
                          style={{
                            ...TABLE_TD,
                            textAlign: "right",
                            color: "#c9a84c",
                            fontWeight: 600,
                          }}
                        >
                          {r.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
