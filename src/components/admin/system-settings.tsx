"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateRegistrationStatus } from "@/lib/firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Settings, Save, Shield, Users } from "lucide-react";

interface SystemSettingsProps {
  className?: string;
}

export function SystemSettings({ className }: SystemSettingsProps) {
  const [blockRegistrations, setBlockRegistrations] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'system', 'registrationConfig'));
        if (configDoc.exists()) {
          const config = configDoc.data();
          setBlockRegistrations(config.blocked || false);
          setBlockMessage(config.message || '');
        }
      } catch (error) {
        console.error('Error loading system settings:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações do sistema.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Track changes
  useEffect(() => {
    if (!isLoading) {
      setHasChanges(true);
    }
  }, [blockRegistrations, blockMessage, isLoading]);

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const result = await updateRegistrationStatus(
        blockRegistrations,
        blockMessage.trim() || 'Novos registros estão temporariamente bloqueados.'
      );

      if (result.success) {
        setHasChanges(false);
        toast({
          title: "Configurações salvas",
          description: "As configurações do sistema foram salvas com sucesso.",
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações do sistema.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
        <CardDescription>
          Gerencie configurações globais do sistema MUDEAI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
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

        {/* Registration Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Controle de Registros
              </Label>
              <p className="text-sm text-muted-foreground">
                Bloqueie temporariamente novos registros de usuários
              </p>
            </div>
            <Switch
              checked={blockRegistrations}
              onCheckedChange={setBlockRegistrations}
            />
          </div>

          {blockRegistrations && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="block-message" className="text-sm font-medium">
                  Mensagem de Bloqueio
                </Label>
                <Textarea
                  id="block-message"
                  placeholder="Digite a mensagem que será exibida para os usuários..."
                  value={blockMessage}
                  onChange={(e) => setBlockMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Esta mensagem será exibida na página de cadastro quando os registros estiverem bloqueados.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status Information */}
        <div className="p-4 border rounded-lg bg-muted/10">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium">Status Atual</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong>Novos registros:</strong>{' '}
                  <span className={blockRegistrations ? 'text-destructive' : 'text-green-600'}>
                    {blockRegistrations ? 'Bloqueados' : 'Permitidos'}
                  </span>
                </p>
                {blockRegistrations && blockMessage && (
                  <p>
                    <strong>Mensagem:</strong> {blockMessage}
                  </p>
                )}
                <p>
                  <strong>Usuários existentes:</strong>{' '}
                  <span className="text-green-600">Podem fazer login normalmente</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Sobre o Controle de Registros</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• Quando ativado, impede novos cadastros via e-mail e Google</p>
                <p>• Usuários com contas existentes podem continuar fazendo login</p>
                <p>• Útil para manutenção, migração de dados ou controle de acesso</p>
                <p>• A configuração é aplicada imediatamente após salvar</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
