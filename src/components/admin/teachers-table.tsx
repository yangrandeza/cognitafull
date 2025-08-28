"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { Teacher, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getTeachersByOrganization } from "@/lib/firebase/firestore";


export function TeachersTable() {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (userProfile?.organizationId) {
        setLoading(true);
        const fetchedTeachers = await getTeachersByOrganization(userProfile.organizationId);
        setTeachers(fetchedTeachers);
        setLoading(false);
      }
    }
    fetchTeachers();
  }, [userProfile]);

  const handleAddTeacher = () => {
     toast({
      title: "Função em desenvolvimento",
      description: "A funcionalidade para adicionar novos professores estará disponível em breve.",
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Professores</CardTitle>
          <CardDescription>
            Adicione, visualize e gerencie as contas dos professores da sua instituição.
          </CardDescription>
        </div>
        <Button onClick={handleAddTeacher}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar professor
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : teachers.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      {/* Note: Status is not on UserProfile, assuming 'active' for now */}
                      <Badge variant={'default'} className={'bg-green-600'}>
                          Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Desativar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            Excluir
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                Nenhum professor cadastrado ainda.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
