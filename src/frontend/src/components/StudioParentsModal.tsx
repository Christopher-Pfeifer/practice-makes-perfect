import type { Profile } from "@/backend";
import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

interface StudioParentsModalProps {
  onClose: () => void;
}

interface ParentRow {
  username: string;
  fullName: string;
  studentCount: number;
}

export default function StudioParentsModal({
  onClose,
}: StudioParentsModalProps) {
  const [rows, setRows] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const [allProfiles, psPairs]: [
          Array<[string, Profile]>,
          Awaited<ReturnType<typeof actor.getAllParentStudents>>,
        ] = await Promise.all([
          actor.getAllProfiles(),
          actor.getAllParentStudents(),
        ]);
        const parentProfiles = allProfiles.filter(
          ([, p]) => p.role === "Parent",
        );
        const countMap = new Map<string, number>();
        for (const ps of psPairs) {
          countMap.set(
            ps.parentUserName,
            (countMap.get(ps.parentUserName) || 0) + 1,
          );
        }
        setRows(
          parentProfiles.map(([u, p]) => ({
            username: u,
            fullName: p.fullName ?? "",
            studentCount: countMap.get(u) || 0,
          })),
        );
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="studio-parents.dialog"
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
            Parents
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
            data-ocid="studio-parents.close_button"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-parents.loading_state"
            >
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="studio-parents.empty_state"
            >
              No parent records found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rows.map((row, idx) => (
                <div
                  key={row.username}
                  className="rounded-lg px-4 py-3 flex items-center gap-3"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}
                  data-ocid={`studio-parents.item.${idx + 1}`}
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
                  <div>
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
                    {row.studentCount > 0 && (
                      <div className="text-xs" style={{ color: "#8a9bb5" }}>
                        <span style={{ color: "#4a5c75" }}>
                          Linked students:
                        </span>{" "}
                        {row.studentCount}
                      </div>
                    )}
                  </div>
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
            data-ocid="studio-parents.cancel_button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
