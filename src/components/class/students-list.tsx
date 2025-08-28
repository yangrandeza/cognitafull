"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student, UnifiedProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function StudentsList({ students, profiles }: { students: Student[], profiles: UnifiedProfile[] }) {
  const { toast } = useToast();

  const handleGeneratePdf = (studentName: string) => {
    toast({
      title: "Função em Desenvolvimento",
      description: `A geração de relatório em PDF para ${studentName} estará disponível em breve.`,
    });
  };

  const getStudentProfile = (studentId: string) => {
    return profiles.find(p => p.studentId === studentId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lista de Alunos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Perfil Dominante (DISC)</TableHead>
              <TableHead>Estilo de Aprendizagem (VARK)</TableHead>
              <TableHead className="text-right">Relatório Individual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const profile = getStudentProfile(student.id);
              return (
                 <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.age}</TableCell>
                    <TableCell>
                      {profile ? (
                        <Badge variant="secondary">{profile.discProfile.dominant}</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                       {profile ? (
                        <Badge variant="secondary">{profile.varkProfile.dominant}</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGeneratePdf(student.name)}
                        disabled={!profile}
                      >
                        Gerar PDF
                      </Button>
                    </TableCell>
                  </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
