import { Suspense } from "react";
import { SuperAdminClasses } from "@/components/admin/superadmin-classes";

export default function ClassesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <SuperAdminClasses />
      </Suspense>
    </div>
  );
}
