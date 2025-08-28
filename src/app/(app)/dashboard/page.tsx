import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Users, ArrowRight } from "lucide-react";
import { mockClasses } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Minhas Turmas
        </h1>
        <div className="flex items-center space-x-2">
          <Button className="font-headline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Turma
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockClasses.map((classItem) => (
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
              <Progress value={(classItem.responsesCount / classItem.studentCount) * 100} className="mt-4" />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full font-headline">
                <Link href={`/class/${classItem.id}`}>
                    Ver Insights <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
