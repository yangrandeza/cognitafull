"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeachersTable } from "@/components/admin/teachers-table";
import { WhiteLabelSettings } from "@/components/admin/white-label-settings";

export function AdminDashboard() {
  return (
    <Tabs defaultValue="teachers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="teachers">Teacher Management</TabsTrigger>
        <TabsTrigger value="settings">Brand Settings</TabsTrigger>
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
