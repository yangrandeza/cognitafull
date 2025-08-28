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
import { submitQuizAnswers } from '@/lib/firebase/firestore';
import type { QuizAnswers } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
   {
    type: 'radio',
    part: 'Parte 1: Como Você Aprende (VARK)',
    question: 'Para se lembrar de algo importante para uma prova, qual método funciona melhor para você?',
    id: 'vark_3',
    options: [
      { value: 'V', label: 'Criar mapas mentais coloridos ou usar marca-textos para grifar o material.' },
      { value: 'A', label: 'Explicar a matéria em voz alta para si mesmo ou para um colega.' },
      { value: 'R', label: 'Fazer resumos escritos e reler suas anotações várias vezes.' },
      { value: 'K', label: 'Associar o conteúdo a um movimento, a uma história ou a um exemplo real.' },
    ],
  },
   {
    type: 'radio',
    part: 'Parte 1: Como Você Aprende (VARK)',
    question: 'Em uma apresentação ou palestra, o que mais prende a sua atenção?',
    id: 'vark_4',
    options: [
      { value: 'V', label: 'O design dos slides, as imagens e os gráficos apresentados.' },
      { value: 'A', label: 'A clareza da fala, o tom de voz e as histórias contadas pelo palestrante.' },
      { value: 'R', label: 'A quantidade de dados e informações textuais detalhadas nos slides.' },
      { value: 'K', label: 'As atividades interativas, demonstrações ao vivo ou estudos de caso práticos.' },
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
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_2',
    words: ['Competitivo', 'Otimista', 'Estável', 'Cauteloso'],
  },
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_3',
    words: ['Direto', 'Sociável', 'Previsível', 'Perfeccionista'],
  },
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_4',
    words: ['Ousado', 'Entusiasmado', 'Calmo', 'Sistemático'],
  },
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_5',
    words: ['Focado em resultados', 'Inspirador', 'Apoiador', 'Lógico'],
  },
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_6',
    words: ['Exigente', 'Comunicativo', 'Consistente', 'Preciso'],
  },
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_7',
    words: ['Pioneiro', 'Convincente', 'Leal', 'Cuidadoso'],
  },
   {
    type: 'disc',
    part: 'Parte 2: Como Você Age e Interage (DISC)',
    instruction: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    id: 'disc_8',
    words: ['Independente', 'Divertido', 'Harmonioso', 'Organizado'],
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
  {
    type: 'radio',
    part: 'Parte 3: Como Sua Mente Funciona (Jungiano)',
    question: 'Ao lidar com uma nova tarefa, você tende a:',
    id: 'jung_2',
    options: [
      { value: 'S', label: 'Focar nos detalhes práticos e seguir um passo a passo claro.' },
      { value: 'N', label: 'Pensar nas possibilidades, nas conexões e na visão geral do projeto.' },
    ],
  },
  {
    type: 'radio',
    part: 'Parte 3: Como Sua Mente Funciona (Jungiano)',
    question: 'Na hora de tomar uma decisão, o que pesa mais para você?',
    id: 'jung_3',
    options: [
      { value: 'T', label: 'A lógica, a análise imparcial dos fatos e a objetividade.' },
      { value: 'F', label: 'O impacto da decisão nas pessoas envolvidas e em seus valores pessoais.' },
    ],
  },
  {
    type: 'radio',
    part: 'Parte 3: Como Sua Mente Funciona (Jungiano)',
    question: 'Seu estilo de trabalho preferido é:',
    id: 'jung_4',
    options: [
      { value: 'J', label: 'Ter um plano bem definido, com prazos e metas claras, e segui-lo.' },
      { value: 'P', label: 'Manter as opções em aberto e se adaptar conforme as coisas acontecem.' },
    ],
  },
  // Schwartz
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_1',
      statement: 'Ter a liberdade de escolher o que faz e pensa por si mesmo é muito importante para esta pessoa.',
      value: 'Autodireção'
  },
   {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_2',
      statement: 'Ela busca uma vida cheia de emoção, novidades e desafios.',
      value: 'Estimulação'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_3',
      statement: 'Para ela, sentir prazer e aproveitar os bons momentos da vida é uma prioridade.',
      value: 'Hedonismo'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_4',
      statement: 'Ser bem-sucedido(a) e mostrar aos outros que é capaz é algo que a motiva muito.',
      value: 'Realização'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_5',
      statement: 'Ela gosta de liderar, ser responsável e ter influência sobre as coisas.',
      value: 'Poder'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_6',
      statement: 'Viver em um ambiente seguro, estável e organizado é fundamental para seu bem-estar.',
      value: 'Segurança'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_7',
      statement: 'Ela se esforça para seguir as regras e nunca decepcionar as pessoas ao seu redor.',
      value: 'Conformidade'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_8',
      statement: 'Para ela, é importante respeitar os costumes e as tradições de sua família e cultura.',
      value: 'Tradição'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_9',
      statement: 'Ajudar as pessoas que ama e ser um amigo(a) leal é uma de suas maiores qualidades.',
      value: 'Benevolência'
  },
  {
      type: 'scale',
      part: 'Parte 4: O que Realmente te Move (Schwartz)',
      instruction: 'Para cada frase, indique o quanto a pessoa descrita se parece com você.',
      id: 'schwartz_10',
      statement: 'Ela se preocupa muito com a igualdade, a justiça social e a proteção do meio ambiente.',
      value: 'Universalismo'
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
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [studentInfo, setStudentInfo] = useState({ name: '', age: '', gender: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const params = useParams();
  const { toast } = useToast();
  const classId = params.classId as string;

  const currentQuestion = questions[step];
  const isLastQuestion = step === totalQuestions;


  const handleStudentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStudentInfo(prev => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (value: string) => {
    setStudentInfo(prev => ({ ...prev, gender: value }));
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleDiscAnswerChange = (groupId: string, type: 'most' | 'least', value: string) => {
      setAnswers(prev => {
          const newAnswers = {...prev};
          // Ensure the same word cannot be both MOST and LEAST
          if (type === 'most' && newAnswers[`${groupId}_least`] === value) {
              delete newAnswers[`${groupId}_least`];
          }
          if (type === 'least' && newAnswers[`${groupId}_most`] === value) {
              delete newAnswers[`${groupId}_most`];
          }
          newAnswers[`${groupId}_${type}`] = value;
          return newAnswers;
      });
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
    try {
        await submitQuizAnswers(classId, studentInfo, answers);
        toast({
            title: "Respostas enviadas!",
            description: "Agradecemos sua participação.",
        });
        // We change the step to the finish card AFTER submission is successful
        setStep(questions.length - 1); 
    } catch (error) {
        console.error("Submission error:", error);
        toast({
            variant: "destructive",
            title: "Erro ao enviar",
            description: "Não foi possível salvar suas respostas. Por favor, tente novamente.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const progress = step > 0 ? ((step -1) / totalQuestions) * 100 : 0;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
                        <Input id="name" placeholder="Seu nome completo" value={studentInfo.name} onChange={handleStudentInfoChange} required/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="age">Idade</Label>
                            <Input id="age" type="number" placeholder="Sua idade" value={studentInfo.age} onChange={handleStudentInfoChange} required/>
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="gender">Gênero (Opcional)</Label>
                           <Select value={studentInfo.gender} onValueChange={handleGenderChange}>
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                    <SelectItem value="Feminino">Feminino</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                    <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                    <div key={opt.value} className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                      <RadioGroupItem value={opt.value} id={`${currentQuestion.id}_${opt.value}`} />
                      <Label htmlFor={`${currentQuestion.id}_${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {currentQuestion.type === 'disc' && (
                   <div className="space-y-4">
                     <div className="grid grid-cols-3 gap-2 text-center items-center px-4">
                        <span className="font-medium text-sm text-muted-foreground text-left">MAIS parecido</span>
                        <span></span>
                        <span className="font-medium text-sm text-muted-foreground text-right">MENOS parecido</span>
                     </div>
                      {currentQuestion.words.map((word, index) => (
                         <div key={index} className="grid grid-cols-3 gap-2 border p-3 rounded-md items-center has-[:checked]:bg-primary/5">
                            <div className="flex justify-start">
                                <RadioGroup 
                                    value={answers[`${currentQuestion.id}_most`] || ''}
                                    onValueChange={(value) => handleDiscAnswerChange(currentQuestion.id, 'most', value)}
                                >
                                    <RadioGroupItem value={word} id={`most_${currentQuestion.id}_${index}`} />
                                </RadioGroup>
                            </div>
                            <Label className="text-center font-medium">{word}</Label>
                            <div className="flex justify-end">
                                <RadioGroup 
                                    value={answers[`${currentQuestion.id}_least`] || ''}
                                    onValueChange={(value) => handleDiscAnswerChange(currentQuestion.id, 'least', value)}
                                >
                                <RadioGroupItem value={word} id={`least_${currentQuestion.id}_${index}`} />
                                </RadioGroup>
                            </div>
                        </div>
                      ))}
                  </div>
              )}
              {currentQuestion.type === 'scale' && (
                <div>
                    <p className="italic mb-4">"{currentQuestion.statement}"</p>
                    <RadioGroup 
                        className="flex flex-col sm:flex-row justify-around bg-muted/50 p-3 rounded-lg"
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                        {[{val: 1, label: "Nada parecido comigo"}, {val: 2, label: "Um pouco como eu"}, {val: 3, label: "Parecido comigo"}, {val: 4, label: "Muito parecido comigo"}].map(({val, label}) => (
                            <div key={val} className="flex items-center space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 py-2 sm:py-0">
                                <RadioGroupItem value={String(val)} id={`scale-${currentQuestion.id}-${val}`} />
                                <Label htmlFor={`scale-${currentQuestion.id}-${val}`} className="text-xs text-muted-foreground text-center cursor-pointer">
                                    {label}
                                </Label>
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
                {isLastQuestion ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar e Enviar
                    </Button>
                ) : (
                     <Button onClick={handleNext}>
                        Próximo <ArrowRight className="ml-2 h-4 w-4" />
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
                <Button asChild><Link href="/">Voltar para o início</Link></Button>
            </CardFooter>
            </>
        )}
      </Card>
    </div>
  );
}
