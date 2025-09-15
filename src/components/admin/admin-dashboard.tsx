"use client";

import { useSearchParams } from "next/navigation";
import { TeachersTable } from "@/components/admin/teachers-table";
import { OrganizationClasses } from "@/components/admin/organization-classes";
import { OrganizationInsights } from "@/components/admin/organization-insights";

export function AdminDashboard() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "teachers";

  const renderContent = () => {
    switch (tab) {
      case "classes":
        return <OrganizationClasses />;
      case "insights":
        return <OrganizationInsights />;
      case "teachers":
      default:
        return <TeachersTable />;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}
