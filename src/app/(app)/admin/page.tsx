"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { userProfile, loading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Painel do administrador
        </h1>
      </div>
      <AdminDashboard />
    </div>
  );
}
