"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, CheckCircle } from "lucide-react";

export function SuperAdminSystem() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Configurações do Sistema</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status da Conexão</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Último Backup</span>
              <span className="text-sm text-muted-foreground">Hoje, 02:00</span>
            </div>
            <Button variant="outline" className="w-full">
              Fazer Backup Manual
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Autenticação</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Última Verificação</span>
              <span className="text-sm text-muted-foreground">Agora</span>
            </div>
            <Button variant="outline" className="w-full">
              Verificar Segurança
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
