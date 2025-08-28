
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const varkOptions = ['Visual', 'Auditivo', 'Leitura/Escrita', 'Cinestésico'];
const discOptions = ['Dominância', 'Influência', 'Estabilidade', 'Consciência'];
const jungianOptions = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

export function StudentsList({ students: initialStudents, profiles }: { students: Student[], profiles: UnifiedProfile[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentList, setStudentList] = useState<Student[]>(initialStudents);
  const [filters, setFilters] = useState({
      vark: 'all',
      disc: 'all',
      jung: 'all',
      age: ''
  });
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);


  useEffect(() => {
    setStudentList(initialStudents);
  }, [initialStudents]);

  const getStudentProfile = (studentId: string) => {
    return profiles.find(p => p.studentId === studentId);
  }
  
  const handleStudentUpdated = (updatedStudent: Pick<Student, 'id' | 'name' | 'age'>) => {
    setStudentList(currentList => 
      currentList.map(s => 
        s.id === updatedStudent.id ? { ...s, name: updatedStudent.name, age: updatedStudent.age } : s
      )
    );
  };
  
  const handleStudentDeleted = (studentId: string) => {
     setStudentList(currentList => currentList.filter(s => s.id !== studentId));
  }
  
  const handleFilterChange = (filterType: 'vark' | 'disc' | 'jung' | 'age', value: string) => {
      setFilters(prev => ({...prev, [filterType]: value}));
  }

  const filteredStudents = useMemo(() => {
    return studentList.filter(student => {
        const profile = getStudentProfile(student.id);

        const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const ageMatch = !filters.age || student.age === parseInt(filters.age, 10);
        const varkMatch = !profile || filters.vark === 'all' || profile.varkProfile.dominant === filters.vark;
        const discMatch = !profile || filters.disc === 'all' || profile.discProfile.dominant === filters.disc;
        const jungMatch = !profile || filters.jung === 'all' || profile.jungianProfile.type === filters.jung;

        return nameMatch && ageMatch && varkMatch && discMatch && jungMatch;
    });
  }, [searchTerm, studentList, filters, profiles]);
  
  const handleDeleteConfirm = async (studentId: string) => {
    await deleteStudent(studentId);
    handleStudentDeleted(studentId);
    setIsDeleteOpen(false);
  };
  
  const openEditDialog = (student: Student) => {
      setSelectedStudent(student);
      setIsEditOpen(true);
  }
  
  const openDeleteDialog = (student: Student) => {
      setSelectedStudent(student);
      setIsDeleteOpen(true);
  }


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lista de Alunos e Perfis Individuais</CardTitle>
        <CardDescription>
          Visualize, pesquise, edite e remova os alunos da sua turma.
        </CardDescription>
        <div className="pt-4 flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-xs"
          />
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="number"
                placeholder="Filtrar por idade..."
                value={filters.age}
                onChange={(e) => handleFilterChange('age', e.target.value)}
              />
              <Select value={filters.vark} onValueChange={(value) => handleFilterChange('vark', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por VARK" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">VARK (Todos)</SelectItem>
                    {varkOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
               <Select value={filters.disc} onValueChange={(value) => handleFilterChange('disc', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por DISC" />
                </SelectTrigger>
                <SelectContent>
                     <SelectItem value="all">DISC (Todos)</SelectItem>
                    {discOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
               <Select value={filters.jung} onValueChange={(value) => handleFilterChange('jung', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por Tipo Junguiano" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tipo Junguiano (Todos)</SelectItem>
                    {jungianOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
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
                        <Badge variant="secondary">{profile.jungianProfile.type}</Badge>
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
                          
                          <DropdownMenuItem onSelect={() => openEditDialog(student)}>
                              <FilePenLine className="mr-2 h-4 w-4" />
                              Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                              onSelect={() => openDeleteDialog(student)}
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                          </DropdownMenuItem>
                          
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
            Nenhum aluno encontrado com os filtros aplicados.
          </div>
        )}
      </CardContent>
    </Card>

    {selectedStudent && (
        <>
            <EditStudentDialog 
                key={`edit-${selectedStudent.id}`}
                student={selectedStudent} 
                onStudentUpdated={handleStudentUpdated}
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
            />
            <DeleteStudentDialog
                key={`delete-${selectedStudent.id}`}
                studentName={selectedStudent.name}
                onConfirm={() => handleDeleteConfirm(selectedStudent.id)}
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
            />
        </>
    )}

    </>
  );
}
