import { Role } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getActor } from "@/lib/actor";
import type { UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

interface AuthPageProps {
  onLogin: (profile: UserProfile) => void;
}

type AuthMode = "signin" | "signup";

const ROLES: { label: string; value: Role }[] = [
  { label: "Studio Director", value: Role.Studio },
  { label: "Teacher", value: Role.Teacher },
  { label: "Student", value: Role.Student },
  { label: "Parent", value: Role.Parent },
];

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>(Role.Unassigned);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");

  useEffect(() => {
    if (mode !== "signin") return;
    let cancelled = false;
    async function load() {
      setProfilesLoading(true);
      try {
        const actor = getActor();
        const result = await actor.getAllProfiles();
        if (cancelled) return;
        const list = result.map(([, p]) => ({
          username: p.username,
          fullName: p.fullName,
          role: p.role as import("@/types/auth").UserRole,
        }));
        setProfiles(list);
      } catch {
        setProfiles([]);
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const actor = getActor();
      if (mode === "signin") {
        const result = await actor.signIn(username, password);
        if (result.__kind__ === "ok") {
          onLogin({
            username: result.ok.username,
            fullName: result.ok.fullName,
            role: result.ok.role as import("@/types/auth").UserRole,
          });
        } else {
          setError(result.err);
        }
      } else {
        const result = await actor.signUp(username, password, fullName, role);
        if (result.__kind__ === "ok") {
          // Save additional profile fields
          await actor.updateProfile(username, {
            address1,
            address2,
            city,
            state,
            zip,
            email,
            phone,
          });
          const signInResult = await actor.signIn(username, password);
          if (signInResult.__kind__ === "ok") {
            onLogin({
              username: signInResult.ok.username,
              fullName: signInResult.ok.fullName,
              role: signInResult.ok.role as import("@/types/auth").UserRole,
            });
          } else {
            setError("Account created. Please sign in.");
            setMode("signin");
          }
        } else {
          setError(result.err);
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0f1729" }}
      data-ocid="auth.page"
    >
      <div
        className="w-full max-w-md rounded-xl p-8 shadow-2xl"
        style={{
          background: "#1a2540",
          border: "1px solid rgba(201,168,76,0.2)",
        }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "rgba(201,168,76,0.15)" }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              role="img"
              aria-label="Music studio logo"
            >
              <title>Music studio logo</title>
              <path
                d="M8 24 C8 16 16 8 24 8"
                stroke="#c9a84c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M8 24 C8 18 14 12 20 12"
                stroke="#c9a84c"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="24" cy="8" r="3" fill="#c9a84c" />
            </svg>
          </div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "#f5f0e8" }}
          >
            Practice Makes Perfect
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8a9bb5" }}>
            Music Studio Management
          </p>
        </div>

        {/* Tab switcher */}
        <div
          className="flex rounded-lg mb-6 p-1"
          style={{ background: "#0f1729" }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-smooth"
            style={{
              background: mode === "signin" ? "#c9a84c" : "transparent",
              color: mode === "signin" ? "#0f1729" : "#8a9bb5",
            }}
            data-ocid="auth.signin_tab"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-smooth"
            style={{
              background: mode === "signup" ? "#c9a84c" : "transparent",
              color: mode === "signup" ? "#0f1729" : "#8a9bb5",
            }}
            data-ocid="auth.signup_tab"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signin" && (
            <div data-ocid="auth.profile_browser">
              <Label
                style={{
                  color: "#c9a84c",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Select Profile
              </Label>
              <input
                type="text"
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                placeholder="Search profiles…"
                className="mt-1 mb-2 w-full rounded-md px-3 py-2 text-sm"
                style={{
                  background: "#0f1729",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#f5f0e8",
                  outline: "none",
                }}
                data-ocid="auth.profile_search_input"
              />
              <div
                className="rounded-lg overflow-y-auto"
                style={{
                  maxHeight: 180,
                  background: "#0f1729",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                {profilesLoading ? (
                  <div
                    className="text-center py-4 text-sm"
                    style={{ color: "#8a9bb5" }}
                    data-ocid="auth.profile_browser.loading_state"
                  >
                    Loading profiles…
                  </div>
                ) : profiles.length === 0 ? (
                  <div
                    className="text-center py-4 text-sm"
                    style={{ color: "#8a9bb5" }}
                    data-ocid="auth.profile_browser.empty_state"
                  >
                    No profiles found.
                  </div>
                ) : (
                  profiles
                    .filter((p) => {
                      const q = profileSearch.toLowerCase();
                      return (
                        p.username.toLowerCase().includes(q) ||
                        p.fullName.toLowerCase().includes(q) ||
                        p.role.toLowerCase().includes(q)
                      );
                    })
                    .map((p, i) => (
                      <button
                        key={p.username}
                        type="button"
                        onClick={() => setUsername(p.username)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left transition-smooth"
                        style={{
                          background: "transparent",
                          borderBottom: "1px solid rgba(201,168,76,0.08)",
                          color: "#f5f0e8",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(201,168,76,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                        }}
                        data-ocid={`auth.profile_browser.item.${i + 1}`}
                      >
                        <span className="text-sm truncate">{p.fullName}</span>
                        <span className="flex items-center gap-2">
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: "#c9a84c",
                            }}
                          >
                            {p.role}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "#8a9bb5" }}
                          >
                            {p.username}
                          </span>
                        </span>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}

          <div>
            <Label
              htmlFor="username"
              style={{
                color: "#c9a84c",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="your_username"
              className="mt-1"
              style={{
                background: "#0f1729",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#f5f0e8",
              }}
              data-ocid="auth.username_input"
            />
          </div>

          {mode === "signup" && (
            <>
              <div>
                <Label
                  htmlFor="fullName"
                  style={{
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Alex Chen"
                  className="mt-1"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#f5f0e8",
                  }}
                  data-ocid="auth.fullname_input"
                />
              </div>
              <div>
                <Label
                  htmlFor="address1"
                  style={{
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Address 1
                </Label>
                <Input
                  id="address1"
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="123 Main St"
                  className="mt-1"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#f5f0e8",
                  }}
                  data-ocid="auth.address1_input"
                />
              </div>
              <div>
                <Label
                  htmlFor="address2"
                  style={{
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Address 2
                </Label>
                <Input
                  id="address2"
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt 4B"
                  className="mt-1"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#f5f0e8",
                  }}
                  data-ocid="auth.address2_input"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label
                    htmlFor="city"
                    style={{
                      color: "#c9a84c",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nashville"
                    className="mt-1"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.3)",
                      color: "#f5f0e8",
                    }}
                    data-ocid="auth.city_input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="state"
                    style={{
                      color: "#c9a84c",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="TN"
                    className="mt-1"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.3)",
                      color: "#f5f0e8",
                    }}
                    data-ocid="auth.state_input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="zip"
                    style={{
                      color: "#c9a84c",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    ZIP
                  </Label>
                  <Input
                    id="zip"
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="37201"
                    className="mt-1"
                    style={{
                      background: "#0f1729",
                      border: "1px solid rgba(201,168,76,0.3)",
                      color: "#f5f0e8",
                    }}
                    data-ocid="auth.zip_input"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="email"
                  style={{
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="mt-1"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#f5f0e8",
                  }}
                  data-ocid="auth.email_input"
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  style={{
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                  style={{
                    background: "#0f1729",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#f5f0e8",
                  }}
                  data-ocid="auth.phone_input"
                />
              </div>
            </>
          )}

          <div>
            <Label
              htmlFor="password"
              style={{
                color: "#c9a84c",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              placeholder="••••••••"
              className="mt-1"
              style={{
                background: "#0f1729",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#f5f0e8",
              }}
              data-ocid="auth.password_input"
            />
          </div>

          {mode === "signup" && (
            <div>
              <Label
                htmlFor="role"
                style={{
                  color: "#c9a84c",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Role
              </Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 w-full rounded-md px-3 py-2 text-sm"
                style={{
                  background: "#0f1729",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#f5f0e8",
                }}
                data-ocid="auth.role_select"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p
              className="text-sm rounded-lg px-3 py-2"
              style={{
                background: "rgba(220,38,38,0.1)",
                color: "#f87171",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
              data-ocid="auth.error_state"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-2.5 mt-2"
            style={{ background: "#c9a84c", color: "#0f1729" }}
            data-ocid="auth.submit_button"
          >
            {loading
              ? "Please wait…"
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
