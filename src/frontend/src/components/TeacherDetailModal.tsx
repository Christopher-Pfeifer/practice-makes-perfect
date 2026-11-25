import { Role } from "@/backend";
import type {
  Profile,
  TeacherDetail,
  TeacherStudioAffiliation,
} from "@/backend";
import InstrumentPicker from "@/components/InstrumentPicker";
import { getActor } from "@/lib/actor";
import { useEffect, useState } from "react";

interface TeacherDetailModalProps {
  username: string;
  onClose: () => void;
}

const G_COLOR = "#c9a84c";
const DEEP_BG = "#0f1729";
const TEXT_COLOR = "#f5f0e8";
const MUTED_COLOR = "#8a9bb5";
const BORDER_25 = "rgba(201,168,76,0.25)";
const BORDER_35 = "rgba(201,168,76,0.35)";
const BORDER_15 = "rgba(201,168,76,0.15)";

const fieldInpStyle: React.CSSProperties = {
  background: DEEP_BG,
  border: `1px solid ${BORDER_25}`,
  color: TEXT_COLOR,
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none",
};
const fieldLblStyle: React.CSSProperties = {
  color: MUTED_COLOR,
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 4,
  display: "block",
};

function FField({
  label,
  children,
  error,
}: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <span style={fieldLblStyle}>{label}</span>
      {children}
      {error && (
        <p style={{ color: "#e05c5c", fontSize: 11, marginTop: 3 }}>{error}</p>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="flex items-center gap-2 pt-2 pb-1"
      style={{ borderBottom: `1px solid ${BORDER_15}` }}
    >
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: G_COLOR }}
      >
        {title}
      </span>
    </div>
  );
}

const EMPTY: TeacherDetail = {
  instruments: "",
  bio: "",
  yearsExperience: "",
  certifications: "",
  notes: "",
};

export default function TeacherDetailModal({
  username,
  onClose,
}: TeacherDetailModalProps) {
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [showPwChange, setShowPwChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  // Detail fields
  const [form, setForm] = useState<TeacherDetail>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [affiliations, setAffiliations] = useState<TeacherStudioAffiliation[]>(
    [],
  );
  const [selectedStudioToAdd, setSelectedStudioToAdd] = useState("");
  const [allStudios, setAllStudios] = useState<
    { userName: string; fullName: string }[]
  >([]);
  const [certificationsList, setCertificationsList] = useState<string[]>([]);
  const [factStates, setFactStates] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const actor = getActor();
        const [allProfiles, data, affs, certs, states] = await Promise.all([
          actor.getAllProfiles().catch(() => [] as [string, Profile][]),
          actor.getTeacherDetail(username).catch(() => null),
          actor
            .getTeacherStudioAffiliations(username)
            .catch(() => [] as TeacherStudioAffiliation[]),
          actor.getCertifications().catch(() => [] as string[]),
          actor.getFactStates().catch(() => [] as string[]),
        ]);
        const me = allProfiles.find(([u]) => u === username)?.[1];
        if (me) {
          setFullName(me.fullName);
          setEmail(me.email);
          setPhone(me.phone);
          setAddress1(me.address1);
          setAddress2(me.address2);
          setCity(me.city);
          setState(me.state);
          setZip(me.zip);
        }
        if (data) setForm(data);
        setAllStudios(
          allProfiles
            .filter(([, p]) => p.role === Role.Studio)
            .map(([, p]) => ({ userName: p.username, fullName: p.fullName })),
        );
        setAffiliations(affs);
        setCertificationsList(certs);
        setFactStates(states);
      } catch {
        /* start with empty form */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const profileUpdate: Record<string, unknown> = {
        fullName,
        email,
        phone,
        address1,
        address2,
        city,
        state,
        zip,
      };
      if (showPwChange && newPassword.trim())
        profileUpdate.password = newPassword.trim();
      const result = await getActor().updateTeacherProfile(
        username,
        profileUpdate,
        form,
      );
      if (result.__kind__ === "err") {
        setIsError(true);
        setMessage(`Error: ${result.err}`);
      } else {
        setIsError(false);
        setMessage("Profile saved.");
        setShowPwChange(false);
        setNewPassword("");
      }
    } catch (e) {
      setIsError(true);
      setMessage(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAffiliation = async () => {
    if (!selectedStudioToAdd) return;
    try {
      const res = await getActor().addTeacherStudioAffiliation(
        username,
        selectedStudioToAdd,
      );
      if (res.__kind__ === "err") {
        setIsError(true);
        setMessage(`Error: ${res.err}`);
        return;
      }
      setAffiliations(await getActor().getTeacherStudioAffiliations(username));
      setSelectedStudioToAdd("");
    } catch (e) {
      setIsError(true);
      setMessage(
        `Error adding studio: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };

  const handleRemoveAffiliation = async (studioUserName: string) => {
    try {
      await getActor().removeTeacherStudioAffiliation(username, studioUserName);
      setAffiliations(await getActor().getTeacherStudioAffiliations(username));
    } catch (e) {
      setIsError(true);
      setMessage(
        `Error removing studio: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };

  const selectedCertifications = form.certifications
    ? form.certifications
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const toggleCertification = (cert: string) => {
    const next = selectedCertifications.includes(cert)
      ? selectedCertifications.filter((c) => c !== cert)
      : [...selectedCertifications, cert];
    setForm((f) => ({ ...f, certifications: next.join("|") }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="teacher-detail.dialog"
    >
      <div
        className="relative rounded-xl w-full flex flex-col"
        style={{
          background: "#1a2540",
          border: `1px solid ${BORDER_35}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          maxWidth: 560,
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
          style={{ borderBottom: `1px solid ${BORDER_15}` }}
        >
          <h2
            className="text-xl font-display font-bold"
            style={{ color: TEXT_COLOR }}
          >
            Teacher Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: MUTED_COLOR }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = G_COLOR;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = MUTED_COLOR;
            }}
            data-ocid="teacher-detail.close_button"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div
              className="text-sm py-8 text-center"
              style={{ color: MUTED_COLOR }}
              data-ocid="teacher-detail.loading_state"
            >
              Loading…
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Section A: Profile */}
              <SectionHeader title="Contact & Identity" />
              <FField label="Full Name">
                <input
                  type="text"
                  style={fieldInpStyle}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  data-ocid="teacher-detail.fullname_input"
                />
              </FField>
              <div className="grid grid-cols-2 gap-3">
                <FField label="Email">
                  <input
                    type="email"
                    style={fieldInpStyle}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="teacher-detail.email_input"
                  />
                </FField>
                <FField label="Phone">
                  <input
                    type="tel"
                    style={fieldInpStyle}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-ocid="teacher-detail.phone_input"
                  />
                </FField>
              </div>
              <FField label="Address Line 1">
                <input
                  type="text"
                  style={fieldInpStyle}
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  data-ocid="teacher-detail.address1_input"
                />
              </FField>
              <FField label="Address Line 2">
                <input
                  type="text"
                  style={fieldInpStyle}
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt, Suite (optional)"
                  data-ocid="teacher-detail.address2_input"
                />
              </FField>
              <div className="grid grid-cols-3 gap-3">
                <FField label="City">
                  <input
                    type="text"
                    style={fieldInpStyle}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-ocid="teacher-detail.city_input"
                  />
                </FField>
                <FField label="State">
                  <select
                    style={fieldInpStyle}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    data-ocid="teacher-detail.state_select"
                  >
                    <option value="">— State —</option>
                    {factStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FField>
                <FField label="Zip">
                  <input
                    type="text"
                    style={fieldInpStyle}
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    data-ocid="teacher-detail.zip_input"
                  />
                </FField>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPwChange((v) => !v);
                    setNewPassword("");
                  }}
                  className="text-xs font-semibold transition-colors"
                  style={{
                    color: showPwChange ? G_COLOR : MUTED_COLOR,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  data-ocid="teacher-detail.change_password_toggle"
                >
                  {showPwChange
                    ? "▼ Cancel Password Change"
                    : "▶ Change Password"}
                </button>
                {showPwChange && (
                  <div className="mt-2">
                    <FField label="New Password">
                      <input
                        type="password"
                        style={fieldInpStyle}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        data-ocid="teacher-detail.new_password_input"
                      />
                    </FField>
                  </div>
                )}
              </div>
              {/* Section B: Teacher Details */}
              <SectionHeader title="Teaching Profile" />
              <InstrumentPicker
                value={form.instruments}
                onChange={(v) => setForm((f) => ({ ...f, instruments: v }))}
                label="Instrument(s)"
                ocidPrefix="teacher-detail.instruments"
              />
              <FField label="Bio">
                <textarea
                  style={{
                    ...fieldInpStyle,
                    minHeight: 72,
                    resize: "vertical",
                  }}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  data-ocid="teacher-detail.bio_textarea"
                />
              </FField>
              <FField label="Years of Experience">
                <input
                  type="number"
                  min="0"
                  style={fieldInpStyle}
                  value={form.yearsExperience}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, yearsExperience: e.target.value }))
                  }
                  data-ocid="teacher-detail.years_experience_input"
                />
              </FField>
              {/* Certifications multi-select */}
              <div>
                <span style={fieldLblStyle}>Certifications</span>
                {selectedCertifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedCertifications.map((cert) => (
                      <span
                        key={cert}
                        className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: "rgba(201,168,76,0.18)",
                          color: G_COLOR,
                          border: `1px solid ${BORDER_35}`,
                        }}
                        data-ocid="teacher-detail.certification-chip"
                      >
                        {cert}
                        <button
                          type="button"
                          aria-label={`Remove ${cert}`}
                          onClick={() => toggleCertification(cert)}
                          style={{
                            color: G_COLOR,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            lineHeight: 1,
                            padding: "0 1px",
                            fontSize: 11,
                            opacity: 0.8,
                          }}
                          data-ocid="teacher-detail.certification-remove"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <select
                  style={fieldInpStyle}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) toggleCertification(e.target.value);
                  }}
                  data-ocid="teacher-detail.certifications_select"
                >
                  <option value="">— Add certification —</option>
                  {certificationsList
                    .filter((c) => !selectedCertifications.includes(c))
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              {/* Section C: Studio Affiliations */}
              <SectionHeader title="Studio Affiliations" />
              {affiliations.length === 0 ? (
                <p className="text-sm" style={{ color: MUTED_COLOR }}>
                  No studio affiliations.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {affiliations.map((aff) => (
                    <span
                      key={aff.studioUserName}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: "rgba(201,168,76,0.18)",
                        color: G_COLOR,
                        border: `1px solid ${BORDER_35}`,
                      }}
                      data-ocid="teacher-detail.affiliation-chip"
                    >
                      {aff.studioName}
                      <button
                        type="button"
                        aria-label={`Remove ${aff.studioName}`}
                        onClick={() =>
                          handleRemoveAffiliation(aff.studioUserName)
                        }
                        style={{
                          color: G_COLOR,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          lineHeight: 1,
                          padding: "0 1px",
                          fontSize: 11,
                          opacity: 0.8,
                        }}
                        data-ocid="teacher-detail.affiliation-remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <select
                  style={{ ...fieldInpStyle, flex: 1 }}
                  value={selectedStudioToAdd}
                  onChange={(e) => setSelectedStudioToAdd(e.target.value)}
                  data-ocid="teacher-detail.affiliation-add-select"
                >
                  <option value="">— Add studio —</option>
                  {allStudios
                    .filter(
                      (s) =>
                        !affiliations.some(
                          (a) => a.studioUserName === s.userName,
                        ),
                    )
                    .map((s) => (
                      <option key={s.userName} value={s.userName}>
                        {s.fullName}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddAffiliation}
                  disabled={!selectedStudioToAdd}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-smooth"
                  style={{
                    background: "rgba(201,168,76,0.15)",
                    border: "1px solid rgba(201,168,76,0.4)",
                    color: G_COLOR,
                    opacity: !selectedStudioToAdd ? 0.5 : 1,
                    cursor: !selectedStudioToAdd ? "not-allowed" : "pointer",
                  }}
                  data-ocid="teacher-detail.affiliation-add-button"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 gap-3"
          style={{ borderTop: `1px solid ${BORDER_15}` }}
        >
          {message && (
            <p
              className="text-xs flex-1"
              style={{ color: isError ? "#e05c5c" : G_COLOR }}
              data-ocid={
                isError
                  ? "teacher-detail.error_state"
                  : "teacher-detail.success_state"
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
                color: MUTED_COLOR,
              }}
              data-ocid="teacher-detail.cancel_button"
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
                color: G_COLOR,
                opacity: saving || loading ? 0.5 : 1,
                cursor: saving || loading ? "not-allowed" : "pointer",
              }}
              data-ocid="teacher-detail.save_button"
            >
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
