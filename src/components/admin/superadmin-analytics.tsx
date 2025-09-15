"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllOrganizations, getAllUsers, getAllClasses } from "@/lib/firebase/firestore";
import type { Organization, UserProfile, Class } from "@/lib/types";
import { PieChart, TrendingUp, BarChart3 } from "lucide-react";

export function SuperAdminAnalytics() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgs, allUsers, allClasses] = await Promise.all([
          getAllOrganizations(),
          getAllUsers(),
          getAllClasses()
        ]);
        setOrganizations(orgs);
        setUsers(allUsers);
        setClasses(allClasses);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados de analytics.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    organizations: organizations.length,
    users: users.length,
    classes: classes.length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analytics Avançados</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição por Função
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Super Administradores</span>
                <span className="font-bold">{users.filter(u => u.role === 'superadmin').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Diretores</span>
                <span className="font-bold">{stats.admins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Professores</span>
                <span className="font-bold">{stats.teachers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taxa Média de Conclusão</span>
                  <span>{((classes.reduce((sum, cls) => sum + cls.responsesCount, 0) /
                    classes.reduce((sum, cls) => sum + cls.studentCount, 0)) * 100 || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
