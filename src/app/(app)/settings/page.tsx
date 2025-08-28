import { TeacherSettings } from "@/components/settings/teacher-settings";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Configurações
        </h1>
      </div>
      <TeacherSettings />
    </div>
  );
}
