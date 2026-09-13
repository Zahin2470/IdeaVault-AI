"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MEMBER_ROLES } from "@/lib/validations/member";
import { Copy, Trash2, Check } from "lucide-react";

interface PersonSummary {
  id: string;
  name: string;
  email: string;
}

interface MemberRow {
  id: string;
  role: string;
  user: PersonSummary;
}

interface InviteRow {
  id: string;
  email: string;
  role: string;
  token: string;
}

interface MembersData {
  owner: PersonSummary;
  members: MemberRow[];
  invites: InviteRow[];
  isOwner: boolean;
}

// Team collaboration (Phase 12). Only the owner sees the invite form,
// pending invites, and remove buttons — a VIEWER/EDITOR just sees who
// else has access.
export function MembersPanel({ projectId }: { projectId: string }) {
  const [data, setData] = useState<MembersData | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("VIEWER");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/members`);
    if (res.ok) setData(await res.json());
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setInviting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't send the invite. Please try again.");
      return;
    }

    setEmail("");
    await load();
  }

  function copyLink(token: string) {
    const link = `${window.location.origin}/invites/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this person's access to the project?")) return;
    const res = await fetch(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">People with access</h3>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          <div className="flex items-center justify-between p-3 text-sm">
            <div>
              <p>{data.owner.name}</p>
              <p className="text-xs text-muted-foreground">{data.owner.email}</p>
            </div>
            <Badge variant="accent">Owner</Badge>
          </div>
          {data.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p>{m.user.name}</p>
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">{m.role === "EDITOR" ? "Editor" : "Viewer"}</Badge>
                {data.isOwner && (
                  <button
                    onClick={() => handleRemove(m.user.id)}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {data.isOwner && (
        <>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">Invite someone</h3>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
              >
                {MEMBER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r === "EDITOR" ? "Editor" : "Viewer"}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={inviting || !email.trim()}>
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </form>
            {error && <p className="text-sm text-danger">{error}</p>}
            <p className="text-xs text-muted-foreground">
              No email is sent automatically — copy the link below and share it yourself.
            </p>
          </section>

          {data.invites.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">Pending invites</h3>
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {data.invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <p>{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.role === "EDITOR" ? "Editor" : "Viewer"} · pending
                      </p>
                    </div>
                    <button
                      onClick={() => copyLink(inv.token)}
                      className="flex items-center gap-1 text-xs text-accent"
                    >
                      {copiedToken === inv.token ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy link
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
