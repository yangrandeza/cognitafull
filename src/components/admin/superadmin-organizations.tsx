"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function SuperAdminOrganizations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h2 className="text-xl font-bold">Gerenciamento de Organizações</h2>
      </div>

      <Card>
        <CardHeader className="text-center">
          <Building className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Funcionalidade Integrada</CardTitle>
          <CardDescription>
            O gerenciamento de organizações foi integrado à aba "Usuários" para uma experiência mais completa.
            Agora você pode gerenciar organizações, usuários e turmas em um único local.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/superadmin/users">
            <Button>
              Ir para Gerenciamento de Usuários
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
