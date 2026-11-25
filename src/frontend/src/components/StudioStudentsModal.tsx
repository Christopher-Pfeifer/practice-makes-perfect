import type { Profile, StudentEnrollment } from "@/backend";
import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

interface StudioStudentsModalProps {
  studioFullName: string;
  onClose: () => void;
}

interface StudentRow {
  userName: string;
  fullName: string;
  teacherUserName: string;
  teacherFullName: string;
  instrument: string;
  voiceType: string;
  ensembleParticipation: string;
  skillLevel: string;
  theoryLevel: string;
  practiceGoals: string;
  notes: string;
  studioName: string;
  rawInstruments: string[];
  rawEnsembles: string[];
}

export default function StudioStudentsModal({
  studioFullName,
  onClose,
}: StudioStudentsModalProps) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterInstrument, setFilterInstrument] = useState("All Instruments");
  const [filterEnsemble, setFilterEnsemble] = useState("All Ensembles");

  useEffect(() => {
    setExpandedId(null);
    setFilterInstrument("All Instruments");
    setFilterEnsemble("All Ensembles");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [allEnrollments, allProfiles] = await Promise.all([
          getActor().getAllEnrollments(),
          getActor().getAllProfiles(),
        ]);

        const profileMap = new Map<string, Profile>();
        for (const [u, p] of allProfiles) {
          profileMap.set(u, p);
        }

        const studioEnrollments = allEnrollments.filter(
          (e) => e.studioName === studioFullName,
        );

        const rows: StudentRow[] = studioEnrollments.map((e) => {
          const studentProfile = profileMap.get(e.studentUserName);
          const teacherProfile = profileMap.get(e.teacherUserName);
          return {
            userName: e.studentUserName,
            fullName: studentProfile?.fullName ?? e.studentUserName,
            teacherUserName: e.teacherUserName,
            teacherFullName: teacherProfile?.fullName ?? e.teacherUserName,
            instrument: e.instrument,
            voiceType: e.voiceType,
            ensembleParticipation: e.ensembleParticipation,
            skillLevel: e.skillLevel,
            theoryLevel: e.theoryLevel,
            practiceGoals: e.practiceGoals,
            notes: e.notes,
            studioName: e.studioName,
            rawInstruments: e.instrument ? [e.instrument] : [],
            rawEnsembles: e.ensembleParticipation
              ? e.ensembleParticipation.split("|").filter(Boolean)
              : [],
          };
        });

        setRows(rows);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studioFullName]);

  // Unique filter options
  const allInstruments = Array.from(
    new Set(rows.flatMap((r) => r.rawInstruments)),
  ).sort();
  const allEnsembles = Array.from(
    new Set(rows.flatMap((r) => r.rawEnsembles)),
  ).sort();

  const visibleRows = rows.filter((r) => {
    if (
      filterInstrument !== "All Instruments" &&
      !r.rawInstruments.includes(filterInstrument)
    )
      return false;
    if (
      filterEnsemble !== "All Ensembles" &&
      !r.rawEnsembles.includes(filterEnsemble)
    )
      return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="studio-students.dialog"
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
            Students — {studioFullName}
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
            data-ocid="studio-students.close_button"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Filters */}
          {!loading && rows.length > 0 && (
            <div
              className="flex gap-2 mb-3 items-center"
              data-ocid="studio-students.filter.section"
            >
              <span style={{ color: "#c9a84c", fontSize: 12, fontWeight: 600 }}>
                Filter:
              </span>
              <select
                value={filterInstrument}
                onChange={(e) => setFilterInstrument(e.target.value)}
                style={{
                  background: "#0f1729",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#c0cedf",
                  fontSize: 12,
                  borderRadius: 4,
                  padding: "3px 8px",
                }}
                data-ocid="studio-students.instrument_filter.select"
              >
                <option>All Instruments</option>
                {allInstruments.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
              <select
                value={filterEnsemble}
                onChange={(e) => setFilterEnsemble(e.target.value)}
                style={{
                  background: "#0f1729",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#c0cedf",
                  fontSize: 12,
                  borderRadius: 4,
                  padding: "3px 8px",
                }}
                data-ocid="studio-students.ensemble_filter.select"
              >
                <option>All Ensembles</option>
                {allEnsembles.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
              {(filterInstrument !== "All Instruments" ||
                filterEnsemble !== "All Ensembles") && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterInstrument("All Instruments");
                    setFilterEnsemble("All Ensembles");
                  }}
                  style={{
                    color: "#8a9bb5",
                    fontSize: 11,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  data-ocid="studio-students.filter_clear.button"
                >
                  clear
                </button>
              )}
            </div>
          )}
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-students.loading_state"
            >
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-students.empty_state"
            >
              No students found for this studio.
            </div>
          ) : visibleRows.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-students.filter_empty_state"
            >
              No students match the selected filters.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleRows.map((row, idx) => {
                const expanded = expandedId === row.userName;
                return (
                  <div
                    key={row.userName}
                    className="rounded-lg overflow-hidden"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.15)",
                    }}
                    data-ocid={`studio-students.item.${idx + 1}`}
                  >
                    <button
                      type="button"
                      className="w-full px-4 py-3 flex items-center gap-3 text-left"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpandedId(expanded ? null : row.userName)
                      }
                      aria-expanded={expanded}
                      data-ocid={`studio-students.toggle.${idx + 1}`}
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
                        <div className="text-xs" style={{ color: "#4a5c75" }}>
                          Teacher: {row.teacherFullName || "—"}
                        </div>
                        {row.instrument && (
                          <div className="text-xs" style={{ color: "#8a9bb5" }}>
                            <span style={{ color: "#4a5c75" }}>
                              Instrument:
                            </span>{" "}
                            {row.instrument}
                          </div>
                        )}
                        {row.studioName && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: "#c9a84c",
                              border: "1px solid rgba(201,168,76,0.3)",
                            }}
                          >
                            {row.studioName}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          color: "#4a5c75",
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        {expanded ? "▲" : "▼"}
                      </span>
                    </button>
                    {expanded && (
                      <div
                        className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 pb-3"
                        style={{
                          borderTop: "1px solid rgba(201,168,76,0.1)",
                          paddingTop: 8,
                        }}
                      >
                        {row.voiceType && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Voice Type
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.voiceType}
                            </span>
                          </>
                        )}
                        {row.skillLevel && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Skill Level
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.skillLevel}
                            </span>
                          </>
                        )}
                        {row.theoryLevel && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Theory Level
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.theoryLevel}
                            </span>
                          </>
                        )}
                        {row.ensembleParticipation && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Ensembles
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.ensembleParticipation}
                            </span>
                          </>
                        )}
                        {row.practiceGoals && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Practice Goals
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.practiceGoals}
                            </span>
                          </>
                        )}
                        {row.notes && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Notes
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.notes}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
            data-ocid="studio-students.cancel_button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
