"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, ArrowRight, Loader2 } from "lucide-react";
import { getClassesByTeacher } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { Class } from "@/lib/types";
import { CreateClassDialog } from "@/components/class/create-class-dialog";

export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const fetchClasses = async () => {
      if (user) {
        setLoadingClasses(true);
        const userClasses = await getClassesByTeacher(user.uid);
        setClasses(userClasses);
        setLoadingClasses(false);
      }
  }

  useEffect(() => {
    if (user) {
      fetchClasses();
    } else if (!loadingAuth) {
      setLoadingClasses(false);
    }
  }, [user, loadingAuth]);
  
  const handleClassCreated = () => {
    fetchClasses();
  }

  if (loadingAuth || loadingClasses) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }
  
  if (!user) {
     return (
        <div className="flex-1 space-y-4 p-8 pt-6">
             <h1 className="text-3xl font-bold tracking-tight font-headline">
                Acesso negado
            </h1>
            <p>Você precisa estar logado para ver suas turmas.</p>
             <Button asChild>
                <Link href="/login">Ir para o login</Link>
            </Button>
        </div>
     )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Minhas turmas
        </h1>
        <div className="flex items-center space-x-2">
           <CreateClassDialog onClassCreated={handleClassCreated} />
        </div>
      </div>

       {classes.length === 0 && !loadingClasses && (
          <Card>
              <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Nenhuma turma encontrada. que tal criar a primeira?</p>
              </CardContent>
          </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-headline">{classItem.name}</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classItem.studentCount} alunos</div>
              <p className="text-xs text-muted-foreground">
                {classItem.responsesCount} de {classItem.studentCount} completaram o questionário
              </p>
              <Progress value={classItem.studentCount > 0 ? (classItem.responsesCount / classItem.studentCount) * 100 : 0} className="mt-4" />
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
    </div>
  );
}
