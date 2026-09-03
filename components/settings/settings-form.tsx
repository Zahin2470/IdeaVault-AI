"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  email: string;
  aiProvider: string;
  initialProfile: { name: string; bio: string };
  initialPreferences: { theme: string; notifyTasks: boolean; notifyProject: boolean };
}

const THEME_OPTIONS = [
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
  { value: "SYSTEM", label: "System" },
] as const;

// Settings — profile, appearance, notifications, and read-only account
// info. Theme changes apply immediately via next-themes (already handles
// its own persistence) and are also saved to UserPreference so the
// choice is recorded server-side, not just in this browser.
export function SettingsForm({ email, aiProvider, initialProfile, initialPreferences }: SettingsFormProps) {
  const { setTheme } = useTheme();

  const [name, setName] = useState(initialProfile.name);
  const [bio, setBio] = useState(initialProfile.bio);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [theme, setThemeState] = useState(initialPreferences.theme);
  const [notifyTasks, setNotifyTasks] = useState(initialPreferences.notifyTasks);
  const [notifyProject, setNotifyProject] = useState(initialPreferences.notifyProject);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio: bio || undefined }),
    });
    setSavingProfile(false);
    if (res.ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }
  }

  async function handleThemeChange(value: string) {
    setThemeState(value);
    setTheme(value.toLowerCase());
    await fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: value }),
    });
  }

  async function handleToggle(field: "notifyTasks" | "notifyProject", current: boolean) {
    const next = !current;
    if (field === "notifyTasks") setNotifyTasks(next);
    else setNotifyProject(next);

    await fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short line about you (optional)"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingProfile} className="w-fit">
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
            {profileSaved && <span className="text-xs text-muted-foreground">Saved</span>}
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Appearance</h2>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleThemeChange(opt.value)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm transition-colors",
                theme === opt.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={notifyTasks}
            onChange={() => handleToggle("notifyTasks", notifyTasks)}
            className="h-4 w-4 accent-accent"
          />
          Notify me about task due dates
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={notifyProject}
            onChange={() => handleToggle("notifyProject", notifyProject)}
            className="h-4 w-4 accent-accent"
          />
          Notify me about project activity
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Account</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between border-b border-border py-2">
            <span className="text-muted-foreground">Email</span>
            <span>{email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">AI Provider</span>
            <span className="capitalize">{aiProvider} (free tier)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
