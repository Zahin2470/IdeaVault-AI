import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/services/settings.service";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await getSettings(user.id);
  if (!settings) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <SettingsForm
        email={settings.email}
        aiProvider={process.env.AI_PROVIDER ?? "gemini"}
        initialProfile={{ name: settings.name, bio: settings.bio ?? "" }}
        initialPreferences={{
          theme: settings.preferences.theme,
          notifyTasks: settings.preferences.notifyTasks,
          notifyProject: settings.preferences.notifyProject,
        }}
      />
    </div>
  );
}
