import { StudentDashboard } from "@/components/student/student-dashboard";
import { getStudentAndProfileById } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, User } from "lucide-react";


export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
    // Directly use params.id as it's available in Server Components
    const data = await getStudentAndProfileById((await params).id);

    if (!data) {
        return (
             <div className="flex-1 space-y-4 p-8 pt-6">
                 <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 font-headline text-destructive">
                            <AlertTriangle />
                            Aluno não encontrado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>O perfil do aluno que você está tentando acessar não existe ou você não tem permissão para visualizá-lo.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
             <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Painel de {data.student.name}
                    </h1>
                </div>
            </div>
            <StudentDashboard student={data.student} profile={data.profile} />
        </div>
    )
}
