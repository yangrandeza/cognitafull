import { Suspense } from "react";
import { SuperAdminAnalytics } from "@/components/admin/superadmin-analytics";

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <SuperAdminAnalytics />
      </Suspense>
    </div>
  );
}
