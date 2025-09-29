
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
import { User, MoreHorizontal, FilePenLine, Trash2, Eye } from "lucide-react";
import { EditStudentDialog } from "./edit-student-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentDetailsModal } from "./student-details-modal";
import { deleteStudent, getProfilesByClass, getClassById } from "@/lib/firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RawUnifiedProfile } from "@/lib/types";
import { CsvExportModal } from "./csv-export-modal";


const varkOptions = ['Visual', 'Auditivo', 'Leitura/Escrita', 'Cinestésico'];
const discOptions = ['Dominância', 'Influência', 'Estabilidade', 'Consciência'];
const jungianOptions = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

export function StudentsList({ students: initialStudents, profiles, classId }: { students: Student[], profiles: UnifiedProfile[], classId: string }) {
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [rawProfiles, setRawProfiles] = useState<RawUnifiedProfile[]>([]);
  const [loadingRawProfiles, setLoadingRawProfiles] = useState(false);
  const [classConfig, setClassConfig] = useState<any>(null);
  const [loadingClassConfig, setLoadingClassConfig] = useState(false);


  useEffect(() => {
    setStudentList(initialStudents);
  }, [initialStudents]);

  // Buscar configuração da turma para obter campos personalizados
  useEffect(() => {
    const fetchClassConfig = async () => {
      if (!classId) return;

      setLoadingClassConfig(true);
      try {
        const config = await getClassById(classId);
        setClassConfig(config);
      } catch (error) {
        console.error('Erro ao buscar configuração da turma:', error);
      } finally {
        setLoadingClassConfig(false);
      }
    };

    fetchClassConfig();
  }, [classId]);

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

  const openDetailsModal = async (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);

    // Buscar perfis brutos se ainda não foram carregados
    if (rawProfiles.length === 0 && !loadingRawProfiles) {
      setLoadingRawProfiles(true);
      try {
        const profiles = await getProfilesByClass(classId);
        setRawProfiles(profiles);
      } catch (error) {
        console.error('Erro ao buscar perfis brutos:', error);
      } finally {
        setLoadingRawProfiles(false);
      }
    }
  }

  // Função para obter os campos personalizados do estudante
  const getStudentCustomFields = (student: Student) => {
    return student.customFields || {};
  }

  const getStudentRawProfile = (studentId: string) => {
    return rawProfiles.find(p => p.studentId === studentId);
  }


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lista de alunos e perfis individuais</CardTitle>
        <CardDescription>
          Visualize, pesquise, edite e remova os alunos da sua turma.
        </CardDescription>
        <div className="pt-4 flex justify-end">
          <CsvExportModal
            students={filteredStudents}
            profiles={profiles}
            customFields={classConfig?.customFields || []}
            classId={classId}
          />
        </div>
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
                    <SelectValue placeholder="Filtrar por tipo junguiano" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tipo junguiano (Todos)</SelectItem>
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
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => openDetailsModal(student)}
                           title="Ver detalhes completos"
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
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
                              Ver painel
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
                       </div>
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
            <StudentDetailsModal
                key={`details-${selectedStudent.id}`}
                student={selectedStudent}
                profile={getStudentProfile(selectedStudent.id) || null}
                rawProfile={getStudentRawProfile(selectedStudent.id) || null}
                customFields={classConfig?.customFields || []}
                customFieldValues={getStudentCustomFields(selectedStudent)}
                isOpen={isDetailsOpen}
                onClose={() => {
                  setIsDetailsOpen(false);
                  setSelectedStudent(null);
                }}
            />
        </>
    )}

    </>
  );
}
