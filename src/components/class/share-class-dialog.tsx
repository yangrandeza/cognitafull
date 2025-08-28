
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ShareClassDialogProps {
  classId: string;
  className?: string;
}

export function ShareClassDialog({ classId, className }: ShareClassDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const url = `${window.location.origin}/q/${classId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
    url
  )}`;

  const handleOpen = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description:
        "O link de convite da turma foi copiado para sua área de transferência.",
    });
    setOpen(true);
  };
  
  const handleCopyToClipboard = () => {
     navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
    });
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `qrcode-turma-${classId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast({
        variant: "destructive",
        title: "Erro no Download",
        description: "Não foi possível baixar o QR Code. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleOpen} className={className}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar Turma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Compartilhe com a Turma
          </DialogTitle>
          <DialogDescription>
            Os alunos podem usar o QR Code ou o link direto para acessar o
            questionário.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <Image
              src={qrCodeUrl}
              alt="QR Code para o questionário da turma"
              width={200}
              height={200}
              data-ai-hint="qr code"
            />
          </div>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Baixar QR Code
          </Button>

          <div className="w-full space-y-2 pt-4 border-t">
            <Label htmlFor="class-link">Ou copie o link</Label>
            <div className="flex space-x-2">
                <Input id="class-link" value={url} readOnly />
                <Button type="button" size="icon" onClick={handleCopyToClipboard}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
