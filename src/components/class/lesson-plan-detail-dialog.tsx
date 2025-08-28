
"use client";

import { useRef, forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import ReactToPrint from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LessonPlan } from "@/lib/types";
import { FileDown, Wand2, Book, Lightbulb } from "lucide-react";


interface LessonPlanDetailDialogProps {
  plan: LessonPlan;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const PrintableContent = forwardRef<HTMLDivElement, { content: string }>(({ content }, ref) => {
  return (
    <div ref={ref} className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
});
PrintableContent.displayName = 'PrintableContent';


export function LessonPlanDetailDialog({ plan, isOpen, setIsOpen }: LessonPlanDetailDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{plan.title}</DialogTitle>
          <DialogDescription>
            Detalhes do seu plano de aula otimizado.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="reformed" className="flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="original"><Book className="mr-2 h-4 w-4" /> Plano Original</TabsTrigger>
            <TabsTrigger value="suggestions"><Lightbulb className="mr-2 h-4 w-4" /> Sugestões da IA</TabsTrigger>
            <TabsTrigger value="reformed"><Wand2 className="mr-2 h-4 w-4" /> Plano Melhorado</TabsTrigger>
          </TabsList>
          
          <div className="flex-grow mt-4 overflow-hidden">
            <TabsContent value="original" className="h-full">
               <ScrollArea className="h-full pr-4">
                 <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-muted/20">
                    <ReactMarkdown>{plan.originalPlan}</ReactMarkdown>
                 </div>
               </ScrollArea>
            </TabsContent>
            <TabsContent value="suggestions" className="h-full">
                <ScrollArea className="h-full pr-4">
                 <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-muted/20">
                    <ReactMarkdown>{plan.suggestions}</ReactMarkdown>
                 </div>
               </ScrollArea>
            </TabsContent>
            <TabsContent value="reformed" className="h-full flex flex-col">
                 <ScrollArea className="h-full pr-4 flex-grow">
                    <PrintableContent content={plan.reformulatedPlan} ref={printRef} />
                </ScrollArea>
                 <div className="flex-shrink-0 pt-4 mt-auto">
                    <ReactToPrint
                        content={() => printRef.current}
                        documentTitle={plan.title.replace(/ /g, '_')}
                        trigger={() => (
                             <Button>
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar para PDF
                            </Button>
                        )}
                    />
                 </div>
            </TabsContent>
          </div>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
