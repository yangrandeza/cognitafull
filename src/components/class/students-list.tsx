"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student, UnifiedProfile } from "@/lib/types";
import { User, MoreHorizontal, FilePenLine, Trash2 } from "lucide-react";
import { EditStudentDialog } from "./edit-student-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { deleteStudent } from "@/lib/firebase/firestore";

export function StudentsList({ students, profiles }: { students: Student[], profiles: UnifiedProfile[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentList, setStudentList] = useState(students);

  // Ensure the list updates if the parent component's data changes
  useEffect(() => {
    setStudentList(students);
  }, [students]);

  const getStudentProfile = (studentId: string) => {
    return profiles.find(p => p.studentId === studentId);
  }
  
  const handleStudentUpdated = (updatedStudent: Pick<Student, 'id' | 'name' | 'age'>) => {
    setStudentList(currentList => 
      currentList.map(s => 
        s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
      )
    );
  };
  
  const handleStudentDeleted = (studentId: string) => {
     setStudentList(currentList => currentList.filter(s => s.id !== studentId));
  }

  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return studentList;
    }
    return studentList.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, studentList]);
  
  const handleDeleteConfirm = async (studentId: string) => {
    await deleteStudent(studentId);
    handleStudentDeleted(studentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lista de Alunos e Perfis Individuais</CardTitle>
        <CardDescription>
          Visualize, pesquise, edite e remova os alunos da sua turma.
        </CardDescription>
        <div className="pt-4">
          <Input
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Perfil (DISC)</TableHead>
              <TableHead>Aprendizagem (VARK)</TableHead>
              <TableHead>Tipo (Jung)</TableHead>
              <TableHead>Valores (Schwartz)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
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
                     <TableCell>
                       {profile?.jungianProfile ? (
                        <Badge variant="secondary">{profile.jungianProfile}</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                     <TableCell>
                       {profile?.schwartzValues ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {profile.schwartzValues.top_values.map(value => (
                             <Badge key={value} variant="outline" className="text-xs">{value}</Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu de ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild disabled={!profile}>
                            <Link href={`/student/${student.id}`}>
                              <User className="mr-2 h-4 w-4" />
                              Ver Painel
                            </Link>
                          </DropdownMenuItem>
                          
                          <EditStudentDialog 
                             student={student} 
                             onStudentUpdated={handleStudentUpdated}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                               <FilePenLine className="mr-2 h-4 w-4" />
                               Editar
                            </DropdownMenuItem>
                          </EditStudentDialog>

                          <DeleteStudentDialog
                             studentName={student.name}
                             onConfirm={() => handleDeleteConfirm(student.id)}
                          >
                            <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                          </DeleteStudentDialog>
                          
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
              )
            })}
          </TableBody>
        </Table>
         {filteredStudents.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Nenhum aluno encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
