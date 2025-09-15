import { Suspense } from "react";
import { SuperAdminUsers } from "@/components/admin/superadmin-users";

export default function UsersPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <SuperAdminUsers />
      </Suspense>
    </div>
  );
}
