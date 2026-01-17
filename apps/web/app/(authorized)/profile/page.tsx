import { getUserProfile } from "@/lib/actions/profile";
import { ProfileSection } from "./profile-section";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default async function ProfilePage() {
  // Fetch user profile
  const profileResult = await getUserProfile();
  if (!profileResult.success || !profileResult.profile) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your personal information and account security
        </p>
      </div>

      <ProfileSection profile={profileResult.profile} />
    </div>
  );
}
