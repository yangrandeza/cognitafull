"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { deleteClassAction } from "@/lib/actions";
import { getClassById, updateClass } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { Settings, Trash2, Plus, X, FileText, Shield, Save } from "lucide-react";
import type { CustomField, Class } from "@/lib/types";

interface ClassSettingsProps {
  classId: string;
  className: string;
}

export function ClassSettings({ classId, className }: ClassSettingsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [enableCustomFields, setEnableCustomFields] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomField['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load existing class configuration
  useEffect(() => {
    const loadClassConfig = async () => {
      try {
        const classData = await getClassById(classId);
        if (classData) {
          setEnableCustomFields(classData.enableCustomFields || false);
          setCustomFields(classData.customFields || []);
        }
      } catch (error) {
        console.error('Error loading class config:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações da turma.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (classId) {
      loadClassConfig();
    }
  }, [classId, toast]);

  // Save class configuration
  const saveClassConfig = async () => {
    setIsSaving(true);
    try {
      console.log('Saving class config:', { enableCustomFields, customFields });
      await updateClass(classId, {
        enableCustomFields,
        customFields
      });
      setHasChanges(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações da turma foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving class config:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Track changes (only after initial load)
  useEffect(() => {
    if (!isLoading) {
      setHasChanges(true);
    }
  }, [enableCustomFields, customFields, isLoading]);

  // Custom Fields Functions
  const addCustomField = () => {
    if (!newFieldLabel.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira um nome para o campo.",
      });
      return;
    }

    const newField: CustomField = {
      id: Date.now().toString(),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      ...(newFieldType === 'select' && newFieldOptions.trim() ? {
        options: newFieldOptions.split(',').map(opt => opt.trim()).filter(opt => opt)
      } : {})
    };

    setCustomFields([...customFields, newField]);
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');

    toast({
      title: "Campo adicionado",
      description: `O campo "${newField.label}" foi adicionado com sucesso.`,
    });
  };

  const removeCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(field => field.id !== fieldId));
    toast({
      title: "Campo removido",
      description: "O campo foi removido com sucesso.",
    });
  };

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
        <CardContent className="space-y-6">
          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-end">
              <Button onClick={saveClassConfig} disabled={isSaving} className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Campos Adicionais do Quiz */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Campos Adicionais do Quiz
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ative campos personalizados para coletar informações adicionais no quiz psicométrico
                </p>
              </div>
              <Switch
                checked={enableCustomFields}
                onCheckedChange={setEnableCustomFields}
              />
            </div>

            {enableCustomFields && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                {/* Lista de Campos Existentes */}
                {customFields.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Campos Configurados:</Label>
                    <div className="space-y-2">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-background rounded-md border">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{field.label}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {field.type === 'text' ? 'Texto' :
                                   field.type === 'number' ? 'Número' :
                                   field.type === 'email' ? 'E-mail' :
                                   field.type === 'phone' ? 'Telefone' :
                                   field.type === 'select' ? 'Seleção' : 'Área de Texto'}
                                </Badge>
                                {field.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(field.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adicionar Novo Campo */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-medium">Adicionar Novo Campo:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="field-label" className="text-sm">Nome do Campo</Label>
                      <Input
                        id="field-label"
                        placeholder="Ex: Idade, Profissão, etc."
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="field-type" className="text-sm">Tipo do Campo</Label>
                      <Select value={newFieldType} onValueChange={(value: CustomField['type']) => setNewFieldType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="select">Seleção</SelectItem>
                          <SelectItem value="textarea">Área de Texto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newFieldType === 'select' && (
                    <div className="space-y-2">
                      <Label htmlFor="field-options" className="text-sm">
                        Opções (separadas por vírgula)
                      </Label>
                      <Input
                        id="field-options"
                        placeholder="Ex: Opção 1, Opção 2, Opção 3"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="field-required"
                        checked={newFieldRequired}
                        onCheckedChange={setNewFieldRequired}
                      />
                      <Label htmlFor="field-required" className="text-sm">
                        Campo obrigatório
                      </Label>
                    </div>
                    <Button onClick={addCustomField} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Campo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
