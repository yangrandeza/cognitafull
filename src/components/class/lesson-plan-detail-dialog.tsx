
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LearningStrategy } from "@/lib/types";
import { Lightbulb, Book, WandSparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyCard } from "./strategy-card";

interface StrategyDetailDialogProps {
  strategy: LearningStrategy;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function StrategyDetailDialog({ strategy, isOpen, setIsOpen }: StrategyDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            {strategy.title}
          </DialogTitle>
           <DialogDescription>
            Detalhes do plano de aula original e as estratégias de aprendizagem sugeridas pelo Oráculo.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="suggestions" className="flex-grow mt-4 overflow-hidden flex flex-col">
            <TabsList className="flex-shrink-0">
                <TabsTrigger value="suggestions"><WandSparkles className="mr-2 h-4 w-4" /> Sugestões do Oráculo</TabsTrigger>
                <TabsTrigger value="original"><Book className="mr-2 h-4 w-4" /> Plano Original</TabsTrigger>
            </TabsList>
            
            <div className="flex-grow mt-4 overflow-hidden">
                 <TabsContent value="suggestions" className="h-full m-0">
                     <ScrollArea className="h-full pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.isArray(strategy.strategies) && strategy.strategies.map((item, index) => (
                                <StrategyCard key={index} strategy={item} />
                            ))}
                        </div>
                    </ScrollArea>
                 </TabsContent>
                 <TabsContent value="original" className="h-full m-0">
                     <ScrollArea className="h-full pr-4">
                         <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{strategy.lessonPlan}</p>
                         </div>
                    </ScrollArea>
                 </TabsContent>
            </div>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
