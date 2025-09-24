"use client";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { Teacher, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { usePermissions } from "@/hooks/use-permissions";
import { getTeachersByOrganization, createTeacher, updateTeacher, deleteTeacher } from "@/lib/firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";


export function TeachersTable() {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '' });
  const [editTeacher, setEditTeacher] = useState({ name: '' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTeachers = async () => {
      if (userProfile?.organizationId) {
        setLoading(true);
        const fetchedTeachers = await getTeachersByOrganization(userProfile.organizationId);
        // Show all teachers (pending invitations and active teachers)
        setTeachers(fetchedTeachers);
        setLoading(false);
        // Reset to first page when data changes
        setCurrentPage(1);
      }
    }
    fetchTeachers();
  }, [userProfile]);

  // Pagination calculations
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = teachers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name.trim() || !newTeacher.email.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e e-mail do professor.",
      });
      return;
    }

    if (!userProfile?.organizationId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível identificar sua organização.",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createTeacher(userProfile.organizationId, newTeacher);
      toast({
        title: "Professor adicionado",
        description: `${newTeacher.name} foi adicionado como professor.`,
      });
      setNewTeacher({ name: '', email: '' });
      setIsAddDialogOpen(false);

      // Refresh the teachers list
      const fetchedTeachers = await getTeachersByOrganization(userProfile.organizationId);
      setTeachers(fetchedTeachers);
    } catch (error) {
      console.error("Error creating teacher:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      if (errorMessage.includes("Já existe um usuário com este e-mail")) {
        toast({
          variant: "destructive",
          title: "E-mail já cadastrado",
          description: "Já existe um usuário com este e-mail. Verifique se o professor já foi convidado ou se o e-mail está correto.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao adicionar professor",
          description: "Não foi possível adicionar o professor. Tente novamente.",
        });
      }
    } finally {
      setIsCreating(false);
    }
  }

  const handleEditTeacher = async () => {
    if (!selectedTeacher || !editTeacher.name.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do professor.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateTeacher(selectedTeacher.id, { name: editTeacher.name });
      toast({
        title: "Professor atualizado",
        description: `O nome do professor foi atualizado para ${editTeacher.name}.`,
      });
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
      setEditTeacher({ name: '' });

      // Refresh the teachers list
      if (userProfile?.organizationId) {
        const fetchedTeachers = await getTeachersByOrganization(userProfile.organizationId);
        setTeachers(fetchedTeachers);
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar professor",
        description: "Não foi possível atualizar o professor. Tente novamente.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleDeactivateTeacher = async (teacher: UserProfile) => {
    if (!teacher.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do professor não encontrado.",
      });
      return;
    }

    setSelectedTeacher(teacher);
    setIsUpdating(true);
    try {
      await updateTeacher(teacher.id, { status: 'inactive' });
      toast({
        title: "Professor desativado",
        description: `${teacher.name} foi desativado.`,
      });

      // Refresh the teachers list
      if (userProfile?.organizationId) {
        const fetchedTeachers = await getTeachersByOrganization(userProfile.organizationId);
        setTeachers(fetchedTeachers);
      }
    } catch (error) {
      console.error("Error deactivating teacher:", error);
      toast({
        variant: "destructive",
        title: "Erro ao desativar professor",
        description: "Não foi possível desativar o professor. Tente novamente.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher || !selectedTeacher.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Professor não encontrado ou ID inválido.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTeacher(selectedTeacher.id);
      toast({
        title: selectedTeacher.status === 'pending' ? "Convite cancelado" : "Professor excluído",
        description: selectedTeacher.status === 'pending'
          ? `O convite para ${selectedTeacher.name} foi cancelado.`
          : `${selectedTeacher.name} foi excluído permanentemente.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);

      // Refresh the teachers list
      if (userProfile?.organizationId) {
        const fetchedTeachers = await getTeachersByOrganization(userProfile.organizationId);
        setTeachers(fetchedTeachers);
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir professor",
        description: "Não foi possível excluir o professor. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const openEditDialog = (teacher: UserProfile) => {
    setSelectedTeacher(teacher);
    setEditTeacher({ name: teacher.name });
    setIsEditDialogOpen(true);
  }

  const openDeleteDialog = (teacher: UserProfile) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Professores</CardTitle>
          <CardDescription>
            Adicione, visualize e gerencie as contas dos professores da sua instituição.
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar professor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Professor</DialogTitle>
              <DialogDescription>
                Adicione um novo professor à sua instituição. Ele poderá criar turmas e gerenciar seus alunos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  placeholder="Nome completo do professor"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                  className="col-span-3"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTeacher} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar Professor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Teacher Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Professor</DialogTitle>
              <DialogDescription>
                Atualize as informações do professor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  value={editTeacher.name}
                  onChange={(e) => setEditTeacher(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  placeholder="Nome completo do professor"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditTeacher} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Teacher Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Professor</DialogTitle>
              <DialogDescription>
                Tem certeza de que deseja excluir {selectedTeacher?.status === 'pending' ? 'o convite para' : ''} o professor <strong>{selectedTeacher?.name}</strong>?
                <br />
                <br />
                {selectedTeacher?.status === 'pending' ? (
                  'Esta ação irá cancelar o convite enviado para este professor.'
                ) : (
                  'Esta ação irá excluir permanentemente todas as turmas do professor, todos os alunos das turmas, todas as estratégias de aprendizagem e todos os dados e insights.'
                )}
                <br />
                <br />
                <strong>Esta ação não pode ser desfeita.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteTeacher} disabled={isDeleting}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedTeacher?.status === 'pending' ? 'Cancelar Convite' : 'Excluir Professor'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Como os professores fazem login:</strong> Quando você adiciona um professor, ele recebe automaticamente o papel de professor em sua organização.
            O professor deve se registrar no sistema usando o mesmo e-mail que você cadastrou. Durante o registro, ele será automaticamente associado à sua organização como professor.
          </AlertDescription>
        </Alert>
        {loading ? (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : teachers.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedTeachers.map((teacher, index) => (
                <TableRow key={`${teacher.id}-${index}`}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={teacher.status === 'pending' ? 'secondary' : teacher.status === 'inactive' ? 'destructive' : 'default'}
                        className={
                          teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          teacher.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {teacher.status === 'pending' ? 'Convite Pendente' :
                         teacher.status === 'inactive' ? 'Inativo' :
                         'Ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(teacher)}>Editar</DropdownMenuItem>
                        {teacher.status !== 'pending' && (
                          <DropdownMenuItem onClick={() => handleDeactivateTeacher(teacher)}>Desativar</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(teacher)}>
                            Excluir
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                Nenhum professor cadastrado ainda.
            </div>
        )}

        {/* Pagination Controls */}
        {teachers.length > itemsPerPage && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, teachers.length)} de {teachers.length} professores
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
      </CardContent>
    </Card>
  );
}
