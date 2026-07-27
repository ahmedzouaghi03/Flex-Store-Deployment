import { notFound } from "next/navigation";
import { getTeamMember } from "@/actions/teamActions";
import { TeamMemberEditForm } from "@/components/admin/TeamMemberEditForm";

export async function TeamMemberEditContent({
  id,
  currentUserId,
}: {
  id: string;
  currentUserId: string;
}) {
  const result = await getTeamMember(id);
  if (!result.success || !result.data) notFound();

  return (
    <>
      <p className="mb-8 text-sm text-[var(--color-muted)]">
        Update {result.data.name}&apos;s name, email, or password.
      </p>
      <TeamMemberEditForm member={result.data} isSelf={result.data.id === currentUserId} />
    </>
  );
}
