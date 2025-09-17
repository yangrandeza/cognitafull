"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailTestDialog } from "@/components/admin/email-test-dialog";
import { EmailTemplateEditor } from "@/components/admin/email-template-editor";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Users,
  FileText,
  TrendingUp
} from "lucide-react";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'sent' | 'failed' | 'pending';
  messageId?: string;
  error?: string;
  sentAt: Timestamp;
  createdAt: Timestamp;
}

export default function SuperAdminEmailsPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const { toast } = useToast();

  // Load email logs from Firestore
  const loadEmailLogs = async () => {
    try {
      setLoading(true);
      const emailLogsRef = collection(db, 'emailLogs');
      const q = query(
        emailLogsRef,
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const logs: EmailLog[] = [];

      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as EmailLog);
      });

      setEmailLogs(logs);
    } catch (error) {
      console.error('Error loading email logs:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar o histórico de emails.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmailLogs();
  }, []);

  // Filter logs based on search and filters
  const filteredLogs = emailLogs.filter(log => {
    const matchesSearch = log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesTemplate = templateFilter === "all" || log.template === templateFilter;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Statistics
  const stats = {
    total: emailLogs.length,
    sent: emailLogs.filter(log => log.status === 'sent').length,
    failed: emailLogs.filter(log => log.status === 'failed').length,
    pending: emailLogs.filter(log => log.status === 'pending').length,
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTemplateBadge = (template: string) => {
    const colors = {
      'welcome': 'bg-blue-100 text-blue-800',
      'quiz-results': 'bg-green-100 text-green-800',
      'teacher-invitation': 'bg-purple-100 text-purple-800',
      'custom': 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[template as keyof typeof colors] || colors.custom}>
        {template}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Gerenciamento de Emails
          </h1>
          <p className="text-muted-foreground">
            Monitore, teste e gerencie todos os emails enviados pelo sistema MUDEAI
          </p>
        </div>
        <Button onClick={() => setShowTestDialog(true)} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Testar Emails
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Emails</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Histórico de Emails</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor">Editor de Templates</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por email ou assunto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="sm:w-48">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sent">Enviados</SelectItem>
                      <SelectItem value="failed">Falhas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:w-48">
                  <Label>Template</Label>
                  <Select value={templateFilter} onValueChange={setTemplateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="welcome">Boas-vindas</SelectItem>
                      <SelectItem value="quiz-results">Resultados Quiz</SelectItem>
                      <SelectItem value="teacher-invitation">Convite Professor</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={loadEmailLogs} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Emails</CardTitle>
              <CardDescription>
                Últimos {filteredLogs.length} emails enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando logs...</p>
                  </div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum email encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">{log.to}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                          <TableCell>{getTemplateBadge(log.template)}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.messageId ? (
                              <span className="text-green-600">{log.messageId.substring(0, 20)}...</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Disponíveis</CardTitle>
              <CardDescription>
                Templates de email configurados com cores e logo do MUDEAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Email de Boas-vindas</h3>
                    <Badge className="bg-blue-100 text-blue-800">welcome</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado automaticamente quando um aluno completa o cadastro
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Resultados do Quiz</h3>
                    <Badge className="bg-green-100 text-green-800">quiz-results</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado após processamento dos resultados psicométricos
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Convite para Professor</h3>
                    <Badge className="bg-purple-100 text-purple-800">teacher-invitation</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado quando diretor cadastra um novo professor
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h3 className="font-medium">Email Personalizado</h3>
                    <Badge className="bg-gray-100 text-gray-800">custom</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template customizável para necessidades específicas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <EmailTemplateEditor />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
              <CardDescription>
                Configurações atuais do sistema de email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Servidor SMTP</Label>
                  <p className="text-sm text-muted-foreground">Gmail (smtp.gmail.com)</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Porta</Label>
                  <p className="text-sm text-muted-foreground">587 (TLS)</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email Remetente</Label>
                  <p className="text-sm text-muted-foreground">mude.rise@gmail.com</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Variáveis de Ambiente</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  <div>EMAIL_USER=mude.rise@gmail.com</div>
                  <div>EMAIL_PASS=[CONFIGURADO]</div>
                  <div>EMAIL_FROM=noreply@mudeai.com</div>
                  <div>NEXT_PUBLIC_APP_URL=https://mudeai.com</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Test Dialog */}
      <EmailTestDialog
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
      />
    </div>
  );
}
