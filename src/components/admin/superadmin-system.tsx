"use client";

import { SystemSettings } from "./system-settings";

export function SuperAdminSystem() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie configurações globais do sistema MUDEAI
          </p>
        </div>
      </div>

      <SystemSettings />
    </div>
  );
}
