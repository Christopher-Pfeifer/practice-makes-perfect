import DashboardHome from "@/components/DashboardHome";
import DataAnalyticsPortal from "@/components/DataAnalyticsPortal";
import DataViewerPortal from "@/components/DataViewerPortal";
import FactManagementPortal from "@/components/FactManagementPortal";
import NavMenu from "@/components/NavMenu";
import ParentDetailModal from "@/components/ParentDetailModal";
import ParentStudentDataModal from "@/components/ParentStudentDataModal";
import ParentStudentsModal from "@/components/ParentStudentsModal";
import StudentDetailModal from "@/components/StudentDetailModal";
import StudentSelfDataModal from "@/components/StudentSelfDataModal";
import StudioDetailModal from "@/components/StudioDetailModal";
import StudioExtendedDataModal from "@/components/StudioExtendedDataModal";
import StudioParentsModal from "@/components/StudioParentsModal";
import StudioReportsModal from "@/components/StudioReportsModal";
import StudioStudentsModal from "@/components/StudioStudentsModal";
import StudioTeachersModal from "@/components/StudioTeachersModal";
import TeacherDetailModal from "@/components/TeacherDetailModal";
import TeacherPerformancesModal from "@/components/TeacherPerformancesModal";
import TeacherRecitalsModal from "@/components/TeacherRecitalsModal";
import TeacherScheduleModal from "@/components/TeacherScheduleModal";
import TeacherStudentExtendedModal from "@/components/TeacherStudentExtendedModal";
import TeacherStudentsModal from "@/components/TeacherStudentsModal";
import UnderConstructionModal from "@/components/UnderConstructionModal";
import { Button } from "@/components/ui/button";
import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  profile: UserProfile;
  onLogout: () => void;
  onSwitchProfile: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  Studio: "Studio Director",
  Teacher: "Teacher",
  Student: "Student",
  Parent: "Parent",
  Unassigned: "Unassigned",
};

export default function SplashScreen({
  profile,
  onLogout,
  onSwitchProfile,
}: SplashScreenProps) {
  const [portalOpen, setPortalOpen] = useState(false);
  const [factPortalOpen, setFactPortalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("Dashboard");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  /** Inline Settings panel — minimal profile info + coming-soon note */
  function SettingsPanel({
    profile: p,
    onClose,
  }: { profile: UserProfile; onClose: () => void }) {
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
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
        data-ocid="settings.dialog"
      >
        <div
          style={{
            background: "#0f1729",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 10,
            width: "100%",
            maxWidth: 480,
            padding: 32,
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <h2
            style={{
              color: "#c9a84c",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            Settings
          </h2>
          <div
            style={{
              background: "#1a2540",
              border: "1px solid rgba(201,168,76,0.18)",
              borderRadius: 8,
              padding: "14px 18px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                color: "#4a5c75",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}
            >
              Account
            </div>
            <div
              style={{
                color: "#f5f0e8",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {p.fullName}
            </div>
            <div
              style={{
                color: "#8a9bb5",
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              {p.username}
            </div>
            <div style={{ color: "#c9a84c", fontSize: 12, marginTop: 4 }}>
              {p.role}
            </div>
          </div>
          <div
            style={{
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 8,
              padding: "12px 18px",
              marginBottom: 24,
              color: "#8a9bb5",
              fontSize: 13,
            }}
          >
            ⚙ More settings coming soon — notification preferences, display
            options, and account management will appear here.
          </div>
          <button
            type="button"
            style={{
              background: "rgba(201,168,76,0.18)",
              border: "1px solid rgba(201,168,76,0.5)",
              color: "#c9a84c",
              borderRadius: 6,
              padding: "8px 20px",
              fontSize: 14,
              cursor: "pointer",
            }}
            onClick={onClose}
            data-ocid="settings.close_button"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /** Inline Student Schedule panel — read-only upcoming lesson entries */
  function StudentSchedulePanel({
    profile: p,
    onClose,
  }: { profile: UserProfile; onClose: () => void }) {
    const [lessons, setLessons] = useState<
      Array<{
        lessonDate: string;
        duration: bigint;
        topics: string;
        teacherUsername: string;
        teacherNotes: string;
        lessonEntryId: string;
      }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
      async function load() {
        try {
          const actor = getActor();
          const result = await actor.getLessonEntriesByStudent(p.username);
          const sorted = result
            .map(([, r]) => r)
            .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate));
          setLessons(sorted);
        } catch {
          setLessons([]);
        } finally {
          setLoading(false);
        }
      }
      load();
    }, [p.username]);

    const filtered = search.trim()
      ? lessons.filter((l) =>
          [l.lessonDate, l.topics, l.teacherUsername]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
      : lessons;

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
        data-ocid="student-schedule.dialog"
      >
        <div
          style={{
            background: "#0f1729",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 10,
            width: "100%",
            maxWidth: 640,
            maxHeight: "85vh",
            overflowY: "auto",
            padding: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
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
              My Schedule
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
              data-ocid="student-schedule.close_button"
            >
              Close
            </button>
          </div>
          <input
            style={{
              width: "100%",
              background: "#1a2540",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: 6,
              padding: "7px 10px",
              color: "#f5f0e8",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 16,
            }}
            placeholder="Search by date, topic, teacher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="student-schedule.search_input"
          />
          {loading ? (
            <div
              style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
              data-ocid="student-schedule.loading_state"
            >
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{ color: "#8a9bb5", textAlign: "center", padding: 32 }}
              data-ocid="student-schedule.empty_state"
            >
              {search
                ? "No lessons match your search."
                : "No lesson history found."}
            </div>
          ) : (
            filtered.map((l, i) => (
              <div
                key={l.lessonEntryId}
                style={{
                  background: "#1a2540",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 10,
                }}
                data-ocid={`student-schedule.item.${i + 1}`}
              >
                <div
                  style={{
                    color: "#c9a84c",
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {l.lessonDate || "(no date)"}
                </div>
                <div style={{ color: "#8a9bb5", fontSize: 13 }}>
                  {l.duration ? `${l.duration} min` : ""}
                  {l.teacherUsername ? ` · Teacher: ${l.teacherUsername}` : ""}
                </div>
                {l.topics && (
                  <div style={{ color: "#a0aec0", fontSize: 12, marginTop: 3 }}>
                    Topics: {l.topics}
                  </div>
                )}
                {l.teacherNotes && (
                  <div style={{ color: "#8a9bb5", fontSize: 12, marginTop: 2 }}>
                    Notes: {l.teacherNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function handleNavSelect(section: string) {
    if (section === "Dashboard") {
      setActiveSection("Dashboard");
      setActiveModal(null);
    } else {
      setActiveModal(section);
    }
  }

  function renderModal() {
    if (!activeModal) return null;
    const role = profile.role;

    if (role === "Studio") {
      if (activeModal === "Studio Profile")
        return (
          <StudioDetailModal
            userName={profile.username}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Teachers")
        return (
          <StudioTeachersModal
            studioUsername={profile.username}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Students")
        return (
          <StudioStudentsModal
            studioFullName={profile.fullName}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Parents")
        return <StudioParentsModal onClose={() => setActiveModal(null)} />;
      if (activeModal === "studio-recitals")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="recitals"
            title="Teacher Recitals"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-performances")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="performances"
            title="Teacher Performances"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-lessons")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-lessons"
            title="Student Lessons"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-practices")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-practices"
            title="Student Practices"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-assignments")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-assignments"
            title="Student Assignments"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-progress")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-progress"
            title="Student Progress"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-repertoire")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-repertoire"
            title="Student Repertoire"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-messages")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-messages"
            title="Student Messages"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-billing")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-billing"
            title="Student Billing"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "studio-student-collaboration")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-collaboration"
            title="Student Collaboration"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Lessons")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-lessons"
            title="Lessons"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Scheduling")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="recitals"
            title="Teacher Scheduling"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Billing")
        return (
          <StudioExtendedDataModal
            profile={profile}
            tableType="student-billing"
            title="Billing"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Reports")
        return (
          <StudioReportsModal
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Settings")
        return (
          <SettingsPanel
            profile={profile}
            onClose={() => {
              setActiveModal(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        );
    }

    if (role === "Teacher") {
      if (activeModal === "My Profile")
        return (
          <TeacherDetailModal
            username={profile.username}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "My Students")
        return (
          <TeacherStudentsModal
            teacherUsername={profile.username}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-recitals")
        return (
          <TeacherRecitalsModal
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-performances")
        return (
          <TeacherPerformancesModal
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-lessons")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="lessons"
            title="Student Lessons Log"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-practices")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="practices"
            title="Student Practices"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-assignments")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="assignments"
            title="Student Assignments"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-progress")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="progress"
            title="Student Progress"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-repertoire")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="repertoire"
            title="Student Repertoire"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-messages")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="messages"
            title="Student Messages"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-billing")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="billing"
            title="Student Billing"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "teacher-student-collaboration")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="collaboration"
            title="Student Collaboration"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Lessons")
        return (
          <TeacherStudentExtendedModal
            profile={profile}
            tableType="lessons"
            title="Lessons"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Schedule")
        return (
          <TeacherScheduleModal
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Settings")
        return (
          <SettingsPanel
            profile={profile}
            onClose={() => {
              setActiveModal(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        );
    }

    if (role === "Student") {
      if (activeModal === "My Profile")
        return (
          <StudentDetailModal
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-lessons")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="lessons"
            title="My Lessons Log"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-practices")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="practices"
            title="My Practice Log"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-assignments")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="assignments"
            title="My Assignments"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-progress")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="progress"
            title="My Progress"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-repertoire")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="repertoire"
            title="My Repertoire"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-messages")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="messages"
            title="My Messages"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-billing")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="billing"
            title="My Billing"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "student-collaboration")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="collaboration"
            title="My Collaboration"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "My Lessons")
        return (
          <StudentSelfDataModal
            profile={profile}
            tableType="lessons"
            title="My Lessons"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "My Schedule")
        return (
          <StudentSchedulePanel
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Settings")
        return (
          <SettingsPanel
            profile={profile}
            onClose={() => {
              setActiveModal(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        );
    }

    if (role === "Parent") {
      if (activeModal === "My Profile")
        return (
          <ParentDetailModal
            profile={profile}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "My Students")
        return (
          <ParentStudentsModal
            parentUsername={profile.username}
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-lessons")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="lessons"
            title="Student Lessons"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-practices")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="practices"
            title="Student Practices"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-assignments")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="assignments"
            title="Student Assignments"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-progress")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="progress"
            title="Student Progress"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-repertoire")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="repertoire"
            title="Student Repertoire"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-messages")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="messages"
            title="Student Messages"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "parent-student-billing")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="billing"
            title="Student Billing"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Payments")
        return (
          <ParentStudentDataModal
            profile={profile}
            tableType="billing"
            title="Payments"
            onClose={() => setActiveModal(null)}
          />
        );
      if (activeModal === "Settings")
        return (
          <SettingsPanel
            profile={profile}
            onClose={() => {
              setActiveModal(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        );
    }

    // Unassigned role: Settings
    if (activeModal === "Settings")
      return (
        <SettingsPanel
          profile={profile}
          onClose={() => {
            setActiveModal(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      );

    // Data Analytics — all roles
    if (activeModal === "data-analytics")
      return (
        <DataAnalyticsPortal
          onClose={() => {
            setActiveModal(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      );

    // Fallback: Under Construction for any remaining nav items
    return (
      <UnderConstructionModal
        itemName={activeModal}
        onClose={() => {
          setActiveModal(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#0f1729" }}
        data-ocid="splash.page"
      >
        {/* Title bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shadow-md flex-shrink-0"
          style={{
            background: "#1a2540",
            borderBottom: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(201,168,76,0.2)", color: "#c9a84c" }}
            >
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono"
                  style={{ color: "#8a9bb5" }}
                >
                  {profile.username}
                </span>
                <span style={{ color: "#3a4b60" }}>|</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#f5f0e8" }}
                >
                  {profile.fullName}
                </span>
                <span style={{ color: "#3a4b60" }}>|</span>
                <span className="text-xs" style={{ color: "#c9a84c" }}>
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSwitchProfile}
              style={{
                borderColor: "rgba(201,168,76,0.3)",
                color: "#8a9bb5",
                background: "transparent",
              }}
              data-ocid="splash.switch_profile_button"
            >
              Switch Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveModal("data-analytics")}
              style={{
                borderColor: "rgba(201,168,76,0.4)",
                color: "#c9a84c",
                background: "transparent",
              }}
              data-ocid="splash.data_analytics_button"
            >
              Data Analytics
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFactPortalOpen(true)}
              style={{
                borderColor: "rgba(201,168,76,0.4)",
                color: "#c9a84c",
                background: "transparent",
              }}
              data-ocid="splash.fact_management_button"
            >
              FACT Management
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPortalOpen(true)}
              style={{
                borderColor: "rgba(201,168,76,0.4)",
                color: "#c9a84c",
                background: "transparent",
              }}
              data-ocid="splash.portal_button"
            >
              Admin Portal
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              style={{
                borderColor: "rgba(201,168,76,0.4)",
                color: "#c9a84c",
                background: "transparent",
              }}
              data-ocid="splash.exit_button"
            >
              Exit
            </Button>
          </div>
        </header>

        {/* Body: sidebar + main */}
        <div className="flex flex-1 overflow-hidden">
          <NavMenu role={profile.role} onNavSelect={handleNavSelect} />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto" data-ocid="splash.main">
            {activeSection === "Dashboard" && activeModal === null ? (
              <DashboardHome profile={profile} />
            ) : null}
          </main>
        </div>
      </div>

      {renderModal()}
      {portalOpen && (
        <DataViewerPortal
          onClose={() => {
            setPortalOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          currentUsername={profile?.username ?? ""}
          currentPassword=""
        />
      )}
      {factPortalOpen && (
        <FactManagementPortal
          onClose={() => {
            setFactPortalOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
}
