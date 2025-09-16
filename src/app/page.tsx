import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, BarChart, Users, FileText } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  const features = [
    {
      icon: <img src="/logo.svg" alt="MUDEAI Logo" className="w-8 h-8 object-contain" />,
      title: 'Perfis de aluno 360°',
      description: 'Vá além das notas com perfis holísticos que cobrem VARK, DISC, tipos junguianos e valores de Schwartz.',
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: 'Dashboards interativos',
      description: 'Visualize a dinâmica da sua turma rapidamente. Entenda os estilos de aprendizagem e tendências comportamentais dominantes instantaneamente.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Assistente pedagógico com IA',
      description: 'Otimize seus planos de aula com sugestões práticas e orientadas por IA, adaptadas aos perfis únicos de seus alunos.',
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Relatórios em PDF white-label',
      description: 'Gere relatórios profissionais e individualizados para reuniões de pais e mestres ou sessões de feedback com os alunos.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-light-lavender">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary">
                  Desbloqueie o potencial de cada aluno
                </h1>
                <p className="text-lg text-foreground/80">
                  O MUDEAI transforma a sala de aula, fornecendo aos professores insights profundos e acionáveis sobre os perfis de aprendizagem e comportamentais de seus alunos. Personalize o ensino, aumente o engajamento e promova o crescimento como nunca antes.
                </p>
                <div className="flex space-x-4">
                  <Button asChild size="lg" className="font-headline">
                    <Link href="/signup">Comece de graça</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-headline">
                    <a href="https://wa.me/554491857303" target="_blank" rel="noopener noreferrer">Solicite uma demonstração</a>
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <div className="absolute w-full h-full rounded-2xl border border-white/40 bg-white/20 backdrop-blur-lg shadow-2xl"></div>
                 <div className="relative grid grid-cols-2 gap-8 p-8">
                    <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                        <img src="/logo.svg" alt="MUDEAI Logo" className="w-12 h-12 object-contain" />
                        <p className="font-semibold text-foreground/80">Perfis 360°</p>
                    </div>
                     <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                        <BarChart className="w-12 h-12 text-primary"/>
                         <p className="font-semibold text-foreground/80">Dashboards</p>
                    </div>
                     <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                        <Users className="w-12 h-12 text-primary"/>
                         <p className="font-semibold text-foreground/80">Assistente IA</p>
                    </div>
                     <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                        <FileText className="w-12 h-12 text-primary"/>
                         <p className="font-semibold text-foreground/80">Relatórios</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Uma nova dimensão do ensino</h2>
              <p className="text-lg max-w-3xl mx-auto text-foreground/70">
                O MUDEAI é mais do que uma ferramenta; é seu parceiro na criação de um ambiente de aprendizagem mais eficaz e empático.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">Pronto para revolucionar sua sala de aula?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Junte-se à crescente comunidade de educadores que estão fazendo a diferença, um insight personalizado de cada vez.
            </p>
            <Button asChild size="lg" className="font-headline">
              <Link href="/signup">Inscreva-se agora</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
