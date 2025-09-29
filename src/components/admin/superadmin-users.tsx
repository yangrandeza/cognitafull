"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  getAllOrganizations,
  getAllUsers,
  updateUserRole,
  deleteTeacher,
  getClassesByOrganization,
  getClassesByTeacher,
  getAllClasses,
  deleteClass,
  updateOrganization,
  deleteOrganization,
  createUserProfileInFirestore,
  createOrganization
} from "@/lib/firebase/firestore";
import type { Organization, UserProfile, Class } from "@/lib/types";
import { Users, Plus, Trash2, Search, ChevronDown, ChevronRight, Building, BookOpen, UserCheck, Eye, Edit, X } from "lucide-react";

interface UserWithClasses extends UserProfile {
  classes?: Class[];
}

interface OrganizationWithUsers extends Organization {
  admins: UserWithClasses[];
  teachers: UserWithClasses[];
}

export function SuperAdminUsers() {
  const [organizations, setOrganizations] = useState<OrganizationWithUsers[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userClasses, setUserClasses] = useState<Class[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [editingOrgName, setEditingOrgName] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgs, users, classes] = await Promise.all([
          getAllOrganizations(),
          getAllUsers(),
          getAllClasses()
        ]);

        setAllUsers(users);
        setAllClasses(classes);

        // Organize data hierarchically
        const orgsWithUsers = orgs.map(org => {
          const orgUsers = users.filter(u => u.organizationId === org.id);
          const admins = orgUsers.filter(u => u.role === 'admin').map(admin => ({
            ...admin,
            classes: classes.filter(c => c.organizationId === org.id)
          }));
          const teachers = orgUsers.filter(u => u.role === 'teacher').map(teacher => ({
            ...teacher,
            classes: classes.filter(c => c.teacherId === teacher.id)
          }));

          return {
            ...org,
            admins,
            teachers
          };
        });

        setOrganizations(orgsWithUsers);
      } catch (error) {
        console.error("Error fetching users data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados dos usuários.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const toggleOrgExpansion = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
    try {
      await updateUserRole(userId, newRole);
      setAllUsers(users => users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      // Refresh organizations data
      const updatedOrgs = organizations.map(org => {
        const orgUsers = allUsers.filter(u => u.organizationId === org.id && u.id !== userId);
        const updatedUser = allUsers.find(u => u.id === userId);
        if (updatedUser) {
          orgUsers.push(updatedUser);
        }

        const admins = orgUsers.filter(u => u.role === 'admin').map(admin => ({
          ...admin,
          classes: allClasses.filter(c => c.organizationId === org.id)
        }));
        const teachers = orgUsers.filter(u => u.role === 'teacher').map(teacher => ({
          ...teacher,
          classes: allClasses.filter(c => c.teacherId === teacher.id)
        }));

        return {
          ...org,
          admins,
          teachers
        };
      });

      setOrganizations(updatedOrgs);

      toast({
        title: "Função atualizada",
        description: "A função do usuário foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar função",
        description: "Não foi possível atualizar a função do usuário.",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await deleteTeacher(userId);
        setAllUsers(users => users.filter(user => user.id !== userId));

        // Refresh organizations data
        setOrganizations(orgs => orgs.map(org => ({
          ...org,
          admins: org.admins.filter(a => a.id !== userId),
          teachers: org.teachers.filter(t => t.id !== userId)
        })));

        toast({
          title: "Usuário excluído",
          description: "O usuário foi removido com sucesso.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir usuário",
          description: "Não foi possível excluir o usuário.",
        });
      }
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma? Todos os alunos e dados serão perdidos.')) {
      try {
        await deleteClass(classId);
        setAllClasses(classes => classes.filter(c => c.id !== classId));

        // Refresh organizations data
        setOrganizations(orgs => orgs.map(org => ({
          ...org,
          admins: org.admins.map(admin => ({
            ...admin,
            classes: admin.classes?.filter(c => c.id !== classId)
          })),
          teachers: org.teachers.map(teacher => ({
            ...teacher,
            classes: teacher.classes?.filter(c => c.id !== classId)
          }))
        })));

        toast({
          title: "Turma excluída",
          description: "A turma foi removida com sucesso.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir turma",
          description: "Não foi possível excluir a turma.",
        });
      }
    }
  };

  const viewUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    let classes: Class[] = [];

    if (user.role === 'admin') {
      classes = allClasses.filter(c => c.organizationId === user.organizationId);
    } else if (user.role === 'teacher') {
      classes = allClasses.filter(c => c.teacherId === user.id);
    }

    setUserClasses(classes);
    setShowUserDialog(true);
  };

  const viewClassDetails = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowClassDialog(true);
  };

  const editOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setEditingOrgName(org.name);
    setShowOrgDialog(true);
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrganization || !editingOrgName.trim()) return;

    try {
      await updateOrganization(selectedOrganization.id, { name: editingOrgName.trim() });

      // Update local state
      setOrganizations(orgs => orgs.map(org =>
        org.id === selectedOrganization.id ? { ...org, name: editingOrgName.trim() } : org
      ));

      toast({
        title: "Organização atualizada",
        description: "O nome da organização foi atualizado com sucesso.",
      });

      setShowOrgDialog(false);
      setSelectedOrganization(null);
      setEditingOrgName('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar organização",
        description: "Não foi possível atualizar a organização.",
      });
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (confirm('Tem certeza que deseja excluir esta organização? Todos os usuários, turmas, alunos e dados serão perdidos permanentemente.')) {
      try {
        await deleteOrganization(orgId);

        // Remove from local state
        setOrganizations(orgs => orgs.filter(org => org.id !== orgId));

        toast({
          title: "Organização excluída",
          description: "A organização foi removida com sucesso.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir organização",
          description: "Não foi possível excluir a organização.",
        });
      }
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;

    try {
      const orgId = await createOrganization(newOrgName.trim());

      // Add to local state
      const newOrg: OrganizationWithUsers = {
        id: orgId,
        name: newOrgName.trim(),
        createdAt: new Date().toISOString() as any, // Firestore timestamp will be handled by the backend
        admins: [],
        teachers: []
      };

      setOrganizations(orgs => [...orgs, newOrg]);

      toast({
        title: "Organização criada",
        description: "A organização foi criada com sucesso.",
      });

      setShowCreateOrgDialog(false);
      setNewOrgName('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar organização",
        description: "Não foi possível criar a organização.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.admins.some(admin => admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    org.teachers.some(teacher => teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Gerenciamento de Usuários</h2>
          <Badge variant="secondary">{allUsers.length} usuários</Badge>
          <Badge variant="outline">{allClasses.length} turmas</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar organizações ou usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button onClick={() => setShowCreateOrgDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Organização
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrganizations.map((org) => (
          <Card key={org.id}>
            <Collapsible open={expandedOrgs.has(org.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CollapsibleTrigger
                      onClick={() => toggleOrgExpansion(org.id)}
                      className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded"
                    >
                      {expandedOrgs.has(org.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                    </CollapsibleTrigger>
                    <Badge variant="outline">{org.admins.length + org.teachers.length} usuários</Badge>
                    <Badge variant="secondary">{org.admins.length} diretores</Badge>
                    <Badge variant="outline">{org.teachers.length} professores</Badge>
                    <div className="flex gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editOrganization(org)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrganization(org.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Tabs defaultValue="admins" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="admins" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Diretores ({org.admins.length})
                      </TabsTrigger>
                      <TabsTrigger value="teachers" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Professores ({org.teachers.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="admins" className="space-y-4">
                      {org.admins.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Nenhum diretor encontrado</p>
                      ) : (
                        <div className="space-y-3">
                          {org.admins.map((admin) => (
                            <Card key={admin.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                    <div>
                                      <h4 className="font-medium">{admin.name}</h4>
                                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary">Diretor</Badge>
                                        <Badge variant={admin.status === 'active' ? 'default' : 'outline'}>
                                          {admin.status === 'active' ? 'Ativo' : 'Pendente'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => viewUserDetails(admin)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver Detalhes
                                    </Button>
                                    <Select
                                      value={admin.role}
                                      onValueChange={(value) => handleRoleChange(admin.id, value as UserProfile['role'])}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Diretor</SelectItem>
                                        <SelectItem value="teacher">Professor</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(admin.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {admin.classes && admin.classes.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="text-sm font-medium mb-2">Turmas da Organização:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {admin.classes.slice(0, 3).map((classItem) => (
                                        <Badge
                                          key={classItem.id}
                                          variant="outline"
                                          className="cursor-pointer hover:bg-muted"
                                          onClick={() => viewClassDetails(classItem)}
                                        >
                                          <BookOpen className="h-3 w-3 mr-1" />
                                          {classItem.name}
                                        </Badge>
                                      ))}
                                      {admin.classes.length > 3 && (
                                        <Badge variant="outline">
                                          +{admin.classes.length - 3} mais
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="teachers" className="space-y-4">
                      {org.teachers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Nenhum professor encontrado</p>
                      ) : (
                        <div className="space-y-3">
                          {org.teachers.map((teacher) => (
                            <Card key={teacher.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <h4 className="font-medium">{teacher.name}</h4>
                                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">Professor</Badge>
                                        <Badge variant={teacher.status === 'active' ? 'default' : 'outline'}>
                                          {teacher.status === 'active' ? 'Ativo' : 'Pendente'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => viewUserDetails(teacher)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver Detalhes
                                    </Button>
                                    <Select
                                      value={teacher.role}
                                      onValueChange={(value) => handleRoleChange(teacher.id, value as UserProfile['role'])}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Diretor</SelectItem>
                                        <SelectItem value="teacher">Professor</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(teacher.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {teacher.classes && teacher.classes.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="text-sm font-medium mb-2">Turmas do Professor:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {teacher.classes.map((classItem) => (
                                        <Badge
                                          key={classItem.id}
                                          variant="outline"
                                          className="cursor-pointer hover:bg-muted"
                                          onClick={() => viewClassDetails(classItem)}
                                        >
                                          <BookOpen className="h-3 w-3 mr-1" />
                                          {classItem.name} ({classItem.studentCount} alunos)
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas sobre {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Função</label>
                  <Badge variant={selectedUser.role === 'admin' ? 'secondary' : 'outline'}>
                    {selectedUser.role === 'admin' ? 'Diretor' : 'Professor'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={selectedUser.status === 'active' ? 'default' : 'outline'}>
                    {selectedUser.status === 'active' ? 'Ativo' : 'Pendente'}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Turmas ({userClasses.length})</h4>
                {userClasses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma turma encontrada</p>
                ) : (
                  <div className="space-y-2">
                    {userClasses.map((classItem) => (
                      <div key={classItem.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium">{classItem.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {classItem.studentCount} alunos • {classItem.responsesCount} respostas
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewClassDetails(classItem)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement password reset functionality
                toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "O reset de senha será implementado em breve.",
                });
              }}
            >
              Resetar Senha
            </Button>
            <Button onClick={() => setShowUserDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Details Dialog */}
      <Dialog open={showClassDialog} onOpenChange={setShowClassDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Turma</DialogTitle>
            <DialogDescription>
              Informações sobre a turma {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da Turma</label>
                  <p className="text-sm text-muted-foreground">{selectedClass.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Alunos</label>
                  <p className="text-sm text-muted-foreground">{selectedClass.studentCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Respostas</label>
                  <p className="text-sm text-muted-foreground">{selectedClass.responsesCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Criação</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedClass.createdAt && typeof selectedClass.createdAt === 'object' && 'toDate' in selectedClass.createdAt
                      ? (selectedClass.createdAt as any).toDate().toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Professor</label>
                <p className="text-sm text-muted-foreground">
                  {allUsers.find(u => u.id === selectedClass.teacherId)?.name || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Organização</label>
                <p className="text-sm text-muted-foreground">
                  {organizations.find(o => o.id === selectedClass.organizationId)?.name || 'N/A'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="destructive" onClick={() => selectedClass && handleDeleteClass(selectedClass.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Turma
            </Button>
            <Button onClick={() => setShowClassDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization Edit Dialog */}
      <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
            <DialogDescription>
              Edite o nome da organização {selectedOrganization?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Organização</label>
              <Input
                value={editingOrgName}
                onChange={(e) => setEditingOrgName(e.target.value)}
                placeholder="Digite o nome da organização"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrgDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateOrganization} disabled={!editingOrgName.trim()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Organização</DialogTitle>
            <DialogDescription>
              Crie uma nova organização para gerenciar usuários e turmas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Organização</label>
              <Input
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Digite o nome da organização"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrgDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrganization} disabled={!newOrgName.trim()}>
              Criar Organização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
