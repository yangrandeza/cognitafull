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
      title: '360° Student Profiles',
      description: 'Go beyond grades with holistic profiles covering VARK, DISC, Jungian types, and Schwartz values.',
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: 'Interactive Dashboards',
      description: 'Visualize your class dynamics at a glance. Understand dominant learning styles and behavioral trends instantly.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'AI Pedagogical Assistant',
      description: 'Optimize your lesson plans with practical, AI-driven suggestions tailored to your students\' unique profiles.',
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'White-Labeled PDF Reports',
      description: 'Generate professional, individualized reports for parent-teacher meetings or student feedback sessions.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-light-lavender py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary">
                  Unlock Every Student's Potential
                </h1>
                <p className="text-lg text-foreground/80">
                  Cognita 360 transforms the classroom by providing teachers with deep, actionable insights into their students' learning and behavioral profiles. Personalize teaching, boost engagement, and foster growth like never before.
                </p>
                <div className="flex space-x-4">
                  <Button asChild size="lg" className="font-headline">
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-headline">
                    <Link href="/login">Request a Demo</Link>
                  </Button>
                </div>
              </div>
              <div>
                <Image
                  src="https://picsum.photos/600/400"
                  alt="An engaging classroom environment"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="classroom students"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">A New Dimension of Teaching</h2>
              <p className="text-lg max-w-3xl mx-auto text-foreground/70">
                Cognita 360 is more than a tool; it's your partner in creating a more effective and empathetic learning environment.
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

        <section className="bg-light-lavender py-20 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">Ready to Revolutionize Your Classroom?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Join the growing community of educators who are making a difference, one personalized insight at a time.
            </p>
            <Button asChild size="lg" className="font-headline">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
