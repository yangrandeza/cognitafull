"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { deleteClassAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trash2 } from "lucide-react";

interface ClassSettingsProps {
  classId: string;
  className: string;
}

export function ClassSettings({ classId, className }: ClassSettingsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteClass = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteClassAction(classId);
      if (result.success) {
        toast({
          title: "Turma excluída",
          description: `A turma "${className}" foi excluída com sucesso.`,
        });
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao excluir turma",
          description: result.error || "Ocorreu um erro ao excluir a turma.",
        });
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir turma",
        description: "Ocorreu um erro inesperado ao excluir a turma.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Settings className="h-5 w-5" />
            Configurações da Turma
          </CardTitle>
          <CardDescription>
            Gerencie as configurações da sua turma aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h3 className="font-semibold text-destructive">Zona de Perigo</h3>
              <p className="text-sm text-muted-foreground">
                Ações irreversíveis para esta turma.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Turma
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClass}
        isDeleting={isDeleting}
        title="Excluir Turma"
        description={
          <>
            Tem certeza de que deseja excluir a turma <strong>"{className}"</strong>?
            <br />
            <br />
            Esta ação irá excluir permanentemente todos os alunos e seus perfis de aprendizagem, todas as estratégias de aprendizagem salvas, e todos os dados e insights da turma.
            <br />
            <br />
            <strong>Esta ação não pode ser desfeita.</strong>
          </>
        }
      />
    </div>
  );
}
