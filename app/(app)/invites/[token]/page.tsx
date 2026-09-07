import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getInviteDetails } from "@/lib/services/member.service";
import { AcceptInviteButton } from "@/components/projects/accept-invite-button";

// Sits under (app) rather than the project workspace — the signed-in
// user may not have access to the project yet, that's the whole point
// of this page.
export default async function AcceptInvitePage({ params }: { params: { token: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invite = await getInviteDetails(params.token);

  if (!invite || invite.status !== "PENDING") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Invite not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invite link is invalid, expired, or has already been used.
        </p>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Invite expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask {invite.invitedBy.name} to send you a new invite to {invite.project.name}.
        </p>
      </div>
    );
  }

  const emailMatches = invite.email.toLowerCase() === (user.email ?? "").toLowerCase();

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        {invite.invitedBy.name} invited you to {invite.project.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;ll join as {invite.role === "EDITOR" ? "an Editor" : "a Viewer"}.
      </p>

      {!emailMatches && (
        <p className="mt-4 text-sm text-danger">
          This invite was sent to {invite.email}. You&apos;re signed in with a different email —
          sign in with that address to accept it.
        </p>
      )}

      <div className="mt-6 flex justify-center">
        <AcceptInviteButton token={params.token} projectId={invite.project.id} />
      </div>
    </div>
  );
}
