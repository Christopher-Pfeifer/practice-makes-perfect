import type { StudentDetail } from "@/backend";
import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

interface StudentDetailModalProps {
  profile: UserProfile;
  onClose: () => void;
}

const EMPTY: StudentDetail = { notes: "" };

export default function StudentDetailModal({
  profile,
  onClose,
}: StudentDetailModalProps) {
  const [form, setForm] = useState<StudentDetail>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [assignedTeacherName, setAssignedTeacherName] = useState<string | null>(
    null,
  );
  const [showChangeTeacher, setShowChangeTeacher] = useState(false);
  const [teacherOptions, setTeacherOptions] = useState<
    { userName: string; fullName: string }[]
  >([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const [data, teacherAffArr] = await Promise.all([
          actor.getStudentDetail(profile.username),
          actor
            .getStudentTeachers(profile.username)
            .catch(() => [] as string[]),
        ]);
        if (data) {
          setForm(data);
        }

        if (teacherAffArr && teacherAffArr.length > 0) {
          const allProfiles = await actor.getAllProfiles();
          const names = teacherAffArr
            .map((tu) => {
              const tp = allProfiles.find(([u]) => u === tu);
              return tp?.[1].fullName ?? tu;
            })
            .join(", ");
          setAssignedTeacherName(names);
        } else {
          setAssignedTeacherName(null);
        }
      } catch {
        // leave empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await getActor().saveStudentDetail(profile.username, form);
      setMessage("Saved successfully.");
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const openChangeTeacher = async () => {
    setTeacherMessage("");
    setSelectedTeacher("");
    try {
      const allProfiles = await getActor().getAllProfiles();
      const options = allProfiles
        .filter(([, p]) => p.role === "Teacher")
        .map(([u, p]) => ({ userName: u, fullName: p.fullName }));
      setTeacherOptions(options);
      setShowChangeTeacher(true);
    } catch {
      setTeacherOptions([]);
      setShowChangeTeacher(true);
    }
  };

  const handleChangeTeacher = async () => {
    if (!selectedTeacher) return;
    setTeacherMessage("");
    try {
      // Teacher affiliation is now managed through enrollments
      const allProfiles = await getActor().getAllProfiles();
      const tp = allProfiles.find(([u]) => u === selectedTeacher);
      setAssignedTeacherName(tp?.[1].fullName ?? selectedTeacher);
      setShowChangeTeacher(false);
    } catch (e) {
      setTeacherMessage(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="student-detail.dialog"
    >
      <div
        className="relative rounded-xl w-full mx-4 max-w-lg max-h-[90vh] flex flex-col"
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
            {profile.fullName || "Student Profile"}
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
            data-ocid="student-detail.close_button"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "#8a9bb5" }}
              data-ocid="student-detail.loading_state"
            >
              Loading…
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Assigned Teacher display */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="block text-xs font-medium"
                    style={{ color: "#8a9bb5" }}
                  >
                    Assigned Teacher
                  </span>
                  <button
                    type="button"
                    onClick={openChangeTeacher}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(201,168,76,0.15)",
                      border: "1px solid rgba(201,168,76,0.4)",
                      color: "#c9a84c",
                    }}
                    data-ocid="student-detail.change_teacher_button"
                  >
                    Change
                  </button>
                </div>
                <div
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "rgba(15,23,41,0.5)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    color: assignedTeacherName ? "#f5f0e8" : "#8a9bb5",
                  }}
                  data-ocid="student-detail.assigned_teacher"
                >
                  {assignedTeacherName ?? "No teacher assigned"}
                </div>
              </div>

              {showChangeTeacher && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                  data-ocid="student-detail.change_teacher_panel"
                >
                  <label
                    htmlFor="change-teacher-select"
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#8a9bb5" }}
                  >
                    Select New Teacher
                  </label>
                  <select
                    id="change-teacher-select"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm mb-2"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.25)",
                      color: "#f5f0e8",
                    }}
                    data-ocid="student-detail.change_teacher_select"
                  >
                    <option value="">— Select teacher —</option>
                    {teacherOptions.map((opt) => (
                      <option key={opt.userName} value={opt.userName}>
                        {opt.fullName}
                      </option>
                    ))}
                  </select>
                  {teacherMessage && (
                    <p className="text-xs mb-2" style={{ color: "#e05c5c" }}>
                      {teacherMessage}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleChangeTeacher}
                      className="px-3 py-1.5 rounded text-xs font-semibold"
                      style={{
                        background: "rgba(201,168,76,0.15)",
                        border: "1px solid rgba(201,168,76,0.4)",
                        color: "#c9a84c",
                      }}
                      data-ocid="student-detail.confirm_change_teacher_button"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangeTeacher(false)}
                      className="px-3 py-1.5 rounded text-xs"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(201,168,76,0.3)",
                        color: "#8a9bb5",
                      }}
                      data-ocid="student-detail.cancel_change_teacher_button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* StudentDetail is now empty — enrollment fields are managed via enrollments */}
              <p className="text-sm" style={{ color: "#8a9bb5" }}>
                Student enrollment details (instrument, skill level, etc.) are
                managed through the Enrollments section.
              </p>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 gap-3"
          style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
        >
          {message && (
            <p
              className="text-xs flex-1"
              style={{
                color: message.startsWith("Error") ? "#e05c5c" : "#c9a84c",
              }}
              data-ocid={
                message.startsWith("Error")
                  ? "student-detail.error_state"
                  : "student-detail.success_state"
              }
            >
              {message}
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm transition-smooth"
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#8a9bb5",
              }}
              data-ocid="student-detail.cancel_button"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#c9a84c",
                opacity: saving || loading ? 0.5 : 1,
              }}
              data-ocid="student-detail.save_button"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
