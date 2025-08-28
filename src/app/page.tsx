import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BrainCircuit, BarChart, Users, FileText } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: 'Perfis de Aluno 360°',
      description: 'Vá além das notas com perfis holísticos que cobrem VARK, DISC, tipos junguianos e valores de Schwartz.',
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: 'Dashboards Interativos',
      description: 'Visualize a dinâmica da sua turma rapidamente. Entenda os estilos de aprendizagem e tendências comportamentais dominantes instantaneamente.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Assistente Pedagógico com IA',
      description: 'Otimize seus planos de aula com sugestões práticas e orientadas por IA, adaptadas aos perfis únicos de seus alunos.',
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Relatórios em PDF White-Label',
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
                  Desbloqueie o Potencial de Cada Aluno
                </h1>
                <p className="text-lg text-foreground/80">
                  O Cognita 360 transforma a sala de aula, fornecendo aos professores insights profundos e acionáveis sobre os perfis de aprendizagem e comportamentais de seus alunos. Personalize o ensino, aumente o engajamento e promova o crescimento como nunca antes.
                </p>
                <div className="flex space-x-4">
                  <Button asChild size="lg" className="font-headline">
                    <Link href="/signup">Comece de Graça</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-headline">
                    <Link href="/login">Solicite uma Demonstração</Link>
                  </Button>
                </div>
              </div>
              <div>
                <Image
                  src="https://picsum.photos/600/400"
                  alt="Um ambiente de sala de aula envolvente"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="estudantes sala de aula"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Uma Nova Dimensão do Ensino</h2>
              <p className="text-lg max-w-3xl mx-auto text-foreground/70">
                O Cognita 360 é mais do que uma ferramenta; é seu parceiro na criação de um ambiente de aprendizagem mais eficaz e empático.
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
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">Pronto para Revolucionar sua Sala de Aula?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Junte-se à crescente comunidade de educadores que estão fazendo a diferença, um insight personalizado de cada vez.
            </p>
            <Button asChild size="lg" className="font-headline">
              <Link href="/signup">Inscreva-se Agora</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
