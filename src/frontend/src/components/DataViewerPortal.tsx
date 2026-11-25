import { Role, type TeacherStudioAffiliation } from "@/backend";
import type {
  Profile,
  ProfileUpdate,
  StudentDetail,
  StudioDetail,
  TeacherDetail,
} from "@/backend";
import { BackupRestoreTab } from "@/components/BackupRestoreTab";
import CsvImportTab from "@/components/CsvImportTab";
import {
  ExtendedCrudPanel,
  type TableKey,
} from "@/components/ExtendedDetailTables";
import FactValidationPanel from "@/components/FactValidationPanel";
import InstrumentPicker from "@/components/InstrumentPicker";
import { Button } from "@/components/ui/button";
import { getActor } from "@/lib/actor";
import { useCallback, useEffect, useState } from "react";

interface DataViewerPortalProps {
  onClose: () => void;
  currentUsername?: string;
  currentPassword?: string;
}

type Tab =
  | "list"
  | "edit"
  | "create"
  | "details"
  | "csv"
  | "backup"
  | "fact-validation";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: Role.Studio, label: "Studio Director" },
  { value: Role.Teacher, label: "Teacher" },
  { value: Role.Student, label: "Student" },
  { value: Role.Parent, label: "Parent" },
  { value: Role.Unassigned, label: "Unassigned" },
];

const ROLE_LABELS: Record<string, string> = {
  Studio: "Studio",
  Teacher: "Teacher",
  Student: "Student",
  Parent: "Parent",
  Unassigned: "Unassigned",
};

const CARD_STYLE = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
};

const INPUT_STYLE = {
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.25)",
  color: "#f5f0e8",
  borderRadius: "6px",
  padding: "8px 12px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};

const LABEL_STYLE = {
  color: "#8a9bb5",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "4px",
};

const GOLD = "#c9a84c";

function FieldGroup({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={LABEL_STYLE}>{label}</div>
      {children}
    </div>
  );
}

function AffiliationDropdowns({
  role,
  teacherAffiliation,
  parentAffiliation,
  teacherUsernames,
  parentUsernames,
  onChange,
}: {
  role: Role;
  teacherAffiliation: string;
  parentAffiliation: string;
  teacherUsernames: string[];
  parentUsernames: string[];
  onChange: (field: string, value: string) => void;
}) {
  if (role === Role.Student) {
    return (
      <>
        <FieldGroup label="Teacher Affiliation *">
          <select
            value={teacherAffiliation}
            onChange={(e) => onChange("teacherAffiliation", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.teacher_affiliation.select"
          >
            <option value="">— Select Teacher —</option>
            {teacherUsernames.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Parent Affiliation">
          <select
            value={parentAffiliation}
            onChange={(e) => onChange("parentAffiliation", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.parent_affiliation.select"
          >
            <option value="">— None —</option>
            {parentUsernames.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </FieldGroup>
      </>
    );
  }
  return null;
}

// ── ALL PROFILES TAB ──────────────────────────────────────────────────────────
function AllProfilesTab({
  onEdit,
}: {
  onEdit: (profile: Profile) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const entries = await getActor().getAllProfiles();
      setProfiles(entries.map(([, p]) => p));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === "" || p.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (username: string) => {
    setDeleteError("");
    try {
      const res = await getActor().deleteProfile(username);
      if (res.__kind__ === "err") {
        setDeleteError(res.err);
        return;
      }
      setConfirmDelete(null);
      await loadProfiles();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="flex flex-col gap-4" data-ocid="portal.list.panel">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by username or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...INPUT_STYLE, flex: 1 }}
          data-ocid="portal.search_input"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ ...INPUT_STYLE, width: "auto", minWidth: "140px" }}
          data-ocid="portal.role_filter.select"
        >
          <option value="">All Roles</option>
          <option value="Studio">Studio</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
          <option value="Parent">Parent</option>
          <option value="Unassigned">Unassigned</option>
        </select>
        <Button
          type="button"
          size="sm"
          onClick={loadProfiles}
          style={{
            borderColor: "rgba(201,168,76,0.4)",
            color: GOLD,
            background: "transparent",
            border: "1px solid",
          }}
          data-ocid="portal.refresh_button"
        >
          ↻ Refresh
        </Button>
      </div>

      {loading && (
        <div
          className="text-center py-8"
          style={{ color: "#8a9bb5" }}
          data-ocid="portal.list.loading_state"
        >
          Loading profiles…
        </div>
      )}
      {error && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{
            background: "rgba(220,38,38,0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.3)",
          }}
          data-ocid="portal.list.error_state"
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div
              className="text-center py-10"
              style={{ color: "#8a9bb5" }}
              data-ocid="portal.list.empty_state"
            >
              {search ? "No profiles match your search." : "No profiles yet."}
            </div>
          ) : (
            <div className="overflow-auto rounded-lg" style={CARD_STYLE}>
              <table
                className="w-full text-sm"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(201,168,76,0.2)",
                      background: "rgba(201,168,76,0.05)",
                    }}
                  >
                    {[
                      "UserName",
                      "Full Name",
                      "Role",
                      "Address",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-semibold"
                        style={{
                          color: GOLD,
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((profile, idx) => (
                    <tr
                      key={profile.username}
                      style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
                      data-ocid={`portal.list.item.${idx + 1}`}
                    >
                      <td
                        className="px-4 py-3 font-mono"
                        style={{ color: GOLD, fontSize: "13px" }}
                      >
                        {profile.username}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#f5f0e8" }}>
                        {profile.fullName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: "rgba(201,168,76,0.15)",
                            color: GOLD,
                          }}
                        >
                          {ROLE_LABELS[profile.role] ?? profile.role}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 truncate max-w-[140px]"
                        style={{ color: "#8a9bb5" }}
                      >
                        {[profile.address1, profile.city, profile.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDelete === profile.username ? (
                          <div className="flex items-center gap-2">
                            <span
                              style={{ color: "#fca5a5", fontSize: "12px" }}
                            >
                              Confirm?
                            </span>
                            <button
                              type="button"
                              className="rounded px-2 py-1 text-xs font-semibold"
                              style={{
                                background: "rgba(220,38,38,0.2)",
                                color: "#fca5a5",
                                border: "1px solid rgba(220,38,38,0.4)",
                              }}
                              onClick={() => handleDelete(profile.username)}
                              data-ocid={`portal.list.confirm_button.${idx + 1}`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className="rounded px-2 py-1 text-xs"
                              style={{
                                background: "rgba(138,155,181,0.15)",
                                color: "#8a9bb5",
                                border: "1px solid rgba(138,155,181,0.3)",
                              }}
                              onClick={() => setConfirmDelete(null)}
                              data-ocid={`portal.list.cancel_button.${idx + 1}`}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded px-3 py-1 text-xs font-medium"
                              style={{
                                background: "rgba(201,168,76,0.15)",
                                color: GOLD,
                                border: "1px solid rgba(201,168,76,0.3)",
                              }}
                              onClick={() => onEdit(profile)}
                              data-ocid={`portal.list.edit_button.${idx + 1}`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded px-3 py-1 text-xs font-medium"
                              style={{
                                background: "rgba(220,38,38,0.12)",
                                color: "#fca5a5",
                                border: "1px solid rgba(220,38,38,0.3)",
                              }}
                              onClick={() => {
                                setConfirmDelete(profile.username);
                                setDeleteError("");
                              }}
                              data-ocid={`portal.list.delete_button.${idx + 1}`}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {deleteError && (
            <div
              className="rounded p-2 text-sm"
              style={{ background: "rgba(220,38,38,0.15)", color: "#fca5a5" }}
            >
              Delete error: {deleteError}
            </div>
          )}
          <div style={{ color: "#8a9bb5", fontSize: "12px" }}>
            {filtered.length} profile{filtered.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </div>
  );
}

// ── VIEW/EDIT TAB ─────────────────────────────────────────────────────────────
function EditProfileTab({
  initialProfile,
  onBack,
  onSaved,
}: {
  initialProfile: Profile | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const blank: Omit<Profile, "username"> = {
    password: "",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    role: Role.Unassigned,
    description: "",
    comments: "",
    studioAffiliation: "",
    teacherAffiliation: "",
    parentAffiliation: "",
    studentAffiliations: [],
  };

  const [fields, setFields] = useState<Omit<Profile, "username">>(
    initialProfile ? { ...initialProfile } : blank,
  );
  const [username] = useState(initialProfile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [_studios, setStudios] = useState<
    { username: string; fullName: string }[]
  >([]);
  const [teacherUsernames, setTeacherUsernames] = useState<string[]>([]);
  const [parentUsernames, setParentUsernames] = useState<string[]>([]);
  const [factStates, setFactStates] = useState<string[]>([]);

  useEffect(() => {
    const actor = getActor();
    Promise.all([
      actor.getAllProfiles(),
      actor.getTeacherUsernames(),
      actor.getParentUsernames(),
    ])
      .then(([profiles, t, p]) => {
        const studioList = profiles
          .map(([, profile]) => profile)
          .filter((p) => p.role === Role.Studio)
          .map((p) => ({ username: p.username, fullName: p.fullName }));
        setStudios(studioList);
        setTeacherUsernames(t);
        setParentUsernames(p);
      })
      .catch(() => {});
    actor
      .getFactStates()
      .then((states) => setFactStates(states))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialProfile) setFields({ ...initialProfile });
  }, [initialProfile]);

  const set = (field: string, value: string | Role) =>
    setFields((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!username) return;
    if (fields.role === Role.Student && !fields.teacherAffiliation) {
      setStatus({
        type: "error",
        msg: "Student profiles require a Teacher affiliation.",
      });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const update: ProfileUpdate = { ...fields };
      const res = await getActor().updateProfile(username, update);
      if (res.__kind__ === "err") {
        setStatus({ type: "error", msg: res.err });
      } else {
        setStatus({ type: "success", msg: "Profile saved successfully." });
        onSaved();
        // Teacher studio affiliations are managed via teacherStudioAffiliations table
      }
    } catch (e) {
      setStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" data-ocid="portal.edit.panel">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          style={{
            color: GOLD,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
          data-ocid="portal.edit.back_button"
        >
          ← Back to List
        </button>
        {username && (
          <span className="font-mono text-sm" style={{ color: "#8a9bb5" }}>
            Editing: {username}
          </span>
        )}
      </div>

      <div className="rounded-lg p-5 grid grid-cols-2 gap-4" style={CARD_STYLE}>
        <FieldGroup label="UserName (read-only)">
          <input
            value={username}
            readOnly
            style={{ ...INPUT_STYLE, opacity: 0.5, cursor: "not-allowed" }}
          />
        </FieldGroup>

        <FieldGroup label="Password">
          <input
            type="text"
            value={fields.password}
            onChange={(e) => set("password", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.password.input"
          />
        </FieldGroup>

        <FieldGroup label="Full Name">
          <input
            value={fields.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.fullname.input"
          />
        </FieldGroup>

        <FieldGroup label="Address Line 1">
          <input
            value={fields.address1}
            onChange={(e) => set("address1", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.address1.input"
          />
        </FieldGroup>

        <FieldGroup label="Address Line 2">
          <input
            value={fields.address2}
            onChange={(e) => set("address2", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.address2.input"
          />
        </FieldGroup>

        <FieldGroup label="City">
          <input
            value={fields.city}
            onChange={(e) => set("city", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.city.input"
          />
        </FieldGroup>

        <FieldGroup label="State">
          {factStates.length > 0 ? (
            <select
              value={fields.state}
              onChange={(e) => set("state", e.target.value)}
              style={INPUT_STYLE}
              data-ocid="portal.edit.state.select"
            >
              <option value="">— Select State —</option>
              {factStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={fields.state}
              onChange={(e) => set("state", e.target.value)}
              style={INPUT_STYLE}
              data-ocid="portal.edit.state.input"
            />
          )}
        </FieldGroup>

        <FieldGroup label="Zip">
          <input
            value={fields.zip}
            onChange={(e) => set("zip", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.zip.input"
          />
        </FieldGroup>

        <FieldGroup label="Phone">
          <input
            value={fields.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.phone.input"
          />
        </FieldGroup>

        <FieldGroup label="Email">
          <input
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.email.input"
          />
        </FieldGroup>

        <FieldGroup label="Role">
          <select
            value={fields.role}
            onChange={(e) => set("role", e.target.value as Role)}
            style={INPUT_STYLE}
            data-ocid="portal.edit.role.select"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldGroup>

        <AffiliationDropdowns
          role={fields.role}
          teacherAffiliation={fields.teacherAffiliation}
          parentAffiliation={fields.parentAffiliation}
          teacherUsernames={teacherUsernames}
          parentUsernames={parentUsernames}
          onChange={set}
        />

        <div className="col-span-2">
          <FieldGroup label="Description">
            <textarea
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              style={{ ...INPUT_STYLE, resize: "vertical" }}
              data-ocid="portal.edit.description.textarea"
            />
          </FieldGroup>
        </div>
      </div>

      {status && (
        <div
          className="rounded p-3 text-sm"
          style={{
            background:
              status.type === "success"
                ? "rgba(34,197,94,0.15)"
                : "rgba(220,38,38,0.15)",
            color: status.type === "success" ? "#86efac" : "#fca5a5",
            border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)"}`,
          }}
          data-ocid={`portal.edit.${status.type}_state`}
        >
          {status.msg}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          style={{
            background: GOLD,
            color: "#0f1729",
            fontWeight: 700,
            border: "none",
            opacity: saving ? 0.6 : 1,
          }}
          data-ocid="portal.edit.save_button"
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          style={{
            borderColor: "rgba(201,168,76,0.4)",
            color: GOLD,
            background: "transparent",
          }}
          data-ocid="portal.edit.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── CREATE TAB ────────────────────────────────────────────────────────────────
function CreateProfileTab({ onCreated }: { onCreated: () => void }) {
  const blankForm: Profile = {
    username: "",
    password: "",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    role: Role.Unassigned,
    description: "",
    comments: "",
    studioAffiliation: "",
    teacherAffiliation: "",
    parentAffiliation: "",
    studentAffiliations: [],
  };

  const [form, setForm] = useState<Profile>(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [_studios, setStudios] = useState<
    { username: string; fullName: string }[]
  >([]);
  const [teacherUsernames, setTeacherUsernames] = useState<string[]>([]);
  const [parentUsernames, setParentUsernames] = useState<string[]>([]);
  const [factStates, setFactStates] = useState<string[]>([]);

  useEffect(() => {
    const actor = getActor();
    Promise.all([
      actor.getAllProfiles(),
      actor.getTeacherUsernames(),
      actor.getParentUsernames(),
    ])
      .then(([profiles, t, p]) => {
        const studioList = profiles
          .map(([, profile]) => profile)
          .filter((p) => p.role === Role.Studio)
          .map((p) => ({ username: p.username, fullName: p.fullName }));
        setStudios(studioList);
        setTeacherUsernames(t);
        setParentUsernames(p);
      })
      .catch(() => {});
    actor
      .getFactStates()
      .then((states) => setFactStates(states))
      .catch(() => {});
  }, []);

  const set = (field: string, value: string | Role) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    if (!form.username.trim()) return "UserName is required.";
    if (!form.password.trim()) return "Password is required.";
    if (!form.fullName.trim()) return "Full name is required.";
    if (form.role === Role.Student && !form.teacherAffiliation)
      return "Student requires a Teacher affiliation.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await getActor().createProfile(form);
      if (res.__kind__ === "err") {
        setStatus({ type: "error", msg: res.err });
      } else {
        setStatus({
          type: "success",
          msg: `Profile "${form.username}" created successfully.`,
        });
        setForm(blankForm);
        onCreated();
        // Teacher studio affiliations are managed via teacherStudioAffiliations table
      }
    } catch (e) {
      setStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" data-ocid="portal.create.panel">
      <div className="rounded-lg p-5 grid grid-cols-2 gap-4" style={CARD_STYLE}>
        <FieldGroup label="UserName *">
          <input
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            placeholder="unique username"
            style={INPUT_STYLE}
            data-ocid="portal.create.username.input"
          />
        </FieldGroup>

        <FieldGroup label="Password *">
          <input
            type="text"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.password.input"
          />
        </FieldGroup>

        <FieldGroup label="Full Name *">
          <input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.fullname.input"
          />
        </FieldGroup>

        <FieldGroup label="Address Line 1">
          <input
            value={form.address1}
            onChange={(e) => set("address1", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.address1.input"
          />
        </FieldGroup>

        <FieldGroup label="Address Line 2">
          <input
            value={form.address2}
            onChange={(e) => set("address2", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.address2.input"
          />
        </FieldGroup>

        <FieldGroup label="City">
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.city.input"
          />
        </FieldGroup>

        <FieldGroup label="State">
          {factStates.length > 0 ? (
            <select
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              style={INPUT_STYLE}
              data-ocid="portal.create.state.select"
            >
              <option value="">— Select State —</option>
              {factStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              style={INPUT_STYLE}
              data-ocid="portal.create.state.input"
            />
          )}
        </FieldGroup>

        <FieldGroup label="Zip">
          <input
            value={form.zip}
            onChange={(e) => set("zip", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.zip.input"
          />
        </FieldGroup>

        <FieldGroup label="Phone">
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.phone.input"
          />
        </FieldGroup>

        <FieldGroup label="Email">
          <input
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            style={INPUT_STYLE}
            data-ocid="portal.create.email.input"
          />
        </FieldGroup>

        <FieldGroup label="Role *">
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value as Role)}
            style={INPUT_STYLE}
            data-ocid="portal.create.role.select"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldGroup>

        <AffiliationDropdowns
          role={form.role}
          teacherAffiliation={form.teacherAffiliation}
          parentAffiliation={form.parentAffiliation}
          teacherUsernames={teacherUsernames}
          parentUsernames={parentUsernames}
          onChange={set}
        />

        <div className="col-span-2">
          <FieldGroup label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              style={{ ...INPUT_STYLE, resize: "vertical" }}
              data-ocid="portal.create.description.textarea"
            />
          </FieldGroup>
        </div>
      </div>

      {status && (
        <div
          className="rounded p-3 text-sm"
          style={{
            background:
              status.type === "success"
                ? "rgba(34,197,94,0.15)"
                : "rgba(220,38,38,0.15)",
            color: status.type === "success" ? "#86efac" : "#fca5a5",
            border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)"}`,
          }}
          data-ocid={`portal.create.${status.type}_state`}
        >
          {status.msg}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            background: GOLD,
            color: "#0f1729",
            fontWeight: 700,
            border: "none",
            opacity: submitting ? 0.6 : 1,
          }}
          data-ocid="portal.create.submit_button"
        >
          {submitting ? "Creating…" : "Create Profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setForm(blankForm);
            setStatus(null);
          }}
          style={{
            borderColor: "rgba(201,168,76,0.4)",
            color: GOLD,
            background: "transparent",
          }}
          data-ocid="portal.create.reset_button"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

// ── DETAIL TABLES TAB ────────────────────────────────────────────────────────
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={LABEL_STYLE}>{label}</span>
      <span
        className="text-sm"
        style={{
          color: value ? "#f5f0e8" : "#8a9bb5",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function DetailSection<T extends object>({
  title,
  entries,
  fields,
  loading,
  error,
  ocidPrefix,
  saveFn,
  search,
  profileMap,
}: {
  title: string;
  entries: [string, T][];
  fields: { key: string; label: string }[];
  loading: boolean;
  error: string;
  ocidPrefix: string;
  saveFn: (username: string, record: T) => Promise<void>;
  search: string;
  profileMap?: Record<string, Profile>;
}) {
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [teacherAffiliations, setTeacherAffiliations] = useState<
    Record<string, TeacherStudioAffiliation[]>
  >({});
  const [affiliationLoading, setAffiliationLoading] = useState<
    Record<string, boolean>
  >({});
  const [selectedStudioToAdd, setSelectedStudioToAdd] = useState<
    Record<string, string>
  >({});

  const filtered = search
    ? entries.filter(([u]) => u.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const startEdit = (username: string, record: T) => {
    setEditingUsername(username);
    setEditDraft({ ...record });
    setSaveStatus(null);
    if (isTeacherSection) {
      loadTeacherAffiliations(username);
    }
  };

  const cancelEdit = () => {
    setEditingUsername(null);
    setEditDraft(null);
    setSaveStatus(null);
  };

  const handleSave = async (username: string) => {
    if (!editDraft) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      await saveFn(username, editDraft);
      setSaveStatus({ type: "success", msg: "Saved successfully." });
      setTimeout(() => {
        setEditingUsername(null);
        setEditDraft(null);
        setSaveStatus(null);
      }, 900);
    } catch (e) {
      setSaveStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving(false);
    }
  };

  const setDraftField = (key: string, value: string) => {
    setEditDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const isTeacherSection = ocidPrefix === "portal.details.teacher";

  const loadTeacherAffiliations = async (teacherUserName: string) => {
    if (!isTeacherSection) return;
    setAffiliationLoading((prev) => ({ ...prev, [teacherUserName]: true }));
    try {
      const actor = getActor();
      const affiliations =
        await actor.getTeacherStudioAffiliations(teacherUserName);
      setTeacherAffiliations((prev) => ({
        ...prev,
        [teacherUserName]: affiliations,
      }));
    } catch {
      setTeacherAffiliations((prev) => ({ ...prev, [teacherUserName]: [] }));
    } finally {
      setAffiliationLoading((prev) => ({ ...prev, [teacherUserName]: false }));
    }
  };

  const _handleAddAffiliation = async (teacherUserName: string) => {
    const studioUserName = selectedStudioToAdd[teacherUserName];
    if (!studioUserName) return;
    try {
      const actor = getActor();
      const res = await actor.addTeacherStudioAffiliation(
        teacherUserName,
        studioUserName,
      );
      if (res.__kind__ === "err") {
        setSaveStatus({ type: "error", msg: res.err });
      } else {
        setSaveStatus({ type: "success", msg: "Affiliation added." });
        await loadTeacherAffiliations(teacherUserName);
        setSelectedStudioToAdd((prev) => ({ ...prev, [teacherUserName]: "" }));
      }
    } catch (e) {
      setSaveStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const _handleRemoveAffiliation = async (
    teacherUserName: string,
    studioUserName: string,
  ) => {
    try {
      const actor = getActor();
      const res = await actor.removeTeacherStudioAffiliation(
        teacherUserName,
        studioUserName,
      );
      if (res.__kind__ === "err") {
        setSaveStatus({ type: "error", msg: res.err });
      } else {
        setSaveStatus({ type: "success", msg: "Affiliation removed." });
        await loadTeacherAffiliations(teacherUserName);
      }
    } catch (e) {
      setSaveStatus({
        type: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <div className="flex flex-col gap-3" data-ocid={`${ocidPrefix}.section`}>
      <h2
        className="text-base font-bold font-mono"
        style={{
          color: GOLD,
          borderBottom: "1px solid rgba(201,168,76,0.25)",
          paddingBottom: "8px",
        }}
      >
        {title}
      </h2>
      {loading && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid={`${ocidPrefix}.loading_state`}
        >
          Loading…
        </div>
      )}
      {!loading && error && (
        <div
          className="rounded p-2 text-sm"
          style={{
            background: "rgba(220,38,38,0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.3)",
          }}
          data-ocid={`${ocidPrefix}.error_state`}
        >
          {error}
        </div>
      )}
      {!loading && !error && entries.length === 0 && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid={`${ocidPrefix}.empty_state`}
        >
          No records yet.
        </div>
      )}
      {!loading && !error && entries.length > 0 && filtered.length === 0 && (
        <div
          style={{ color: "#8a9bb5", fontSize: "13px" }}
          data-ocid={`${ocidPrefix}.empty_state`}
        >
          No matching records.
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map(([username, record], idx) => {
            const isEditing = editingUsername === username;
            return (
              <div
                key={username}
                className="rounded-lg p-4"
                style={{
                  ...CARD_STYLE,
                  border: isEditing
                    ? "1px solid rgba(201,168,76,0.5)"
                    : CARD_STYLE.border,
                }}
                data-ocid={`${ocidPrefix}.item.${idx + 1}`}
              >
                {/* Record header */}
                <div
                  className="flex items-center justify-between mb-3 pb-2"
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#f5f0e8" }}
                    >
                      {profileMap?.[username]?.fullName || username}
                    </span>
                    <span className="font-mono text-xs" style={{ color: GOLD }}>
                      {username}
                    </span>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      className="rounded px-3 py-1 text-xs font-medium transition-colors"
                      style={{
                        background: "rgba(201,168,76,0.15)",
                        color: GOLD,
                        border: "1px solid rgba(201,168,76,0.3)",
                        cursor: "pointer",
                      }}
                      onClick={() => startEdit(username, record)}
                      data-ocid={`${ocidPrefix}.edit_button.${idx + 1}`}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Read-only view */}
                {!isEditing && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {fields.map(({ key, label }) => {
                        const fieldKey = String(key);
                        let displayValue = String(
                          (record as Record<string, unknown>)[fieldKey] ?? "",
                        );
                        if (
                          fieldKey === "studentUserNames" &&
                          profileMap &&
                          displayValue
                        ) {
                          displayValue = displayValue
                            .split("|")
                            .map(
                              (u) => profileMap[u.trim()]?.fullName || u.trim(),
                            )
                            .join(", ");
                        }
                        return (
                          <DetailField
                            key={fieldKey}
                            label={label}
                            value={displayValue}
                          />
                        );
                      })}
                    </div>
                    {isTeacherSection && (
                      <div
                        className="mt-2 pt-3"
                        style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
                      >
                        <span style={LABEL_STYLE}>Affiliated Studios</span>
                        <div className="mt-1">
                          {affiliationLoading[username] ? (
                            <span
                              style={{ color: "#8a9bb5", fontSize: "13px" }}
                            >
                              Loading affiliations…
                            </span>
                          ) : (
                            (() => {
                              const affiliations =
                                teacherAffiliations[username] ?? [];
                              if (affiliations.length === 0) {
                                return (
                                  <span
                                    style={{
                                      color: "#8a9bb5",
                                      fontSize: "13px",
                                    }}
                                  >
                                    None
                                  </span>
                                );
                              }
                              return (
                                <div className="flex flex-wrap gap-2">
                                  {affiliations.map((aff) => (
                                    <span
                                      key={aff.studioUserName}
                                      className="rounded px-2 py-0.5 text-xs font-medium"
                                      style={{
                                        background: "rgba(201,168,76,0.15)",
                                        color: GOLD,
                                        border:
                                          "1px solid rgba(201,168,76,0.3)",
                                      }}
                                    >
                                      {aff.studioName}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inline edit form */}
                {isEditing && editDraft && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {fields.map(({ key, label }) => {
                        const fieldKey = String(key);
                        const isInstrumentField =
                          fieldKey === "instruments" ||
                          fieldKey === "instrument";
                        return (
                          <FieldGroup key={fieldKey} label={label}>
                            {isInstrumentField ? (
                              <InstrumentPicker
                                value={String(editDraft[key] ?? "")}
                                onChange={(v) => setDraftField(key, v)}
                                label=""
                                ocidPrefix={`${ocidPrefix}.${fieldKey}.${idx + 1}`}
                                id={`instrument-picker-${ocidPrefix}-${fieldKey}-${idx + 1}`}
                              />
                            ) : (
                              <input
                                value={String(editDraft[key] ?? "")}
                                onChange={(e) =>
                                  setDraftField(key, e.target.value)
                                }
                                style={INPUT_STYLE}
                                data-ocid={`${ocidPrefix}.${fieldKey}.input.${idx + 1}`}
                              />
                            )}
                          </FieldGroup>
                        );
                      })}
                    </div>

                    {saveStatus && (
                      <div
                        className="rounded p-2 text-sm"
                        style={{
                          background:
                            saveStatus.type === "success"
                              ? "rgba(34,197,94,0.15)"
                              : "rgba(220,38,38,0.15)",
                          color:
                            saveStatus.type === "success"
                              ? "#86efac"
                              : "#fca5a5",
                          border: `1px solid ${saveStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)"}`,
                        }}
                        data-ocid={`${ocidPrefix}.${saveStatus.type}_state.${idx + 1}`}
                      >
                        {saveStatus.msg}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={saving}
                        className="rounded px-4 py-1.5 text-xs font-bold transition-opacity"
                        style={{
                          background: GOLD,
                          color: "#0f1729",
                          border: "none",
                          cursor: saving ? "not-allowed" : "pointer",
                          opacity: saving ? 0.6 : 1,
                        }}
                        onClick={() => handleSave(username)}
                        data-ocid={`${ocidPrefix}.save_button.${idx + 1}`}
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        className="rounded px-4 py-1.5 text-xs font-medium"
                        style={{
                          background: "transparent",
                          color: "#8a9bb5",
                          border: "1px solid rgba(138,155,181,0.3)",
                          cursor: saving ? "not-allowed" : "pointer",
                        }}
                        onClick={cancelEdit}
                        data-ocid={`${ocidPrefix}.cancel_button.${idx + 1}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const STUDIO_FIELDS: { key: keyof StudioDetail; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "licenseNumber", label: "License Number" },
  { key: "description", label: "Description" },
];

const TEACHER_FIELDS: { key: keyof TeacherDetail; label: string }[] = [
  { key: "instruments", label: "Instruments" },
  { key: "bio", label: "Bio" },
  { key: "yearsExperience", label: "Years Experience" },
  { key: "certifications", label: "Certifications" },
];

const STUDENT_FIELDS: { key: string; label: string }[] = [
  { key: "instrument", label: "Instrument" },
  { key: "voiceType", label: "Voice Type" },
  { key: "skillLevel", label: "Skill Level" },
  { key: "theoryLevel", label: "Theory Level" },
  { key: "ensembleParticipation", label: "Ensemble Participation" },
  { key: "practiceGoals", label: "Practice Goals" },
];

type DetailTableFilter =
  | "student"
  | "studio"
  | "teacher"
  | "teacherSchedule"
  | "teacherRecitals"
  | "teacherExamplePerformances"
  | "studentLessons"
  | "studentPractices"
  | "studentAssignments"
  | "studentProgress"
  | "studentRepertoire"
  | "studentMessages"
  | "studentBilling"
  | "studentCollaboration"
  | "all";

const DETAIL_FILTER_OPTIONS: { value: DetailTableFilter; label: string }[] = [
  { value: "student", label: "Student Details" },
  { value: "teacher", label: "Teacher Details" },
  { value: "studio", label: "Studio Details" },
  { value: "teacherSchedule", label: "Teacher Schedule" },
  { value: "teacherRecitals", label: "Teacher Recitals" },
  { value: "teacherExamplePerformances", label: "Teacher Performances" },
  { value: "studentLessons", label: "Student Lessons" },
  { value: "studentPractices", label: "Student Practices" },
  { value: "studentAssignments", label: "Student Assignments" },
  { value: "studentProgress", label: "Student Progress" },
  { value: "studentRepertoire", label: "Student Repertoire" },
  { value: "studentMessages", label: "Student Messages" },
  { value: "studentBilling", label: "Student Billing" },
  { value: "studentCollaboration", label: "Student Collaboration" },
  { value: "all", label: "All Core Tables" },
];

function DetailTablesTab() {
  const [tableFilter, setTableFilter] = useState<DetailTableFilter>("student");
  const [studioEntries, setStudioEntries] = useState<[string, StudioDetail][]>(
    [],
  );
  const [teacherEntries, setTeacherEntries] = useState<
    [string, TeacherDetail][]
  >([]);
  const [studentEntries, setStudentEntries] = useState<
    [string, StudentDetail][]
  >([]);
  const [loadingStudio, setLoadingStudio] = useState(true);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const [errorStudio, setErrorStudio] = useState("");
  const [errorTeacher, setErrorTeacher] = useState("");
  const [errorStudent, setErrorStudent] = useState("");

  const [search, setSearch] = useState("");

  const loadAll = useCallback(async () => {
    const actor = getActor();
    setLoadingStudio(true);
    setLoadingTeacher(true);
    setLoadingStudent(true);
    setErrorStudio("");
    setErrorTeacher("");
    setErrorStudent("");

    actor
      .getAllStudioDetails()
      .then((r) => {
        setStudioEntries(r);
        setLoadingStudio(false);
      })
      .catch((e: unknown) => {
        setErrorStudio(e instanceof Error ? e.message : String(e));
        setLoadingStudio(false);
      });

    actor
      .getAllTeacherDetails()
      .then((r) => {
        setTeacherEntries(r);
        setLoadingTeacher(false);
      })
      .catch((e: unknown) => {
        setErrorTeacher(e instanceof Error ? e.message : String(e));
        setLoadingTeacher(false);
      });

    actor
      .getAllStudentDetails()
      .then((r) => {
        setStudentEntries(r);
        setLoadingStudent(false);
      })
      .catch((e: unknown) => {
        setErrorStudent(e instanceof Error ? e.message : String(e));
        setLoadingStudent(false);
      });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Save helpers — refresh the relevant table after a successful save
  const saveStudio = async (username: string, record: StudioDetail) => {
    await getActor().saveStudioDetail(username, record);
    const fresh = await getActor().getAllStudioDetails();
    setStudioEntries(fresh);
  };

  const saveTeacher = async (username: string, record: TeacherDetail) => {
    await getActor().saveTeacherDetail(username, record);
    const fresh = await getActor().getAllTeacherDetails();
    setTeacherEntries(fresh);
  };

  const saveStudent = async (username: string, record: StudentDetail) => {
    await getActor().saveStudentDetail(username, record);
    const fresh = await getActor().getAllStudentDetails();
    setStudentEntries(fresh);
  };

  const show = (t: DetailTableFilter) =>
    tableFilter === "all" || tableFilter === t;

  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    getActor()
      .getAllProfiles()
      .then((entries) => setProfiles(entries.map(([, p]) => p)))
      .catch(() => setProfiles([]));
  }, []);

  const profileMap: Record<string, Profile> = {};
  for (const p of profiles) profileMap[p.username] = p;

  return (
    <div className="flex flex-col gap-8" data-ocid="portal.details.panel">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Table selector dropdown */}
        <div className="relative">
          <select
            value={tableFilter}
            onChange={(e) =>
              setTableFilter(e.target.value as DetailTableFilter)
            }
            style={{
              ...INPUT_STYLE,
              width: "auto",
              minWidth: "180px",
              paddingRight: "32px",
              appearance: "none",
              background: "#0f1729",
              border: "1px solid rgba(201,168,76,0.45)",
              color: GOLD,
              fontWeight: 600,
              cursor: "pointer",
            }}
            data-ocid="portal.details.table_filter.select"
          >
            {DETAIL_FILTER_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                style={{ color: "#f5f0e8", background: "#1a2540" }}
              >
                {o.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: GOLD }}
          >
            ▾
          </span>
        </div>

        <input
          type="text"
          placeholder="Filter by username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...INPUT_STYLE, flex: 1, minWidth: "140px" }}
          data-ocid="portal.details.search_input"
        />
        <Button
          type="button"
          size="sm"
          onClick={loadAll}
          style={{
            borderColor: "rgba(201,168,76,0.4)",
            color: GOLD,
            background: "transparent",
            border: "1px solid",
          }}
          data-ocid="portal.details.refresh_button"
        >
          ↻ Refresh All
        </Button>
      </div>

      {show("studio") && (
        <DetailSection
          title="studioDetails"
          entries={studioEntries}
          fields={STUDIO_FIELDS}
          loading={loadingStudio}
          error={errorStudio}
          ocidPrefix="portal.details.studio"
          saveFn={saveStudio}
          search={search}
          profileMap={profileMap}
        />
      )}
      {show("teacher") && (
        <DetailSection
          title="teacherDetails"
          entries={teacherEntries}
          fields={TEACHER_FIELDS}
          loading={loadingTeacher}
          error={errorTeacher}
          ocidPrefix="portal.details.teacher"
          saveFn={saveTeacher}
          search={search}
          profileMap={profileMap}
        />
      )}
      {show("student") && (
        <DetailSection
          title="studentDetails"
          entries={studentEntries}
          fields={STUDENT_FIELDS}
          loading={loadingStudent}
          error={errorStudent}
          ocidPrefix="portal.details.student"
          saveFn={saveStudent}
          search={search}
          profileMap={profileMap}
        />
      )}
      {/* Extended tables — each renders its own loader */}
      {(
        [
          "teacherSchedule",
          "teacherRecitals",
          "teacherExamplePerformances",
          "studentLessons",
          "studentPractices",
          "studentAssignments",
          "studentProgress",
          "studentRepertoire",
          "studentMessages",
          "studentBilling",
          "studentCollaboration",
        ] as TableKey[]
      ).map((key) =>
        tableFilter === key ? (
          <ExtendedCrudPanel key={key} tableKey={key} search={search} />
        ) : null,
      )}
    </div>
  );
}

// ── MAIN PORTAL ───────────────────────────────────────────────────────────────
export default function DataViewerPortal({
  onClose,
  currentUsername = "",
  currentPassword = "",
}: DataViewerPortalProps) {
  const [tab, setTab] = useState<Tab>("list");
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [listKey, setListKey] = useState(0);

  const refreshList = () => setListKey((k) => k + 1);

  const _listScrollRef = { current: null as HTMLDivElement | null };

  const scrollListToTop = () => {
    // The tab content container is the scrollable area; scroll it to top
    const container = document.querySelector<HTMLDivElement>(
      '[data-ocid="portal.dialog"] .flex-1.overflow-auto',
    );
    if (container) container.scrollTop = 0;
  };

  const handleEdit = (profile: Profile) => {
    setEditProfile(profile);
    setTab("edit");
  };

  const handleCreated = () => {
    refreshList();
    setTab("list");
    setTimeout(scrollListToTop, 50);
  };

  const TAB_ITEMS: { id: Tab; label: string }[] = [
    { id: "list", label: "All Profiles" },
    { id: "edit", label: "View / Edit" },
    { id: "create", label: "Create" },
    { id: "details", label: "Detail Tables" },
    { id: "csv", label: "CSV Import" },
    { id: "backup", label: "Backup / Restore" },
    { id: "fact-validation", label: "FACT Validation" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      data-ocid="portal.dialog"
    >
      <div
        className="flex flex-col w-full h-full"
        style={{ background: "#0f1729" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            background: "#1a2540",
            borderBottom: "1px solid rgba(201,168,76,0.25)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(201,168,76,0.2)", color: GOLD }}
            >
              DB
            </div>
            <h1 className="text-lg font-bold" style={{ color: GOLD }}>
              Admin Portal
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            style={{
              borderColor: "rgba(201,168,76,0.4)",
              color: GOLD,
              background: "transparent",
            }}
            data-ocid="portal.close_button"
          >
            ✕ Close
          </Button>
        </div>

        {/* Tab Bar */}
        <div
          className="flex gap-1 px-6 pt-4 pb-0 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
        >
          {TAB_ITEMS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="px-5 py-2 text-sm font-medium rounded-t transition-colors"
              style={{
                background:
                  tab === t.id ? "rgba(201,168,76,0.15)" : "transparent",
                color: tab === t.id ? GOLD : "#8a9bb5",
                borderBottom:
                  tab === t.id ? `2px solid ${GOLD}` : "2px solid transparent",
                cursor: "pointer",
                outline: "none",
              }}
              data-ocid={`portal.${t.id}.tab`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {tab === "list" && (
            <AllProfilesTab key={listKey} onEdit={handleEdit} />
          )}
          {tab === "edit" && (
            <EditProfileTab
              initialProfile={editProfile}
              onBack={() => {
                setTab("list");
                setTimeout(scrollListToTop, 50);
              }}
              onSaved={() => {
                refreshList();
                setTab("list");
                setTimeout(scrollListToTop, 50);
              }}
            />
          )}
          {tab === "create" && <CreateProfileTab onCreated={handleCreated} />}
          {tab === "details" && <DetailTablesTab />}
          {tab === "csv" && <CsvImportTab />}
          {tab === "fact-validation" && <FactValidationPanel />}
          {tab === "backup" && (
            <BackupRestoreTab
              mode="full"
              currentUsername={currentUsername}
              currentPassword={currentPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}
