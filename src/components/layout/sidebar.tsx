
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BrainCircuit,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  BookOpen,
  BarChart3,
  PieChart,
  Shield,
  Mail,
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { userSignOut } from "@/lib/firebase/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel", roles: ["teacher"] },
  { href: "/admin?tab=classes", icon: BookOpen, label: "Turmas da organização", roles: ["admin"] },
  { href: "/admin?tab=insights", icon: BarChart3, label: "Insights organizacionais", roles: ["admin"] },
  { href: "/admin?tab=teachers", icon: Users, label: "Gerenciar professores", roles: ["admin"] },
  { href: "/settings", icon: Settings, label: "Configurações", roles: ["teacher", "admin", "superadmin"]},
  // Super Admin sections
  { href: "/superadmin/system", icon: Shield, label: "Sistema", roles: ["superadmin"] },
  { href: "/superadmin/emails", icon: Mail, label: "Emails", roles: ["superadmin"] },
  { href: "/superadmin/users", icon: Users, label: "Usuários", roles: ["superadmin"] },
  { href: "/superadmin/classes", icon: BookOpen, label: "Turmas", roles: ["superadmin"] },
  { href: "/superadmin/analytics", icon: PieChart, label: "Analytics", roles: ["superadmin"] },
];

function getInitials(name: string = ""): string {
    if (!name) return "";
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getActiveVariant(currentPath: string, itemHref: string): boolean {
    // Special case: if user is on /superadmin, redirect to /superadmin/system
    if (currentPath === '/superadmin' && itemHref === '/superadmin/system') {
        return true;
    }

    // Exact match for root paths
    if (currentPath === itemHref) {
        return true;
    }

    // For superadmin paths, match exact path or sub-paths
    if (itemHref.startsWith('/superadmin')) {
        return currentPath === itemHref || currentPath.startsWith(itemHref + '/');
    }

    // For other paths, use startsWith for sub-routes
    return currentPath.startsWith(itemHref);
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useUserProfile();

  const handleSignOut = async () => {
    await userSignOut();
    router.push("/login");
  };
  
  const handleSettingsClick = () => {
    if (userProfile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/settings');
    }
  }

  const userRole = userProfile?.role;

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card flex flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <img src="/logo.svg" alt="MUDEAI Logo" className="h-8 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (!item.roles || item.roles.includes(userRole || '')) {
              return (
                  <li key={item.label}>
                  <Link href={item.href}>
                      <Button
                      variant={getActiveVariant(pathname, item.href) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                      </Button>
                  </Link>
                  </li>
              )
            }
            return null;
          })}
        </ul>
      </nav>
      <div className="mt-auto border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : user && userProfile ? (
                 <>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt="Avatar do usuário" data-ai-hint="pessoa" />
                        <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="text-sm font-medium">{userProfile.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {userProfile.role === 'teacher' ? 'Professor(a)' :
                               userProfile.role === 'admin' ? 'Diretor(a)' :
                               userProfile.role === 'superadmin' ? 'Superadmin' : 'Usuário'}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                 </>
              ) : (
                <p>Nenhum usuário logado</p>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {userProfile && (
                 <>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                 </>
            )}
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
