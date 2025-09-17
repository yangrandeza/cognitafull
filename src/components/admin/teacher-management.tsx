"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TeacherInvitationLink } from "./teacher-invitation-link";
import { useToast } from "@/hooks/use-toast";
import { createTeacher, getTeachersByOrganization, deleteTeacher } from "@/lib/firebase/firestore";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  Plus,
  Users,
  Mail,
  Trash2,
  UserPlus,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: any;
}

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "" });
  const [creating, setCreating] = useState(false);
  const { user: userProfile } = useUserProfile();
  const { toast } = useToast();

  // Load teachers
  const loadTeachers = async () => {
    try {
      setLoading(true);
      if (userProfile?.organizationId) {
        const teachersData = await getTeachersByOrganization(userProfile.organizationId);
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar professores",
        description: "Não foi possível carregar a lista de professores.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [userProfile]);

  // Create new teacher
  const handleCreateTeacher = async () => {
    if (!newTeacher.name.trim() || !newTeacher.email.trim()) {
      toast({
        variant: "destructive",
        title: "Dados obrigatórios",
        description: "Nome e email são obrigatórios.",
      });
      return;
    }

    try {
      setCreating(true);

      if (!userProfile?.organizationId) {
        throw new Error("Organização não encontrada");
      }

      const result = await createTeacher(userProfile.organizationId, {
        name: newTeacher.name.trim(),
        email: newTeacher.email.trim(),
      });

      // Show invitation link dialog
      setInvitationData({
        teacherId: result.teacherId,
        invitationLink: result.invitationLink,
        teacherName: newTeacher.name.trim(),
        teacherEmail: newTeacher.email.trim(),
        expiresAt: result.expiresAt,
        emailSent: result.emailSent,
      });

      setShowCreateDialog(false);
      setShowInvitationDialog(true);
      setNewTeacher({ name: "", email: "" });

      // Reload teachers list
      await loadTeachers();

      toast({
        title: "Professor convidado!",
        description: "O convite foi enviado e o link de compartilhamento foi gerado.",
      });

    } catch (error) {
      console.error('Error creating teacher:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar professor",
        description: (error as Error).message || "Não foi possível criar o professor.",
      });
    } finally {
      setCreating(false);
    }
  };

  // Delete teacher
  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Tem certeza que deseja remover o professor ${teacherName}?`)) {
      return;
    }

    try {
      await deleteTeacher(teacherId);
      await loadTeachers();
      toast({
        title: "Professor removido",
        description: `${teacherName} foi removido da organização.`,
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover professor",
        description: "Não foi possível remover o professor.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciamento de Professores
          </h1>
          <p className="text-muted-foreground">
            Convide e gerencie os professores da sua organização
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Convidar Professor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Professor</DialogTitle>
              <DialogDescription>
                Digite as informações do professor que deseja convidar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teacher-name">Nome Completo</Label>
                <Input
                  id="teacher-name"
                  placeholder="João Silva"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="joao@escola.com"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTeacher}
                  disabled={creating}
                >
                  {creating ? "Criando..." : "Criar Convite"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Professores</p>
                <p className="text-2xl font-bold">{teachers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Professores Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {teachers.filter(t => t.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Convites Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {teachers.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Professores da Organização</CardTitle>
          <CardDescription>
            Lista de todos os professores e status dos convites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando professores...</p>
              </div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum professor cadastrado</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Primeiro Professor
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell>{formatDate(teacher.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation Link Dialog */}
      <Dialog open={showInvitationDialog} onOpenChange={setShowInvitationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convite Criado com Sucesso!</DialogTitle>
            <DialogDescription>
              O professor foi convidado e você pode compartilhar o link de convite
            </DialogDescription>
          </DialogHeader>
          {invitationData && (
            <TeacherInvitationLink
              teacherId={invitationData.teacherId}
              invitationLink={invitationData.invitationLink}
              teacherName={invitationData.teacherName}
              teacherEmail={invitationData.teacherEmail}
              expiresAt={invitationData.expiresAt}
              emailSent={invitationData.emailSent}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Instructions */}
      <Alert>
        <UserPlus className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funciona:</strong> Ao convidar um professor, o sistema gera automaticamente um link único que pode ser compartilhado via WhatsApp, email ou qualquer outro canal. O professor poderá aceitar o convite e criar sua conta na plataforma.
        </AlertDescription>
      </Alert>
    </div>
  );
}
