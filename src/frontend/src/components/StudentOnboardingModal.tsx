import { Role } from "@/backend";
import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

interface StudentOnboardingModalProps {
  isOpen: boolean;
  teacherUsername: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProfileForm {
  userName: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

interface EnrollmentForm {
  instrument: string;
  voiceType: string;
  skillLevel: string;
  theoryLevel: string;
  ensembleParticipation: string;
  practiceGoals: string;
  notes: string;
  studioName: string;
}

const emptyProfile: ProfileForm = {
  userName: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

const emptyEnrollment: EnrollmentForm = {
  instrument: "",
  voiceType: "",
  skillLevel: "",
  theoryLevel: "",
  ensembleParticipation: "",
  practiceGoals: "",
  notes: "",
  studioName: "Independent",
};

const baseInputStyle: React.CSSProperties = {
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.25)",
  color: "#f5f0e8",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none",
};

const focusInputStyle: React.CSSProperties = {
  ...baseInputStyle,
  border: "1px solid rgba(201,168,76,0.6)",
};

const labelStyle: React.CSSProperties = {
  color: "#8a9bb5",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 4,
  display: "block",
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ color: "#e05c5c", fontSize: 11, marginTop: 3 }}>{error}</p>
      )}
    </div>
  );
}

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={focused ? focusInputStyle : baseInputStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FocusSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={focused ? focusInputStyle : baseInputStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

function FocusTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      rows={3}
      style={{
        ...(focused ? focusInputStyle : baseInputStyle),
        resize: "vertical",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export default function StudentOnboardingModal({
  isOpen,
  teacherUsername,
  onClose,
  onSuccess,
}: StudentOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"new" | "existing">("new");

  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<keyof ProfileForm, string>>
  >({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { userName: string; fullName: string }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState<{
    userName: string;
    fullName: string;
  } | null>(null);

  const [enrollForm, setEnrollForm] = useState<EnrollmentForm>(emptyEnrollment);
  const [enrollErrors, setEnrollErrors] = useState<
    Partial<Record<keyof EnrollmentForm, string>>
  >({});

  const [factStates, setFactStates] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [voiceTypes, setVoiceTypes] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<string[]>([]);
  const [theoryLevels, setTheoryLevels] = useState<string[]>([]);
  const [teacherAffiliations, setTeacherAffiliations] = useState<
    { studioName: string }[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    resetAll();
    Promise.all([
      getActor().getFactStates(),
      getActor().getInstruments(),
      getActor().getVoiceTypes(),
      getActor().getSkillLevels(),
      getActor().getTheoryLevels(),
      getActor()
        .getTeacherStudioAffiliations(teacherUsername)
        .catch(() => []),
    ])
      .then(([states, instr, voices, skills, theory, affiliations]) => {
        setFactStates(states);
        setInstruments(instr);
        setVoiceTypes(voices);
        setSkillLevels(skills);
        setTheoryLevels(theory);
        setTeacherAffiliations(affiliations as { studioName: string }[]);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teacherUsername]);

  function resetAll() {
    setStep(1);
    setMode("new");
    setProfileForm(emptyProfile);
    setProfileErrors({});
    setSearchQuery("");
    setSearchResults([]);
    setSelectedExisting(null);
    setEnrollForm(emptyEnrollment);
    setEnrollErrors({});
    setSubmitting(false);
    setSubmitError("");
    setSuccessMsg("");
    setParentMode("skip");
    setParentForm(emptyParentForm);
    setParentSearch("");
    setParentSearchResults([]);
    setSelectedParent(null);
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    setSelectedExisting(null);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const all = await getActor().getAllProfiles();
      const q = query.trim().toLowerCase();
      setSearchResults(
        all
          .filter(
            ([u, p]) =>
              p.role === "Student" &&
              (u.toLowerCase().includes(q) ||
                p.fullName.toLowerCase().includes(q)),
          )
          .map(([u, p]) => ({ userName: u, fullName: p.fullName })),
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  function validateStep1(): boolean {
    if (mode === "existing") return selectedExisting !== null;
    const errs: Partial<Record<keyof ProfileForm, string>> = {};
    if (!profileForm.userName.trim()) errs.userName = "Username is required";
    if (!profileForm.password.trim()) errs.password = "Password is required";
    if (!profileForm.fullName.trim()) errs.fullName = "Full name is required";
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Partial<Record<keyof EnrollmentForm, string>> = {};
    if (!enrollForm.instrument.trim())
      errs.instrument = "Instrument is required";
    setEnrollErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const emptyParentForm = {
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
  const [parentMode, setParentMode] = useState<"skip" | "new" | "link">("skip");
  const [parentForm, setParentForm] = useState(emptyParentForm);
  const [parentSearch, setParentSearch] = useState("");
  const [parentSearchResults, setParentSearchResults] = useState<
    { userName: string; fullName: string }[]
  >([]);
  const [selectedParent, setSelectedParent] = useState<{
    userName: string;
    fullName: string;
  } | null>(null);

  async function handleParentSearch(q: string) {
    setParentSearch(q);
    setSelectedParent(null);
    if (q.trim().length < 2) {
      setParentSearchResults([]);
      return;
    }
    try {
      const all = await getActor().getAllProfiles();
      const lower = q.trim().toLowerCase();
      setParentSearchResults(
        all
          .filter(
            ([u, p]) =>
              p.role === "Parent" &&
              (u.toLowerCase().includes(lower) ||
                p.fullName.toLowerCase().includes(lower)),
          )
          .map(([u, p]) => ({ userName: u, fullName: p.fullName })),
      );
    } catch {
      setParentSearchResults([]);
    }
  }

  function handleNext() {
    if (validateStep1()) {
      setStep(2);
      setSubmitError("");
    }
  }

  function handleNextToStep3() {
    if (validateStep2()) {
      setStep(3);
      setSubmitError("");
    }
  }

  function handleBack() {
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
    setSubmitError("");
  }

  async function handleSave() {
    setSubmitting(true);
    setSubmitError("");

    const studentUserName =
      mode === "existing"
        ? selectedExisting!.userName
        : profileForm.userName.trim();
    const enrollmentId = `enr_${Date.now()}_${studentUserName}`;
    const enrollment = {
      enrollmentId,
      studentUserName,
      teacherUserName: teacherUsername,
      instrument: enrollForm.instrument,
      voiceType: enrollForm.voiceType,
      skillLevel: enrollForm.skillLevel,
      theoryLevel: enrollForm.theoryLevel,
      ensembleParticipation: enrollForm.ensembleParticipation,
      practiceGoals: enrollForm.practiceGoals,
      notes: enrollForm.notes,
      studioName: enrollForm.studioName,
    };

    const newParentProfile =
      parentMode === "new"
        ? {
            username: parentForm.userName.trim(),
            password: parentForm.password.trim(),
            fullName: parentForm.fullName.trim(),
            role: Role.Parent,
            email: parentForm.email.trim(),
            phone: parentForm.phone.trim(),
            address1: parentForm.address1.trim(),
            address2: parentForm.address2.trim(),
            city: parentForm.city.trim(),
            state: parentForm.state,
            zip: parentForm.zip.trim(),
            parentAffiliation: "",
            teacherAffiliation: "",
            studioAffiliation: "",
            studentAffiliations: [],
            description: "",
            comments: "",
          }
        : null;

    try {
      if (mode === "new") {
        const studentProfile = {
          username: profileForm.userName.trim(),
          password: profileForm.password.trim(),
          fullName: profileForm.fullName.trim(),
          role: Role.Student,
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
          address1: profileForm.address1.trim(),
          address2: profileForm.address2.trim(),
          city: profileForm.city.trim(),
          state: profileForm.state,
          zip: profileForm.zip.trim(),
          parentAffiliation: "",
          teacherAffiliation: "",
          studioAffiliation: "",
          studentAffiliations: [],
          description: "",
          comments: "",
        };
        if (parentMode === "new") {
          const res = await getActor().onboardStudentWithParent(
            true,
            studentProfile,
            enrollment,
            true,
            newParentProfile,
            false,
            null,
          );
          if (res.__kind__ === "err") {
            setSubmitError(res.err);
            setSubmitting(false);
            return;
          }
        } else if (parentMode === "link" && selectedParent) {
          const res = await getActor().onboardStudentWithParent(
            true,
            studentProfile,
            enrollment,
            false,
            null,
            true,
            selectedParent.userName,
          );
          if (res.__kind__ === "err") {
            setSubmitError(res.err);
            setSubmitting(false);
            return;
          }
        } else {
          const result = await getActor().createProfile(studentProfile);
          if (result.__kind__ === "err") {
            setSubmitError(result.err);
            setSubmitting(false);
            return;
          }
          await getActor().saveStudentDetail(profileForm.userName.trim(), {
            notes: "",
          });
          await getActor().saveStudentEnrollment(enrollmentId, enrollment);
        }
      } else {
        // existing student
        if (parentMode === "new") {
          const res = await getActor().onboardStudentWithParent(
            false,
            {
              username: studentUserName,
              password: "",
              fullName: "",
              role: Role.Student,
              email: "",
              phone: "",
              address1: "",
              address2: "",
              city: "",
              state: "",
              zip: "",
              parentAffiliation: "",
              teacherAffiliation: "",
              studioAffiliation: "",
              studentAffiliations: [],
              description: "",
              comments: "",
            },
            enrollment,
            true,
            newParentProfile,
            false,
            null,
          );
          if (res.__kind__ === "err") {
            setSubmitError(res.err);
            setSubmitting(false);
            return;
          }
        } else if (parentMode === "link" && selectedParent) {
          const res = await getActor().onboardStudentWithParent(
            false,
            {
              username: studentUserName,
              password: "",
              fullName: "",
              role: Role.Student,
              email: "",
              phone: "",
              address1: "",
              address2: "",
              city: "",
              state: "",
              zip: "",
              parentAffiliation: "",
              teacherAffiliation: "",
              studioAffiliation: "",
              studentAffiliations: [],
              description: "",
              comments: "",
            },
            enrollment,
            false,
            null,
            true,
            selectedParent.userName,
          );
          if (res.__kind__ === "err") {
            setSubmitError(res.err);
            setSubmitting(false);
            return;
          }
        } else {
          await getActor().saveStudentEnrollment(enrollmentId, enrollment);
        }
      }

      const label =
        mode === "new"
          ? profileForm.fullName.trim()
          : selectedExisting!.fullName;
      setSuccessMsg(`${label} enrolled successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const G = "#c9a84c";
  const BG = "#1a2540";
  const BORDER = "rgba(201,168,76,0.3)";
  const TEXT = "#f5f0e8";
  const MUTED = "#8a9bb5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,41,0.88)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="student-onboarding.dialog"
    >
      <div
        className="relative rounded-xl w-full flex flex-col"
        style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
          maxWidth: 520,
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Gold accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{
            background:
              "linear-gradient(90deg,transparent,#c9a84c,transparent)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: TEXT, fontFamily: "var(--font-display)" }}
            >
              Onboard New Student
            </h2>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              Step {step} of 3
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: MUTED }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = G;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = MUTED;
            }}
            data-ocid="student-onboarding.close_button"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div
          className="flex items-center justify-center gap-2 py-3 px-6"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              {s > 1 && (
                <div
                  className="h-px w-6"
                  style={{ background: step >= s ? G : "rgba(201,168,76,0.2)" }}
                />
              )}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background:
                    step >= s
                      ? "rgba(201,168,76,0.18)"
                      : "rgba(255,255,255,0.04)",
                  border: `2px solid ${step >= s ? G : "rgba(201,168,76,0.2)"}`,
                  color: step >= s ? G : MUTED,
                }}
              >
                {s}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: step >= s ? G : MUTED }}
              >
                {s === 1
                  ? "Student Identity"
                  : s === 2
                    ? "Enrollment"
                    : "Parent"}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* === STEP 1 === */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Mode tabs */}
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: `1px solid ${BORDER}` }}
                role="tablist"
              >
                {(["new", "existing"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => {
                      setMode(m);
                      setProfileErrors({});
                      setSelectedExisting(null);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={{
                      background:
                        mode === m ? "rgba(201,168,76,0.18)" : "transparent",
                      color: mode === m ? G : MUTED,
                      border: "none",
                      cursor: "pointer",
                    }}
                    data-ocid={`student-onboarding.tab.${m}`}
                  >
                    {m === "new" ? "New Student" : "Existing Student"}
                  </button>
                ))}
              </div>

              {/* New student form */}
              {mode === "new" && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Username *" error={profileErrors.userName}>
                      <FocusInput
                        type="text"
                        placeholder="e.g. jsmith_student"
                        value={profileForm.userName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            userName: e.target.value,
                          })
                        }
                        autoComplete="off"
                        data-ocid="student-onboarding.username_input"
                      />
                    </Field>
                    <Field label="Password *" error={profileErrors.password}>
                      <FocusInput
                        type="password"
                        placeholder="Initial password"
                        value={profileForm.password}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            password: e.target.value,
                          })
                        }
                        autoComplete="new-password"
                        data-ocid="student-onboarding.password_input"
                      />
                    </Field>
                  </div>
                  <Field label="Full Name *" error={profileErrors.fullName}>
                    <FocusInput
                      type="text"
                      placeholder="Student's full name"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fullName: e.target.value,
                        })
                      }
                      data-ocid="student-onboarding.fullname_input"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email">
                      <FocusInput
                        type="email"
                        placeholder="email@example.com"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.email_input"
                      />
                    </Field>
                    <Field label="Phone">
                      <FocusInput
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.phone_input"
                      />
                    </Field>
                  </div>
                  <Field label="Address Line 1">
                    <FocusInput
                      type="text"
                      placeholder="Street address"
                      value={profileForm.address1}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address1: e.target.value,
                        })
                      }
                      data-ocid="student-onboarding.address1_input"
                    />
                  </Field>
                  <Field label="Address Line 2">
                    <FocusInput
                      type="text"
                      placeholder="Apt, Suite, etc. (optional)"
                      value={profileForm.address2}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address2: e.target.value,
                        })
                      }
                      data-ocid="student-onboarding.address2_input"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City">
                      <FocusInput
                        type="text"
                        placeholder="City"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            city: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.city_input"
                      />
                    </Field>
                    <Field label="State">
                      <FocusSelect
                        value={profileForm.state}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            state: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.state_select"
                      >
                        <option value="">— State —</option>
                        {factStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </FocusSelect>
                    </Field>
                    <Field label="Zip">
                      <FocusInput
                        type="text"
                        placeholder="Zip"
                        value={profileForm.zip}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            zip: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.zip_input"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* Existing student search */}
              {mode === "existing" && (
                <div className="flex flex-col gap-3">
                  <Field label="Search by name or username">
                    <FocusInput
                      type="text"
                      placeholder="Type at least 2 characters…"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      data-ocid="student-onboarding.search_input"
                    />
                  </Field>
                  {searchLoading && (
                    <p
                      className="text-xs"
                      style={{ color: MUTED }}
                      data-ocid="student-onboarding.loading_state"
                    >
                      Searching…
                    </p>
                  )}
                  {!searchLoading && searchResults.length > 0 && (
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ border: `1px solid ${BORDER}` }}
                      data-ocid="student-onboarding.search_results"
                    >
                      {searchResults.map((r, idx) => (
                        <button
                          key={r.userName}
                          type="button"
                          onClick={() => setSelectedExisting(r)}
                          className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors"
                          style={{
                            background:
                              selectedExisting?.userName === r.userName
                                ? "rgba(201,168,76,0.15)"
                                : idx % 2 === 0
                                  ? "rgba(255,255,255,0.02)"
                                  : "transparent",
                            border: "none",
                            borderBottom:
                              idx < searchResults.length - 1
                                ? "1px solid rgba(201,168,76,0.1)"
                                : "none",
                            cursor: "pointer",
                          }}
                          data-ocid={`student-onboarding.search_result.${idx + 1}`}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background:
                                selectedExisting?.userName === r.userName
                                  ? "rgba(201,168,76,0.25)"
                                  : "rgba(201,168,76,0.1)",
                              color: G,
                            }}
                          >
                            {r.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-sm font-medium"
                              style={{ color: TEXT }}
                            >
                              {r.fullName}
                            </div>
                            <div className="text-xs" style={{ color: MUTED }}>
                              @{r.userName}
                            </div>
                          </div>
                          {selectedExisting?.userName === r.userName && (
                            <span
                              className="ml-auto text-xs font-bold"
                              style={{ color: G }}
                            >
                              ✓ Selected
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {!searchLoading &&
                    searchQuery.trim().length >= 2 &&
                    searchResults.length === 0 && (
                      <p
                        className="text-xs text-center py-4"
                        style={{ color: MUTED }}
                        data-ocid="student-onboarding.empty_state"
                      >
                        No students found matching “{searchQuery}”.
                      </p>
                    )}
                  {selectedExisting && (
                    <div
                      className="rounded-lg px-4 py-3 flex items-center gap-3"
                      style={{
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.3)",
                      }}
                      data-ocid="student-onboarding.selected_student"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "rgba(201,168,76,0.2)", color: G }}
                      >
                        {selectedExisting.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: TEXT }}
                        >
                          {selectedExisting.fullName}
                        </p>
                        <p className="text-xs" style={{ color: MUTED }}>
                          @{selectedExisting.userName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === STEP 3 === */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: MUTED }}>
                Link a parent to this student (optional).
              </p>
              <div className="flex gap-3" role="radiogroup">
                {(["skip", "new", "link"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setParentMode(m);
                      setParentSearch("");
                      setParentSearchResults([]);
                      setSelectedParent(null);
                    }}
                    className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors"
                    style={{
                      background:
                        parentMode === m
                          ? "rgba(201,168,76,0.18)"
                          : "transparent",
                      border: `1px solid ${parentMode === m ? G : "rgba(201,168,76,0.25)"}`,
                      color: parentMode === m ? G : MUTED,
                      cursor: "pointer",
                    }}
                    data-ocid={`student-onboarding.parent_mode.${m}`}
                  >
                    {m === "skip"
                      ? "Skip"
                      : m === "new"
                        ? "Create New Parent"
                        : "Link Existing"}
                  </button>
                ))}
              </div>
              {parentMode === "new" && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Username *">
                      <FocusInput
                        type="text"
                        placeholder="e.g. parent_smith"
                        value={parentForm.userName}
                        onChange={(e) =>
                          setParentForm({
                            ...parentForm,
                            userName: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.parent_username_input"
                      />
                    </Field>
                    <Field label="Password *">
                      <FocusInput
                        type="password"
                        placeholder="Initial password"
                        value={parentForm.password}
                        onChange={(e) =>
                          setParentForm({
                            ...parentForm,
                            password: e.target.value,
                          })
                        }
                        autoComplete="new-password"
                        data-ocid="student-onboarding.parent_password_input"
                      />
                    </Field>
                  </div>
                  <Field label="Full Name *">
                    <FocusInput
                      type="text"
                      placeholder="Parent's full name"
                      value={parentForm.fullName}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          fullName: e.target.value,
                        })
                      }
                      data-ocid="student-onboarding.parent_fullname_input"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email">
                      <FocusInput
                        type="email"
                        value={parentForm.email}
                        onChange={(e) =>
                          setParentForm({
                            ...parentForm,
                            email: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.parent_email_input"
                      />
                    </Field>
                    <Field label="Phone">
                      <FocusInput
                        type="tel"
                        value={parentForm.phone}
                        onChange={(e) =>
                          setParentForm({
                            ...parentForm,
                            phone: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.parent_phone_input"
                      />
                    </Field>
                  </div>
                  <Field label="Address Line 1">
                    <FocusInput
                      type="text"
                      value={parentForm.address1}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          address1: e.target.value,
                        })
                      }
                      data-ocid="student-onboarding.parent_address1_input"
                    />
                  </Field>
                  <Field label="Address Line 2">
                    <FocusInput
                      type="text"
                      value={parentForm.address2}
                      onChange={(e) =>
                        setParentForm({
                          ...parentForm,
                          address2: e.target.value,
                        })
                      }
                      data-ocid="student-onboarding.parent_address2_input"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City">
                      <FocusInput
                        type="text"
                        value={parentForm.city}
                        onChange={(e) =>
                          setParentForm({ ...parentForm, city: e.target.value })
                        }
                        data-ocid="student-onboarding.parent_city_input"
                      />
                    </Field>
                    <Field label="State">
                      <FocusSelect
                        value={parentForm.state}
                        onChange={(e) =>
                          setParentForm({
                            ...parentForm,
                            state: e.target.value,
                          })
                        }
                        data-ocid="student-onboarding.parent_state_select"
                      >
                        <option value="">— State —</option>
                        {factStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </FocusSelect>
                    </Field>
                    <Field label="Zip">
                      <FocusInput
                        type="text"
                        value={parentForm.zip}
                        onChange={(e) =>
                          setParentForm({ ...parentForm, zip: e.target.value })
                        }
                        data-ocid="student-onboarding.parent_zip_input"
                      />
                    </Field>
                  </div>
                </div>
              )}
              {parentMode === "link" && (
                <div className="flex flex-col gap-3">
                  <Field label="Search parent by name or username">
                    <FocusInput
                      type="text"
                      placeholder="Type at least 2 characters…"
                      value={parentSearch}
                      onChange={(e) => handleParentSearch(e.target.value)}
                      data-ocid="student-onboarding.parent_search_input"
                    />
                  </Field>
                  {parentSearchResults.length > 0 && (
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ border: `1px solid ${BORDER}` }}
                    >
                      {parentSearchResults.map((r, idx) => (
                        <button
                          key={r.userName}
                          type="button"
                          onClick={() => setSelectedParent(r)}
                          className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors"
                          style={{
                            background:
                              selectedParent?.userName === r.userName
                                ? "rgba(201,168,76,0.15)"
                                : idx % 2 === 0
                                  ? "rgba(255,255,255,0.02)"
                                  : "transparent",
                            border: "none",
                            borderBottom:
                              idx < parentSearchResults.length - 1
                                ? "1px solid rgba(201,168,76,0.1)"
                                : "none",
                            cursor: "pointer",
                          }}
                          data-ocid={`student-onboarding.parent_result.${idx + 1}`}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background:
                                selectedParent?.userName === r.userName
                                  ? "rgba(201,168,76,0.25)"
                                  : "rgba(201,168,76,0.1)",
                              color: G,
                            }}
                          >
                            {r.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-sm font-medium"
                              style={{ color: TEXT }}
                            >
                              {r.fullName}
                            </div>
                            <div className="text-xs" style={{ color: MUTED }}>
                              @{r.userName}
                            </div>
                          </div>
                          {selectedParent?.userName === r.userName && (
                            <span
                              className="ml-auto text-xs font-bold"
                              style={{ color: G }}
                            >
                              ✓ Selected
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedParent && (
                    <div
                      className="rounded-lg px-4 py-3 flex items-center gap-3"
                      style={{
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.3)",
                      }}
                      data-ocid="student-onboarding.selected_parent"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "rgba(201,168,76,0.2)", color: G }}
                      >
                        {selectedParent.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: TEXT }}
                        >
                          {selectedParent.fullName}
                        </p>
                        <p className="text-xs" style={{ color: MUTED }}>
                          @{selectedParent.userName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === STEP 2 === */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              {/* Teacher auto-assign badge */}
              <div
                className="rounded-lg px-4 py-2.5 flex items-center gap-2"
                style={{
                  background: "rgba(201,168,76,0.06)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <span className="text-xs" style={{ color: MUTED }}>
                  Teacher:
                </span>
                <span className="text-xs font-semibold" style={{ color: G }}>
                  @{teacherUsername}
                </span>
                <span className="text-xs ml-auto" style={{ color: MUTED }}>
                  (auto-assigned)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Studio">
                  <FocusSelect
                    value={enrollForm.studioName}
                    onChange={(e) =>
                      setEnrollForm({
                        ...enrollForm,
                        studioName: e.target.value,
                      })
                    }
                    data-ocid="student-onboarding.studio_select"
                  >
                    <option value="Independent">Independent</option>
                    {teacherAffiliations.map((a) => (
                      <option key={a.studioName} value={a.studioName}>
                        {a.studioName}
                      </option>
                    ))}
                  </FocusSelect>
                </Field>
                <Field label="Instrument *" error={enrollErrors.instrument}>
                  <FocusSelect
                    value={enrollForm.instrument}
                    onChange={(e) =>
                      setEnrollForm({
                        ...enrollForm,
                        instrument: e.target.value,
                        voiceType:
                          e.target.value === "Voice"
                            ? enrollForm.voiceType
                            : "",
                      })
                    }
                    data-ocid="student-onboarding.instrument_select"
                  >
                    <option value="">— Select —</option>
                    {instruments.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </FocusSelect>
                </Field>
              </div>
              {enrollForm.instrument === "Voice" && (
                <Field label="Voice Type">
                  <FocusSelect
                    value={enrollForm.voiceType}
                    onChange={(e) =>
                      setEnrollForm({
                        ...enrollForm,
                        voiceType: e.target.value,
                      })
                    }
                    data-ocid="student-onboarding.voice_type_select"
                  >
                    <option value="">— Select —</option>
                    {voiceTypes.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </FocusSelect>
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Skill Level">
                  <FocusSelect
                    value={enrollForm.skillLevel}
                    onChange={(e) =>
                      setEnrollForm({
                        ...enrollForm,
                        skillLevel: e.target.value,
                      })
                    }
                    data-ocid="student-onboarding.skill_level_select"
                  >
                    <option value="">— Select —</option>
                    {skillLevels.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </FocusSelect>
                </Field>
                <Field label="Theory Level">
                  <FocusSelect
                    value={enrollForm.theoryLevel}
                    onChange={(e) =>
                      setEnrollForm({
                        ...enrollForm,
                        theoryLevel: e.target.value,
                      })
                    }
                    data-ocid="student-onboarding.theory_level_select"
                  >
                    <option value="">— Select —</option>
                    {theoryLevels.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </FocusSelect>
                </Field>
              </div>
              <Field label="Ensemble Participation">
                <FocusInput
                  type="text"
                  placeholder="e.g. String Ensemble, Jazz Combo"
                  value={enrollForm.ensembleParticipation}
                  onChange={(e) =>
                    setEnrollForm({
                      ...enrollForm,
                      ensembleParticipation: e.target.value,
                    })
                  }
                  data-ocid="student-onboarding.ensemble_input"
                />
              </Field>
              <Field label="Practice Goals">
                <FocusTextarea
                  placeholder="Student's practice goals…"
                  value={enrollForm.practiceGoals}
                  onChange={(e) =>
                    setEnrollForm({
                      ...enrollForm,
                      practiceGoals: e.target.value,
                    })
                  }
                  data-ocid="student-onboarding.practice_goals_textarea"
                />
              </Field>
              <Field label="Notes">
                <FocusTextarea
                  placeholder="Enrollment notes…"
                  value={enrollForm.notes}
                  onChange={(e) =>
                    setEnrollForm({ ...enrollForm, notes: e.target.value })
                  }
                  data-ocid="student-onboarding.notes_textarea"
                />
              </Field>
            </div>
          )}

          {submitError && (
            <div
              className="mt-3 rounded-lg px-4 py-3 text-sm"
              style={{
                background: "rgba(224,92,92,0.1)",
                border: "1px solid rgba(224,92,92,0.3)",
                color: "#e05c5c",
              }}
              data-ocid="student-onboarding.error_state"
            >
              {submitError}
            </div>
          )}
          {successMsg && (
            <div
              className="mt-3 rounded-lg px-4 py-3 text-sm font-medium"
              style={{
                background: "rgba(74,197,130,0.1)",
                border: "1px solid rgba(74,197,130,0.3)",
                color: "#4ac582",
              }}
              data-ocid="student-onboarding.success_state"
            >
              ✓ {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: MUTED,
                }}
                data-ocid="student-onboarding.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={mode === "existing" && !selectedExisting}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: "rgba(201,168,76,0.2)",
                  border: `1px solid ${mode === "existing" && !selectedExisting ? "rgba(201,168,76,0.2)" : G}`,
                  color:
                    mode === "existing" && !selectedExisting
                      ? "rgba(201,168,76,0.4)"
                      : G,
                  cursor:
                    mode === "existing" && !selectedExisting
                      ? "not-allowed"
                      : "pointer",
                }}
                data-ocid="student-onboarding.next_button"
              >
                Next →
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: MUTED,
                }}
                data-ocid="student-onboarding.back_button"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextToStep3}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: "rgba(201,168,76,0.2)",
                  border: `1px solid ${G}`,
                  color: G,
                  cursor: "pointer",
                }}
                data-ocid="student-onboarding.next_to_step3_button"
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: MUTED,
                }}
                data-ocid="student-onboarding.back_button"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: submitting
                    ? "rgba(201,168,76,0.1)"
                    : "rgba(201,168,76,0.2)",
                  border: `1px solid ${submitting ? "rgba(201,168,76,0.25)" : G}`,
                  color: submitting ? "rgba(201,168,76,0.5)" : G,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
                data-ocid="student-onboarding.save_button"
              >
                {submitting ? "Saving…" : "Finish & Enroll"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
