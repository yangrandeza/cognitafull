
"use client";

import { UpdateProfileForm } from "@/components/settings/update-profile-form";
import { UpdatePasswordForm } from "@/components/settings/update-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Loader2 } from "lucide-react";

export function TeacherSettings() {
  const { userProfile, loading } = useUserProfile();

  if (loading) {
    return (
        <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!userProfile) {
    return <p>Perfil não encontrado.</p>;
  }

  return (
    <div className="space-y-8">
      <UpdateProfileForm userProfile={userProfile} />
      <UpdatePasswordForm />
    </div>
  );
}
