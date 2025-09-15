import { Suspense } from "react";
import { SuperAdminOrganizations } from "@/components/admin/superadmin-organizations";

export default function OrganizationsPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <SuperAdminOrganizations />
      </Suspense>
    </div>
  );
}
