import { Suspense } from "react";
import { SettingsPageClient } from "./SettingsPageClient";

function SettingsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-[var(--muted)] text-sm">Loading settings…</div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsPageClient />
    </Suspense>
  );
}
