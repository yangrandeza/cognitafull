
"use client";

import { Student, UnifiedProfile } from "@/lib/types";
import { generateStudentInsights, IndividualStudentInsights } from "@/lib/student-insights-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Rocket, Heart, BookOpen, Lightbulb, Download, Share2, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { downloadStudentReportPDF } from "@/lib/pdf-generator";

interface InsightQuadrantProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

function InsightQuadrant({ icon, title, children }: InsightQuadrantProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 pb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground">{children}</div>
            </CardContent>
        </Card>
    );
}

interface StudentDashboardProps {
    student: Student;
    profile: UnifiedProfile;
}

export function StudentDashboard({ student, profile }: StudentDashboardProps) {
    const [insights, setInsights] = useState<IndividualStudentInsights | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (profile) {
            const generatedInsights = generateStudentInsights(profile, student);
            setInsights(generatedInsights);
        }
    }, [profile, student]);

    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            toast({
                title: "Gerando PDF...",
                description: "Seu relatório está sendo preparado.",
            });

            // Gerar e baixar o PDF
            await downloadStudentReportPDF({
                student,
                profile,
                includeLogo: true,
                includeContactInfo: true,
                includeSharingLinks: true,
            });

            toast({
                title: "PDF baixado!",
                description: "Seu relatório foi baixado com sucesso.",
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                variant: "destructive",
                title: "Erro ao gerar PDF",
                description: "Não foi possível gerar o relatório. Tente novamente.",
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleShareResults = async () => {
        try {
            // Criar link de compartilhamento (por enquanto apenas copia URL atual)
            const shareUrl = window.location.href;

            await navigator.clipboard.writeText(shareUrl);
            setShareLinkCopied(true);

            toast({
                title: "Link copiado!",
                description: "O link do seu perfil foi copiado para compartilhar.",
            });

            setTimeout(() => setShareLinkCopied(false), 2000);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao copiar link",
                description: "Não foi possível copiar o link. Tente novamente.",
            });
        }
    };

    const handleShareViaWhatsApp = () => {
        const shareUrl = window.location.href;
        const message = `Olá! Acabei de descobrir meu perfil de aprendizagem na plataforma MUDEAI. Veja meus resultados: ${shareUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShareViaEmail = () => {
        const shareUrl = window.location.href;
        const subject = "Meus Resultados do Perfil de Aprendizagem - MUDEAI";
        const body = `Olá!

Acabei de descobrir meu perfil de aprendizagem na plataforma MUDEAI e gostaria de compartilhar meus resultados com você.

Veja meu relatório completo: ${shareUrl}

A plataforma MUDEAI usa inteligência artificial para analisar perfis de aprendizagem baseados em metodologias científicas reconhecidas internacionalmente.

Atenciosamente,
${student.name}`;

        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(emailUrl, '_blank');
    };

    if (!insights) {
        return <div>Gerando insights...</div>
    }

    // Helper para renderizar o manual com quebras de linha e negrito
    const renderManual = (manualText: string) => {
        return manualText.split('\n').map((line, index) => {
            if (line.startsWith('**')) {
                 const parts = line.split('**');
                 return <p key={index} className="mt-2"><strong className="text-foreground">{parts[1]}</strong> {parts[2]}</p>
            }
            return <span key={index}>{line}</span>
        })
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Seu Mosaico de Aprendizagem</CardTitle>
                    <CardDescription>
                        Este é um resumo de como você aprende, interage e se motiva. Use esses insights para entender seus pontos fortes e como você pode aprender ainda melhor!
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightQuadrant 
                    icon={<Brain className="h-6 w-6" />}
                    title="Minha Mente em Foco 🧘‍♀️"
                >
                   <p>{insights.mind}</p>
                </InsightQuadrant>
                <InsightQuadrant 
                    icon={<Rocket className="h-6 w-6" />}
                    title="Meus Superpoderes 🚀"
                >
                   <p>{insights.superpowers}</p>
                </InsightQuadrant>
                <InsightQuadrant 
                    icon={<Heart className="h-6 w-6" />}
                    title="O Que Me Move ❤️"
                >
                    <p>{insights.motivation}</p>
                </InsightQuadrant>
                <InsightQuadrant
                    icon={<BookOpen className="h-6 w-6" />}
                    title="Meu 'Manual de Instruções' 📖"
                >
                    {renderManual(insights.manual)}
                </InsightQuadrant>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Lightbulb className="text-amber-500"/>
                        Dicas para Voar Mais Alto
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                       {insights.tips.map((tip, index) => (
                           <li key={index}>{tip}</li>
                       ))}
                    </ul>
                </CardContent>
            </Card>

            {/* PDF Download and Sharing Section */}
            <Card className="border-primary/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-primary">
                        <Download className="h-5 w-5" />
                        Baixe Seu Relatório Completo
                    </CardTitle>
                    <CardDescription>
                        Baixe um relatório profissional em PDF com todos os seus resultados e insights personalizados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2"
                            size="lg"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Gerando PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Baixar Relatório em PDF
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleShareResults}
                            variant="outline"
                            className="flex items-center gap-2"
                            size="lg"
                        >
                            {shareLinkCopied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            {shareLinkCopied ? "Link Copiado!" : "Copiar Link"}
                        </Button>
                    </div>

                    <Alert>
                        <Share2 className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Compartilhe seus resultados!</strong> Seu relatório em PDF inclui todas as informações da sua página de perfil,
                            formatado profissionalmente com as cores da marca MUDEAI, e links para compartilhar com outras pessoas.
                        </AlertDescription>
                    </Alert>

                    {/* Sharing Options */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            Compartilhar Resultados
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                onClick={handleShareViaWhatsApp}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <span className="text-green-600 font-bold">W</span>
                                WhatsApp
                            </Button>

                            <Button
                                onClick={handleShareViaEmail}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <span className="text-blue-600">📧</span>
                                Email
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
