import type { UserRole } from "@/types/auth";
import { useState } from "react";

const ROLE_NAV: Record<UserRole, { label: string; key: string }[]> = {
  Studio: [
    { label: "Dashboard", key: "Dashboard" },
    { label: "Studio Profile", key: "Studio Profile" },
    { label: "Teachers", key: "Teachers" },
    { label: "Students", key: "Students" },
    { label: "Parents", key: "Parents" },
    { label: "Lessons", key: "Lessons" },
    { label: "Scheduling", key: "Scheduling" },
    { label: "Teacher Recitals", key: "studio-recitals" },
    { label: "Teacher Performances", key: "studio-performances" },
    { label: "Student Lessons", key: "studio-student-lessons" },
    { label: "Student Practices", key: "studio-student-practices" },
    { label: "Student Assignments", key: "studio-student-assignments" },
    { label: "Student Progress", key: "studio-student-progress" },
    { label: "Student Repertoire", key: "studio-student-repertoire" },
    { label: "Student Messages", key: "studio-student-messages" },
    { label: "Student Billing", key: "studio-student-billing" },
    { label: "Student Collaboration", key: "studio-student-collaboration" },
    { label: "Billing", key: "Billing" },
    { label: "Reports", key: "Reports" },
    { label: "Settings", key: "Settings" },
  ],
  Teacher: [
    { label: "Dashboard", key: "Dashboard" },
    { label: "My Profile", key: "My Profile" },
    { label: "My Students", key: "My Students" },
    { label: "Lessons", key: "Lessons" },
    { label: "Schedule", key: "Schedule" },
    { label: "Recitals", key: "teacher-recitals" },
    { label: "Example Performances", key: "teacher-performances" },
    { label: "Student Lessons Log", key: "teacher-student-lessons" },
    { label: "Student Practices", key: "teacher-student-practices" },
    { label: "Student Assignments", key: "teacher-student-assignments" },
    { label: "Student Progress", key: "teacher-student-progress" },
    { label: "Student Repertoire", key: "teacher-student-repertoire" },
    { label: "Student Messages", key: "teacher-student-messages" },
    { label: "Student Billing", key: "teacher-student-billing" },
    { label: "Student Collaboration", key: "teacher-student-collaboration" },
    { label: "Settings", key: "Settings" },
  ],
  Student: [
    { label: "Dashboard", key: "Dashboard" },
    { label: "My Profile", key: "My Profile" },
    { label: "My Lessons", key: "My Lessons" },
    { label: "My Schedule", key: "My Schedule" },
    { label: "Lessons Log", key: "student-lessons" },
    { label: "Practice Log", key: "student-practices" },
    { label: "Assignments", key: "student-assignments" },
    { label: "Progress", key: "student-progress" },
    { label: "Repertoire", key: "student-repertoire" },
    { label: "Messages", key: "student-messages" },
    { label: "Billing", key: "student-billing" },
    { label: "Collaboration", key: "student-collaboration" },
    { label: "Settings", key: "Settings" },
  ],
  Parent: [
    { label: "Dashboard", key: "Dashboard" },
    { label: "My Profile", key: "My Profile" },
    { label: "My Students", key: "My Students" },
    { label: "Payments", key: "Payments" },
    { label: "Student Lessons", key: "parent-student-lessons" },
    { label: "Student Practices", key: "parent-student-practices" },
    { label: "Student Assignments", key: "parent-student-assignments" },
    { label: "Student Progress", key: "parent-student-progress" },
    { label: "Student Repertoire", key: "parent-student-repertoire" },
    { label: "Student Messages", key: "parent-student-messages" },
    { label: "Student Billing", key: "parent-student-billing" },
    { label: "Settings", key: "Settings" },
  ],
  Unassigned: [
    { label: "Dashboard", key: "Dashboard" },
    { label: "Settings", key: "Settings" },
  ],
  Admin: [
    { label: "Dashboard", key: "Dashboard" },
    { label: "Settings", key: "Settings" },
  ],
};

// Simple icon mapping using emoji — no extra dependency
const ITEM_ICONS: Record<string, string> = {
  Dashboard: "⊞",
  "Studio Profile": "🏛",
  "My Profile": "👤",
  Teachers: "🎓",
  Students: "📚",
  "My Students": "📚",
  Parents: "👨‍👩‍👦",
  Lessons: "🎵",
  "My Lessons": "🎵",
  Scheduling: "📅",
  Schedule: "📅",
  "My Schedule": "📅",
  Billing: "💳",
  Payments: "💳",
  Reports: "📊",
  Settings: "⚙",
  Recitals: "🎤",
  "Example Performances": "🎬",
  "Student Lessons Log": "📓",
  "Student Practices": "🎹",
  "Student Assignments": "📋",
  "Student Progress": "📈",
  "Student Repertoire": "🎼",
  "Student Messages": "✉️",
  "Student Billing": "💰",
  "Student Collaboration": "🤝",
  "Lessons Log": "📓",
  "Practice Log": "🎹",
  Assignments: "📋",
  Progress: "📈",
  Repertoire: "🎼",
  Messages: "✉️",
  Collaboration: "🤝",
  "Teacher Recitals": "🎤",
  "Teacher Performances": "🎬",
  "Student Lessons": "📓",
};

interface NavMenuProps {
  role: UserRole;
  onNavSelect: (section: string) => void;
}

export default function NavMenu({ role, onNavSelect }: NavMenuProps) {
  const [collapsed, setCollapsed] = useState(false);
  const items = ROLE_NAV[role] ?? ROLE_NAV.Unassigned;

  return (
    <nav
      className="flex flex-col flex-shrink-0 h-full transition-smooth"
      style={{
        width: collapsed ? 56 : 220,
        background: "#111e35",
        borderRight: "1px solid rgba(201,168,76,0.15)",
      }}
      aria-label="Main navigation"
      data-ocid="nav.panel"
    >
      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center h-10 w-full mt-3 mb-1 transition-smooth"
        style={{ color: "#4a5c75" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        data-ocid="nav.toggle"
      >
        <span
          className="text-sm transition-smooth"
          style={{
            display: "inline-block",
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ◀
        </span>
      </button>

      {/* Menu items */}
      <ul className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
        {items.map((item, idx) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onNavSelect(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-smooth"
              style={{
                background: "transparent",
                color: "#c0cedf",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(201,168,76,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#f5f0e8";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#c0cedf";
              }}
              aria-label={item.label}
              data-ocid={`nav.item.${idx + 1}`}
            >
              <span className="text-base flex-shrink-0" aria-hidden="true">
                {ITEM_ICONS[item.label] ?? "•"}
              </span>
              {!collapsed && (
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Bottom divider */}
      <div
        className="mt-auto mx-3 mb-3 pt-3"
        style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}
      >
        {!collapsed && (
          <p className="text-xs text-center" style={{ color: "#3a4b60" }}>
            Practice Makes Perfect
          </p>
        )}
      </div>
    </nav>
  );
}
