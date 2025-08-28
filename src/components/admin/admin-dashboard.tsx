"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeachersTable } from "@/components/admin/teachers-table";
import { WhiteLabelSettings } from "@/components/admin/white-label-settings";

export function AdminDashboard() {
  return (
    <Tabs defaultValue="teachers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="teachers">Gerenciamento de Professores</TabsTrigger>
        <TabsTrigger value="settings">Configurações da Marca</TabsTrigger>
      </TabsList>
      <TabsContent value="teachers">
        <TeachersTable />
      </TabsContent>
      <TabsContent value="settings">
        <WhiteLabelSettings />
      </TabsContent>
    </Tabs>
  );
}
