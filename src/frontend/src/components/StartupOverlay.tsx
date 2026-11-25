import { getActor, initActor } from "@/lib/actor";
import { useEffect, useState } from "react";

type StepStatus = "pending" | "running" | "success" | "error";

interface Step {
  id: number;
  label: string;
  detail: string;
  status: StepStatus;
  result: string;
}

interface StartupOverlayProps {
  onReady: () => void;
}

const initialSteps: Step[] = [
  {
    id: 1,
    label: "Fetch Configuration",
    detail: "Loading /env.json",
    status: "pending",
    result: "",
  },
  {
    id: 2,
    label: "Initialize Actor",
    detail: "Connecting to canister",
    status: "pending",
    result: "",
  },
  {
    id: 3,
    label: "Verify Backend",
    detail: "Testing canister reachability",
    status: "pending",
    result: "",
  },
];

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "pending") return <span style={{ color: "#4a5a70" }}>○</span>;
  if (status === "running") return <span style={{ color: "#c9a84c" }}>◌</span>;
  if (status === "success") return <span style={{ color: "#4ade80" }}>✓</span>;
  return <span style={{ color: "#f87171" }}>✗</span>;
}

export default function StartupOverlay({ onReady }: StartupOverlayProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [allPassed, setAllPassed] = useState(false);
  const [canisterId, setCanisterId] = useState("");

  function updateStep(id: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  useEffect(() => {
    void runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runChecks() {
    // Step 1: Fetch /env.json
    updateStep(1, { status: "running", detail: "Fetching /env.json…" });
    let cid = "";
    try {
      const res = await fetch("/env.json");
      const raw = await res.text();
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        throw new Error(`Invalid JSON in /env.json: ${raw.slice(0, 200)}`);
      }
      cid = String(
        parsed.backend_canister_id ??
          parsed.canisterId ??
          parsed.CANISTER_ID ??
          parsed.canister_id ??
          "",
      );
      if (!cid || cid === "undefined" || cid === "null") {
        throw new Error(
          `No valid canisterId in /env.json. Got: ${JSON.stringify(parsed)}`,
        );
      }
      setCanisterId(cid);
      updateStep(1, {
        status: "success",
        result: `canisterId: ${cid}`,
        detail: "Configuration loaded",
      });
    } catch (err) {
      updateStep(1, { status: "error", result: String(err), detail: "Failed" });
      return;
    }

    // Step 2: Init actor
    updateStep(2, {
      status: "running",
      detail: "Initializing actor singleton…",
    });
    try {
      initActor(cid);
      updateStep(2, {
        status: "success",
        result: `Actor created for canister ${cid}`,
        detail: "Actor initialized",
      });
    } catch (err) {
      updateStep(2, { status: "error", result: String(err), detail: "Failed" });
      return;
    }

    // Step 3: Ping backend
    updateStep(3, { status: "running", detail: "Calling ping()…" });
    try {
      const actor = getActor();
      const pong = await actor.ping();
      updateStep(3, {
        status: "success",
        result: `Response: "${pong}"`,
        detail: "Canister reachable",
      });
      setAllPassed(true);
    } catch (err) {
      updateStep(3, { status: "error", result: String(err), detail: "Failed" });
    }
  }

  const currentSteps = steps;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0f1729" }}
      data-ocid="startup.page"
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          background: "#1a2540",
          border: "1px solid rgba(201,168,76,0.25)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              role="img"
              aria-label="Practice Makes Perfect logo"
            >
              <title>Practice Makes Perfect logo</title>
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
            className="text-xl font-display font-bold"
            style={{ color: "#f5f0e8" }}
          >
            Practice Makes Perfect
          </h1>
          <p
            className="text-sm mt-1 font-medium tracking-wider uppercase"
            style={{ color: "#c9a84c", fontSize: "0.7rem" }}
          >
            Startup Health Checks
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {currentSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-xl px-4 py-3"
              style={{
                background:
                  step.status === "success"
                    ? "rgba(74,222,128,0.06)"
                    : step.status === "error"
                      ? "rgba(248,113,113,0.06)"
                      : step.status === "running"
                        ? "rgba(201,168,76,0.08)"
                        : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  step.status === "success"
                    ? "rgba(74,222,128,0.2)"
                    : step.status === "error"
                      ? "rgba(248,113,113,0.2)"
                      : step.status === "running"
                        ? "rgba(201,168,76,0.3)"
                        : "rgba(255,255,255,0.06)"
                }`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-base mt-0.5 font-mono">
                  <StatusIcon status={step.status} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#f5f0e8" }}
                    >
                      {step.label}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color:
                          step.status === "success"
                            ? "#4ade80"
                            : step.status === "error"
                              ? "#f87171"
                              : step.status === "running"
                                ? "#c9a84c"
                                : "#4a5a70",
                      }}
                    >
                      {step.status === "pending"
                        ? "Waiting"
                        : step.status === "running"
                          ? "Running…"
                          : step.status === "success"
                            ? "Success"
                            : "Error"}
                    </span>
                  </div>
                  {step.result && (
                    <p
                      className="text-xs mt-1 font-mono break-all"
                      style={{
                        color: step.status === "error" ? "#f87171" : "#8a9bb5",
                      }}
                    >
                      {step.result}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Canister ID display */}
        {canisterId && (
          <div
            className="mb-6 rounded-lg px-3 py-2 text-xs font-mono"
            style={{
              background: "rgba(201,168,76,0.08)",
              color: "#c9a84c",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            Canister: {canisterId}
          </div>
        )}

        {/* Continue button */}
        <button
          type="button"
          disabled={!allPassed}
          onClick={onReady}
          className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-smooth"
          style={{
            background: allPassed ? "#c9a84c" : "rgba(201,168,76,0.2)",
            color: allPassed ? "#0f1729" : "#4a5a70",
            cursor: allPassed ? "pointer" : "not-allowed",
          }}
          data-ocid="startup.continue_button"
        >
          {allPassed ? "Continue to Login →" : "Running checks…"}
        </button>
      </div>
    </div>
  );
}
