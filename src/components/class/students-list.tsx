
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student, UnifiedProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import Link from "next/link";

export function StudentsList({ students, profiles }: { students: Student[], profiles: UnifiedProfile[] }) {
  const { toast } = useToast();

  const getStudentProfile = (studentId: string) => {
    return profiles.find(p => p.studentId === studentId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lista de Alunos e Perfis Individuais</CardTitle>
        <CardDescription>Visualize o perfil dominante de cada aluno e acesse o painel individual detalhado.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Perfil Dominante (DISC)</TableHead>
              <TableHead>Estilo de Aprendizagem (VARK)</TableHead>
              <TableHead className="text-right">Painel Individual</TableHead>
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
                      {profile?.discProfile ? (
                        <Badge variant="secondary">{profile.discProfile.dominant}</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                       {profile?.varkProfile ? (
                        <Badge variant="secondary">{profile.varkProfile.dominant}</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="outline" size="sm" disabled={!profile}>
                          <Link href={`/student/${student.id}`}>
                            <User className="mr-2 h-4 w-4" />
                            Painel do Aluno
                          </Link>
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
