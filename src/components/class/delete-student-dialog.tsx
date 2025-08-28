
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DeleteStudentDialogProps {
  studentName: string;
  onConfirm: () => Promise<void>;
  children: React.ReactNode; // The trigger button
}

export function DeleteStudentDialog({
  studentName,
  onConfirm,
  children,
}: DeleteStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      toast({
        title: "Aluno excluído!",
        description: `${studentName} foi removido da turma.`,
      });
      setOpen(false);
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o aluno. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá remover permanentemente o
            aluno <span className="font-bold">{studentName}</span> e todos os
            seus dados de perfil associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sim, excluir aluno
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
