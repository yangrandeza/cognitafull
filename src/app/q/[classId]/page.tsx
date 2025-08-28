
"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookHeart, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    id: 'vark_1',
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
    id: 'vark_2',
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
    id: 'disc_1',
    words: ['Decidido', 'Influente', 'Paciente', 'Detalhado'],
  },
  // Jungian
  {
    type: 'radio',
    part: 'Parte 3: Como Sua Mente Funciona (Jungiano)',
    question: 'Depois de um dia cheio de atividades em grupo, você se sente:',
    id: 'jung_1',
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
      id: 'schwartz_1',
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
  const [studentInfo, setStudentInfo] = useState({ name: '', age: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const params = useParams();
  const { toast } = useToast();
  const classId = params.classId as string;

  const currentQuestion = questions[step];

  const handleStudentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStudentInfo(prev => ({ ...prev, [id]: value }));
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion.type === 'intro') {
      if (!studentInfo.name || !studentInfo.age) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Por favor, preencha seu nome e idade para começar.",
        });
        return;
      }
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Here we would call the function to save to Firestore
    console.log("Submitting:", { studentInfo, answers, classId });
    // TODO: Implement Firestore submission logic
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
        title: "Respostas enviadas!",
        description: "Agradecemos sua participação.",
    });

    // We change the step to the finish card AFTER submission is successful
    setStep(questions.length - 1); 
    setIsSubmitting(false);
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
                        <Input id="name" placeholder="Seu nome completo" value={studentInfo.name} onChange={handleStudentInfoChange} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="age">Idade</Label>
                        <Input id="age" type="number" placeholder="Sua idade" value={studentInfo.age} onChange={handleStudentInfoChange}/>
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
                <RadioGroup 
                  className="space-y-3"
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
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
                        <span className="col-span-2 font-medium text-sm text-muted-foreground">MAIS parecido</span>
                        <span className="col-span-2"></span>
                        <span className="col-span-2 font-medium text-sm text-muted-foreground">MENOS parecido</span>
                     </div>
                      {currentQuestion.words.map((word, index) => (
                         <div key={index} className="grid grid-cols-6 gap-2 border p-3 rounded-md items-center">
                            <RadioGroup 
                                className="col-span-2 flex justify-around"
                                name={`${currentQuestion.id}_${index}_most`}
                                value={answers[`${currentQuestion.id}_${index}_most`] || ''}
                                onValueChange={() => handleAnswerChange(`${currentQuestion.id}_${index}_most`, word)}
                            >
                              <RadioGroupItem value={word} id={`most_${index}`} />
                            </RadioGroup>
                            <Label className="col-span-2 text-center">{word}</Label>
                            <RadioGroup 
                                className="col-span-2 flex justify-around"
                                name={`${currentQuestion.id}_${index}_least`}
                                value={answers[`${currentQuestion.id}_${index}_least`] || ''}
                                onValueChange={() => handleAnswerChange(`${currentQuestion.id}_${index}_least`, word)}
                            >
                               <RadioGroupItem value={word} id={`least_${index}`} />
                            </RadioGroup>
                        </div>
                      ))}
                  </div>
              )}
              {currentQuestion.type === 'scale' && (
                <div>
                    <p className="italic mb-4">"{currentQuestion.statement}"</p>
                    <RadioGroup 
                        className="flex justify-around bg-muted p-2 rounded-lg"
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
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
                <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                {step < totalQuestions ? (
                     <Button onClick={handleNext}>
                        Próximo <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar e Enviar
                    </Button>
                )}
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
                <Button onClick={() => window.location.href = '/'}>Voltar para o início</Button>
            </CardFooter>
            </>
        )}
      </Card>
    </div>
  );
}

