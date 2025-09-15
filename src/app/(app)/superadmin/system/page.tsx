import { Suspense } from "react";
import { SuperAdminSystem } from "@/components/admin/superadmin-system";

export default function SystemPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <SuperAdminSystem />
      </Suspense>
    </div>
  );
}
