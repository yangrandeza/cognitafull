"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, ArrowRight, Search, Loader2, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { getClassesByOrganization, getAllUsersByOrganization, getStudentsByClass } from "@/lib/firebase/firestore";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { Class, UserProfile, Student } from "@/lib/types";

export function OrganizationClasses() {
  const { userProfile } = useUserProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showStudentSearch, setShowStudentSearch] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  useEffect(() => {
    const fetchData = async () => {
      if (userProfile?.organizationId) {
        setLoading(true);
        try {
          const [classesData, teachersData] = await Promise.all([
            getClassesByOrganization(userProfile.organizationId),
            getAllUsersByOrganization(userProfile.organizationId)
          ]);

          setClasses(classesData);
          setFilteredClasses(classesData);
          setTeachers(teachersData.filter(user => user.role === 'teacher'));

          // Fetch all students from all classes
          const allStudentsPromises = classesData.map(classItem => getStudentsByClass(classItem.id));
          const allStudentsArrays = await Promise.all(allStudentsPromises);
          const allStudents = allStudentsArrays.flat();
          setStudents(allStudents);
          setFilteredStudents(allStudents);
        } catch (error) {
          console.error("Error fetching organization data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userProfile]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter(classItem => {
        const teacher = teachers.find(t => t.id === classItem.teacherId);
        const teacherName = teacher?.name || "";
        const className = classItem.name || "";

        return className.toLowerCase().includes(searchTerm.toLowerCase()) ||
               teacherName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredClasses(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchTerm, classes, teachers]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (studentSearchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const studentName = student.name || "";
        const studentEmail = student.email || "";

        return studentName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
               studentEmail.toLowerCase().includes(studentSearchTerm.toLowerCase());
      });
      setFilteredStudents(filtered);
    }
  }, [studentSearchTerm, students]);

  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem?.name || "Turma não encontrada";
  };

  const getClassTeacher = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    if (classItem) {
      return getTeacherName(classItem.teacherId);
    }
    return "Professor não encontrado";
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || "Professor não encontrado";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Visualize e acesse todas as turmas criadas pelos professores da sua instituição.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome da turma ou professor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchTerm ? "Nenhuma turma encontrada com os critérios de busca." : "Nenhuma turma encontrada na organização."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedClasses.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-headline">{classItem.name}</CardTitle>
                <CardDescription className="text-sm">
                  Professor: {getTeacherName(classItem.teacherId)}
                </CardDescription>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classItem.studentCount} alunos</div>
              <p className="text-xs text-muted-foreground">
                {classItem.responsesCount} de {classItem.studentCount} completaram o questionário
              </p>
              <Progress
                value={classItem.studentCount > 0 ? (classItem.responsesCount / classItem.studentCount) * 100 : 0}
                className="mt-4"
              />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full font-headline">
                <Link href={`/class/${classItem.id}`}>
                  {classItem.studentCount > 0 ? "Ver insights" : "Acessar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {filteredClasses.length > itemsPerPage && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClasses.length)} de {filteredClasses.length} turmas
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Search Section */}
      <Collapsible open={showStudentSearch} onOpenChange={setShowStudentSearch}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-headline">Buscar alunos</CardTitle>
                  <CardDescription>
                    Encontre alunos específicos por nome ou e-mail em todas as turmas da organização
                  </CardDescription>
                </div>
                {showStudentSearch ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou e-mail do aluno..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {filteredStudents.length === 0 && studentSearchTerm && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum aluno encontrado com "{studentSearchTerm}".
                </p>
              )}

              {filteredStudents.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredStudents.slice(0, 20).map((student) => (
                    <Card key={student.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email || "Sem e-mail"}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {getClassName(student.classId)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Professor: {getClassTeacher(student.classId)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={student.quizStatus === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {student.quizStatus === 'completed' ? 'Questionário completo' : 'Pendente'}
                          </Badge>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/class/${student.classId}`}>
                              Ver turma
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {filteredStudents.length > 20 && (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      Mostrando os primeiros 20 resultados de {filteredStudents.length} alunos encontrados.
                    </p>
                  )}
                </div>
              )}

              {!studentSearchTerm && (
                <p className="text-center text-muted-foreground py-4">
                  Digite um nome ou e-mail para buscar alunos.
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de turmas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, classItem) => sum + classItem.studentCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas coletadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, classItem) => sum + classItem.responsesCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
