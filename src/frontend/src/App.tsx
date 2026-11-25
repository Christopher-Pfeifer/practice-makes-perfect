import StartupOverlay from "@/components/StartupOverlay";
import AuthPage from "@/pages/AuthPage";
import SplashScreen from "@/pages/SplashScreen";
import type { UserProfile } from "@/types/auth";
import { useState } from "react";

type AppState = "startup" | "auth" | "dashboard";

export default function App() {
  const [state, setState] = useState<AppState>("startup");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  if (state === "startup") {
    return <StartupOverlay onReady={() => setState("auth")} />;
  }

  if (state === "auth" || !profile) {
    return (
      <AuthPage
        onLogin={(p) => {
          setProfile(p);
          setState("dashboard");
        }}
      />
    );
  }

  return (
    <SplashScreen
      profile={profile}
      onLogout={() => {
        setProfile(null);
        setState("auth");
      }}
      onSwitchProfile={() => {
        setProfile(null);
        setState("auth");
      }}
    />
  );
}
