"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookHeart, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const questions = [
  // Intro
  {
    type: 'intro',
    title: 'Bem-vindo(a) ao Cognita!',
    description: "Vamos descobrir seus superpoderes de aprendizagem. Para cada pergunta, escolha a opção que mais se parece com você. Não há respostas certas ou erradas. Confie na sua primeira impressão!",
  },
  // VARK
  {
    type: 'radio',
    part: 'Parte 1: Como Você Aprende (VARK)',
    question: 'Quando você precisa aprender algo novo e complexo, o que mais te ajuda?',
    options: [
      { value: 'V', label: 'Ver gráficos, infográficos e vídeos que demonstram o conceito.' },
      { value: 'A', label: 'Ouvir uma boa explicação, um podcast, ou discutir o tópico.' },
      { value: 'R', label: 'Ler um artigo, livro ou manual bem escrito sobre o assunto.' },
      { value: 'K', label: 'Colocar a mão na massa, experimentar ou fazer um exercício prático.' },
    ],
  },
  {
    type: 'radio',
    part: 'Parte 1: Como Você Aprende (VARK)',
    question: 'Imagine que você está tentando chegar a um lugar novo. Qual estratégia você escolheria?',
    options: [
      { value: 'V', label: 'Olhar um mapa visual no GPS do seu celular.' },
      { value: 'A', label: 'Pedir ao GPS para dar instruções por voz.' },
      { value: 'R', label: 'Ler uma lista de nomes de ruas e direções a seguir.' },
      { value: 'K', label: 'Apenas começar a dirigir e se guiar por pontos de referência no caminho.' },
    ],
  },
  // DISC
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    words: ['Decidido', 'Influente', 'Paciente', 'Detalhado'],
  },
  // Jungian
  {
    type: 'radio',
    part: 'Parte 3: Como Sua Mente Funciona (Jungiano)',
    question: 'Depois de um dia cheio de atividades em grupo, você se sente:',
    options: [
      { value: 'I', label: 'Esgotado(a), precisando de um tempo sozinho(a) para recarregar.' },
      { value: 'E', label: 'Energizado(a) e animado(a), querendo continuar a interagir.' },
    ],
  },
  // Schwartz
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      statement: 'Ter a liberdade de escolher o que faz e pensa por si mesmo é muito importante para esta pessoa.',
      value: 'Autodireção'
  },
  // Finish
  {
    type: 'finish',
    title: 'Tudo pronto!',
    description: 'Obrigado por completar o questionário. Seus insights ajudarão a criar uma experiência de aprendizado melhor.',
  },
];

const totalQuestions = questions.filter(q => q.type !== 'intro' && q.type !== 'finish').length;

export default function QuestionnairePage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const currentQuestion = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const progress = step > 0 ? ((step) / totalQuestions) * 100 : 0;


  return (
    <div className="min-h-screen bg-light-lavender flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-2xl mb-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookHeart className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">Cognita 360</span>
        </Link>
      </header>
      <Card className="w-full max-w-2xl">
        <div className="p-4 border-b">
           <Progress value={progress} />
        </div>
        
        {currentQuestion.type === 'intro' && (
            <>
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{currentQuestion.title}</CardTitle>
                <CardDescription>{currentQuestion.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" placeholder="Ex: Mariana" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="age">Idade</Label>
                        <Input id="age" type="number" placeholder="Ex: 16" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleNext}>Começar <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardFooter>
            </>
        )}

        {(currentQuestion.type === 'radio' || currentQuestion.type === 'disc' || currentQuestion.type === 'scale') && (
            <>
            <CardHeader>
                <p className="text-sm font-semibold text-primary">{currentQuestion.part}</p>
                <CardTitle className="font-headline">{currentQuestion.question || currentQuestion.instruction}</CardTitle>
                {currentQuestion.type !== 'disc' && currentQuestion.instruction && <CardDescription>{currentQuestion.instruction}</CardDescription>}
            </CardHeader>
            <CardContent>
              {currentQuestion.type === 'radio' && (
                <RadioGroup className="space-y-3">
                  {currentQuestion.options.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value} className="flex-1 cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {currentQuestion.type === 'disc' && (
                  <div className="space-y-2">
                     <div className="grid grid-cols-6 gap-2 text-center items-center">
                        <span className="col-span-2 font-medium text-sm text-muted-foreground">Mais</span>
                        <span className="col-span-2"></span>
                        <span className="col-span-2 font-medium text-sm text-muted-foreground">Menos</span>
                     </div>
                      <div className="grid grid-cols-6 gap-2 border p-3 rounded-md items-center">
                          <RadioGroup className="col-span-2 flex justify-around">
                            <RadioGroupItem value="most_1" id="most_1" />
                          </RadioGroup>
                          <Label className="col-span-2 text-center">{currentQuestion.words[0]}</Label>
                          <RadioGroup className="col-span-2 flex justify-around">
                            <RadioGroupItem value="least_1" id="least_1" />
                          </RadioGroup>
                      </div>
                       <div className="grid grid-cols-6 gap-2 border p-3 rounded-md items-center">
                          <RadioGroup className="col-span-2 flex justify-around">
                            <RadioGroupItem value="most_2" id="most_2" />
                          </RadioGroup>
                          <Label className="col-span-2 text-center">{currentQuestion.words[1]}</Label>
                          <RadioGroup className="col-span-2 flex justify-around">
                             <RadioGroupItem value="least_2" id="least_2" />
                          </RadioGroup>
                      </div>
                       <div className="grid grid-cols-6 gap-2 border p-3 rounded-md items-center">
                          <RadioGroup className="col-span-2 flex justify-around">
                             <RadioGroupItem value="most_3" id="most_3" />
                          </RadioGroup>
                          <Label className="col-span-2 text-center">{currentQuestion.words[2]}</Label>
                          <RadioGroup className="col-span-2 flex justify-around">
                             <RadioGroupItem value="least_3" id="least_3" />
                          </RadioGroup>
                      </div>
                       <div className="grid grid-cols-6 gap-2 border p-3 rounded-md items-center">
                          <RadioGroup className="col-span-2 flex justify-around">
                            <RadioGroupItem value="most_4" id="most_4" />
                          </RadioGroup>
                          <Label className="col-span-2 text-center">{currentQuestion.words[3]}</Label>
                          <RadioGroup className="col-span-2 flex justify-around">
                             <RadioGroupItem value="least_4" id="least_4" />
                          </RadioGroup>
                      </div>
                  </div>
              )}
              {currentQuestion.type === 'scale' && (
                <div>
                    <p className="italic mb-4">"{currentQuestion.statement}"</p>
                    <RadioGroup className="flex justify-around bg-muted p-2 rounded-lg">
                        {[1, 2, 3, 4].map(val => (
                            <div key={val} className="flex flex-col items-center space-y-2">
                                <Label htmlFor={`scale-${val}`} className="text-xs text-muted-foreground text-center">
                                    {val === 1 && "Não se parece comigo"}
                                    {val === 2 && "Um pouco como eu"}
                                    {val === 3 && "Parecido comigo"}
                                    {val === 4 && "Muito parecido comigo"}
                                </Label>
                                <RadioGroupItem value={String(val)} id={`scale-${val}`} />
                            </div>
                        ))}
                    </RadioGroup>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleNext}>
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
            </>
        )}

        {currentQuestion.type === 'finish' && (
            <>
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{currentQuestion.title}</CardTitle>
                <CardDescription>{currentQuestion.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Check className="mx-auto h-16 w-16 text-green-500 bg-green-100 rounded-full p-2" />
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={() => window.location.href = '/'}>Finalizar</Button>
            </CardFooter>
            </>
        )}
      </Card>
    </div>
  );
}
