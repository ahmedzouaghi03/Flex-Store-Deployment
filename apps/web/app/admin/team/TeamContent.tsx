import { getCurrentUser } from "@/lib/session";
import { getTeamMembers } from "@/actions/teamActions";
import { TeamClient } from "@/components/admin/TeamClient";

export async function TeamContent() {
  const [user, result] = await Promise.all([getCurrentUser(), getTeamMembers()]);
  const members = result.success ? result.data! : [];
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <TeamClient members={members} currentUserId={user?.id ?? ""} isSuperAdmin={isSuperAdmin} />
  );
}
