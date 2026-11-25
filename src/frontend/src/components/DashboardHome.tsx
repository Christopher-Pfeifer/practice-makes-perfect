import {
  AdminAnalytics,
  StudioAnalytics,
  TeacherAnalytics,
} from "@/components/AnalyticsTables";
import { BackupRestoreTab } from "@/components/BackupRestoreTab";
import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

interface DashboardHomeProps {
  profile: UserProfile;
}

interface StudioStats {
  teacherCount: number;
  studentCount: number;
  parentCount: number;
}

interface TeacherStats {
  studentCount: number;
  studioCount: number;
  studioNames: string;
}

interface StudentStats {
  teacherAffiliation: string;
  parentAffiliation: string;
}

interface ParentStats {
  studentCount: number;
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2"
      style={{
        background: "#1a2540",
        border: "1px solid rgba(201,168,76,0.2)",
      }}
    >
      <div className="text-2xl">{icon}</div>
      <div
        className="text-3xl font-bold font-display"
        style={{ color: "#c9a84c" }}
      >
        {value}
      </div>
      <div className="text-sm font-medium" style={{ color: "#8a9bb5" }}>
        {label}
      </div>
    </div>
  );
}

function StudioDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const allProfiles = await actor.getAllProfiles();
        const myTeachers = allProfiles.filter(
          ([, p]) =>
            p.role === "Teacher" && p.studioAffiliation === profile.username,
        );
        const myTeacherNames = new Set(myTeachers.map(([u]) => u));
        const myStudents = allProfiles.filter(
          ([, p]) =>
            p.role === "Student" && myTeacherNames.has(p.teacherAffiliation),
        );
        const parents = allProfiles.filter(([, p]) => p.role === "Parent");
        setStats({
          teacherCount: myTeachers.length,
          studentCount: myStudents.length,
          parentCount: parents.length,
        });
      } catch {
        setStats({ teacherCount: 0, studentCount: 0, parentCount: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username]);

  return (
    <div className="w-full max-w-3xl" data-ocid="dashboard.studio.panel">
      <p className="text-xs font-mono mb-1" style={{ color: "#8a9bb5" }}>
        Studio: {profile.username}
      </p>
      <h1
        className="text-3xl font-display font-bold mb-8"
        style={{ color: "#f5f0e8" }}
      >
        Welcome, {profile.fullName}
      </h1>
      {loading ? (
        <div
          className="text-sm"
          style={{ color: "#8a9bb5" }}
          data-ocid="dashboard.loading_state"
        >
          Loading summary…
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="My Teachers"
            value={stats?.teacherCount ?? 0}
            icon="🎓"
          />
          <StatCard
            label="My Students"
            value={stats?.studentCount ?? 0}
            icon="📚"
          />
          <StatCard
            label="Parents"
            value={stats?.parentCount ?? 0}
            icon="👨‍👩‍👦"
          />
        </div>
      )}
      <StudioAnalytics profile={profile} />
    </div>
  );
}

function TeacherDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupOpen, setBackupOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const [enrollments, affiliations] = await Promise.all([
          actor.getEnrollmentsByTeacher(profile.username),
          actor.getTeacherStudioAffiliations(profile.username),
        ]);
        const uniqueStudents = new Set(
          enrollments.map((e) => e.studentUserName),
        );
        const studioNames =
          affiliations.length > 0
            ? affiliations.map((a) => a.studioName).join(", ")
            : "Unaffiliated";
        setStats({
          studentCount: uniqueStudents.size,
          studioCount: affiliations.length,
          studioNames,
        });
      } catch {
        setStats({
          studentCount: 0,
          studioCount: 0,
          studioNames: "Unaffiliated",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username]);

  return (
    <div className="w-full max-w-3xl" data-ocid="dashboard.teacher.panel">
      <h1
        className="text-3xl font-display font-bold mb-8"
        style={{ color: "#f5f0e8" }}
      >
        Welcome, {profile.fullName}
      </h1>
      {loading ? (
        <div
          className="text-sm"
          style={{ color: "#8a9bb5" }}
          data-ocid="dashboard.loading_state"
        >
          Loading summary…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="My Students"
            value={stats?.studentCount ?? 0}
            icon="📚"
          />
          <StatCard
            label={stats?.studioCount === 1 ? "My Studio" : "My Studios"}
            value={stats?.studioNames ?? "Unaffiliated"}
            icon="🏛"
          />
        </div>
      )}
      <TeacherAnalytics profile={profile} />
      {backupOpen && (
        <div className="mt-8">
          <BackupRestoreTab
            mode="teacher"
            currentUsername={profile.username}
            currentPassword=""
          />
        </div>
      )}
      <div className="mt-6">
        <button
          type="button"
          data-ocid="dashboard.teacher.backup_button"
          onClick={() => setBackupOpen((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.4)",
            color: "#c9a84c",
          }}
        >
          {backupOpen ? "Hide Backup / Export" : "Backup / Export My Data"}
        </button>
      </div>
    </div>
  );
}

function StudentDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const allProfiles = await actor.getAllProfiles();
        const me = allProfiles.find(([u]) => u === profile.username);
        setStats({
          teacherAffiliation: me?.[1].teacherAffiliation || "None",
          parentAffiliation: me?.[1].parentAffiliation || "None",
        });
      } catch {
        setStats({ teacherAffiliation: "None", parentAffiliation: "None" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username]);

  return (
    <div className="w-full max-w-2xl" data-ocid="dashboard.student.panel">
      <h1
        className="text-3xl font-display font-bold mb-8"
        style={{ color: "#f5f0e8" }}
      >
        Welcome, {profile.fullName}
      </h1>
      {loading ? (
        <div
          className="text-sm"
          style={{ color: "#8a9bb5" }}
          data-ocid="dashboard.loading_state"
        >
          Loading summary…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="My Teacher"
            value={stats?.teacherAffiliation ?? "None"}
            icon="🎓"
          />
          <StatCard
            label="My Parent"
            value={stats?.parentAffiliation ?? "None"}
            icon="👨‍👩‍👦"
          />
        </div>
      )}
    </div>
  );
}

function ParentDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const allProfiles = await actor.getAllProfiles();
        const me = allProfiles.find(([u]) => u === profile.username);
        setStats({
          studentCount: me?.[1].studentAffiliations?.length ?? 0,
        });
      } catch {
        setStats({ studentCount: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile.username]);

  return (
    <div className="w-full max-w-2xl" data-ocid="dashboard.parent.panel">
      <h1
        className="text-3xl font-display font-bold mb-8"
        style={{ color: "#f5f0e8" }}
      >
        Welcome, {profile.fullName}
      </h1>
      {loading ? (
        <div
          className="text-sm"
          style={{ color: "#8a9bb5" }}
          data-ocid="dashboard.loading_state"
        >
          Loading summary…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-w-xs">
          <StatCard
            label="My Students"
            value={stats?.studentCount ?? 0}
            icon="📚"
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardHome({ profile }: DashboardHomeProps) {
  const renderDashboard = () => {
    switch (profile.role) {
      case "Studio":
        return <StudioDashboard profile={profile} />;
      case "Teacher":
        return <TeacherDashboard profile={profile} />;
      case "Student":
        return <StudentDashboard profile={profile} />;
      case "Parent":
        return <ParentDashboard profile={profile} />;
      default:
        return (
          <div className="w-full max-w-5xl" data-ocid="dashboard.default.panel">
            <h1
              className="text-3xl font-display font-bold mb-2"
              style={{ color: "#f5f0e8" }}
            >
              Welcome to Practice Makes Perfect
            </h1>
            <p className="text-base mb-8" style={{ color: "#8a9bb5" }}>
              Administrator Overview
            </p>
            <AdminAnalytics />
          </div>
        );
    }
  };

  return (
    <div
      className="flex-1 flex items-start justify-center p-8 overflow-y-auto w-full"
      data-ocid="dashboard.page"
    >
      {renderDashboard()}
    </div>
  );
}
