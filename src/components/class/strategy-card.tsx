"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { StrategyCard as Strategy } from "@/lib/types";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

interface StrategyCardProps {
    strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
    // @ts-ignore
    const Icon = LucideIcons[strategy.iconName] || LucideIcons.HelpCircle;

    return (
        <Card className="flex flex-col border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="space-y-3">
                <div className="flex items-center gap-3 text-primary">
                    <Icon className="h-6 w-6" />
                    <span className="font-semibold text-sm uppercase tracking-wider">{strategy.methodology}</span>
                </div>
                <CardTitle className="font-headline text-2xl">{strategy.headline}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1">Como fazer:</h4>
                    <p className="text-muted-foreground">{strategy.details}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-1">Por que funciona (para esta turma):</h4>
                    <p className="text-muted-foreground">{strategy.connection}</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="link" asChild className="p-0 h-auto">
                    <Link href={strategy.reference} target="_blank" rel="noopener noreferrer">
                        Saber mais sobre {strategy.methodology}
                        <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
