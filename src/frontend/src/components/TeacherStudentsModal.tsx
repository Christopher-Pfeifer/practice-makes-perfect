import { Role } from "@/backend";
import StudentOnboardingModal from "@/components/StudentOnboardingModal";
import { getActor } from "@/lib/actor";
import { useCallback, useEffect, useState } from "react";

interface TeacherStudentsModalProps {
  teacherUsername: string;
  onClose: () => void;
}

interface StudentRow {
  enrollmentId: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  instrument: string;
  voiceType: string;
  skillLevel: string;
  theoryLevel: string;
  ensembleParticipation: string;
  practiceGoals: string;
  enrollmentNotes: string;
  studentNotes: string;
  studioName: string;
}

interface ParentInfo {
  parentUserName: string;
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

const G = "#c9a84c";
const BG_CARD = "#1a2540";
const BG_DARK = "#0f1729";
const BORDER = "rgba(201,168,76,0.2)";
const TEXT = "#f5f0e8";
const MUTED = "#8a9bb5";
const DIM = "#4a5c75";

const baseInput: React.CSSProperties = {
  background: BG_DARK,
  border: "1px solid rgba(201,168,76,0.25)",
  color: TEXT,
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 12,
  width: "100%",
  outline: "none",
};
const focusInput: React.CSSProperties = {
  ...baseInput,
  border: "1px solid rgba(201,168,76,0.6)",
};

function FI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false);
  return (
    <input
      {...props}
      style={f ? focusInput : baseInput}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
    />
  );
}

function FS({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [f, setF] = useState(false);
  return (
    <select
      {...props}
      style={f ? focusInput : baseInput}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
    >
      {children}
    </select>
  );
}

function FTA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [f, setF] = useState(false);
  return (
    <textarea
      {...props}
      rows={2}
      style={{ ...(f ? focusInput : baseInput), resize: "vertical" }}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
    />
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: DIM,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        display: "block",
        marginBottom: 3,
      }}
    >
      {children}
    </span>
  );
}

function InlineMsg({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return (
    <div
      className="rounded px-3 py-2 text-xs mt-1"
      style={{
        background: ok ? "rgba(74,197,130,0.1)" : "rgba(224,92,92,0.1)",
        border: ok
          ? "1px solid rgba(74,197,130,0.3)"
          : "1px solid rgba(224,92,92,0.3)",
        color: ok ? "#4ac582" : "#e05c5c",
      }}
    >
      {ok || err}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="text-xs font-bold uppercase tracking-widest"
      style={{
        color: G,
        borderBottom: `1px solid ${BORDER}`,
        paddingBottom: 4,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
  );
}

// ── Sub-section A: Student Profile Edit ──────────────────────────────────────
function StudentProfileSection({
  row,
  teacherUsername,
  factStates,
  onSaved,
}: {
  row: StudentRow;
  teacherUsername: string;
  factStates: string[];
  onSaved: (u: Partial<StudentRow>) => void;
}) {
  const [form, setForm] = useState({
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zip: row.zip,
    notes: row.studentNotes,
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  async function save() {
    setSaving(true);
    setOk("");
    setErr("");
    try {
      const res = await getActor().updateStudentProfile(
        teacherUsername,
        row.userName,
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        { notes: form.notes },
      );
      if (res.__kind__ === "err") {
        setErr(res.err);
      } else {
        setOk("Profile saved.");
        onSaved({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
          studentNotes: form.notes,
        });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <SectionHeader title="Student Profile" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Lbl>Full Name</Lbl>
          <FI
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            data-ocid={`student-profile.fullname.${row.userName}`}
          />
        </div>
        <div>
          <Lbl>Email</Lbl>
          <FI
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            data-ocid={`student-profile.email.${row.userName}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Lbl>Phone</Lbl>
          <FI
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            data-ocid={`student-profile.phone.${row.userName}`}
          />
        </div>
        <div>
          <Lbl>Address 1</Lbl>
          <FI
            value={form.address1}
            onChange={(e) => setForm({ ...form, address1: e.target.value })}
            data-ocid={`student-profile.address1.${row.userName}`}
          />
        </div>
      </div>
      <div>
        <Lbl>Address 2</Lbl>
        <FI
          value={form.address2}
          onChange={(e) => setForm({ ...form, address2: e.target.value })}
          data-ocid={`student-profile.address2.${row.userName}`}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Lbl>City</Lbl>
          <FI
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            data-ocid={`student-profile.city.${row.userName}`}
          />
        </div>
        <div>
          <Lbl>State</Lbl>
          <FS
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            data-ocid={`student-profile.state.${row.userName}`}
          >
            <option value="">— State —</option>
            {factStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FS>
        </div>
        <div>
          <Lbl>Zip</Lbl>
          <FI
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            data-ocid={`student-profile.zip.${row.userName}`}
          />
        </div>
      </div>
      <div>
        <Lbl>Student Notes</Lbl>
        <FTA
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          data-ocid={`student-profile.notes.${row.userName}`}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-3 py-1.5 rounded text-xs font-semibold"
          style={{
            background: saving
              ? "rgba(201,168,76,0.08)"
              : "rgba(201,168,76,0.18)",
            border: `1px solid ${saving ? BORDER : G}`,
            color: saving ? "rgba(201,168,76,0.4)" : G,
            cursor: saving ? "not-allowed" : "pointer",
          }}
          data-ocid={`student-profile.save_button.${row.userName}`}
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
      <InlineMsg ok={ok} err={err} />
    </div>
  );
}

// ── Sub-section B: Enrollment Edit ────────────────────────────────────────────
function EnrollmentSection({
  row,
  teacherUsername,
  instruments,
  voiceTypes,
  skillLevels,
  theoryLevels,
  studioOptions,
  onSaved,
}: {
  row: StudentRow;
  teacherUsername: string;
  instruments: string[];
  voiceTypes: string[];
  skillLevels: string[];
  theoryLevels: string[];
  studioOptions: string[];
  onSaved: (u: Partial<StudentRow>) => void;
}) {
  const [form, setForm] = useState({
    instrument: row.instrument,
    voiceType: row.voiceType,
    skillLevel: row.skillLevel,
    theoryLevel: row.theoryLevel,
    ensembleParticipation: row.ensembleParticipation,
    practiceGoals: row.practiceGoals,
    notes: row.enrollmentNotes,
    studioName: row.studioName,
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  async function save() {
    setSaving(true);
    setOk("");
    setErr("");
    try {
      const res = await getActor().updateStudentEnrollment(
        row.enrollmentId,
        teacherUsername,
        {
          enrollmentId: row.enrollmentId,
          studentUserName: row.userName,
          teacherUserName: teacherUsername,
          instrument: form.instrument,
          voiceType: form.voiceType,
          skillLevel: form.skillLevel,
          theoryLevel: form.theoryLevel,
          ensembleParticipation: form.ensembleParticipation,
          practiceGoals: form.practiceGoals,
          notes: form.notes,
          studioName: form.studioName,
        },
      );
      if (res.__kind__ === "err") {
        setErr(res.err);
      } else {
        setOk("Enrollment saved.");
        onSaved({
          instrument: form.instrument,
          voiceType: form.voiceType,
          skillLevel: form.skillLevel,
          theoryLevel: form.theoryLevel,
          ensembleParticipation: form.ensembleParticipation,
          practiceGoals: form.practiceGoals,
          enrollmentNotes: form.notes,
          studioName: form.studioName,
        });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <SectionHeader title="Enrollment Details" />
      <div>
        <Lbl>Instrument</Lbl>
        <FS
          value={form.instrument}
          onChange={(e) => {
            const val = e.target.value;
            setForm({
              ...form,
              instrument: val,
              voiceType: val === "Voice" ? form.voiceType : "",
            });
          }}
          data-ocid={`enrollment.instrument.${row.enrollmentId}`}
        >
          <option value="">— Select —</option>
          {instruments.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </FS>
      </div>
      {form.instrument === "Voice" && (
        <div>
          <Lbl>Voice Type</Lbl>
          <FS
            value={form.voiceType}
            onChange={(e) => setForm({ ...form, voiceType: e.target.value })}
            data-ocid={`enrollment.voice_type.${row.enrollmentId}`}
          >
            <option value="">— Select —</option>
            {voiceTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </FS>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Lbl>Skill Level</Lbl>
          <FS
            value={form.skillLevel}
            onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
            data-ocid={`enrollment.skill_level.${row.enrollmentId}`}
          >
            <option value="">— Select —</option>
            {skillLevels.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FS>
        </div>
        <div>
          <Lbl>Theory Level</Lbl>
          <FS
            value={form.theoryLevel}
            onChange={(e) => setForm({ ...form, theoryLevel: e.target.value })}
            data-ocid={`enrollment.theory_level.${row.enrollmentId}`}
          >
            <option value="">— Select —</option>
            {theoryLevels.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FS>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Lbl>Studio</Lbl>
          <FS
            value={form.studioName}
            onChange={(e) => setForm({ ...form, studioName: e.target.value })}
            data-ocid={`enrollment.studio.${row.enrollmentId}`}
          >
            <option value="Independent">Independent</option>
            {studioOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FS>
        </div>
        <div>
          <Lbl>Ensemble Participation</Lbl>
          <FI
            value={form.ensembleParticipation}
            onChange={(e) =>
              setForm({ ...form, ensembleParticipation: e.target.value })
            }
            data-ocid={`enrollment.ensemble.${row.enrollmentId}`}
          />
        </div>
      </div>
      <div>
        <Lbl>Practice Goals</Lbl>
        <FTA
          value={form.practiceGoals}
          onChange={(e) => setForm({ ...form, practiceGoals: e.target.value })}
          data-ocid={`enrollment.practice_goals.${row.enrollmentId}`}
        />
      </div>
      <div>
        <Lbl>Enrollment Notes</Lbl>
        <FTA
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          data-ocid={`enrollment.notes.${row.enrollmentId}`}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-3 py-1.5 rounded text-xs font-semibold"
          style={{
            background: saving
              ? "rgba(201,168,76,0.08)"
              : "rgba(201,168,76,0.18)",
            border: `1px solid ${saving ? BORDER : G}`,
            color: saving ? "rgba(201,168,76,0.4)" : G,
            cursor: saving ? "not-allowed" : "pointer",
          }}
          data-ocid={`enrollment.save_button.${row.enrollmentId}`}
        >
          {saving ? "Saving…" : "Save Enrollment"}
        </button>
      </div>
      <InlineMsg ok={ok} err={err} />
    </div>
  );
}

// ── Sub-section C: Parent Management ──────────────────────────────────────────
function ParentManagementSection({
  row,
  teacherUsername,
  factStates,
}: {
  row: StudentRow;
  teacherUsername: string;
  factStates: string[];
}) {
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [addMode, setAddMode] = useState<"none" | "new" | "link">("none");
  const [editingParent, setEditingParent] = useState<string | null>(null);
  const [parentEditForm, setParentEditForm] = useState<ParentInfo | null>(null);
  const [savingParent, setSavingParent] = useState(false);
  const [parentOk, setParentOk] = useState("");
  const [parentErr, setParentErr] = useState("");
  const emptyNew = {
    fullName: "",
    userName: "",
    password: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
  };
  const [newPF, setNewPF] = useState(emptyNew);
  const [newErr, setNewErr] = useState("");
  const [newOk, setNewOk] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [linkResults, setLinkResults] = useState<
    { parentUserName: string; fullName: string }[]
  >([]);
  const [linkSearching, setLinkSearching] = useState(false);
  const [selectedLink, setSelectedLink] = useState<{
    parentUserName: string;
    fullName: string;
  } | null>(null);
  const [linkErr, setLinkErr] = useState("");
  const [linkOk, setLinkOk] = useState("");

  const loadParents = useCallback(async () => {
    setLoadingParents(true);
    try {
      const [links, allProfiles] = await Promise.all([
        getActor().getStudentParents(row.userName),
        getActor().getAllProfiles(),
      ]);
      const pmap = new Map(allProfiles.map(([u, p]) => [u, p]));
      setParents(
        links.map((l) => {
          const p = pmap.get(l.parentUserName);
          return {
            parentUserName: l.parentUserName,
            fullName: p?.fullName ?? l.parentUserName,
            email: p?.email ?? "",
            phone: p?.phone ?? "",
            address1: p?.address1 ?? "",
            address2: p?.address2 ?? "",
            city: p?.city ?? "",
            state: p?.state ?? "",
            zip: p?.zip ?? "",
          };
        }),
      );
    } catch {
      setParents([]);
    } finally {
      setLoadingParents(false);
    }
  }, [row.userName]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  async function handleUnlink(parentUserName: string) {
    try {
      await getActor().removeParentStudentLink(
        teacherUsername,
        parentUserName,
        row.userName,
      );
      await loadParents();
    } catch {
      /* silent */
    }
  }

  function startEditParent(info: ParentInfo) {
    setEditingParent(info.parentUserName);
    setParentEditForm({ ...info });
    setParentOk("");
    setParentErr("");
  }

  async function saveParentProfile() {
    if (!parentEditForm) return;
    setSavingParent(true);
    setParentOk("");
    setParentErr("");
    try {
      const res = await getActor().updateParentProfile(
        teacherUsername,
        parentEditForm.parentUserName,
        {
          fullName: parentEditForm.fullName,
          email: parentEditForm.email,
          phone: parentEditForm.phone,
          address1: parentEditForm.address1,
          address2: parentEditForm.address2,
          city: parentEditForm.city,
          state: parentEditForm.state,
          zip: parentEditForm.zip,
        },
      );
      if (res.__kind__ === "err") {
        setParentErr(res.err);
      } else {
        setParentOk("Parent profile saved.");
        setParents((prev) =>
          prev.map((p) =>
            p.parentUserName === parentEditForm.parentUserName
              ? { ...parentEditForm }
              : p,
          ),
        );
        setEditingParent(null);
      }
    } catch (e) {
      setParentErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingParent(false);
    }
  }

  async function handleAddNewParent() {
    if (!newPF.userName.trim()) {
      setNewErr("Username is required.");
      return;
    }
    if (!newPF.fullName.trim()) {
      setNewErr("Full name is required.");
      return;
    }
    if (!newPF.password.trim()) {
      setNewErr("Password is required.");
      return;
    }
    setSavingNew(true);
    setNewErr("");
    setNewOk("");
    try {
      const cr = await getActor().createProfile({
        username: newPF.userName.trim(),
        password: newPF.password.trim(),
        fullName: newPF.fullName.trim(),
        role: Role.Parent,
        email: newPF.email.trim(),
        phone: newPF.phone.trim(),
        address1: newPF.address1.trim(),
        address2: newPF.address2.trim(),
        city: newPF.city.trim(),
        state: newPF.state,
        zip: newPF.zip.trim(),
        parentAffiliation: "",
        teacherAffiliation: "",
        studioAffiliation: "",
        studentAffiliations: [],
        description: "",
        comments: "",
      });
      if (cr.__kind__ === "err") {
        setNewErr(cr.err);
        setSavingNew(false);
        return;
      }
      const lr = await getActor().addParentStudentLink(
        teacherUsername,
        newPF.userName.trim(),
        row.userName,
      );
      if (lr.__kind__ === "err") {
        setNewErr(lr.err);
        setSavingNew(false);
        return;
      }
      setNewOk(`${newPF.fullName} added and linked.`);
      setNewPF(emptyNew);
      setAddMode("none");
      await loadParents();
    } catch (e) {
      setNewErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingNew(false);
    }
  }

  async function handleLinkSearch(q: string) {
    setLinkSearch(q);
    setSelectedLink(null);
    if (q.trim().length < 2) {
      setLinkResults([]);
      return;
    }
    setLinkSearching(true);
    try {
      const all = await getActor().getAllProfiles();
      const lower = q.trim().toLowerCase();
      setLinkResults(
        all
          .filter(
            ([u, p]) =>
              p.role === "Parent" &&
              (u.toLowerCase().includes(lower) ||
                p.fullName.toLowerCase().includes(lower)),
          )
          .map(([u, p]) => ({ parentUserName: u, fullName: p.fullName })),
      );
    } catch {
      setLinkResults([]);
    } finally {
      setLinkSearching(false);
    }
  }

  async function handleLinkExisting() {
    if (!selectedLink) return;
    setLinkErr("");
    setLinkOk("");
    try {
      const res = await getActor().addParentStudentLink(
        teacherUsername,
        selectedLink.parentUserName,
        row.userName,
      );
      if (res.__kind__ === "err") {
        setLinkErr(res.err);
      } else {
        setLinkOk(`${selectedLink.fullName} linked.`);
        setLinkSearch("");
        setLinkResults([]);
        setSelectedLink(null);
        setAddMode("none");
        await loadParents();
      }
    } catch (e) {
      setLinkErr(e instanceof Error ? e.message : String(e));
    }
  }

  const pf = parentEditForm;
  return (
    <div className="flex flex-col gap-2">
      <SectionHeader title="Parent Management" />
      {loadingParents ? (
        <div
          className="text-xs py-2"
          style={{ color: MUTED }}
          data-ocid={`parents.loading_state.${row.userName}`}
        >
          Loading parents…
        </div>
      ) : parents.length === 0 ? (
        <div
          className="text-xs py-2"
          style={{ color: MUTED }}
          data-ocid={`parents.empty_state.${row.userName}`}
        >
          No parents linked.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {parents.map((parent, idx) => (
            <div
              key={parent.parentUserName}
              className="rounded-lg p-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${BORDER}`,
              }}
              data-ocid={`parents.item.${idx + 1}.${row.userName}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div
                    className="text-xs font-semibold"
                    style={{ color: TEXT }}
                  >
                    {parent.fullName}
                  </div>
                  {parent.email && (
                    <div className="text-xs" style={{ color: MUTED }}>
                      {parent.email}
                    </div>
                  )}
                  {parent.phone && (
                    <div className="text-xs" style={{ color: MUTED }}>
                      {parent.phone}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      editingParent === parent.parentUserName
                        ? setEditingParent(null)
                        : startEditParent(parent)
                    }
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: "rgba(201,168,76,0.12)",
                      border: `1px solid ${BORDER}`,
                      color: G,
                      cursor: "pointer",
                    }}
                    data-ocid={`parents.edit_button.${idx + 1}.${row.userName}`}
                  >
                    {editingParent === parent.parentUserName
                      ? "Cancel"
                      : "Edit Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnlink(parent.parentUserName)}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: "rgba(224,92,92,0.1)",
                      border: "1px solid rgba(224,92,92,0.35)",
                      color: "#e05c5c",
                      cursor: "pointer",
                    }}
                    data-ocid={`parents.unlink_button.${idx + 1}.${row.userName}`}
                  >
                    Unlink
                  </button>
                </div>
              </div>
              {editingParent === parent.parentUserName && pf && (
                <div
                  className="flex flex-col gap-2 mt-3 pt-3"
                  style={{ borderTop: `1px solid ${BORDER}` }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Lbl>Full Name</Lbl>
                      <FI
                        value={pf.fullName}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, fullName: e.target.value })
                        }
                        data-ocid={`parent-edit.fullname.${parent.parentUserName}`}
                      />
                    </div>
                    <div>
                      <Lbl>Email</Lbl>
                      <FI
                        type="email"
                        value={pf.email}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, email: e.target.value })
                        }
                        data-ocid={`parent-edit.email.${parent.parentUserName}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Lbl>Phone</Lbl>
                      <FI
                        type="tel"
                        value={pf.phone}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, phone: e.target.value })
                        }
                        data-ocid={`parent-edit.phone.${parent.parentUserName}`}
                      />
                    </div>
                    <div>
                      <Lbl>Address 1</Lbl>
                      <FI
                        value={pf.address1}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, address1: e.target.value })
                        }
                        data-ocid={`parent-edit.address1.${parent.parentUserName}`}
                      />
                    </div>
                  </div>
                  <div>
                    <Lbl>Address 2</Lbl>
                    <FI
                      value={pf.address2}
                      onChange={(e) =>
                        setParentEditForm({ ...pf, address2: e.target.value })
                      }
                      data-ocid={`parent-edit.address2.${parent.parentUserName}`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Lbl>City</Lbl>
                      <FI
                        value={pf.city}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, city: e.target.value })
                        }
                        data-ocid={`parent-edit.city.${parent.parentUserName}`}
                      />
                    </div>
                    <div>
                      <Lbl>State</Lbl>
                      <FS
                        value={pf.state}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, state: e.target.value })
                        }
                        data-ocid={`parent-edit.state.${parent.parentUserName}`}
                      >
                        <option value="">— State —</option>
                        {factStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </FS>
                    </div>
                    <div>
                      <Lbl>Zip</Lbl>
                      <FI
                        value={pf.zip}
                        onChange={(e) =>
                          setParentEditForm({ ...pf, zip: e.target.value })
                        }
                        data-ocid={`parent-edit.zip.${parent.parentUserName}`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingParent(null)}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: "transparent",
                        border: `1px solid ${BORDER}`,
                        color: MUTED,
                        cursor: "pointer",
                      }}
                      data-ocid={`parent-edit.cancel_button.${parent.parentUserName}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingParent}
                      onClick={saveParentProfile}
                      className="text-xs px-2 py-1 rounded font-semibold"
                      style={{
                        background: savingParent
                          ? "rgba(201,168,76,0.08)"
                          : "rgba(201,168,76,0.18)",
                        border: `1px solid ${savingParent ? BORDER : G}`,
                        color: savingParent ? "rgba(201,168,76,0.4)" : G,
                        cursor: savingParent ? "not-allowed" : "pointer",
                      }}
                      data-ocid={`parent-edit.save_button.${parent.parentUserName}`}
                    >
                      {savingParent ? "Saving…" : "Save"}
                    </button>
                  </div>
                  <InlineMsg ok={parentOk} err={parentErr} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {addMode === "none" && (
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => setAddMode("new")}
            className="text-xs px-2 py-1 rounded"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: `1px solid ${BORDER}`,
              color: G,
              cursor: "pointer",
            }}
            data-ocid={`parents.add_new_button.${row.userName}`}
          >
            + New Parent
          </button>
          <button
            type="button"
            onClick={() => setAddMode("link")}
            className="text-xs px-2 py-1 rounded"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: `1px solid ${BORDER}`,
              color: G,
              cursor: "pointer",
            }}
            data-ocid={`parents.link_button.${row.userName}`}
          >
            + Link Existing
          </button>
        </div>
      )}
      {addMode === "new" && (
        <div
          className="flex flex-col gap-2 rounded-lg p-3 mt-1"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${BORDER}`,
          }}
          data-ocid={`parents.new_form.${row.userName}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: G }}>
              New Parent
            </span>
            <button
              type="button"
              onClick={() => {
                setAddMode("none");
                setNewPF(emptyNew);
                setNewErr("");
              }}
              className="text-xs"
              style={{
                color: MUTED,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              data-ocid={`parents.new_form_cancel.${row.userName}`}
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Lbl>Username *</Lbl>
              <FI
                value={newPF.userName}
                onChange={(e) =>
                  setNewPF({ ...newPF, userName: e.target.value })
                }
                placeholder="e.g. parent_smith"
                data-ocid={`parents.new_username.${row.userName}`}
              />
            </div>
            <div>
              <Lbl>Password *</Lbl>
              <FI
                type="password"
                value={newPF.password}
                onChange={(e) =>
                  setNewPF({ ...newPF, password: e.target.value })
                }
                placeholder="Initial password"
                data-ocid={`parents.new_password.${row.userName}`}
              />
            </div>
          </div>
          <div>
            <Lbl>Full Name *</Lbl>
            <FI
              value={newPF.fullName}
              onChange={(e) => setNewPF({ ...newPF, fullName: e.target.value })}
              placeholder="Parent's full name"
              data-ocid={`parents.new_fullname.${row.userName}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Lbl>Email</Lbl>
              <FI
                type="email"
                value={newPF.email}
                onChange={(e) => setNewPF({ ...newPF, email: e.target.value })}
                data-ocid={`parents.new_email.${row.userName}`}
              />
            </div>
            <div>
              <Lbl>Phone</Lbl>
              <FI
                type="tel"
                value={newPF.phone}
                onChange={(e) => setNewPF({ ...newPF, phone: e.target.value })}
                data-ocid={`parents.new_phone.${row.userName}`}
              />
            </div>
          </div>
          <div>
            <Lbl>Address 1</Lbl>
            <FI
              value={newPF.address1}
              onChange={(e) => setNewPF({ ...newPF, address1: e.target.value })}
              data-ocid={`parents.new_address1.${row.userName}`}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Lbl>City</Lbl>
              <FI
                value={newPF.city}
                onChange={(e) => setNewPF({ ...newPF, city: e.target.value })}
                data-ocid={`parents.new_city.${row.userName}`}
              />
            </div>
            <div>
              <Lbl>State</Lbl>
              <FS
                value={newPF.state}
                onChange={(e) => setNewPF({ ...newPF, state: e.target.value })}
                data-ocid={`parents.new_state.${row.userName}`}
              >
                <option value="">— State —</option>
                {factStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </FS>
            </div>
            <div>
              <Lbl>Zip</Lbl>
              <FI
                value={newPF.zip}
                onChange={(e) => setNewPF({ ...newPF, zip: e.target.value })}
                data-ocid={`parents.new_zip.${row.userName}`}
              />
            </div>
          </div>
          {newErr && <InlineMsg err={newErr} />}
          {newOk && <InlineMsg ok={newOk} />}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={savingNew}
              onClick={handleAddNewParent}
              className="text-xs px-3 py-1.5 rounded font-semibold"
              style={{
                background: savingNew
                  ? "rgba(201,168,76,0.08)"
                  : "rgba(201,168,76,0.18)",
                border: `1px solid ${savingNew ? BORDER : G}`,
                color: savingNew ? "rgba(201,168,76,0.4)" : G,
                cursor: savingNew ? "not-allowed" : "pointer",
              }}
              data-ocid={`parents.new_save_button.${row.userName}`}
            >
              {savingNew ? "Saving…" : "Create & Link Parent"}
            </button>
          </div>
        </div>
      )}
      {addMode === "link" && (
        <div
          className="flex flex-col gap-2 rounded-lg p-3 mt-1"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${BORDER}`,
          }}
          data-ocid={`parents.link_form.${row.userName}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: G }}>
              Link Existing Parent
            </span>
            <button
              type="button"
              onClick={() => {
                setAddMode("none");
                setLinkSearch("");
                setLinkResults([]);
                setSelectedLink(null);
                setLinkErr("");
              }}
              className="text-xs"
              style={{
                color: MUTED,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              data-ocid={`parents.link_form_cancel.${row.userName}`}
            >
              Cancel
            </button>
          </div>
          <div>
            <Lbl>Search by name or username</Lbl>
            <FI
              value={linkSearch}
              onChange={(e) => handleLinkSearch(e.target.value)}
              placeholder="Type at least 2 characters…"
              data-ocid={`parents.link_search.${row.userName}`}
            />
          </div>
          {linkSearching && (
            <div className="text-xs" style={{ color: MUTED }}>
              Searching…
            </div>
          )}
          {!linkSearching && linkResults.length > 0 && (
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: `1px solid ${BORDER}` }}
            >
              {linkResults.map((r, i) => (
                <button
                  key={r.parentUserName}
                  type="button"
                  onClick={() => setSelectedLink(r)}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs"
                  style={{
                    background:
                      selectedLink?.parentUserName === r.parentUserName
                        ? "rgba(201,168,76,0.15)"
                        : i % 2 === 0
                          ? "rgba(255,255,255,0.02)"
                          : "transparent",
                    border: "none",
                    borderBottom:
                      i < linkResults.length - 1
                        ? `1px solid ${BORDER}`
                        : "none",
                    cursor: "pointer",
                    color: TEXT,
                  }}
                  data-ocid={`parents.link_result.${i + 1}.${row.userName}`}
                >
                  <span style={{ color: G, fontWeight: 600 }}>
                    {r.fullName}
                  </span>
                  <span style={{ color: MUTED }}>@{r.parentUserName}</span>
                  {selectedLink?.parentUserName === r.parentUserName && (
                    <span className="ml-auto" style={{ color: G }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {linkErr && <InlineMsg err={linkErr} />}
          {linkOk && <InlineMsg ok={linkOk} />}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!selectedLink}
              onClick={handleLinkExisting}
              className="text-xs px-3 py-1.5 rounded font-semibold"
              style={{
                background: selectedLink
                  ? "rgba(201,168,76,0.18)"
                  : "rgba(201,168,76,0.05)",
                border: `1px solid ${selectedLink ? G : "rgba(201,168,76,0.2)"}`,
                color: selectedLink ? G : "rgba(201,168,76,0.3)",
                cursor: selectedLink ? "pointer" : "not-allowed",
              }}
              data-ocid={`parents.link_confirm_button.${row.userName}`}
            >
              Link Parent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function TeacherStudentsModal({
  teacherUsername,
  onClose,
}: TeacherStudentsModalProps) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [factStates, setFactStates] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [voiceTypes, setVoiceTypes] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<string[]>([]);
  const [theoryLevels, setTheoryLevels] = useState<string[]>([]);
  const [studioOptions, setStudioOptions] = useState<string[]>([]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const [enrollments, allProfiles, affiliations] = await Promise.all([
        getActor().getEnrollmentsByTeacher(teacherUsername),
        getActor().getAllProfiles(),
        getActor().getTeacherStudioAffiliations(teacherUsername),
      ]);
      const pmap = new Map(allProfiles.map(([u, p]) => [u, p]));
      setStudioOptions(affiliations.map((a) => a.studioName));
      const students: StudentRow[] = await Promise.all(
        enrollments.map(async (e) => {
          const p = pmap.get(e.studentUserName);
          let studentNotes = "";
          try {
            const detail = await getActor().getStudentDetail(e.studentUserName);
            studentNotes = detail?.notes ?? "";
          } catch {
            /* ignore */
          }
          return {
            enrollmentId: e.enrollmentId,
            userName: e.studentUserName,
            fullName: p?.fullName ?? e.studentUserName,
            email: p?.email ?? "",
            phone: p?.phone ?? "",
            address1: p?.address1 ?? "",
            address2: p?.address2 ?? "",
            city: p?.city ?? "",
            state: p?.state ?? "",
            zip: p?.zip ?? "",
            instrument: e.instrument,
            voiceType: e.voiceType,
            skillLevel: e.skillLevel,
            theoryLevel: e.theoryLevel,
            ensembleParticipation: e.ensembleParticipation,
            practiceGoals: e.practiceGoals,
            enrollmentNotes: e.notes,
            studentNotes,
            studioName: e.studioName || "Independent",
          };
        }),
      );
      setRows(students);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [teacherUsername]);

  useEffect(() => {
    loadRows();
    Promise.all([
      getActor().getFactStates(),
      getActor().getInstruments(),
      getActor().getVoiceTypes(),
      getActor().getSkillLevels(),
      getActor().getTheoryLevels(),
    ])
      .then(([states, instr, voices, skills, theory]) => {
        setFactStates(states);
        setInstruments(instr);
        setVoiceTypes(voices);
        setSkillLevels(skills);
        setTheoryLevels(theory);
      })
      .catch(() => {});
  }, [loadRows]);

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    try {
      await getActor().deleteStudentEnrollment(enrollmentId);
      await loadRows();
    } catch {
      /* silent */
    }
  };

  const handleRowUpdate = (
    enrollmentId: string,
    updated: Partial<StudentRow>,
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.enrollmentId === enrollmentId ? { ...r, ...updated } : r,
      ),
    );
  };

  return (
    <>
      {showOnboarding && (
        <StudentOnboardingModal
          isOpen={showOnboarding}
          teacherUsername={teacherUsername}
          onClose={() => setShowOnboarding(false)}
          onSuccess={() => {
            loadRows();
          }}
        />
      )}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center"
        style={{ background: "rgba(15,23,41,0.85)" }}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
        data-ocid="teacher-students.dialog"
      >
        <div
          className="relative rounded-xl w-full mx-4 flex flex-col"
          style={{
            background: BG_CARD,
            border: "1px solid rgba(201,168,76,0.35)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            maxWidth: 640,
            maxHeight: "90vh",
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
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <h2
              className="text-xl font-display font-bold"
              style={{ color: TEXT }}
            >
              My Students
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-lg leading-none"
              style={{
                color: DIM,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = G;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = DIM;
              }}
              aria-label="Close"
              data-ocid="teacher-students.close_button"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            {loading ? (
              <div
                className="text-sm py-8 text-center"
                style={{ color: MUTED }}
                data-ocid="teacher-students.loading_state"
              >
                Loading…
              </div>
            ) : rows.length === 0 ? (
              <div
                className="text-sm py-8 text-center"
                style={{ color: MUTED }}
                data-ocid="teacher-students.empty_state"
              >
                No students assigned to you yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rows.map((row, idx) => {
                  const expanded = expandedId === row.enrollmentId;
                  return (
                    <div
                      key={row.enrollmentId}
                      className="rounded-lg overflow-hidden"
                      style={{
                        background: BG_DARK,
                        border: `1px solid ${BORDER}`,
                      }}
                      data-ocid={`teacher-students.item.${idx + 1}`}
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
                          setExpandedId(expanded ? null : row.enrollmentId)
                        }
                        aria-expanded={expanded}
                        data-ocid={`teacher-students.toggle.${idx + 1}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: "rgba(201,168,76,0.15)",
                            color: G,
                          }}
                        >
                          {row.fullName.slice(0, 2).toUpperCase() || "??"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: TEXT }}
                          >
                            {row.fullName || "(no name)"}
                          </div>
                          <div className="flex gap-3">
                            {row.instrument && (
                              <span
                                className="text-xs"
                                style={{ color: MUTED }}
                              >
                                <span style={{ color: DIM }}>Instr:</span>{" "}
                                {row.instrument}
                              </span>
                            )}
                            {row.skillLevel && (
                              <span
                                className="text-xs"
                                style={{ color: MUTED }}
                              >
                                <span style={{ color: DIM }}>Skill:</span>{" "}
                                {row.skillLevel}
                              </span>
                            )}
                            {row.studioName && (
                              <span
                                className="text-xs"
                                style={{ color: MUTED }}
                              >
                                <span style={{ color: DIM }}>Studio:</span>{" "}
                                {row.studioName}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          style={{ color: DIM, fontSize: 10, flexShrink: 0 }}
                        >
                          {expanded ? "▲" : "▼"}
                        </span>
                      </button>
                      {expanded && (
                        <div
                          className="px-4 pb-4 flex flex-col gap-4"
                          style={{
                            borderTop: `1px solid ${BORDER}`,
                            paddingTop: 12,
                          }}
                        >
                          <StudentProfileSection
                            row={row}
                            teacherUsername={teacherUsername}
                            factStates={factStates}
                            onSaved={(u) =>
                              handleRowUpdate(row.enrollmentId, u)
                            }
                          />
                          <EnrollmentSection
                            row={row}
                            teacherUsername={teacherUsername}
                            instruments={instruments}
                            voiceTypes={voiceTypes}
                            skillLevels={skillLevels}
                            theoryLevels={theoryLevels}
                            studioOptions={studioOptions}
                            onSaved={(u) =>
                              handleRowUpdate(row.enrollmentId, u)
                            }
                          />
                          <ParentManagementSection
                            row={row}
                            teacherUsername={teacherUsername}
                            factStates={factStates}
                          />
                          <div
                            className="flex justify-end pt-1"
                            style={{ borderTop: `1px solid ${BORDER}` }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveEnrollment(row.enrollmentId)
                              }
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                background: "rgba(224,92,92,0.12)",
                                border: "1px solid rgba(224,92,92,0.4)",
                                color: "#e05c5c",
                                cursor: "pointer",
                              }}
                              data-ocid={`teacher-students.delete_button.${idx + 1}`}
                            >
                              Remove Enrollment
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
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop: `1px solid ${BORDER}` }}
          >
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "rgba(201,168,76,0.18)",
                border: `1px solid ${G}`,
                color: G,
                cursor: "pointer",
              }}
              data-ocid="teacher-students.open_modal_button"
            >
              + Add New Student
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm"
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.3)",
                color: MUTED,
                cursor: "pointer",
              }}
              data-ocid="teacher-students.close_button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
