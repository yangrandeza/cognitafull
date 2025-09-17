import { AppSidebar } from "@/components/layout/sidebar";
import { WelcomeOnboarding } from "@/components/common/welcome-onboarding";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col bg-light-lavender">
        {children}
      </main>
      <WelcomeOnboarding />
    </div>
  );
}
