"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClassForSuperadmin, updateClassForSuperadmin, getAllUsers, getAllOrganizations } from "@/lib/firebase/firestore";
import type { Organization, UserProfile, Class } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome da turma deve ter pelo menos 3 caracteres.",
  }),
  teacherId: z.string().min(1, {
    message: "Selecione um professor.",
  }),
  organizationId: z.string().min(1, {
    message: "Selecione uma organização.",
  }),
});

interface SuperAdminClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClass?: Class | null;
  onClassSaved: () => void;
}

export function SuperAdminClassDialog({
  open,
  onOpenChange,
  editingClass,
  onClassSaved
}: SuperAdminClassDialogProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!editingClass;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teacherId: "",
      organizationId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgs, allUsers] = await Promise.all([
          getAllOrganizations(),
          getAllUsers()
        ]);
        setOrganizations(orgs);
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar organizações e usuários.",
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, toast]);

  useEffect(() => {
    if (editingClass) {
      form.reset({
        name: editingClass.name,
        teacherId: editingClass.teacherId,
        organizationId: editingClass.organizationId || "",
      });
    } else {
      form.reset({
        name: "",
        teacherId: "",
        organizationId: "",
      });
    }
  }, [editingClass, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (isEditing && editingClass) {
        await updateClassForSuperadmin(editingClass.id, {
          name: values.name,
          teacherId: values.teacherId,
          organizationId: values.organizationId,
        });
        toast({
          title: "Turma atualizada",
          description: `A turma "${values.name}" foi atualizada com sucesso.`,
        });
      } else {
        await createClassForSuperadmin(values.name, values.teacherId, values.organizationId);
        toast({
          title: "Turma criada",
          description: `A turma "${values.name}" foi criada com sucesso.`,
        });
      }
      onClassSaved();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar turma",
        description: "Não foi possível salvar a turma. Tente novamente.",
      });
      console.error("Error saving class:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter teachers (users with role 'teacher')
  const teachers = users.filter(user => user.role === 'teacher');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isEditing ? "Editar Turma" : "Criar Nova Turma"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da turma."
              : "Preencha os detalhes para criar uma nova turma."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Nome da Turma</Label>
                  <FormControl>
                    <Input id="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="organizationId">Organização</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma organização" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="teacherId">Professor</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
