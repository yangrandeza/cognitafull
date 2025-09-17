// Cliente-side utilities - apenas para compatibilidade
export interface PDFGeneratorOptions {
  student: any;
  profile: any;
  includeLogo?: boolean;
  includeContactInfo?: boolean;
  includeSharingLinks?: boolean;
}

// Função utilitária para baixar PDF via API
export const downloadStudentReportPDF = async (options: PDFGeneratorOptions, filename?: string): Promise<void> => {
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `relatorio-${options.student.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    throw error;
  }
};

// Função de compatibilidade para manter a interface existente
export const generateStudentReportPDF = (options: PDFGeneratorOptions) => {
  return {
    download: (filename?: string) => downloadStudentReportPDF(options, filename)
  };
};
