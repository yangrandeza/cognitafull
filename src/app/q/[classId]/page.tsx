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
    title: 'Welcome to Cognita!',
    description: "Let's discover your learning superpowers. For each question, choose the option that feels most like you. There are no right or wrong answers. Trust your first impression!",
  },
  // VARK
  {
    type: 'radio',
    part: 'Part 1: How You Learn (VARK)',
    question: 'When you need to learn something new and complex, what helps you most?',
    options: [
      { value: 'V', label: 'Seeing graphs, infographics, and videos that demonstrate the concept.' },
      { value: 'A', label: 'Hearing a good explanation, a podcast, or discussing the topic.' },
      { value: 'R', label: 'Reading a well-written article, book, or manual on the subject.' },
      { value: 'K', label: 'Getting hands-on, experimenting, or doing a practical exercise.' },
    ],
  },
  {
    type: 'radio',
    part: 'Part 1: How You Learn (VARK)',
    question: 'Imagine you are trying to get to a new place. Which strategy would you choose?',
    options: [
      { value: 'V', label: 'Look at a visual map on your phone\'s GPS.' },
      { value: 'A', label: 'Ask the GPS to give you voice instructions.' },
      { value: 'R', label: 'Read a list of street names and directions to follow.' },
      { value: 'K', label: 'Just start driving and guide yourself by landmarks along the way.' },
    ],
  },
  // DISC
   {
    type: 'disc',
    part: 'Part 2: How You Act and Interact (DISC)',
    instruction: 'In each group of four words, choose the one that is MOST like you and the one that is LEAST like you.',
    words: ['Decided', 'Influential', 'Patient', 'Detailed'],
  },
  // Jungian
  {
    type: 'radio',
    part: 'Part 3: How Your Mind Works (Jungian)',
    question: 'After a day full of group activities, you feel:',
    options: [
      { value: 'I', label: 'Exhausted, needing some alone time to recharge.' },
      { value: 'E', label: 'Energized and excited, wanting to continue interacting.' },
    ],
  },
  // Schwartz
  {
      type: 'scale',
      part: 'Part 4: What Truly Moves You (Schwartz)',
      instruction: 'For each sentence, indicate how much the person described is like you.',
      statement: 'Having the freedom to choose what they do and think for themselves is very important to this person.',
      value: 'Autodirection'
  },
  // Finish
  {
    type: 'finish',
    title: 'All Done!',
    description: 'Thank you for completing the questionnaire. Your insights will help create a better learning experience.',
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
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="E.g., Mariana" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" placeholder="E.g., 16" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleNext}>Start <ArrowRight className="ml-2 h-4 w-4" /></Button>
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
                        <span className="col-span-2 font-medium text-sm text-muted-foreground">Most</span>
                        <span className="col-span-2"></span>
                        <span className="col-span-2 font-medium text-sm text-muted-foreground">Least</span>
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
                                    {val === 1 && "Not like me"}
                                    {val === 2 && "A little like me"}
                                    {val === 3 && "Like me"}
                                    {val === 4 && "Very like me"}
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
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
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
                <Button onClick={() => window.location.href = '/'}>Finish</Button>
            </CardFooter>
            </>
        )}
      </Card>
    </div>
  );
}
