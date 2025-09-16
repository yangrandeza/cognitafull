"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, BarChart, Users, FileText, TrendingUp, Target, Zap, Award, ArrowRight, CheckCircle, Star, Quote, Wind, Sparkles, MessageSquare, Telescope, AlertTriangle, Rabbit, Snail, Mic, Cake, Baby, BookMarked } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const realFeatures = [
    {
      icon: BrainCircuit,
      title: "Bússola Cognitiva da Turma",
      desc: "Veja a 'personalidade' coletiva da sua turma através de um gráfico intuitivo que revela tendências gerais de aprendizagem e comportamento.",
      color: "text-primary"
    },
    {
      icon: Wind,
      title: "Clima da Sala de Aula",
      desc: "Descubra como seus alunos se sentem mais confortáveis aprendendo - se preferem ambientes calmos ou dinâmicos.",
      color: "text-blue-500"
    },
    {
      icon: Sparkles,
      title: "Faísca do Engajamento",
      desc: "Identifique o que realmente motiva cada aluno a se inclinar para frente na cadeira e participar ativamente.",
      color: "text-amber-500"
    },
    {
      icon: MessageSquare,
      title: "Comunicação e Feedback",
      desc: "Aprenda o melhor estilo de comunicação para sua turma e como dar feedback que realmente impacta o aprendizado.",
      color: "text-green-500"
    },
    {
      icon: Telescope,
      title: "Ritmo de Trabalho e Foco",
      desc: "Entenda se sua turma trabalha melhor em ritmo acelerado ou gradual, e se prefere visão geral ou detalhes.",
      color: "text-cyan-500"
    },
    {
      icon: Users,
      title: "Formação de Equipes Equilibradas",
      desc: "Agrupe alunos por perfis complementares para otimizar o trabalho em equipe e reduzir conflitos.",
      color: "text-purple-500"
    }
  ];

  const testimonials = [
    {
      quote: "A plataforma mudou minha relação com alunos difíceis. Ao entender o perfil comportamental e de aprendizagem deles, adaptei minha abordagem e as notas da turma melhoraram em 20% em um semestre.",
      author: "Coordenadora Pedagógica",
      company: "Rede de Colégios XYZ"
    },
    {
      quote: "O MUDEAI me deu superpoderes pedagógicos. Agora vejo minha turma como um organismo vivo, não como um grupo de indivíduos desconectados.",
      author: "Professor de Matemática",
      company: "Escola Estadual ABC"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-light-lavender via-white to-light-lavender">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-ping"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="animate-pulse">🧠 Superpoderes Pedagógicos</Badge>
                  <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary leading-tight">
                    Sua turma como <span className="text-secondary">um organismo vivo</span>
                  </h1>
                  <p className="text-xl text-foreground/80 leading-relaxed">
                    O MUDEAI transforma dados em insights acionáveis. Veja a "personalidade" da sua turma, entenda cada aluno individualmente e crie estratégias que realmente funcionam.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="font-headline group hover:scale-105 transition-transform">
                    <a href="https://wa.me/554491857303" target="_blank" rel="noopener noreferrer">
                      Solicitar Demo
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-headline group hover:scale-105 transition-transform">
                    <Link href="/signup">
                      Começar Grátis
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                {/* Disruptive Visual Element */}
                <div className="relative flex items-center justify-center min-h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 rounded-3xl transform rotate-3 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-secondary/20 via-primary/10 to-secondary/20 rounded-3xl transform -rotate-3 animate-pulse delay-1000"></div>

                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/50">
                    <div className="grid grid-cols-2 gap-6">
                      {realFeatures.slice(0, 4).map((feature, index) => (
                        <div key={index} className="text-center space-y-3 group hover:scale-110 transition-transform duration-300">
                          <div className={`mx-auto w-16 h-16 ${feature.color} bg-current/10 rounded-full flex items-center justify-center group-hover:animate-bounce`}>
                            <feature.icon className="w-8 h-8" />
                          </div>
                          <p className="font-semibold text-sm">{feature.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="recursos" className="py-20 md:py-24 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                Recursos que transformam professores em super-heróis
              </h2>
              <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
                Cada ferramenta foi criada para resolver problemas reais da sala de aula, baseada em dados reais dos seus alunos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {realFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-20 h-20 ${feature.color} bg-current/10 rounded-full flex items-center justify-center mb-4`}>
                      <feature.icon className="w-10 h-10" />
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70 text-center">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                Como funciona (é simples assim)
              </h2>
                <p className="text-xl text-foreground/80">
                  Em minutos você tem dados que levariam meses para descobrir sozinho.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "1",
                    title: "Crie sua turma",
                    desc: "Cadastre seus alunos e envie o questionário personalizado.",
                    icon: Users
                  },
                  {
                    step: "2",
                    title: "Colete os dados",
                    desc: "Alunos respondem assessments validados (VARK, DISC, etc.) em minutos.",
                    icon: CheckCircle
                  },
                  {
                    step: "3",
                    title: "Veja os insights",
                    desc: "Dashboards visuais mostram a 'personalidade' da sua turma e perfis individuais.",
                    icon: BarChart
                  },
                  {
                    step: "4",
                    title: "Aja com inteligência",
                    desc: "Use estratégias personalizadas salvas e gere relatórios para pais.",
                    icon: BrainCircuit
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center space-y-4 group">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{step.step}</span>
                      </div>
                    </div>
                    <h3 className="font-headline text-xl font-semibold">{step.title}</h3>
                    <p className="text-foreground/70">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-24 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                Professores que já transformaram suas aulas
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <Quote className="w-8 h-8 text-primary/50 mb-4" />
                    <p className="text-lg text-foreground/80 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-foreground/60">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-24 bg-gradient-to-r from-primary via-primary/90 to-secondary">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8 text-white">
              <h2 className="font-headline text-3xl md:text-5xl font-bold">
                Pronto para ver sua turma de verdade?
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                Pare de adivinhar. Comece a saber exatamente como ensinar cada aluno da sua turma.
              </p>
              <p className="text-lg font-semibold">
                Teste grátis por 14 dias. Sem cartão de crédito.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                <Button asChild size="lg" variant="secondary" className="font-headline group hover:scale-105 transition-transform">
                  <a href="https://wa.me/554491857303" target="_blank" rel="noopener noreferrer">
                    Agendar Demonstração
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-headline group hover:scale-105 transition-transform border-white text-black hover:bg-white hover:text-black">
                  <Link href="/signup">
                    Começar teste gratuito
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
