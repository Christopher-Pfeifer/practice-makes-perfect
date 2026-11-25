import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

interface StudioTeachersModalProps {
  studioUsername: string;
  onClose: () => void;
}

interface TeacherRow {
  userName: string;
  fullName: string;
  instruments: string;
  bio: string;
  yearsExperience: string;
  certifications: string;
  phone: string;
  email: string;
  notes: string;
}

export default function StudioTeachersModal({
  studioUsername,
  onClose,
}: StudioTeachersModalProps) {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [allProfiles, allTeacherDetails, affiliations] =
          await Promise.all([
            getActor().getAllProfiles(),
            getActor().getAllTeacherDetails(),
            getActor().getStudioTeacherAffiliations(studioUsername),
          ]);
        const affiliatedUserNames = new Set(
          affiliations.map((a) => a.teacherUserName),
        );
        const detailMap = new Map(allTeacherDetails.map(([u, d]) => [u, d]));
        const teachers = allProfiles
          .filter(
            ([u, p]) => p.role === "Teacher" && affiliatedUserNames.has(u),
          )
          .map(([u, p]) => {
            const d = detailMap.get(u);
            return {
              userName: u,
              fullName: p.fullName,
              instruments: d?.instruments?.replace(/\|/g, ", ") ?? "",
              bio: d?.bio ?? "",
              yearsExperience: d?.yearsExperience ?? "",
              certifications: d?.certifications?.replace(/\|/g, ", ") ?? "",
              phone: p.phone ?? "",
              email: p.email ?? "",
              notes: d?.notes ?? "",
            };
          });
        setRows(teachers);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studioUsername]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="studio-teachers.dialog"
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
            Teachers
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
            data-ocid="studio-teachers.close_button"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-teachers.loading_state"
            >
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-teachers.empty_state"
            >
              No teachers affiliated with this studio yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rows.map((row, idx) => {
                const expanded = expandedId === row.userName;
                return (
                  <div
                    key={row.userName}
                    className="rounded-lg overflow-hidden"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.15)",
                    }}
                    data-ocid={`studio-teachers.item.${idx + 1}`}
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
                      data-ocid={`studio-teachers.toggle.${idx + 1}`}
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
                        {row.instruments && (
                          <div className="text-xs" style={{ color: "#8a9bb5" }}>
                            <span style={{ color: "#4a5c75" }}>
                              Instruments:
                            </span>{" "}
                            {row.instruments}
                          </div>
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
                        {row.yearsExperience && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Experience
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.yearsExperience} yrs
                            </span>
                          </>
                        )}
                        {row.certifications && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Certifications
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.certifications}
                            </span>
                          </>
                        )}
                        {row.phone && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Phone
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.phone}
                            </span>
                          </>
                        )}
                        {row.email && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Email
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.email}
                            </span>
                          </>
                        )}
                        {row.bio && (
                          <>
                            <span style={{ color: "#4a5c75", fontSize: 11 }}>
                              Bio
                            </span>
                            <span style={{ color: "#c0cedf", fontSize: 11 }}>
                              {row.bio}
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
            data-ocid="studio-teachers.cancel_button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
