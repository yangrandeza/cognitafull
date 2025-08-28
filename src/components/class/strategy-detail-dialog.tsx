
"use client";

import { useRef, forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LearningStrategy } from "@/lib/types";
import { FileDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";


interface StrategyDetailDialogProps {
  strategy: LearningStrategy;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const PrintableContent = forwardRef<HTMLDivElement, { content: string, title: string }>(({ content, title }, ref) => {
  return (
    <div ref={ref} className="prose prose-sm dark:prose-invert max-w-none printable-content">
      <h1 className="font-headline">{title}</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
});
PrintableContent.displayName = 'PrintableContent';


export function StrategyDetailDialog({ strategy, isOpen, setIsOpen }: StrategyDetailDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col no-print">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            {strategy.title}
          </DialogTitle>
          <DialogDescription>
            Estratégias de aprendizagem geradas para esta turma, baseadas na aula sobre: "{strategy.originalLessonPlan}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow mt-4 overflow-hidden flex flex-col">
            <ScrollArea className="h-full pr-4 flex-grow">
                <PrintableContent content={strategy.suggestions} title={strategy.title} ref={printRef} />
            </ScrollArea>
             <div className="flex-shrink-0 pt-4 mt-auto">
                <button
                    onClick={handlePrint}
                    className={cn(buttonVariants({ variant: "default" }))}
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar para PDF
                </button>
             </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
