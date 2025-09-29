"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student, UnifiedProfile, CustomField } from "@/lib/types";

interface CsvExportModalProps {
  students: Student[];
  profiles: UnifiedProfile[];
  customFields: CustomField[];
  classId: string;
}

interface ExportField {
  key: string;
  label: string;
  category: 'standard' | 'profile' | 'custom';
}

export function CsvExportModal({ students, profiles, customFields, classId }: CsvExportModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getStudentProfile = (studentId: string) => {
    return profiles.find(p => p.studentId === studentId);
  };

  const exportFields: ExportField[] = [
    // Standard fields
    { key: 'name', label: 'Nome', category: 'standard' },
    { key: 'age', label: 'Idade', category: 'standard' },
    { key: 'email', label: 'Email', category: 'standard' },
    { key: 'gender', label: 'Gênero', category: 'standard' },
    { key: 'generation', label: 'Geração', category: 'standard' },
    { key: 'quizStatus', label: 'Status do Quiz', category: 'standard' },
    // Profile fields
    { key: 'varkDominant', label: 'Perfil VARK Dominante', category: 'profile' },
    { key: 'discDominant', label: 'Perfil DISC Dominante', category: 'profile' },
    { key: 'jungianType', label: 'Tipo Junguiano', category: 'profile' },
    { key: 'schwartzTopValues', label: 'Valores Schwartz (Top)', category: 'profile' },
    // Custom fields
    ...customFields.map(field => ({
      key: `custom_${field.id}`,
      label: field.label,
      category: 'custom' as const
    }))
  ];

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    const newSelected = new Set(selectedFields);
    if (checked) {
      newSelected.add(fieldKey);
    } else {
      newSelected.delete(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const generateCSV = () => {
    if (selectedFields.size === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum campo selecionado",
        description: "Selecione pelo menos um campo para exportar.",
      });
      return;
    }

    const headers = Array.from(selectedFields).map(fieldKey => {
      const field = exportFields.find(f => f.key === fieldKey);
      return field ? field.label : fieldKey;
    });

    const rows = students.map(student => {
      const profile = getStudentProfile(student.id);
      const row: string[] = [];

      selectedFields.forEach(fieldKey => {
        let value = '';

        if (fieldKey.startsWith('custom_')) {
          const customFieldId = fieldKey.replace('custom_', '');
          value = student.customFields?.[customFieldId] || '';
        } else {
          switch (fieldKey) {
            case 'name':
              value = student.name;
              break;
            case 'age':
              value = student.age.toString();
              break;
            case 'email':
              value = student.email || '';
              break;
            case 'gender':
              value = student.gender || '';
              break;
            case 'generation':
              value = student.generation || '';
              break;
            case 'quizStatus':
              value = student.quizStatus === 'completed' ? 'Concluído' : 'Pendente';
              break;
            case 'varkDominant':
              value = profile?.varkProfile?.dominant || '';
              break;
            case 'discDominant':
              value = profile?.discProfile?.dominant || '';
              break;
            case 'jungianType':
              value = profile?.jungianProfile?.type || '';
              break;
            case 'schwartzTopValues':
              value = profile?.schwartzValues?.top_values?.join(', ') || '';
              break;
            default:
              value = '';
          }
        }

        row.push(`"${value.replace(/"/g, '""')}"`);
      });

      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    return csvContent;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV();
      if (!csvContent) return;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `alunos_turma_${classId}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "O arquivo CSV foi baixado com sucesso.",
      });

      setOpen(false);
      setSelectedFields(new Set());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo CSV.",
      });
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const groupedFields = exportFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-headline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Exportar Relatório de Alunos</DialogTitle>
          <DialogDescription>
            Selecione os campos que deseja incluir no arquivo CSV de exportação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedFields).map(([category, fields]) => (
            <div key={category}>
              <h4 className="font-medium mb-3 capitalize">
                {category === 'standard' ? 'Campos Padrão' :
                 category === 'profile' ? 'Dados de Perfil' :
                 'Campos Personalizados'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.has(field.key)}
                      onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                    />
                    <Label htmlFor={field.key} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={selectedFields.size === 0 || isExporting}
          >
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Exportar CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
