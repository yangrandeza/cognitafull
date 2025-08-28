"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import Image from "next/image";

export function WhiteLabelSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">White-Labeling</CardTitle>
        <CardDescription>
          Personalize a plataforma com a identidade visual da sua instituição.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
                <Label htmlFor="logo" className="mb-2 block">Logo da Instituição</Label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted">
                        <Image src="/logo-placeholder.svg" alt="logo placeholder" width={40} height={40} />
                    </div>
                    <Button variant="outline" asChild>
                        <label htmlFor="logo-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" /> Enviar
                            <input id="logo-upload" type="file" className="hidden" />
                        </label>
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex items-center gap-2">
                        <Input id="primary-color" defaultValue="#4A148C" />
                        <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: "#4A148C" }}></div>
                    </div>
                </div>
                <div>
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                        <Input id="secondary-color" defaultValue="#E6E6FA" />
                        <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: "#E6E6FA" }}></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}
