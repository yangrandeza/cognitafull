"use client";

import { useUserProfile } from "@/hooks/use-user-profile";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

function AdminPageContent() {
  const { userProfile, loading } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.push('/login');
      } else if (userProfile.role !== 'admin') {
        router.push('/dashboard');
      }
      // If user is admin and no specific tab is requested, redirect to default tab
      else if (!searchParams.get('tab')) {
        router.push('/admin?tab=teachers');
      }
    }
  }, [userProfile, loading, router, searchParams]);

  // Show loading while checking permissions
  if (loading || !userProfile) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render for non-admin users (they will be redirected)
  if (userProfile.role !== 'admin') {
    return null;
  }

  const getPageTitle = () => {
    const tab = searchParams.get('tab');
    switch (tab) {
      case 'classes':
        return 'Turmas da organização';
      case 'insights':
        return 'Insights organizacionais';
      case 'teachers':
      default:
        return 'Gerenciar professores';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {getPageTitle()}
        </h1>
      </div>
      <AdminDashboard />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 space-y-4 p-8 pt-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
