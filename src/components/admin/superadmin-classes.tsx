"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getAllOrganizations, getAllUsers, getAllClasses, deleteClass } from "@/lib/firebase/firestore";
import type { Organization, UserProfile, Class } from "@/lib/types";
import { BookOpen, Plus, Edit, Trash2, Search } from "lucide-react";

export function SuperAdminClasses() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        console.error("Error fetching classes data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados das turmas.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      try {
        await deleteClass(classId);
        setClasses(classes.filter(cls => cls.id !== classId));
        toast({
          title: "Turma excluída",
          description: "A turma foi removida com sucesso.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir turma",
          description: "Não foi possível excluir a turma.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Gerenciamento de Turmas</h2>
          <Badge variant="secondary">{filteredClasses.length} turmas</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Turma</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead>Respostas</TableHead>
                <TableHead>Taxa de Conclusão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => {
                const teacher = users.find(u => u.id === cls.teacherId);
                const org = organizations.find(o => o.id === cls.organizationId);
                const completionRate = cls.studentCount > 0 ? (cls.responsesCount / cls.studentCount) * 100 : 0;

                return (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{teacher?.name || 'N/A'}</TableCell>
                    <TableCell>{org?.name || 'N/A'}</TableCell>
                    <TableCell>{cls.studentCount}</TableCell>
                    <TableCell>{cls.responsesCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{completionRate.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
