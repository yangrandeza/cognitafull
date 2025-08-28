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
import type { Student } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function StudentsList({ students }: { students: Student[] }) {
  const { toast } = useToast();

  const handleGeneratePdf = (studentName: string) => {
    toast({
      title: "Gerando Relatório...",
      description: `Um relatório em PDF para ${studentName} está sendo gerado.`,
    });
  };

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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>
                  <Badge variant={student.quizStatus === 'completed' ? 'default' : 'outline'} className={student.quizStatus === 'completed' ? 'bg-green-600' : ''}>
                    {student.quizStatus === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGeneratePdf(student.name)}
                    disabled={student.quizStatus !== 'completed'}
                  >
                    Gerar PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
