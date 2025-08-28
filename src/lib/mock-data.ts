import type { Class, Student, Teacher, UnifiedProfile } from './types';

export const mockClasses: Class[] = [
  {
    id: 'class-201',
    name: 'Turma 201',
    studentCount: 25,
    responsesCount: 22,
    quizLink: '/q/class-201',
  },
  {
    id: 'class-202',
    name: 'Turma 202',
    studentCount: 28,
    responsesCount: 28,
    quizLink: '/q/class-202',
  },
  {
    id: 'class-301',
    name: 'Turma 301',
    studentCount: 23,
    responsesCount: 15,
    quizLink: '/q/class-301',
  },
  {
    id: 'class-302',
    name: 'Turma 302',
    studentCount: 30,
    responsesCount: 30,
    quizLink: '/q/class-302',
  },
];

export const mockStudents: Student[] = [
  { id: 'student-1', name: 'Mariana Silva', age: 16, quizStatus: 'completed', unifiedProfileId: 'profile-1' },
  { id: 'student-2', name: 'João Pereira', age: 17, quizStatus: 'completed', unifiedProfileId: 'profile-2' },
  { id: 'student-3', name: 'Beatriz Costa', age: 16, quizStatus: 'pending' },
  { id: 'student-4', name: 'Lucas Martins', age: 16, quizStatus: 'completed', unifiedProfileId: 'profile-4' },
  { id: 'student-5', name: 'Gabriela Souza', age: 17, quizStatus: 'completed', unifiedProfileId: 'profile-5' },
  { id: 'student-6', name: 'Rafael Oliveira', age: 16, quizStatus: 'pending' },
];

export const mockUnifiedProfiles: UnifiedProfile[] = [
    {
      id: "profile-1",
      studentId: "student-1",
      varkProfile: { dominant: "Visual", scores: { v: 8, a: 4, r: 2, k: 6 } },
      discProfile: { dominant: "Influência", scores: { d: 5, i: 9, s: 6, c: 4 } },
      jungianProfile: "ENFP",
      schwartzValues: { top_values: ["Estimulação", "Benevolência"], scores: {} },
      dissonanceAlert: false,
      dissonanceNotes: "",
    },
    {
      id: "profile-2",
      studentId: "student-2",
      varkProfile: { dominant: "Cinestésico", scores: { v: 3, a: 5, r: 6, k: 9 } },
      discProfile: { dominant: "Dominância", scores: { d: 8, i: 4, s: 5, c: 7 } },
      jungianProfile: "ISTJ",
      schwartzValues: { top_values: ["Realização", "Segurança"], scores: {} },
      dissonanceAlert: true,
      dissonanceNotes: "Perfil Introvertido (Jung) com comportamento de alta Dominância (DISC) detectado.",
    },
    {
      id: "profile-4",
      studentId: "student-4",
      varkProfile: { dominant: "Leitura/Escrita", scores: { v: 4, a: 2, r: 9, k: 3 } },
      discProfile: { dominant: "Conformidade", scores: { d: 3, i: 5, s: 8, c: 9 } },
      jungianProfile: "ISFJ",
      schwartzValues: { top_values: ["Conformidade", "Tradição"], scores: {} },
      dissonanceAlert: false,
      dissonanceNotes: "",
    },
    {
      id: "profile-5",
      studentId: "student-5",
      varkProfile: { dominant: "Auditivo", scores: { v: 5, a: 9, r: 4, k: 2 } },
      discProfile: { dominant: "Estabilidade", scores: { d: 4, i: 6, s: 9, c: 5 } },
      jungianProfile: "ESFJ",
      schwartzValues: { top_values: ["Benevolência", "Universalismo"], scores: {} },
      dissonanceAlert: false,
      dissonanceNotes: "",
    },
];

export const mockClassInsights = {
  vark: [
    { type: 'Visual', value: 40, fill: 'var(--chart-1)' },
    { type: 'Auditivo', value: 25, fill: 'var(--chart-2)' },
    { type: 'Leitura/Escrita', value: 15, fill: 'var(--chart-3)' },
    { type: 'Cinestésico', value: 20, fill: 'var(--chart-4)' },
  ],
  disc: mockStudents.map(s => ({
      name: s.name,
      d: Math.floor(Math.random() * 10),
      i: Math.floor(Math.random() * 10)
  })),
  schwartz: [
      { value: 'Benevolência', count: 18 },
      { value: 'Autodireção', count: 15 },
      { value: 'Segurança', count: 12 },
      { value: 'Realização', count: 10 },
      { value: 'Hedonismo', count: 9 },
      { value: 'Estimulação', count: 8 },
  ],
  dissonance: [
      { studentName: 'João Pereira', note: 'Perfil Introvertido (Jung) com comportamento de alta Dominância (DISC) detectado.' }
  ],
  teams: [
      { category: 'Líderes e Inovadores', students: ['João Pereira', 'Mariana Silva'] },
      { category: 'Planejadores e Executores', students: ['Lucas Martins', 'Ana Clara'] },
      { category: 'Comunicadores e Harmonizadores', students: ['Gabriela Souza', 'Pedro Costa'] }
  ]
};

export const mockTeachers: Teacher[] = [
    { id: 'teacher-1', name: 'Carlos Andrade', email: 'carlos.a@example.com', status: 'active' },
    { id: 'teacher-2', name: 'Fernanda Lima', email: 'fernanda.l@example.com', status: 'active' },
    { id: 'teacher-3', name: 'Ricardo Borges', email: 'ricardo.b@example.com', status: 'disabled' },
    { id: 'teacher-4', name: 'Sofia Ribeiro', email: 'sofia.r@example.com', status: 'active' },
];
